import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GitHubIssueService, GitHubProjectService, GitHubPullRequestService } from '../../src/services/index.js';
import { registerIssueTools, registerProjectTools, registerPullRequestTools } from './tools-registration.js';
import { createServerlessTransport } from '../utils/serverless-transport.js';

// Create a singleton server instance
let server = null;

/**
 * Initialize and get the MCP server instance
 * This ensures we only create one instance of the server
 */
function getOrCreateMcpServer(token) {
    if (server) {
        return server;
    }

    // Validate GitHub token
    if (!token) {
        throw new Error('GitHub token is required');
    }

    // Create services
    const issueService = new GitHubIssueService(token);
    const projectService = new GitHubProjectService(token);
    const pullRequestService = new GitHubPullRequestService(token);

    // Create a new MCP server
    server = new McpServer({
        name: 'MCP GitHub Project Manager',
        version: '1.0.0',
    });

    // Register GitHub tools
    registerIssueTools(server, issueService);
    registerProjectTools(server, projectService);
    registerPullRequestTools(server, pullRequestService);

    return server;
}

/**
 * Handle SSE connection setup
 */
async function setupSSEConnection(req, res, token, basePath) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for Nginx

    try {
        // Get or create MCP server instance
        const server = getOrCreateMcpServer(token);

        // Create transport with the appropriate messages endpoint
        const messagesEndpoint = `${basePath}/messages`;
        const transport = createServerlessTransport(messagesEndpoint, res);

        // Connect the server to the transport
        await server.connect(transport);

        // Keep connection alive until function timeout or client disconnects
        req.on('close', () => {
            console.log('SSE connection closed');
        });
    } catch (error) {
        console.error('Error setting up SSE connection:', error);
        res.status(500).end(`Error: ${error.message}`);
    }
}

/**
 * Handle incoming messages for the SSE connection
 */
async function handleMessages(req, res, token) {
    try {
        // Get the server instance
        const server = getOrCreateMcpServer(token);

        // Forward the message to the server
        const transport = server.getTransport();
        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(400).json({ error: 'No active SSE connection' });
        }
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Main API route handler
 */
export default async function handler(req, res) {
    // Get GitHub token from environment variable
    const token = process.env.GITHUB_PERSONAL_TOKEN;

    // Determine the base path from the request or use default
    const host = req.headers.host || '';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const basePath = `${protocol}://${host}/api/github-mcp`;

    console.log(`Request path: ${req.url}`);

    // Route the request based on the path and method
    if (req.method === 'GET' && req.url.endsWith('/sse')) {
        await setupSSEConnection(req, res, token, basePath);
    } else if (req.method === 'POST' && req.url.endsWith('/messages')) {
        await handleMessages(req, res, token);
    } else {
        // Handle other API endpoints if needed
        res.status(404).json({ error: 'Not found' });
    }
}

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { loadEnv, type Env } from './config/env.js';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

/**
 * Initializes and starts the Google Ads MCP server with stdio transport
 * @param env Environment configuration
 * @returns Promise<void>
 */
export async function startGoogleAdsMcpServer(env: Env): Promise<void> {
    // Create server instance
    const server = new McpServer({
        name: 'GoogleAdsMcpServer',
        version: '0.0.1',
    });

    // Register all components
    registerResources(server, env);
    registerTools(server, env);
    registerPrompts(server, env);

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log('Google Ads MCP server started with stdio transport');
}

/**
 * Initializes and starts the Google Ads MCP server with SSE transport
 * @param port HTTP server port
 * @param env Environment configuration
 * @returns Promise<void>
 */
export async function startGoogleAdsMcpServerSSE(port: number, env: Env): Promise<void> {
    // Create server instance
    const server = new McpServer({
        name: 'GoogleAdsMcpServer',
        version: '0.0.1',
    });

    // Register all components
    registerResources(server, env);
    registerTools(server, env);
    registerPrompts(server, env);

    // Set up Express app for SSE
    const app = express();

    // Store active transports by session ID
    const transports = new Map<string, SSEServerTransport>();

    app.get('/sse', async (req, res) => {
        // Generate a session ID from request headers
        const sessionId =
            (req.headers['x-session-id'] as string) || req.headers['authorization'] || `session-${Date.now()}`;

        const transport = new SSEServerTransport('/messages', res);
        transports.set(sessionId, transport);

        // Clean up on connection close
        res.on('close', () => {
            transports.delete(sessionId);
        });

        await server.connect(transport);
    });

    app.post('/messages', express.json(), async (req, res) => {
        // Get session ID from request
        const sessionId = (req.headers['x-session-id'] as string) || req.headers['authorization'] || req.body.sessionId;

        const transport = transports.get(sessionId);
        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(404).json({ error: 'Session not found. Please connect to /sse first.' });
        }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            server: 'GoogleAdsMcpServer',
            version: '0.0.1',
            activeSessions: transports.size,
        });
    });

    // Start the HTTP server
    app.listen(port, () => {
        console.log(`Google Ads MCP SSE server listening on port ${port}`);
        console.log(`Connect to: http://localhost:${port}/sse`);
        console.log(`Health check: http://localhost:${port}/health`);
    });
}

/**
 * Main server entry point with environment-based configuration
 * @returns Promise<void>
 */
export async function startServer(): Promise<void> {
    try {
        // Load environment from command line or env vars
        const env = loadEnv();

        console.log('Environment configuration loaded successfully');
        console.log(`Customer ID: ${env.GOOGLE_ADS_CUSTOMER_ID}`);
        console.log(`API Version: ${env.API_VERSION}`);

        // Start server with appropriate transport based on configuration
        if (env.RUN_SSE) {
            console.log(`Starting server with SSE transport on port ${env.PORT}`);
            await startGoogleAdsMcpServerSSE(env.PORT, env);
        } else {
            console.log('Starting server with stdio transport');
            await startGoogleAdsMcpServer(env);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to start server: ${error.message}`);
        } else {
            console.error('Failed to start server with unknown error');
        }
        throw error;
    }
}

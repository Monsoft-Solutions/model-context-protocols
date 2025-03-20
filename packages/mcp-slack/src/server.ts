import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { registerTools } from './tools/index.js';
import { initializeSlackClient, validateToken } from './utils/slack.js';
import { Env } from './config/env.js';

/**
 * Initialize and start the Slack MCP server with stdio transport
 *
 * @param env - Environment configuration
 * @returns Promise that resolves when the server is started
 */
export async function startSlackMcpServer(env: Env): Promise<void> {
    try {
        // Initialize Slack client
        const slackClient = initializeSlackClient(env.SLACK_BOT_TOKEN);

        // Validate token
        await validateToken(slackClient);

        // Create server instance
        const server = new McpServer({
            name: 'Slack Integration MCP',
            version: '0.1.0',
        });

        // Register all tools
        registerTools(server, slackClient, env.SLACK_TEAM_ID);

        // Start the server with stdio transport
        const transport = new StdioServerTransport();
        await server.connect(transport);
    } catch (error) {
        console.error('Error starting Slack MCP server:', error);
        throw error;
    }
}

/**
 * Initialize and start the Slack MCP server with SSE transport
 *
 * @param env - Environment configuration
 * @returns Promise that resolves when the server is started
 */
export async function startSlackMcpServerSSE(env: Env): Promise<void> {
    try {
        // Initialize Slack client
        const slackClient = initializeSlackClient(env.SLACK_BOT_TOKEN);

        // Validate token
        await validateToken(slackClient);

        // Create server instance
        const server = new McpServer({
            name: 'Slack Integration MCP',
            version: '0.1.0',
        });

        // Register all tools
        registerTools(server, slackClient, env.SLACK_TEAM_ID);

        // Set up Express app for SSE
        const app = express();
        let transport: SSEServerTransport | null = null;

        app.get('/sse', async (req, res) => {
            transport = new SSEServerTransport('/messages', res);
            await server.connect(transport);
        });

        app.post('/messages', async (req, res) => {
            if (transport) {
                await transport.handlePostMessage(req, res);
            } else {
                res.status(400).send('No active transport');
            }
        });

        // Start the HTTP server
        app.listen(env.PORT, () => {
            console.log(`SSE server listening on port ${env.PORT}`);
        });
    } catch (error) {
        console.error('Error starting Slack MCP server with SSE:', error);
        throw error;
    }
}

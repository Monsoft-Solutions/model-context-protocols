import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';

// Import implementations from dedicated folders
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import { loadEnv, type Env } from './config/env.js';

/**
 * Initialize and start the MCP server with stdio transport
 * @param env Environment configuration
 * @returns Promise<void>
 */
export async function startMcpServer(env: Env): Promise<void> {
    // Create server instance
    const server = new McpServer({
        name: 'OpenAI Image Generator',
        version: '1.0.0',
    });

    // Create ImageKit config if all values are provided
    const imageKitConfig =
        env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT
            ? {
                  publicKey: env.IMAGEKIT_PUBLIC_KEY,
                  privateKey: env.IMAGEKIT_PRIVATE_KEY,
                  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
              }
            : undefined;

    // Register all components
    registerResources(server);
    registerTools(server, env.OPENAI_API_KEY, imageKitConfig);
    registerPrompts(server);

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

/**
 * Initialize and start the MCP server with SSE transport
 * @param env Environment configuration
 * @returns Promise<void>
 */
export async function startMcpServerSSE(env: Env): Promise<void> {
    // Create server instance
    const server = new McpServer({
        name: 'OpenAI Image Generator',
        version: '1.0.0',
    });

    // Create ImageKit config if all values are provided
    const imageKitConfig =
        env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT
            ? {
                  publicKey: env.IMAGEKIT_PUBLIC_KEY,
                  privateKey: env.IMAGEKIT_PRIVATE_KEY,
                  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
              }
            : undefined;

    // Register all components
    registerResources(server);
    registerTools(server, env.OPENAI_API_KEY, imageKitConfig);
    registerPrompts(server);

    // Set up Express app for SSE
    const app = express();

    // Store active transports by session ID
    const transports = new Map<string, SSEServerTransport>();

    app.get('/sse', async (req, res) => {
        const sessionId = (req.query.sessionId as string) || 'default';
        const transport = new SSEServerTransport('/messages', res);

        // Store the transport for use with POST requests
        transports.set(sessionId, transport);

        // When client disconnects, clean up the transport
        req.on('close', () => {
            transports.delete(sessionId);
        });

        await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
        const sessionId = req.body.sessionId || 'default';
        const transport = transports.get(sessionId);

        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    });

    // Start the HTTP server
    app.listen(env.PORT, () => {
        console.log(`SSE server listening on port ${env.PORT}`);
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

        // Start server with appropriate transport based on configuration
        if (env.RUN_SSE) {
            await startMcpServerSSE(env);
        } else {
            await startMcpServer(env);
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

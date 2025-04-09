import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { registerTools } from './tools/index.js';
import { loadEnv, type Env } from './config/env.js';
import { DatabaseService } from './services/database-service.js';

/**
 * Initialize and start the MCP server with stdio transport
 */
export async function startPostgresMcpServer(params: { connectionString: string; ssl?: boolean }): Promise<void> {
    // Create server instance
    const server = new McpServer({
        name: 'PostgresMcpServer',
        version: '1.0.0',
    });

    // Initialize database service
    const dbService = new DatabaseService({
        connectionString: params.connectionString,
        ssl: params.ssl,
    });

    // Register all tools
    registerTools(server, dbService);

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Handle cleanup when the process is terminated
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await dbService.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Shutting down...');
        await dbService.close();
        process.exit(0);
    });
}

/**
 * Initialize and start the MCP server with SSE transport
 */
export async function startPostgresMcpServerSSE(
    port: number,
    params: {
        connectionString: string;
        ssl?: boolean;
    },
): Promise<void> {
    // Create server instance
    const server = new McpServer({
        name: 'PostgresMcpServer',
        version: '1.0.0',
    });

    // Initialize database service
    const dbService = new DatabaseService({
        connectionString: params.connectionString,
        ssl: params.ssl,
    });

    // Register all tools
    registerTools(server, dbService);

    // Set up Express app for SSE
    const app = express();
    const transports = new Map<string, SSEServerTransport>();

    app.get('/sse', async (req, res) => {
        const sessionId = (req.query.session as string) || 'default';
        const transport = new SSEServerTransport('/messages', res);
        transports.set(sessionId, transport);

        await server.connect(transport);

        // Clean up when the connection closes
        res.on('close', () => {
            transports.delete(sessionId);
        });
    });

    app.post('/messages', async (req, res) => {
        const sessionId = req.body.sessionId || 'default';
        const transport = transports.get(sessionId);

        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(404).send({ error: 'Session not found' });
        }
    });

    // Start the HTTP server
    const httpServer = app.listen(port);

    // Handle cleanup when the process is terminated
    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await dbService.close();
        httpServer.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Shutting down...');
        await dbService.close();
        httpServer.close();
        process.exit(0);
    });
}

/**
 * Main server entry point with environment-based configuration
 */
export async function startServer(): Promise<void> {
    try {
        // Load environment from command line or env vars
        const env = loadEnv();

        // Start server with appropriate transport based on configuration
        if (env.RUN_SSE) {
            await startPostgresMcpServerSSE(env.PORT, {
                connectionString: env.POSTGRES_CONNECTION_STRING,
                ssl: true, // Default to secure connections
            });
        } else {
            await startPostgresMcpServer({
                connectionString: env.POSTGRES_CONNECTION_STRING,
                ssl: true, // Default to secure connections
            });
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

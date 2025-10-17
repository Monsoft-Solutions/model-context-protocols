import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from '../tools/index.js';
import { loadEnv } from '../config/env.js';

/**
 * Starts the MCP server with stdio transport
 *
 * @param {Object} params - Server parameters
 * @param {string} params.token - Vercel Blob read-write token
 * @returns {Promise<void>}
 */
export async function startStdioServer(params: { token: string }): Promise<void> {
    const server = new McpServer({
        name: 'mcp-vercel-blob',
        version: '1.0.0',
    });

    registerTools(server, params.token);

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

/**
 * Starts the MCP server with SSE transport
 *
 * @param {Object} params - Server parameters
 * @param {string} params.token - Vercel Blob read-write token
 * @param {number} params.port - HTTP server port
 * @returns {Promise<void>}
 */
export async function startSseServer(params: { token: string; port: number }): Promise<void> {
    const server = new McpServer({
        name: 'mcp-vercel-blob',
        version: '1.0.0',
    });

    registerTools(server, params.token);

    const app = express();
    let transport: SSEServerTransport | null = null;

    app.get('/sse', async (_req, res) => {
        transport = new SSEServerTransport('/messages', res);
        await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
        if (transport) {
            await transport.handlePostMessage(req, res);
            return;
        }
        res.status(400).json({ error: 'No active SSE transport' });
    });

    app.listen(params.port, () => {
        console.log(`SSE server listening on port ${params.port}`);
    });
}

/**
 * Main server entry point that loads environment and starts the appropriate transport
 *
 * @returns {Promise<void>}
 */
export async function startServer(): Promise<void> {
    const env = loadEnv();

    if (env.RUN_SSE) {
        await startSseServer({
            token: env.BLOB_READ_WRITE_TOKEN,
            port: env.PORT,
        });
    } else {
        await startStdioServer({
            token: env.BLOB_READ_WRITE_TOKEN,
        });
    }
}

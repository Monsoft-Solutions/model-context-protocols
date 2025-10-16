import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { registerTools } from '../tools/index.js';
import { registerResources } from '../resources/index.js';
import { registerPrompts } from '../prompts/index.js';
import { loadEnv } from '../config/env.js';

export async function startStdioServer(params: { token: string }): Promise<void> {
    const server = new McpServer({ name: 'mcp-fal-ai', version: '0.1.0' });
    registerResources(server, params.token);
    registerTools(server, params.token);
    registerPrompts(server);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

export async function startSseServer(params: { token: string; port: number }): Promise<void> {
    const server = new McpServer({ name: 'mcp-fal-ai', version: '0.1.0' });
    registerResources(server, params.token);
    registerTools(server, params.token);
    registerPrompts(server);

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

    app.listen(params.port, () => {});
}

export async function startServer(): Promise<void> {
    const env = loadEnv();
    if (env.RUN_SSE) {
        await startSseServer({ token: env.FAL_API_KEY, port: env.PORT });
    } else {
        await startStdioServer({ token: env.FAL_API_KEY });
    }
}

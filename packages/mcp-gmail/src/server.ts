import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import path from 'path';
import os from 'os';
import { registerTools } from './tools/index.js';
import { loadCredentials, authenticate } from './utils/gmail.js';
import { GmailApiError } from './errors/gmail-api-error.js';
import { Env } from './config/env.js';

// Configuration paths
const CONFIG_DIR = path.join(os.homedir(), '.gmail-mcp');

/**
 * Initialize and start the Gmail MCP server with stdio transport
 *
 * @param env - Environment configuration
 * @returns Promise that resolves when the server is started
 */
export async function startGmailMcpServer(env: Env): Promise<void> {
    try {
        // Load OAuth credentials
        const oauth2Client = await loadCredentials(CONFIG_DIR, env.GMAIL_OAUTH_PATH, env.GMAIL_CREDENTIALS_PATH);

        // Create server instance
        const server = new McpServer({
            name: 'gmail',
            version: '1.0.0',
        });

        // Register all tools
        registerTools(server, oauth2Client);

        // Start the server with stdio transport
        const transport = new StdioServerTransport();
        await server.connect(transport);
    } catch (error) {
        console.error('Error starting Gmail MCP server:', error);
        throw error;
    }
}

/**
 * Initialize and start the Gmail MCP server with SSE transport
 *
 * @param env - Environment configuration
 * @returns Promise that resolves when the server is started
 */
export async function startGmailMcpServerSSE(env: Env): Promise<void> {
    try {
        // Load OAuth credentials
        const oauth2Client = await loadCredentials(CONFIG_DIR, env.GMAIL_OAUTH_PATH, env.GMAIL_CREDENTIALS_PATH);

        // Create server instance
        const server = new McpServer({
            name: 'gmail',
            version: '1.0.0',
        });

        // Register all tools
        registerTools(server, oauth2Client);

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
        console.error('Error starting Gmail MCP server with SSE:', error);
        throw error;
    }
}

/**
 * Authenticate with Gmail API
 *
 * @param env - Environment configuration
 * @returns Promise that resolves when authentication is complete
 */
export async function authenticateGmail(env: Env): Promise<void> {
    try {
        // Load OAuth credentials
        const oauth2Client = await loadCredentials(CONFIG_DIR, env.GMAIL_OAUTH_PATH, env.GMAIL_CREDENTIALS_PATH);

        // Authenticate with Gmail API
        await authenticate(oauth2Client, env.GMAIL_CREDENTIALS_PATH);
        console.log('Authentication completed successfully');
    } catch (error) {
        if (error instanceof GmailApiError) {
            console.error(`Authentication error: ${error.message}`);
        } else {
            console.error('Authentication error:', error);
        }
        throw error;
    }
}

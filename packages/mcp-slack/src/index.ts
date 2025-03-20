#!/usr/bin/env node
import { startSlackMcpServer, startSlackMcpServerSSE } from './server.js';
import { loadEnv } from './config/env.js';

/**
 * Main entry point for the Slack MCP server
 */
async function main() {
    try {
        // Load environment from command line or env vars
        const env = loadEnv();

        console.log('Environment parsed and loaded');

        // Start server with appropriate transport based on configuration
        if (env.RUN_SSE) {
            console.log(`Starting server with SSE transport on port ${env.PORT}`);
            await startSlackMcpServerSSE(env);
        } else {
            console.log('Starting server with stdio transport');
            await startSlackMcpServer(env);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to start server: ${error.message}`);
        } else {
            console.error('Failed to start server with unknown error');
        }
        process.exit(1);
    }
}

// Start the server
main().catch((error) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
});

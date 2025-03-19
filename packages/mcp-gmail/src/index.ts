#!/usr/bin/env node

import { loadEnv } from './config/env.js';
import { startGmailMcpServer, startGmailMcpServerSSE, authenticateGmail } from './server.js';
import { EnvironmentValidationError } from './errors/environment-validation-error.js';

async function main() {
    try {
        // Load environment configuration
        const env = loadEnv();

        // Check if authentication mode is requested
        const isAuthMode = process.argv.includes('auth');

        if (isAuthMode) {
            // Run in authentication mode
            await authenticateGmail(env);
            process.exit(0);
        } else {
            // Run in server mode
            console.log('Starting Gmail MCP server...');

            if (env.RUN_SSE) {
                console.log(`Using SSE transport on port ${env.PORT}`);
                await startGmailMcpServerSSE(env);
            } else {
                console.log('Using stdio transport');
                await startGmailMcpServer(env);
            }
        }
    } catch (error) {
        if (error instanceof EnvironmentValidationError) {
            console.error(`Environment configuration error: ${error.message}`);
        } else {
            console.error('Server error:', error);
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});

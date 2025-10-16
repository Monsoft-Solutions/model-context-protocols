#!/usr/bin/env node
import { startServer } from './server.js';

/**
 * Main entry point for the Google Ads MCP server
 */
async function main() {
    try {
        // Start the server - configuration will be loaded from env/CLI args
        await startServer();
        // The server will keep running until terminated
    } catch (error) {
        console.error('Error starting Google Ads MCP server:', error);
        process.exit(1);
    }
}

// Start the server
main();

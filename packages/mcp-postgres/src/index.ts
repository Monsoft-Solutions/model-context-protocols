#!/usr/bin/env node
import { startServer } from './server.js';

/**
 * Main entry point for the Postgres MCP
 */
async function main(): Promise<void> {
    // Start the server - config will be loaded from env/CLI args
    await startServer();
    // The server will keep running until terminated
}

// Start the server and handle errors
main().catch((error) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
});

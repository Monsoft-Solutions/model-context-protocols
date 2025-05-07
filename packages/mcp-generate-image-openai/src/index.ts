#!/usr/bin/env node
import { startServer } from './server.js';

async function main() {
    // Start the server - API key will be loaded from env/CLI args
    await startServer();
    // The server will keep running until terminated
}

// Start the server
main().catch((error) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
});

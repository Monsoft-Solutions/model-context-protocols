import { startCodeArchitectServer } from './code-architect.js';

/**
 * Start the MCP Code Architect server
 */
async function main() {
    try {
        await startCodeArchitectServer();
        // The server will keep running until terminated
    } catch (error) {
        console.error('Error starting MCP Code Architect server:', error);
        process.exit(1);
    }
}

// Start the server
main();

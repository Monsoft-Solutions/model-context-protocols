import { startEraserDiagramServer } from './eraser-diagram.js';

/**
 * Start the MCP Eraser Diagram server
 */
async function main() {
    // Get the API token from environment variables
    const apiToken = '<eraser-api-token>';

    if (!apiToken) {
        console.error('Error: ERASER_API_TOKEN environment variable is not set');
        process.exit(1);
    }

    try {
        await startEraserDiagramServer(apiToken);
        // The server will keep running until terminated
    } catch (error) {
        console.error('Error starting MCP Eraser Diagram server:', error);
        process.exit(1);
    }
}

// Start the server
main();

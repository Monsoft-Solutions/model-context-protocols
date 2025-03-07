import { startGitHubProjectManagerServer } from './github-project-manager.js';

/**
 * Start the MCP GitHub Project Manager server
 */
async function main() {
    try {
        await startGitHubProjectManagerServer();
        // The server will keep running until terminated
    } catch (error) {
        console.error(
            'Error starting MCP GitHub Project Manager server:',
            error,
        );
        process.exit(1);
    }
}

// Start the server
main();

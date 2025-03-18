import { startGitHubProjectManagerServer } from './github-project-manager.js';
import { loadEnv } from '../config/env.js';

/**
 * Custom error class for missing GitHub token
 */

/**
 * Start the MCP GitHub Project Manager server
 */
async function main() {
    // Load environment variables from file
    const env = loadEnv();
    const token = env.GITHUB_PERSONAL_TOKEN;

    await startGitHubProjectManagerServer(token);
    // The server will keep running until terminated
}

// Start the server
main().catch((error) => {
    console.error('Error starting MCP GitHub Project Manager server:', error);
    process.exit(1);
});

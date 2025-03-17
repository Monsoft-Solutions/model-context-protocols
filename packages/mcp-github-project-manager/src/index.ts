#!/usr/bin/env node

// Re-export client
export * from './client/index.js';

// Export server for direct usage
export * from './server/github-project-manager.js';

import { startGitHubProjectManagerServer } from './server/github-project-manager.js';
import { loadEnv } from './config/env.js';

/**
 * Custom error class for missing GitHub token
 */

/**
 * Start the MCP GitHub Project Manager server
 */
async function main() {
    try {
        // Load environment variables from file
        const env = loadEnv();
        const token = env.GITHUB_PERSONAL_TOKEN;

        await startGitHubProjectManagerServer(token);
        // The server will keep running until terminated
    } catch (error) {
        console.error('Error starting MCP GitHub Project Manager server:', error);
        process.exit(1);
    }
}

// Start the server
main();

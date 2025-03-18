#!/usr/bin/env node

import { startGitHubProjectManagerServer } from './server/github-project-manager.js';
import { startGitHubProjectManagerServerSSE } from './server/github-project-manager-sse.js';
import { loadEnv } from './config/env.js';

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
    const runSSE = env.RUN_SSE;
    const port = env.PORT;
    if (runSSE) {
        await startGitHubProjectManagerServerSSE(token, port);
    } else {
        await startGitHubProjectManagerServer(token);
    }
    // The server will keep running until terminated
}

// Start the server
main().catch((error) => {
    console.error('Error starting MCP GitHub Project Manager server:', error);
    process.exit(1);
});

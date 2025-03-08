import { startGitHubProjectManagerServer } from './github-project-manager.js';
import { loadEnv } from '../config/env.js';

/**
 * Custom error class for missing GitHub token
 */
class MissingGitHubTokenError extends Error {
    constructor() {
        super('GITHUB_PERSONAL_TOKEN environment variable is required');
        this.name = 'MissingGitHubTokenError';
        Object.setPrototypeOf(this, MissingGitHubTokenError.prototype);
    }
}

/**
 * Start the MCP GitHub Project Manager server
 */
async function main() {
    try {
        // Load environment variables from file
        const env = loadEnv();
        const token = env.GITHUB_PERSONAL_TOKEN;

        if (!token) {
            throw new MissingGitHubTokenError();
        }
        await startGitHubProjectManagerServer(token);
        // The server will keep running until terminated
    } catch (error) {
        console.error('Error starting MCP GitHub Project Manager server:', error);
        process.exit(1);
    }
}

// Start the server
main();

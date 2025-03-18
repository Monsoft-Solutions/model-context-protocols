import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { MissingGitHubTokenError } from '../errors/index.js';

/**
 * Environment configuration type definition
 * Defines the configuration required for GitHub Project Manager
 */
export type EnvConfig = {
    GITHUB_PERSONAL_TOKEN: string;
    PORT: number;
    RUN_SSE: number;
};

const envConfigSchema = z.object({
    GITHUB_PERSONAL_TOKEN: z.string().describe('GitHub personal access token'),
    PORT: z.number().describe('Port to run the server on').optional().default(3010),
    RUN_SSE: z.number().describe('Run the server in SSE mode').optional().default(0),
});

/**
 * Parse command line arguments using yargs
 *
 * Example usage:
 * ```
 * node your-script.js --GITHUB_PERSONAL_TOKEN=your_token_here
 * ```
 *
 * @returns Parsed environment configuration from command line arguments
 */
function parseArgs() {
    const args = yargs(hideBin(process.argv)).parse();

    console.log(args);

    const envConfig = envConfigSchema.safeParse(args);

    if (!envConfig.success) {
        console.error(envConfig.error);
        return undefined;
    }

    return envConfig.data;
}

/**
 * Load environment configuration from command line arguments
 * @returns Environment configuration
 * @throws {MissingGitHubTokenError} When GitHub token is not provided
 */
export function loadEnv(): EnvConfig {
    const envConfig = parseArgs();
    if (!envConfig) {
        throw new MissingGitHubTokenError();
    }
    return envConfig;
}

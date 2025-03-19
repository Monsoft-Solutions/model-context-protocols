import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';
import path from 'path';
import os from 'os';

// Configuration paths
const CONFIG_DIR = path.join(os.homedir(), '.gmail-mcp');
const DEFAULT_OAUTH_PATH = path.join(CONFIG_DIR, 'gcp-oauth.keys.json');
const DEFAULT_CREDENTIALS_PATH = path.join(CONFIG_DIR, 'credentials.json');

// Define the environment schema with zod
export const envSchema = z.object({
    GMAIL_OAUTH_PATH: z.string().optional().default(DEFAULT_OAUTH_PATH),
    GMAIL_CREDENTIALS_PATH: z.string().optional().default(DEFAULT_CREDENTIALS_PATH),
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3000),
});

// Export the type derived from the schema
export type Env = z.infer<typeof envSchema>;

/**
 * Loads environment variables from command line arguments and env vars.
 * Run with: npx gmail-mcp --oauth-path=PATH --credentials-path=PATH --run-sse --port=4000
 * Or set environment variables GMAIL_OAUTH_PATH, GMAIL_CREDENTIALS_PATH, RUN_SSE, PORT
 *
 * @returns {Env} Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    // Command line parsing with yargs
    const parsedArgs = yargs(hideBin(process.argv))
        .option('oauth-path', {
            alias: 'o',
            description: 'Path to the OAuth keys file',
            type: 'string',
        })
        .option('credentials-path', {
            alias: 'c',
            description: 'Path to the credentials file',
            type: 'string',
        })
        .option('run-sse', {
            alias: 's',
            description: 'Run server with SSE transport',
            type: 'boolean',
        })
        .option('port', {
            alias: 'p',
            description: 'Port for HTTP server (when using SSE)',
            type: 'number',
        })
        .parseSync();

    // Priority: command line args > environment variables > defaults
    const envData = {
        GMAIL_OAUTH_PATH: (parsedArgs['oauth-path'] as string | undefined) || process.env.GMAIL_OAUTH_PATH,
        GMAIL_CREDENTIALS_PATH:
            (parsedArgs['credentials-path'] as string | undefined) || process.env.GMAIL_CREDENTIALS_PATH,
        RUN_SSE: parsedArgs['run-sse'] !== undefined ? Boolean(parsedArgs['run-sse']) : process.env.RUN_SSE === 'true',
        PORT:
            (parsedArgs.port as number | undefined) || (process.env.PORT ? parseInt(process.env.PORT, 10) : undefined),
    };

    try {
        return envSchema.parse(envData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
            throw new EnvironmentValidationError(`Environment validation failed:\n${errorMessages}`);
        }
        throw error;
    }
}

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';

// Define the environment schema with zod
export const envSchema = z.object({
    API_TOKEN: z.string().min(1, 'API Token is required').optional(),
    POSTGRES_CONNECTION_STRING: z.string().min(1, 'Postgres connection string is required'),
    // Server configuration options
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3000),
});

// Export the type derived from the schema
export type Env = z.infer<typeof envSchema>;

/**
 * Loads environment variables from command line arguments and env vars.
 * Run with: npx mcp-postgres --token=YOUR_TOKEN --connection-string=YOUR_CONNECTION_STRING --run-sse --port=4000
 * Or set environment variables API_TOKEN, POSTGRES_CONNECTION_STRING, RUN_SSE, PORT
 *
 * @returns {Env} Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    // Command line parsing with yargs - use parseSync for synchronous parsing
    const argv = yargs(hideBin(process.argv))
        .option('token', {
            alias: 't',
            description: 'API Token',
            type: 'string',
        })
        .option('connection-string', {
            alias: 'c',
            description: 'Postgres connection string',
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
        .help()
        .parseSync();

    // Priority: command line args > environment variables
    const envData = {
        API_TOKEN: argv.token || process.env.API_TOKEN,
        POSTGRES_CONNECTION_STRING: argv.connectionString || process.env.POSTGRES_CONNECTION_STRING,
        RUN_SSE: argv.runSse || process.env.RUN_SSE === 'true',
        PORT: argv.port || (process.env.PORT ? parseInt(process.env.PORT, 10) : undefined),
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

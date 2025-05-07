import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';

// Define the environment schema with zod
export const envSchema = z.object({
    OPENAI_API_KEY: z.string().min(1, 'OpenAI API Key is required'),
    // Server configuration options
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3000),
});

// Export the type derived from the schema
export type Env = z.infer<typeof envSchema>;

/**
 * Loads environment variables from command line arguments and env vars.
 * Run with: npx mcp-generate-image-openai --api-key=YOUR_OPENAI_KEY --run-sse --port=4000
 * Or set environment variables OPENAI_API_KEY, RUN_SSE, PORT
 *
 * @returns {Env} Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    // Command line parsing with yargs
    const argv = yargs(hideBin(process.argv))
        .option('api-key', {
            alias: 'k',
            description: 'OpenAI API Key',
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
        .help().argv;

    // Combine command line args with environment variables
    // Priority: command line args > environment variables
    const envData = {
        OPENAI_API_KEY: (argv as any)['api-key'] || process.env.OPENAI_API_KEY,
        RUN_SSE: (argv as any)['run-sse'] !== undefined ? (argv as any)['run-sse'] : process.env.RUN_SSE === 'true',
        PORT: (argv as any).port || (process.env.PORT ? parseInt(process.env.PORT, 10) : undefined),
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

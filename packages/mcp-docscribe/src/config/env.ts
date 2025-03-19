import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/documentation-error.js';

/**
 * Environment schema definition
 */
export const envSchema = z.object({
    /**
     * API Token for the AI service
     */
    API_TOKEN: z.string().min(1, 'API Token is required'),

    /**
     * AI provider to use (default: 'anthropic')
     */
    AI_PROVIDER: z.enum(['anthropic', 'openai']).default('anthropic'),

    /**
     * Whether to run the server with SSE transport
     */
    RUN_SSE: z.boolean().optional().default(false),

    /**
     * Port for the HTTP server (when using SSE)
     */
    PORT: z.number().int().positive().optional().default(3000),
});

/**
 * Environment configuration type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Loads environment variables from command line arguments and env vars
 * @returns Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    // Command line parsing with yargs
    const argv = yargs(hideBin(process.argv))
        .option('token', {
            alias: 't',
            description: 'API Token for AI service',
            type: 'string',
        })
        .option('provider', {
            alias: 'p',
            description: 'AI provider to use (anthropic or openai)',
            type: 'string',
            choices: ['anthropic', 'openai'],
        })
        .option('run-sse', {
            alias: 's',
            description: 'Run server with SSE transport',
            type: 'boolean',
        })
        .option('port', {
            description: 'Port for HTTP server (when using SSE)',
            type: 'number',
        })
        .help()
        .parseSync();

    // Priority: command line args > environment variables
    const envData = {
        API_TOKEN: argv.token ?? process.env.API_TOKEN,
        AI_PROVIDER: argv.provider ?? process.env.AI_PROVIDER,
        RUN_SSE: argv.runSse ?? process.env.RUN_SSE === 'true',
        PORT: argv.port ?? Number(process.env.PORT),
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

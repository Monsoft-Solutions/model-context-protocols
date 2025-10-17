import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';

/**
 * Environment schema definition for Vercel Blob MCP server
 */
export const envSchema = z.object({
    BLOB_READ_WRITE_TOKEN: z.string().min(1, 'BLOB_READ_WRITE_TOKEN is required'),
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3002),
});

/**
 * Environment configuration type
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Loads and validates environment variables from command line arguments or environment
 *
 * Run with: npx mcp-vercel-blob --token=YOUR_BLOB_TOKEN
 * Or set environment variable BLOB_READ_WRITE_TOKEN
 *
 * @returns {Env} Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    const argv = yargs(hideBin(process.argv))
        .option('token', {
            alias: 't',
            description: 'Vercel Blob read-write token',
            type: 'string',
        })
        .option('run-sse', {
            alias: 's',
            description: 'Run SSE HTTP server',
            type: 'boolean',
        })
        .option('port', {
            alias: 'p',
            description: 'HTTP server port for SSE',
            type: 'number',
        })
        .help().argv as unknown as {
        token?: string;
        runSse?: boolean;
        port?: number;
    };

    const envData = {
        BLOB_READ_WRITE_TOKEN: argv.token ?? process.env.BLOB_READ_WRITE_TOKEN,
        RUN_SSE: argv.runSse ?? (process.env.RUN_SSE ? process.env.RUN_SSE === 'true' : undefined),
        PORT: argv.port ?? (process.env.PORT ? Number(process.env.PORT) : undefined),
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

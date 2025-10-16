import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';

export const envSchema = z.object({
    FAL_API_KEY: z.string().min(1, 'FAL_API_KEY is required'),
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3001),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
    const argv = yargs(hideBin(process.argv))
        .option('fal-api-key', { alias: 'k', description: 'fal.ai API key', type: 'string' })
        .option('run-sse', { alias: 's', description: 'Run SSE HTTP server', type: 'boolean' })
        .option('port', { alias: 'p', description: 'HTTP server port for SSE', type: 'number' })
        .help().argv as unknown as { falApiKey?: string; runSse?: boolean; port?: number };

    const envData = {
        FAL_API_KEY: argv.falApiKey ?? process.env.FAL_API_KEY,
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

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';

// Define the environment schema with zod
export const envSchema = z.object({
    SLACK_BOT_TOKEN: z.string().min(1, 'Slack Bot Token is required'),
    SLACK_TEAM_ID: z.string().min(1, 'Slack Team ID is required'),
    // Server configuration options
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3000),
});

// Export the type derived from the schema
export type Env = z.infer<typeof envSchema>;

/**
 * Loads environment variables from command line arguments and env vars.
 * Run with: npx mcp-slack --token=xoxb-YOUR_TOKEN --team-id=T01234567 --run-sse --port=4000
 * Or set environment variables SLACK_BOT_TOKEN, SLACK_TEAM_ID, RUN_SSE, PORT
 *
 * @returns {Env} Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    // Command line parsing with yargs
    const argv = yargs(hideBin(process.argv))
        .option('token', {
            alias: 't',
            description: 'Slack Bot Token (starts with xoxb-)',
            type: 'string',
        })
        .option('team-id', {
            alias: 'i',
            description: 'Slack Team ID (starts with T)',
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
        SLACK_BOT_TOKEN: (argv.token as string) ?? process.env.SLACK_BOT_TOKEN,
        SLACK_TEAM_ID: (argv['team-id'] as string) ?? process.env.SLACK_TEAM_ID,
        RUN_SSE: (argv['run-sse'] as boolean) ?? process.env.RUN_SSE === 'true',
        PORT: (argv.port as number) ?? (process.env.PORT ? parseInt(process.env.PORT, 10) : undefined),
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

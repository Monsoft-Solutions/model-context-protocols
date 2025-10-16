import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { z } from 'zod';
import { EnvironmentValidationError } from '../errors/environment-validation-error.js';

/**
 * Environment schema for Google Ads MCP server configuration
 */
export const envSchema = z.object({
    // Google Ads API credentials
    GOOGLE_ADS_CLIENT_ID: z.string().min(1, 'Google Ads Client ID is required'),
    GOOGLE_ADS_CLIENT_SECRET: z.string().min(1, 'Google Ads Client Secret is required'),
    GOOGLE_ADS_DEVELOPER_TOKEN: z.string().min(1, 'Google Ads Developer Token is required'),
    GOOGLE_ADS_REFRESH_TOKEN: z.string().min(1, 'Google Ads Refresh Token is required'),
    GOOGLE_ADS_CUSTOMER_ID: z.string().min(1, 'Google Ads Customer ID is required'),

    // Server configuration
    RUN_SSE: z.boolean().optional().default(false),
    PORT: z.number().int().positive().optional().default(3000),

    // Optional configurations
    GOOGLE_ADS_LOGIN_CUSTOMER_ID: z.string().optional(),
    API_VERSION: z.string().optional().default('v20'),
    MAX_KEYWORDS_PER_REQUEST: z.number().int().positive().optional().default(100),
    RATE_LIMIT_DELAY_MS: z.number().int().positive().optional().default(1000),
});

/**
 * Type definition for environment configuration
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Loads environment variables from command line arguments and env vars.
 *
 * Usage:
 * ```bash
 * npx mcp-google-ads --client-id=YOUR_CLIENT_ID --client-secret=YOUR_SECRET \
 *   --developer-token=YOUR_TOKEN --refresh-token=YOUR_REFRESH_TOKEN \
 *   --customer-id=YOUR_CUSTOMER_ID
 * ```
 *
 * Or set environment variables:
 * - GOOGLE_ADS_CLIENT_ID
 * - GOOGLE_ADS_CLIENT_SECRET
 * - GOOGLE_ADS_DEVELOPER_TOKEN
 * - GOOGLE_ADS_REFRESH_TOKEN
 * - GOOGLE_ADS_CUSTOMER_ID
 *
 * @returns {Env} Validated environment configuration
 * @throws {EnvironmentValidationError} When environment validation fails
 */
export function loadEnv(): Env {
    // Command line parsing with yargs
    const argv = yargs(hideBin(process.argv))
        .option('client-id', {
            alias: 'c',
            description: 'Google Ads Client ID',
            type: 'string',
        })
        .option('client-secret', {
            alias: 's',
            description: 'Google Ads Client Secret',
            type: 'string',
        })
        .option('developer-token', {
            alias: 'd',
            description: 'Google Ads Developer Token',
            type: 'string',
        })
        .option('refresh-token', {
            alias: 'r',
            description: 'Google Ads Refresh Token',
            type: 'string',
        })
        .option('customer-id', {
            alias: 'i',
            description: 'Google Ads Customer ID',
            type: 'string',
        })
        .option('login-customer-id', {
            alias: 'l',
            description: 'Google Ads Login Customer ID (for manager accounts)',
            type: 'string',
        })
        .option('api-version', {
            alias: 'v',
            description: 'Google Ads API Version',
            type: 'string',
        })
        .option('max-keywords', {
            alias: 'k',
            description: 'Maximum keywords per request',
            type: 'number',
        })
        .option('rate-limit-delay', {
            alias: 'rl',
            description: 'Rate limit delay in milliseconds',
            type: 'number',
        })
        .option('run-sse', {
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
        GOOGLE_ADS_CLIENT_ID: argv['client-id'] || process.env.GOOGLE_ADS_CLIENT_ID,
        GOOGLE_ADS_CLIENT_SECRET: argv['client-secret'] || process.env.GOOGLE_ADS_CLIENT_SECRET,
        GOOGLE_ADS_DEVELOPER_TOKEN: argv['developer-token'] || process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        GOOGLE_ADS_REFRESH_TOKEN: argv['refresh-token'] || process.env.GOOGLE_ADS_REFRESH_TOKEN,
        GOOGLE_ADS_CUSTOMER_ID: argv['customer-id'] || process.env.GOOGLE_ADS_CUSTOMER_ID,
        GOOGLE_ADS_LOGIN_CUSTOMER_ID: argv['login-customer-id'] || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
        API_VERSION: argv['api-version'] || process.env.GOOGLE_ADS_API_VERSION,
        MAX_KEYWORDS_PER_REQUEST:
            argv['max-keywords'] ||
            (process.env.MAX_KEYWORDS_PER_REQUEST ? parseInt(process.env.MAX_KEYWORDS_PER_REQUEST) : undefined),
        RATE_LIMIT_DELAY_MS:
            argv['rate-limit-delay'] ||
            (process.env.RATE_LIMIT_DELAY_MS ? parseInt(process.env.RATE_LIMIT_DELAY_MS) : undefined),
        RUN_SSE: argv['run-sse'] || process.env.RUN_SSE === 'true',
        PORT: argv.port || (process.env.PORT ? parseInt(process.env.PORT) : undefined),
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

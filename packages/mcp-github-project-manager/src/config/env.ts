import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Environment configuration loader
 * Loads environment variables from a .env file in the specified directory
 */
export type EnvConfig = {
    GITHUB_PERSONAL_TOKEN: string;
    [key: string]: string;
};

/**
 * Load environment variables from a file
 * @param envFilePath - Path to the environment file
 * @returns Environment configuration object
 */
export function loadEnvFromFile(envFilePath: string): EnvConfig {
    try {
        // Check if file exists
        if (!fs.existsSync(envFilePath)) {
            throw new Error(`Environment file not found: ${envFilePath}`);
        }

        // Read and parse the env file
        const envContent = fs.readFileSync(envFilePath, 'utf-8');
        const envVars: EnvConfig = {
            GITHUB_PERSONAL_TOKEN: '',
        };

        // Parse each line in the format KEY=VALUE
        envContent.split('\n').forEach((line) => {
            const trimmedLine = line.trim();
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return;
            }

            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                // Remove quotes if present
                const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
                envVars[key.trim()] = cleanValue;
            }
        });

        return envVars;
    } catch (error) {
        console.error(`Error loading environment file: ${error instanceof Error ? error.message : String(error)}`);
        // Fall back to process.env
        return {
            GITHUB_PERSONAL_TOKEN: process.env.GITHUB_PERSONAL_TOKEN || '',
        };
    }
}

/**
 * Get the default environment file path
 * @returns Path to the default .env file
 */
export function getDefaultEnvFilePath(): string {
    // Get the directory of the current module
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // First check if we're running from the dist folder
    const distEnvPath = path.resolve(__dirname, '../.env');

    // If we're running from dist and the file exists there, use it
    if (fs.existsSync(distEnvPath)) {
        return distEnvPath;
    }

    // Otherwise, look for it in the project root (for development)
    const projectRoot = path.resolve(__dirname, '../');
    return path.join(projectRoot, '.env');
}

/**
 * Load environment configuration from the default location
 * @returns Environment configuration
 */
export function loadEnv(): EnvConfig {
    const envPath = getDefaultEnvFilePath();
    return loadEnvFromFile(envPath);
}

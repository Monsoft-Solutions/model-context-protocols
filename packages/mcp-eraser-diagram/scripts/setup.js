#!/usr/bin/env node

/**
 * This script sets up the MCP Eraser Diagram package.
 * It prompts the user to enter their Eraser API token and saves it to a .env file.
 */

import { createInterface } from 'readline';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the .env file
const envPath = resolve(__dirname, '../.env');

// Create a readline interface
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log('Welcome to the MCP Eraser Diagram setup!');
console.log('This script will help you set up your Eraser API token.');
console.log(
    'You can get your API token from https://app.eraser.io/account/api-keys',
);
console.log('');

// Prompt for the API token
rl.question('Please enter your Eraser API token: ', async (token) => {
    if (!token) {
        console.error('Error: API token is required');
        rl.close();
        process.exit(1);
    }

    try {
        // Write the token to the .env file
        await writeFile(envPath, `ERASER_API_TOKEN=${token}\n`);
        console.log('');
        console.log('API token saved successfully!');
        console.log(`The token has been saved to ${envPath}`);
        console.log('');
        console.log('You can now run the example with:');
        console.log('npm run example');
    } catch (error) {
        console.error('Error saving API token:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
});

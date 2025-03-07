#!/usr/bin/env node

import { startGitHubProjectManagerServer } from '../dist/server/github-project-manager.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

// Load environment variables from .env file
let token = process.env.GITHUB_TOKEN;

if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from ${envPath}`);
    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.error('Error loading .env file:', result.error);
    } else {
        console.log('Environment variables loaded successfully');
        token = process.env.GITHUB_TOKEN;
    }
} else {
    console.warn('.env file not found at', envPath);
}

console.log('Starting GitHub Project Manager Example');
console.log('======================================');

if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is not set.');
    console.error('Please run the setup script first: npm run setup');
    process.exit(1);
}

console.log('GitHub token found. Starting server...');

// Start the server with the token
startGitHubProjectManagerServer(token)
    .then(() => {
        console.log('Server started successfully.');
        console.log('You can now use the GitHub Project Manager tools.');
        console.log('The server will keep running until terminated (Ctrl+C).');
    })
    .catch((error) => {
        console.error('Error starting server:', error);
        process.exit(1);
    });

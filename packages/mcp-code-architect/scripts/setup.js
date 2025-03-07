#!/usr/bin/env node

/**
 * Script to set up the MCP Code Architect package
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the package directory
const packageDir = path.resolve(__dirname, '..');

// Function to run a command and log its output
function runCommand(command, cwd = packageDir) {
    console.log(`Running: ${command}`);
    try {
        execSync(command, { cwd, stdio: 'inherit' });
    } catch (error) {
        console.error(`Error running command: ${command}`);
        console.error(error.message);
        process.exit(1);
    }
}

// Check if .env file exists, create it if not
const envPath = path.join(packageDir, '.env');
if (!fs.existsSync(envPath)) {
    console.log('Creating .env file...');
    fs.writeFileSync(envPath, 'ANTHROPIC_API_KEY=your_api_key_here\n', 'utf8');
    console.log(
        '.env file created. Please update it with your Anthropic API key.',
    );
}

// Install dependencies
console.log('Installing dependencies...');
runCommand('npm install');

// Build the package
console.log('Building the package...');
runCommand('npm run build');

console.log('\n=== Setup Complete ===');
console.log('To run the example:');
console.log(
    '1. Make sure you have set your Anthropic API key in the .env file',
);
console.log('2. Run: npm run example');

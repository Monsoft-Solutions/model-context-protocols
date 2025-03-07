#!/usr/bin/env node

/**
 * This script runs the example file to demonstrate the MCP Eraser Diagram client.
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the example file
const examplePath = resolve(__dirname, '../dist/examples/generate-erd.js');

// Run the example
const child = spawn('node', [examplePath], {
    stdio: 'inherit',
    env: {
        ...process.env,
    },
});

// Handle process exit
child.on('exit', (code) => {
    process.exit(code);
});

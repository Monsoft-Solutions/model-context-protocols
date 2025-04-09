#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to create a Promise that resolves after a specified time
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Path to the MCP executable
const mcpPath = path.join(__dirname, 'dist', 'index.js');

// Connection string from environment variable
const connectionString =
    process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database?sslmode=require';

// Start the MCP process
const mcp = spawn('node', [mcpPath, '--token=test', `--connection-string=${connectionString}`]);

// Handle MCP process output
mcp.stdout.on('data', (data) => {
    console.log(`MCP stdout: ${data}`);
});

mcp.stderr.on('data', (data) => {
    console.error(`MCP stderr: ${data}`);
});

mcp.on('close', (code) => {
    console.log(`MCP process exited with code ${code}`);
});

// Function to send a request to the MCP
async function sendRequest(request) {
    return new Promise((resolve, reject) => {
        const jsonRequest = JSON.stringify(request) + '\n';
        console.log('\nSending request:', request);

        // Write the request to MCP's stdin
        mcp.stdin.write(jsonRequest);

        // Set up a one-time listener for the response
        const responseHandler = (data) => {
            try {
                const responseText = data.toString();
                console.log('\nRaw response:', responseText);

                // Parse the JSON response
                const response = JSON.parse(responseText);
                resolve(response);
            } catch (error) {
                console.error('Error parsing response:', error);
                reject(error);
            }
        };

        mcp.stdout.once('data', responseHandler);
    });
}

// Main test function
async function runTests() {
    try {
        // Give the MCP some time to start up
        await sleep(2000);

        // First, check the capabilities of the server
        const capabilitiesRequest = {
            jsonrpc: '2.0',
            id: '0',
            method: 'getCapabilities',
        };

        const capabilitiesResponse = await sendRequest(capabilitiesRequest);
        console.log('\nCapabilities response:');
        console.log(JSON.stringify(capabilitiesResponse, null, 2));

        // Test 1: Get schema
        const schemaRequest = {
            jsonrpc: '2.0',
            id: '1',
            method: 'mcp.tool.call',
            params: {
                name: 'postgres-get-schema',
                arguments: {},
            },
        };

        const schemaResponse = await sendRequest(schemaRequest);
        console.log('\nSchema response:');
        console.log(JSON.stringify(schemaResponse, null, 2));

        // Test 2: Execute a simple query to list tables
        await sleep(1000);

        const queryRequest = {
            jsonrpc: '2.0',
            id: '2',
            method: 'mcp.tool.call',
            params: {
                name: 'postgres-execute-query',
                arguments: {
                    query: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' LIMIT 5;",
                },
            },
        };

        const queryResponse = await sendRequest(queryRequest);
        console.log('\nQuery response:');
        console.log(JSON.stringify(queryResponse, null, 2));

        // Clean up and exit
        console.log('\nTests completed, shutting down...');
        mcp.stdin.end();
        setTimeout(() => process.exit(0), 1000);
    } catch (error) {
        console.error('Test error:', error);
        mcp.kill();
        process.exit(1);
    }
}

// Run the tests
runTests();

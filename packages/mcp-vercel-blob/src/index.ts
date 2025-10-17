#!/usr/bin/env node
import { startServer } from './server/index.js';

/**
 * Main entry point for the Vercel Blob MCP server
 */
async function main(): Promise<void> {
    await startServer();
}

main().catch((error: unknown) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
});

#!/usr/bin/env node
import { startServer } from './server/index.js';

async function main(): Promise<void> {
    await startServer();
}

main().catch((error: unknown) => {
    console.error('Error starting MCP server:', error);
    process.exit(1);
});

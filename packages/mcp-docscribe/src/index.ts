#!/usr/bin/env node

/**
 * @file Main entry point for the DocScribe package
 */

// Export public API
export { startDocScribeServer } from './server/mcp-server.js';
export { DocumentService } from './services/document-service.js';
export { AIService } from './services/ai-service.js';
export * from './types/documentation-types.js';
export * from './errors/documentation-error.js';
export * from './templates/prompt-templates.js';

// Run CLI when invoked directly
import('./config/cli.js').then(({ runCli }) => {
    runCli().catch((err: Error) => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });
});

#!/usr/bin/env node

/**
 * Example script to generate documentation using DocScribe
 *
 * Run with:
 * API_TOKEN=your_token node scripts/run-example.js
 */

import { DocumentService } from '../dist/services/document-service.js';

async function runExample() {
    if (!process.env.API_TOKEN) {
        console.error('❌ API_TOKEN environment variable is required.');
        process.exit(1);
    }

    const documentService = new DocumentService(
        process.env.API_TOKEN,
        process.env.AI_PROVIDER || 'anthropic',
        './example-docs',
    );

    console.log('Generating technical documentation for Example Project...');

    try {
        const result = await documentService.generateAndWriteDocumentation({
            documentType: 'technical',
            projectName: 'Example Project',
            description: 'A demo project that shows the capabilities of DocScribe',
            additionalContext: 'Should be easy to understand for beginners',
            targetAudience: 'Software developers',
        });

        console.log(`✅ Documentation generation successful!`);
        console.log(`Generated ${result.documents.length} document(s) in ${result.generationTime / 1000} seconds.`);
        console.log('Files:');
        for (const filePath of result.filePaths) {
            console.log(`- ${filePath}`);
        }
    } catch (error) {
        console.error('❌ Documentation generation failed:');
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

runExample().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});

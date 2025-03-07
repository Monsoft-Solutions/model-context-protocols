#!/usr/bin/env node

/**
 * Script to run the code architect example
 */

// Check if the ANTHROPIC_API_KEY environment variable is set
if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    console.error('Please set it before running the example:');
    console.error('export ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
}

// Run the example
import('../dist/examples/code-architect-example.js').catch((error) => {
    console.error('Error running example:', error);
    process.exit(1);
});

# MCP Code Architect

A Model Context Protocol (MCP) code architect implementation that generates detailed implementation plans based on code context and custom instructions.

## Features

- Analyzes code context to understand the existing codebase
- Processes custom instructions to understand requirements
- Generates detailed implementation plans including:
    - High-level overview
    - Key components and responsibilities
    - Data flow between components
    - API design
    - Implementation considerations and challenges
    - Step-by-step implementation guide
- Uses Claude AI (via Anthropic API) for intelligent code architecture planning
- Implements the Model Context Protocol (MCP) for client-server communication

## Installation

```bash
npm install @monsoft/mcp-code-architect
```

## Usage

### Using the Code Architect Client

```javascript
import { CodeArchitectClient } from '@monsoft/mcp-code-architect';

async function main() {
    // Create a new code architect client
    const codeArchitect = new CodeArchitectClient();

    try {
        // Connect to the code architect server
        await codeArchitect.connect();

        // Your code context (existing code)
        const codeContext = `
        // Your existing code here
        `;

        // Your custom instructions
        const customInstructions = `
        // Your implementation requirements here
        `;

        // Generate an implementation plan
        const result = await codeArchitect.generateImplementationPlan(
            codeContext,
            customInstructions,
        );

        // Use the implementation plan
        console.log(result.implementationPlan);

        // Disconnect when done
        await codeArchitect.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
```

## Environment Setup

This package requires an Anthropic API key to function. You can set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

Or create a `.env` file in the package root with:

```
ANTHROPIC_API_KEY=your_api_key_here
```

## Running the Example

```bash
# Quick setup (installs dependencies and builds the package)
npm run setup

# Or manually:
# Install dependencies
npm install

# Build the package
npm run build

# Run the example
npm run example
```

## Development

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- Anthropic API key

### Setup

```bash
# Quick setup
npm run setup

# Or manually:
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## Notes

This package uses ES modules. Make sure your project is configured to support ES modules if you're importing this package.

## License

MIT

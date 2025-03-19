# MCP DocScribe

A Model Context Protocol implementation for generating comprehensive documentation for software projects.

## Overview

MCP DocScribe leverages the Model Context Protocol (MCP) and the [@ai-sdk](https://www.npmjs.com/package/ai) to automatically generate detailed and structured documentation for software projects. It can create various types of documentation based on simple descriptions, saving developers time and ensuring consistent, high-quality documentation.

## Features

- Generate multiple documentation types from simple descriptions
- Supports various documentation aspects (technical, database, UI/UX, etc.)
- Configurable outputs tailored to different audiences
- MCP Server implementation for seamless integration with AI assistants
- Command-line interface for easy usage in development workflows

## Installation

```bash
npm install @monsoft/mcp-docscribe
```

Or use it directly via the MCP:

```bash
npx @monsoft/mcp-docscribe --token=YOUR_API_TOKEN
```

## Usage

### Command Line

```bash
npx mcp-docscribe generate \
  --documentType=technical \
  --projectName="My Awesome Project" \
  --description="A project that does something amazing" \
  --additionalContext="Should support mobile and desktop"
```

### As a Model Context Protocol Server

```typescript
import { startDocScribeServer } from '@monsoft/mcp-docscribe';

startDocScribeServer({
    token: 'YOUR_API_TOKEN',
    port: 3000, // Optional, for SSE transport
    runSse: true, // Optional, use SSE instead of stdio
});
```

## Documentation Types

DocScribe can generate the following documentation types:

- **Technical Specification** (`technical`): Detailed technical requirements and architecture
- **Database Specification** (`database`): Database schemas, relationships, and queries
- **UI/UX Specification** (`uiux`): User interfaces, workflows, and interactions
- **Audience Definition** (`audience`): User personas and stakeholder information
- **Accessibility Specification** (`accessibility`): Accessibility guidelines and considerations
- **API Documentation** (`api`): API endpoints, parameters, and responses
- **All Types** (`all`): Generate all applicable document types

## Parameters

| Parameter             | Description                             | Required |
| --------------------- | --------------------------------------- | -------- |
| documentType          | Type of document to generate            | Yes      |
| projectName           | Name of the project                     | Yes      |
| description           | Brief description of what to accomplish | Yes      |
| additionalContext     | Additional context or requirements      | No       |
| targetAudience        | Intended audience for the documentation | No       |
| implementationDetails | Specific implementation details         | No       |
| integrationPoints     | Systems or services to integrate with   | No       |

## Output

DocScribe generates Markdown files for each documentation type requested, organized in a clean directory structure. The files can be further used with static site generators like MkDocs or integrated directly into your project documentation.

## Examples

### Generate Technical Documentation

```bash
npx mcp-docscribe generate \
  --documentType=technical \
  --projectName="Authentication Service" \
  --description="A microservice for user authentication with OAuth2 support" \
  --implementationDetails="Built with Node.js and Express"
```

### Generate All Documentation Types

```bash
npx mcp-docscribe generate \
  --documentType=all \
  --projectName="E-commerce Platform" \
  --description="A full-featured e-commerce platform with cart, checkout, and inventory management" \
  --additionalContext="Should support multiple payment providers" \
  --targetAudience="Developers and business stakeholders"
```

## Contributing

Contributions are welcome! Please see our [Contributing Guide](../../CONTRIBUTING.md) for more information.

## License

MIT

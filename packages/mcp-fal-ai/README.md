# MCP fal.ai Integration

[![npm version](https://badge.fury.io/js/%40monsoft%2Fmcp-fal-ai.svg)](https://www.npmjs.com/package/@monsoft/mcp-fal-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server that integrates with [fal.ai](https://fal.ai) to provide seamless access to AI models for image generation, text processing, audio synthesis, and more. Use this package to connect AI agents like Cursor, Claude Desktop, ChatGPT, and other MCP-compatible tools to fal.ai's powerful AI model catalog.

## Features

✨ **8 Tools** for model discovery, execution, and job management  
🔗 **4 Resources** for configuration and documentation  
📝 **1 Prompt** for image generation assistance  
🚀 **Dual Transport** support (stdio and SSE)  
🔒 **Type-safe** with full TypeScript support  
🎯 **Zero dependencies** on fal.ai SDK (pure HTTP client)

---

## Installation

### NPM Package

```bash
npm install -g @monsoft/mcp-fal-ai
```

Or install locally in your project:

```bash
npm install @monsoft/mcp-fal-ai
```

### From Source

```bash
git clone https://github.com/Monsoft-Solutions/model-context-protocols.git
cd model-context-protocols/packages/mcp-fal-ai
npm install
npm run build
```

---

## Getting Your fal.ai API Key

Before using this MCP server, you need a fal.ai API key:

1. Visit [fal.ai dashboard](https://fal.ai/dashboard)
2. Sign up or log in with your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key for configuration (next section)

---

## MCP Setup Instructions

Configure this MCP server in your AI agent by following the instructions for your specific tool.

### 🎯 Cursor IDE

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to **Features** → **Model Context Protocol**
3. Click **Add MCP Server** or edit your MCP configuration file
4. Add the following configuration:

**Using global npm installation:**

```json
{
    "mcpServers": {
        "fal-ai": {
            "command": "mcp-fal-ai",
            "env": {
                "FAL_API_KEY": "your-fal-api-key-here"
            }
        }
    }
}
```

**Using npx:**

```json
{
    "mcpServers": {
        "fal-ai": {
            "command": "npx",
            "args": ["-y", "@monsoft/mcp-fal-ai"],
            "env": {
                "FAL_API_KEY": "your-fal-api-key-here"
            }
        }
    }
}
```

5. Save and restart Cursor
6. The fal.ai tools should now be available in your agent context

### 🤖 Claude Desktop

1. Locate your Claude Desktop configuration file:

    - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
    - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
    - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add or update the MCP server configuration:

```json
{
    "mcpServers": {
        "fal-ai": {
            "command": "npx",
            "args": ["-y", "@monsoft/mcp-fal-ai"],
            "env": {
                "FAL_API_KEY": "your-fal-api-key-here"
            }
        }
    }
}
```

3. Save the file and restart Claude Desktop
4. Look for the 🔌 icon in Claude to verify the MCP server is connected

### 💬 ChatGPT (OpenAI Desktop or Custom Integration)

For ChatGPT with MCP support (if available):

1. Access your MCP configuration settings
2. Add the server using npx:

```json
{
    "mcpServers": {
        "fal-ai": {
            "command": "npx",
            "args": ["-y", "@monsoft/mcp-fal-ai"],
            "env": {
                "FAL_API_KEY": "your-fal-api-key-here"
            }
        }
    }
}
```

### 🛠️ Generic MCP Client

For any MCP-compatible client:

**Using stdio transport:**

```bash
FAL_API_KEY=your-api-key npx @monsoft/mcp-fal-ai
```

**Using SSE transport:**

```bash
FAL_API_KEY=your-api-key npx @monsoft/mcp-fal-ai --run-sse --port 3001
```

**Configuration options:**

```json
{
    "command": "npx",
    "args": ["-y", "@monsoft/mcp-fal-ai"],
    "env": {
        "FAL_API_KEY": "your-fal-api-key-here",
        "RUN_SSE": "false",
        "PORT": "3001"
    }
}
```

### 🔧 CLI Flags

You can also pass configuration via command-line flags:

- `--fal-api-key` or `-k`: Your fal.ai API key
- `--run-sse` or `-s`: Enable SSE transport (default: false)
- `--port` or `-p`: Port for SSE server (default: 3001)

Example:

```bash
npx @monsoft/mcp-fal-ai --fal-api-key YOUR_KEY --run-sse --port 3001
```

---

## Quick Start Examples

Once configured in your AI agent, you can use the fal.ai tools directly in your conversations:

### Example 1: Generate an Image

```
User: Use fal.ai to generate an image of a sunset over mountains

Agent: I'll help you generate that image using fal.ai.
1. First, let me search for image generation models...
   [calls: fal-search-models with keyword "image generation"]

2. I'll use the flux-pro model. Let me get its schema...
   [calls: fal-get-model-schema with modelId "fal-ai/flux-pro"]

3. Now I'll generate the image...
   [calls: fal-enqueue with proper parameters]

4. Checking status...
   [calls: fal-get-status with requestId]

5. Retrieving the result...
   [calls: fal-get-result with requestId]
```

### Example 2: List Available Models

```
User: What AI models are available on fal.ai?

Agent: Let me search for available models...
[calls: fal-list-models with limit 10]
```

### Example 3: Get Model Details

```
User: Show me the input parameters for the flux-pro model

Agent: I'll fetch the schema for that model...
[calls: fal-get-model-schema with modelId "fal-ai/flux-pro"]
```

---

## Available Tools

The MCP server exposes the following tools to AI agents:

### 🔍 Discovery Tools

#### `fal-list-models`

List all available models from fal.ai with optional pagination.

**Parameters:**

- `limit` (number, optional): Maximum number of models to return
- `page` (number, optional): Page number for pagination

**Example:**

```json
{
    "limit": 20,
    "page": 1
}
```

#### `fal-search-models`

Search for models by keywords with optional category and limit filtering.

**Parameters:**

- `keyword` (string, required): Search keyword (e.g., "image generation", "text to speech")
- `limit` (number, optional): Maximum number of results
- `category` (string, optional): Filter by category

**Example:**

```json
{
    "keyword": "image generation",
    "limit": 10
}
```

#### `fal-get-model-schema`

Get the OpenAPI schema for a specific model to understand its input/output parameters.

**Parameters:**

- `modelId` (string, required): Model identifier (e.g., "fal-ai/flux-pro")

**Example:**

```json
{
    "modelId": "fal-ai/flux-pro"
}
```

### ⚡ Execution Tools

#### `fal-run-sync`

Run a model synchronously (blocks until completion). Best for fast models.

**Parameters:**

- `modelId` (string, required): Model identifier
- `input` (object, required): Model-specific input parameters

**Example:**

```json
{
    "modelId": "fal-ai/flux-pro",
    "input": {
        "prompt": "A serene sunset over mountains",
        "image_size": "landscape_16_9"
    }
}
```

#### `fal-enqueue`

Queue a model execution asynchronously. Returns a request ID for status tracking.

**Parameters:**

- `modelId` (string, required): Model identifier
- `input` (object, required): Model-specific input parameters

**Returns:** `{ request_id: string }`

### 📊 Status & Result Tools

#### `fal-get-status`

Check the status of an asynchronous job.

**Parameters:**

- `requestId` (string, required): Request ID from fal-enqueue
- `modelId` (string, required): Model identifier

**Returns:** Status object with state (IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED)

#### `fal-get-result`

Retrieve the result of a completed asynchronous job.

**Parameters:**

- `requestId` (string, required): Request ID from fal-enqueue
- `modelId` (string, required): Model identifier

**Returns:** Model output (automatically downloads and embeds images as base64)

### 🛑 Control Tools

#### `fal-cancel`

Cancel a running or queued asynchronous job.

**Parameters:**

- `requestId` (string, required): Request ID from fal-enqueue
- `modelId` (string, required): Model identifier

---

## Available Resources

The MCP server provides the following resources:

### `config://fal`

Configuration information about the current fal.ai connection.

### `docs://fal/usage`

Usage guide showing the typical workflow for generating images and running models.

### `docs://fal/tools-reference`

Quick reference documentation for all available tools.

### `fal-model://{modelId}/schema`

Dynamic resource that returns the OpenAPI schema for any model.

**Example:** `fal-model://fal-ai/flux-pro/schema`

---

## Available Prompts

### `review-fal-prompt`

A prompt template that helps improve image generation prompts for better fal.ai results.

**Parameters:**

- `prompt` (string): Your original image prompt

**Usage:** The agent can use this prompt to enhance your image generation requests.

---

## Developer Examples

The package includes several example scripts for testing and development:

### List Models Example

```bash
cd packages/mcp-fal-ai
npm run build
FAL_API_KEY=YOUR_KEY npm run example:list-models
```

This example demonstrates:

- Listing available models with pagination
- Searching for models by keyword
- Displaying model information

### Generate Image Example

```bash
FAL_API_KEY=YOUR_KEY npm run example:generate-nano-banana
```

This example shows:

- Enqueueing an image generation job
- Polling for job status with progress updates
- Retrieving the final result

### Get Model Schema Example

```bash
FAL_API_KEY=YOUR_KEY npm run example:get-model-schema
```

This example demonstrates:

- Fetching model schemas
- Understanding input/output parameters

---

## Implementation Status

✅ **Core Functionality Complete**

- ✅ 8 MCP Tools (discovery, execution, status, control)
- ✅ 4 MCP Resources (config, documentation, model schemas)
- ✅ 1 MCP Prompt (prompt enhancement)
- ✅ Dual transport support (stdio & SSE)
- ✅ TypeScript with strict type safety
- ✅ Zod-based validation
- ✅ Custom error handling
- ✅ HTTP client (no SDK dependency)

🚧 **Potential Future Enhancements**

- [ ] File upload tool (`fal-upload-file`)
- [ ] Convenience tool with auto-polling (`fal-enqueue-and-wait`)
- [ ] Rate limit handling with exponential backoff
- [ ] Request logging with secret redaction
- [ ] Comprehensive test suite

---

## Project Structure

```
packages/mcp-fal-ai/
├── README.md                    # This file
├── package.json                 # NPM package configuration
├── tsconfig.json                # TypeScript configuration
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── server/
│   │   └── index.ts             # MCP server (stdio/SSE)
│   ├── config/
│   │   └── env.ts               # Environment validation (Zod)
│   ├── services/
│   │   └── fal-client.ts        # HTTP client for fal.ai API
│   ├── tools/
│   │   └── index.ts             # MCP tool implementations
│   ├── resources/
│   │   └── index.ts             # MCP resource implementations
│   ├── prompts/
│   │   └── index.ts             # MCP prompt implementations
│   ├── types/
│   │   └── model.ts             # Type definitions
│   ├── errors/
│   │   ├── api-errors.ts        # HTTP error classes
│   │   └── environment-validation-error.ts
│   └── utils/                   # Utility functions
├── dist/                        # Compiled output (generated)
└── examples/                    # Example scripts
```

---

## Architecture Overview

### Execution Flow

```
AI Agent (Cursor, Claude, ChatGPT, etc.)
    ↓
MCP Server (stdio or SSE transport)
    ├─ 8 Tools (discovery, execution, status, control)
    ├─ 4 Resources (config, docs, schemas)
    └─ 1 Prompt (enhancement)
    ↓
FalClient (HTTP wrapper)
    ├─ Authentication (Key header)
    ├─ Request/Response handling
    └─ Error mapping
    ↓
fal.ai API
    ├─ https://fal.ai/api (models catalog)
    ├─ https://fal.run (sync execution)
    └─ https://queue.fal.run (async execution)
```

### Execution Modes

**Synchronous Mode** (`fal-run-sync`)

- Direct execution via `https://fal.run`
- Blocks until model completes
- Best for fast models (<30 seconds)
- Returns result immediately

**Asynchronous Mode** (`fal-enqueue` → `fal-get-status` → `fal-get-result`)

- Queue-based execution via `https://queue.fal.run`
- Returns request ID immediately
- Poll status until completion
- Best for long-running models

---

## Technical Details

### Type Safety

- ✅ Strict TypeScript mode enabled (`strict: true`)
- ✅ No `any` types (use `unknown` when type is uncertain)
- ✅ Explicit type annotations on all functions
- ✅ Zod schemas for runtime validation
- ✅ One type per file convention

### Error Handling

Custom error classes for different HTTP status codes:

```typescript
401 → UnauthorizedError     // Invalid API key
403 → ForbiddenError         // Access denied
404 → NotFoundError          // Model/endpoint not found
429 → RateLimitError         // Too many requests
5xx → ServerError            // fal.ai server error
4xx → ApiError               // Other client errors
```

### Environment Variables

Required:

- `FAL_API_KEY`: Your fal.ai API key

Optional:

- `RUN_SSE`: Enable SSE transport (default: `false`)
- `PORT`: SSE server port (default: `3001`)

---

## Dependencies

### Production

| Package                     | Purpose                    |
| --------------------------- | -------------------------- |
| `@modelcontextprotocol/sdk` | MCP server/client SDK      |
| `zod`                       | Runtime schema validation  |
| `zod-to-json-schema`        | Convert Zod to JSON Schema |
| `yargs`                     | CLI argument parsing       |
| `undici`                    | Fast HTTP client           |
| `express`                   | SSE server (when enabled)  |

### Development

| Package       | Purpose                       |
| ------------- | ----------------------------- |
| `typescript`  | TypeScript compiler           |
| `@types/node` | Node.js type definitions      |
| `shx`         | Cross-platform shell commands |

---

## Troubleshooting

### MCP Server Not Connecting

1. **Check API Key**: Ensure `FAL_API_KEY` is set correctly
2. **Restart Agent**: Restart your AI agent after configuration changes
3. **Check Logs**: Look for error messages in your agent's console
4. **Test Manually**: Run `FAL_API_KEY=xxx npx @monsoft/mcp-fal-ai` to test

### Tool Calls Failing

1. **Invalid Model ID**: Ensure model ID is correct (e.g., `fal-ai/flux-pro`)
2. **Invalid Input**: Check model schema with `fal-get-model-schema`
3. **API Key Issues**: Verify your API key has sufficient permissions
4. **Rate Limits**: You may be hitting fal.ai rate limits

### Common Issues

**Issue**: `Environment validation failed: FAL_API_KEY is required`
**Solution**: Set the `FAL_API_KEY` environment variable

**Issue**: `UnauthorizedError` when calling tools
**Solution**: Your API key may be invalid or expired

**Issue**: Tools not appearing in agent
**Solution**: Check MCP server configuration and restart agent

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Style**: Follow TypeScript best practices (see `typescript.rules`)
2. **MCP Patterns**: Follow MCP conventions (see `model-context-protocol.rules`)
3. **Type Safety**: Use strict TypeScript, avoid `any`
4. **Documentation**: Add JSDoc comments to public APIs
5. **Testing**: Test changes with example scripts
6. **Commits**: Use clear, descriptive commit messages

### Development Setup

```bash
git clone https://github.com/Monsoft-Solutions/model-context-protocols.git
cd model-context-protocols/packages/mcp-fal-ai
npm install
npm run build
```

### Running Examples

```bash
FAL_API_KEY=xxx npm run example:list-models
FAL_API_KEY=xxx npm run example:generate-nano-banana
FAL_API_KEY=xxx npm run example:get-model-schema
```

---

## Links & Resources

- 📦 [NPM Package](https://www.npmjs.com/package/@monsoft/mcp-fal-ai)
- 🐙 [GitHub Repository](https://github.com/Monsoft-Solutions/model-context-protocols)
- 🔧 [fal.ai Documentation](https://docs.fal.ai)
- 🎨 [fal.ai Model Catalog](https://fal.ai/models)
- 📖 [MCP Specification](https://modelcontextprotocol.io)
- 🔑 [fal.ai Dashboard](https://fal.ai/dashboard)

---

## License

MIT License - see LICENSE file for details

---

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/Monsoft-Solutions/model-context-protocols/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Monsoft-Solutions/model-context-protocols/discussions)
- 📧 **Contact**: support@monsoftsolutions.com

---

**Package Version:** 0.1.0  
**Last Updated:** October 17, 2025  
**Status:** Production Ready ✅

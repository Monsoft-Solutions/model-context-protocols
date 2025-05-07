# MCP Generate Image OpenAI

A Model Context Protocol (MCP) server for generating images using OpenAI's image generation API.

[![npm version](https://img.shields.io/npm/v/mcp-generate-image-openai.svg)](https://www.npmjs.com/package/mcp-generate-image-openai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Implements the Model Context Protocol for image generation
- Supports both stdio and Server-Sent Events (SSE) transports
- Easy integration with OpenAI's DALL-E API
- Configurable through environment variables
- Extensible architecture with tools, resources, and prompts

## Installation

```bash
npm install mcp-generate-image-openai
```

## Prerequisites

- Node.js 16 or later
- An OpenAI API key with access to image generation models

## Usage

### Basic Usage

```javascript
import { startServer } from 'mcp-generate-image-openai';

// Start the server with configuration from environment variables
startServer()
    .then(() => console.log('Server started successfully'))
    .catch((err) => console.error('Failed to start server:', err));
```

### Manual Configuration

```javascript
import { startMcpServer, startMcpServerSSE } from 'mcp-generate-image-openai';

// Start with stdio transport
startMcpServer('your-openai-api-key')
    .then(() => console.log('Stdio server started'))
    .catch((err) => console.error('Error:', err));

// Or start with SSE transport
startMcpServerSSE('your-openai-api-key', 3000)
    .then(() => console.log('SSE server started on port 3000'))
    .catch((err) => console.error('Error:', err));
```

## Configuration

### Environment Variables

The server can be configured using the following environment variables:

| Variable         | Description                  | Default  |
| ---------------- | ---------------------------- | -------- |
| `OPENAI_API_KEY` | Your OpenAI API key          | Required |
| `PORT`           | Port for SSE server          | 3000     |
| `RUN_SSE`        | Whether to use SSE transport | `false`  |

### Command Line Arguments

You can also provide configuration through command-line arguments, which will override environment variables:

```bash
node your-script.js --openai-api-key=your-key --port=8080 --run-sse
```

## API

### Server Functions

#### `startServer()`

The main entry point that automatically configures and starts the server based on environment variables.

#### `startMcpServer(apiKey: string)`

Starts an MCP server with stdio transport.

- **Parameters**:
    - `apiKey`: OpenAI API key

#### `startMcpServerSSE(apiKey: string, port: number)`

Starts an MCP server with SSE transport.

- **Parameters**:
    - `apiKey`: OpenAI API key
    - `port`: HTTP server port

### SSE Endpoints

When using SSE transport:

- `GET /sse`: Establishes an SSE connection
    - Query parameter: `sessionId` (optional, defaults to 'default')
- `POST /messages`: Sends messages to an established session
    - Body parameter: `sessionId` (optional, defaults to 'default')

## Examples

### Integrating with a Client Application

```javascript
// Client code example
import { McpClient } from '@modelcontextprotocol/sdk/client';

const client = new McpClient({
    transport: 'stdio', // or 'sse' for web applications
    serverUrl: 'http://localhost:3000', // Only needed for SSE
});

await client.connect();

// Generate an image
const result = await client.execute({
    toolName: 'generate_image',
    params: {
        prompt: 'A futuristic city with flying cars',
        size: '1024x1024',
    },
});

console.log('Generated image URL:', result.imageUrl);
```

## Development

### Project Structure

```
src/
├── config/      # Environment and configuration handling
├── prompts/     # Prompt templates and definitions
├── resources/   # Resource implementations
├── tools/       # Tool implementations
└── server.ts    # Main server implementation
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## License

MIT © [Your Organization]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- Built with [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- Uses OpenAI's API for image generation

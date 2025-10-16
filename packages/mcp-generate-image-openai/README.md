# MCP Generate Image OpenAI

A Model Context Protocol (MCP) server for generating images using OpenAI's image generation API.

[![npm version](https://img.shields.io/npm/v/mcp-generate-image-openai.svg)](https://www.npmjs.com/package/mcp-generate-image-openai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Implements the Model Context Protocol for image generation
- Supports both stdio and Server-Sent Events (SSE) transports
- Easy integration with OpenAI's DALL-E API
- Optional integration with ImageKit for image hosting and delivery
- Configurable through environment variables
- Extensible architecture with tools, resources, and prompts

## Installation

```bash
npm install mcp-generate-image-openai
```

## Prerequisites

- Node.js 16 or later
- An OpenAI API key with access to image generation models
- (Optional) ImageKit account for image hosting and CDN delivery

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

// Configure the environment
const env = {
    OPENAI_API_KEY: 'your-openai-api-key',
    PORT: 3000,
    RUN_SSE: false,
    // Optional ImageKit configuration
    IMAGEKIT_PUBLIC_KEY: 'your-imagekit-public-key',
    IMAGEKIT_PRIVATE_KEY: 'your-imagekit-private-key',
    IMAGEKIT_URL_ENDPOINT: 'https://ik.imagekit.io/your_imagekit_id',
};

// Start with stdio transport
startMcpServer(env)
    .then(() => console.log('Stdio server started'))
    .catch((err) => console.error('Error:', err));

// Or start with SSE transport
env.RUN_SSE = true;
startMcpServerSSE(env)
    .then(() => console.log('SSE server started on port 3000'))
    .catch((err) => console.error('Error:', err));
```

## Configuration

### Environment Variables

The server can be configured using the following environment variables:

| Variable                | Description                  | Default  |
| ----------------------- | ---------------------------- | -------- |
| `OPENAI_API_KEY`        | Your OpenAI API key          | Required |
| `PORT`                  | Port for SSE server          | 3000     |
| `RUN_SSE`               | Whether to use SSE transport | `false`  |
| `IMAGEKIT_PUBLIC_KEY`   | ImageKit public key          | Optional |
| `IMAGEKIT_PRIVATE_KEY`  | ImageKit private key         | Optional |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint        | Optional |

### Command Line Arguments

You can also provide configuration through command-line arguments, which will override environment variables:

```bash
node your-script.js --openai-api-key=your-key --port=8080 --run-sse --imagekit-public-key=your-key --imagekit-private-key=your-key --imagekit-url-endpoint=your-endpoint
```

## API

### Server Functions

#### `startServer()`

The main entry point that automatically configures and starts the server based on environment variables.

#### `startMcpServer(env: Env)`

Starts an MCP server with stdio transport.

- **Parameters**:
    - `env`: Environment configuration object containing API keys and settings

#### `startMcpServerSSE(env: Env)`

Starts an MCP server with SSE transport.

- **Parameters**:
    - `env`: Environment configuration object containing API keys and settings

### SSE Endpoints

When using SSE transport:

- `GET /sse`: Establishes an SSE connection
    - Query parameter: `sessionId` (optional, defaults to 'default')
- `POST /messages`: Sends messages to an established session
    - Body parameter: `sessionId` (optional, defaults to 'default')

## Examples

### Generating Images

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
        // Add ImageKit upload options if server is configured with ImageKit
        imagekit: {
            enabled: true,
            folder: 'futuristic-cities',
            fileName: 'flying-cars',
        },
    },
});

console.log('Generated image URL:', result.content);
```

## ImageKit Integration

When ImageKit is configured, generated images can be automatically uploaded to your ImageKit account for hosting and CDN delivery. This provides several advantages:

- Persistent storage for generated images
- CDN delivery for faster loading
- Simplified image management
- Ability to apply transformations through ImageKit's URL-based API

To use ImageKit integration:

1. Create an ImageKit account at [imagekit.io](https://imagekit.io/)
2. Obtain your Public Key, Private Key, and URL Endpoint from the ImageKit dashboard
3. Configure the server with these values using environment variables or command-line arguments
4. When calling the `generate_image` tool, include the `imagekit` parameter with `enabled: true`

### ImageKit Upload Options

| Option     | Description                                | Default              |
| ---------- | ------------------------------------------ | -------------------- |
| `enabled`  | Whether to upload the image to ImageKit    | `false`              |
| `folder`   | Folder path in ImageKit to store the image | `'generated-images'` |
| `fileName` | Custom file name for the uploaded image    | Auto-generated       |

## Development

### Project Structure

```
src/
├── config/      # Environment and configuration handling
├── prompts/     # Prompt templates and definitions
├── resources/   # Resource implementations
├── services/    # API clients (OpenAI, ImageKit)
├── tools/       # Tool implementations
├── types/       # TypeScript type definitions
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
- Optional integration with ImageKit for image hosting

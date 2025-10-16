# MCP fal.ai Integration

An MCP (Model Context Protocol) server that integrates with [fal.ai](https://fal.ai) to provide seamless access to AI models for image generation, text processing, audio synthesis, and more.

## Quick Start

```bash
cd packages/mcp-fal-ai
npm install
npm run build
```

### Run (stdio)

```bash
FAL_API_KEY=YOUR_KEY npx mcp-fal-ai
```

### Run (SSE)

```bash
FAL_API_KEY=YOUR_KEY RUN_SSE=true PORT=3001 npx mcp-fal-ai
```

### CLI flags

- `--fal-api-key` | `-k`
- `--run-sse` | `-s`
- `--port` | `-p`

## Example Clients

### List Models Example

```bash
cd packages/mcp-fal-ai
npm run example:build
FAL_API_KEY=YOUR_KEY npm run example:list-models
```

This example demonstrates how to:

- List available models with pagination
- Search for models by keyword (image generation, text processing)
- Get model schemas for specific models
- Display model information in a user-friendly format

### Generate Image Example

```bash
cd packages/mcp-fal-ai
npm run example:build
FAL_API_KEY=YOUR_KEY npm run example:generate-nano-banana
```

This example shows how to:

- Enqueue an image generation job
- Poll for job status with progress updates
- Retrieve the final result

### Download Image Example

```bash
cd packages/mcp-fal-ai
npm run example:build
FAL_API_KEY=YOUR_KEY IMAGE_URL=https://example.com/image.jpg npm run example:download-image
```

This example demonstrates:

- Downloading images from URLs using fal.ai's download service

## Status: Phase 0 Complete ✅

**Phase 0 — Discovery and API Confirmation** has been completed. All fal.ai endpoints have been documented, request/response schemas captured, and implementation roadmap established.

### Phase 0 Deliverables

✅ **API Endpoint Documentation**

- Models catalog listing and search endpoints
- Model schema/metadata retrieval
- Direct (sync) execution via `fal.run`
- Queued (async) execution via `queue.fal.run`
- Queue management (status, result, cancel)
- File upload to fal.ai CDN

✅ **Authentication & Headers**

- Bearer token authentication pattern
- Base URLs for sync and async execution
- Rate limiting headers
- Standard error response formats

✅ **Representative Models**

- Image Generation (fal-ai/flux-pro)
- Text Generation (fal-ai/openai-gpt)
- Detailed input/output schemas

✅ **Error Handling**

- Common HTTP status codes (200, 202, 400, 401, 404, 429, 500, 503)
- Standard error response structure
- Error pattern documentation

---

## Project Structure

```
packages/mcp-fal-ai/
├── README.md                    # This file
├── instructions.md              # High-level implementation plan
├── PHASE_0_DISCOVERY.md         # Phase 0 API documentation (Complete)
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── server/                  # MCP server implementation (stdio/SSE)
│   ├── config/
│   │   └── env.ts               # Environment configuration
│   ├── services/
│   │   └── fal-client.ts        # fal.ai HTTP client wrapper (no SDK)
│   ├── tools/                   # MCP tools
│   ├── resources/               # MCP resources
│   ├── prompts/                 # MCP prompts
│   ├── types/                   # Type definitions
│   ├── errors/                  # Custom error classes
│   └── utils/                   # Utility functions
└── dist/                        # Compiled JavaScript (built via `npm run build`)
```

---

## Implementation Roadmap

### Phase 1 — Package and Server Scaffolding (Complete)

- [x] Create workspace package structure
- [x] Set up `package.json` with dependencies
- [x] Configure TypeScript and build scripts
- [x] Implement environment validation with zod
- [x] Create MCP server skeleton (stdio + SSE variants)

### Phase 2 — fal.ai Client Layer (Started)

- [x] Implement typed HTTP client
- [ ] Encapsulate all endpoints from Phase 0
- [ ] Add robust error mapping
- [ ] Create request/response type validators

### Phase 3 — MCP Tools (Initial Set Complete)

- [x] `fal-list-models` - List all models
- [x] `fal-search-models` - Search by keyword
- [x] `fal-get-model-schema` - Get model metadata
- [x] `fal-run-sync` - Direct (sync) execution
- [x] `fal-enqueue` - Queued (async) execution
- [x] `fal-get-status` - Check job status
- [x] `fal-get-result` - Retrieve job result
- [x] `fal-cancel` - Cancel a job
- [ ] `fal-upload-file` - Upload files to CDN

### Phase 4 — MCP Resources and Prompts

- [x] `config://fal` - Config resource
- [x] `fal-model://{modelId}/schema` - Model schema resource
- [x] Standardized prompt: `review-fal-prompt`

### Phase 5 — Queue Management UX

- [ ] `fal-enqueue-and-wait` - Convenience tool
- [ ] Polling strategy with backoff
- [ ] Progress tracking and callbacks

### Phase 6 — Validation and Error Handling

- [ ] Environment configuration validation
- [ ] Custom error classes
- [ ] Comprehensive error mapping

### Phase 7 — Documentation and Examples

- [ ] Setup and configuration guide
- [ ] Example scripts
- [ ] Usage patterns documentation

### Phase 8 — Hardening and Observability

- [ ] Retry logic with jitter
- [ ] Request logging (with secret redaction)
- [ ] Rate limit handling

---

## Tools, Resources, Prompts

### Tools

- `fal-list-models`
- `fal-search-models` { query, limit?, category? }
- `fal-get-model-schema` { modelId }
- `fal-run-sync` { modelId, input }
- `fal-enqueue` { modelId, input }
- `fal-get-status` { requestId, modelId? }
- `fal-get-result` { requestId, modelId? }
- `fal-cancel` { requestId, modelId? }
- `fal-enqueue-and-wait` { modelId, input, timeoutMs?, initialBackoffMs? }

### Resources

- `config://fal`
- `fal-model://{modelId}/schema`

### Prompts

- `review-fal-prompt`

---

## Getting Your fal.ai API Key

1. Visit [fal.ai dashboard](https://fal.ai/dashboard)
2. Sign up or log in with your account
3. Navigate to API Keys
4. Create a new API key
5. Copy the key and set it as an environment variable: `export FAL_API_KEY=your_key_here`

---

## Phase 0 Documentation

For detailed information about the fal.ai API endpoints, request/response schemas, and error patterns, refer to:

📄 **[PHASE_0_DISCOVERY.md](./PHASE_0_DISCOVERY.md)**

This document includes:

- Complete endpoint mapping
- Authentication requirements
- Request/response examples
- Error handling patterns
- Representative model schemas

---

## Architecture Overview

### Execution Flow

```
User (LLM/Client)
    ↓
MCP Server (Node.js)
    ├─ Tools (fal-list-models, fal-run-model, etc.)
    ├─ Resources (fal://models, fal://jobs/{id})
    └─ Prompts (generation templates)
    ↓
fal-ai Client (HTTP wrapper)
    ├─ Auth header injection
    ├─ Request serialization
    └─ Response validation
    ↓
fal.ai API
    ├─ fal.run (sync execution)
    ├─ queue.fal.run (async execution)
    ├─ api.fal.ai (models, upload, etc.)
    └─ fal.media (CDN)
```

### Two Execution Modes

**Synchronous (Direct)**

- Base URL: `https://fal.run`
- Blocks until model execution completes
- Best for: Real-time inference, small models
- Tool: `fal-run-model`

**Asynchronous (Queued)**

- Base URL: `https://queue.fal.run`
- Returns immediately with job ID
- Supports polling and status checking
- Tools: `fal-enqueue-model`, `fal-job-status`, `fal-job-result`, `fal-cancel-job`
    - Convenience: `fal-enqueue-and-wait` with exponential backoff and timeout

---

## Type Safety and Best Practices

This project follows the TypeScript guidelines specified in `@typescript.rules` and MCP guidelines in `@model-context-protocol.rules`:

- ✅ Strict TypeScript mode enabled
- ✅ No `any` types (use `unknown` when necessary)
- ✅ All functions have explicit type signatures
- ✅ Zod schema validation for environment and API responses
- ✅ Custom error classes for better error handling

### Error Handling Strategy

The client maps HTTP responses to typed errors:

- 401 → `UnauthorizedError`
- 403 → `ForbiddenError`
- 404 → `NotFoundError`
- 429 → `RateLimitError`
- 5xx → `ServerError`
- Other 4xx → `ApiError`

Tools return JSON text for successful outputs. When using this as a library, catch these error classes to handle specific cases (e.g., backoff on `RateLimitError`).

- ✅ One type definition per file
- ✅ Named exports only (no default exports)

---

## Dependencies

### Core

- `@modelcontextprotocol/sdk` - MCP server/client SDK
- `zod` - Runtime schema validation
- `zod-to-json-schema` - Convert Zod schemas to JSON Schema
- `yargs` - Command line argument parser

### Development

- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `shx` - Cross-platform shell commands

---

## Development Notes

- **Code Organization:** One definition per file (types, classes, utilities)
- **File Size:** Aim to keep files under 300 lines
- **Comments:** Use JSDoc for public APIs
- **Testing:** Unit tests for client methods and tools
- **Linting:** ESLint + Prettier for code formatting

---

## Contributing

When contributing to this package:

1. Follow the TypeScript guidelines in `@typescript.rules`
2. Follow MCP patterns in `@model-context-protocol.rules`
3. Add JSDoc comments to all public APIs
4. Keep functions and classes small and focused
5. Use Zod for all input validation
6. Create custom error classes for domain-specific errors

---

## References

- **fal.ai Docs:** https://docs.fal.ai
- **fal.ai API:** https://api.fal.ai/docs
- **fal.ai JavaScript SDK:** https://github.com/fal-ai/js-sdk
- **fal.ai Model Catalog:** https://fal.ai/models
- **MCP Documentation:** https://modelcontextprotocol.io
- **TypeScript Best Practices:** See `typescript.rules`

---

## License

MIT

---

**Last Updated:** October 16, 2025  
**Phase Status:** Phase 0 Complete ✅  
**Next Phase:** Phase 1 — Package and Server Scaffolding

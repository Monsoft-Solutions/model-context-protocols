import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FalClient } from '../services/fal-client.js';

export function registerResources(server: McpServer, token: string): void {
    const client = new FalClient({ apiKey: token });

    server.resource('fal-config', 'config://fal', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `fal.ai configuration loaded. Token length: ${token.length}`,
            },
        ],
    }));

    // Documentation resource describing the typical flow
    server.resource('fal-docs-usage', 'docs://fal/usage', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: [
                    '# fal.ai MCP usage flow',
                    '',
                    'Use these steps to generate images or run models via MCP:',
                    '',
                    '1. List or search models to discover available endpoints:',
                    '   - Tool: `fal-list-models`',
                    '   - Tool: `fal-search-models`',
                    '',
                    '2. Retrieve the model schema to understand input parameters:',
                    '   - Tool: `fal-get-model-schema`',
                    '',
                    '3. Queue the generation (async) or run synchronously:',
                    '   - Tool (async): `fal-enqueue`',
                    '',
                    '4. Check job status (if queued):',
                    '   - Tool: `fal-get-status` with `requestId`',
                    '',
                    '5. Retrieve the result when complete:',
                    '   - Tool: `fal-get-result` with `requestId`',
                    '',
                    '6. Cancel the job if needed:',
                    '   - Tool: `fal-cancel` with `requestId`',
                    '',
                    '7. Download images from the result:',
                    '   - Tool: `download-image` with `url`',
                ].join('\n'),
            },
        ],
    }));

    // Dynamic resource: model schema
    server.resource(
        'fal-model-schema',
        new ResourceTemplate('fal-model://{modelId}/schema', { list: undefined }),
        async (uri, { modelId }) => {
            const normalizedModelId = Array.isArray(modelId) ? modelId[0] : modelId;
            const schema = await client.getModelSchema(normalizedModelId);
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: typeof schema === 'string' ? schema : JSON.stringify(schema, null, 2),
                    },
                ],
            };
        },
    );

    // Tools reference resource
    server.resource('fal-tools-reference', 'docs://fal/tools-reference', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: [
                    '# fal.ai MCP Tools Reference',
                    '',
                    '## Available Tools',
                    '',
                    '### Discovery Tools',
                    '- `fal-list-models` - List all available models with optional pagination',
                    '- `fal-search-models` - Search models by keyword with optional filters',
                    '- `fal-get-model-schema` - Retrieve OpenAPI schema for a model',
                    '',
                    '### Execution Tools',
                    '- `fal-enqueue` - Queue an async model job via queue.fal.run',
                    '',
                    '### Status & Result Tools',
                    '- `fal-get-status` - Check async job status',
                    '- `fal-get-result` - Retrieve async job result (downloads images to base64)',
                    '',
                    '### Job Control Tools',
                    '- `fal-cancel` - Cancel async job',
                    '',
                    '### Utility Tools',
                    '- `download-image` - Download image from URL to base64',
                    '',
                    '## Common Workflows',
                    '',
                    '### Workflow 1: Async with Manual Polling',
                    '1. Call `fal-enqueue` to queue job',
                    '2. Poll `fal-get-status` until COMPLETED',
                    '3. Call `fal-get-result` to retrieve result',
                    '4. Call `download-image` to download images from the result',
                    '',
                    '## Tool Categories',
                    '',
                    '**Discovery**: Find and understand models',
                    '**Execution**: Run models sync or async',
                    '**Status**: Monitor async job progress',
                    '**Control**: Manage async jobs',
                    '**Utility**: Helper functions',
                    '',
                    '## For Detailed Documentation',
                    'See the comprehensive tools-resource.md in the docs folder for:',
                    '- Full parameter schemas',
                    '- Input/output examples',
                    '- Error handling patterns',
                    '- Best practices',
                ].join('\n'),
            },
        ],
    }));
}

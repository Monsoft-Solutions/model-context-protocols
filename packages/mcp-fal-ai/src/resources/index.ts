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
                    '   - Tool (sync): `fal-run-sync`',
                    '   - Tool (helper): `fal-enqueue-and-wait` to poll until completion',
                    '',
                    '4. Check job status (if queued):',
                    '   - Tool: `fal-get-status` with `requestId`',
                    '',
                    '5. Retrieve the result when complete:',
                    '   - Tool: `fal-get-result` with `requestId`',
                ].join('\n'),
            },
        ],
    }));
}

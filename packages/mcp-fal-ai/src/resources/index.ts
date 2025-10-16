import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerResources(server: McpServer, token: string): void {
    server.resource('fal-config', 'config://fal', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `fal.ai configuration loaded. Token length: ${token.length}`,
            },
        ],
    }));

    server.resource(
        'fal-model-schema',
        new ResourceTemplate('fal-model://{modelId}/schema', { list: undefined }),
        async (uri, { modelId }) => ({
            contents: [
                {
                    uri: uri.href,
                    text: `Use tool get-model-schema to fetch schema for ${modelId}`,
                },
            ],
        }),
    );
}

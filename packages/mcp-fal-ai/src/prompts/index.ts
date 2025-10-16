import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
    server.prompt('review-fal-prompt', { prompt: z.string() }, ({ prompt }) => ({
        messages: [
            {
                role: 'user',
                content: { type: 'text', text: `Please improve this image prompt for fal.ai:\n\n${prompt}` },
            },
        ],
    }));
}

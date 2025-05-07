import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Registers all prompts with the MCP server
 * @param server - The MCP server instance
 */
export function registerPrompts(server: McpServer): void {
    // Register prompt for generating descriptive image prompts
    server.prompt(
        'create-image-prompt',
        {
            description: z.string().min(1).max(1000),
            style: z.string().optional(),
            mood: z.string().optional(),
            details: z.string().optional(),
        },
        ({ description, style, mood, details }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Create a detailed, effective prompt for generating an image with AI (DALL-E or similar).

What I want to generate:
${description}

${style ? `Style preferences: ${style}\n` : ''}${mood ? `Mood/atmosphere: ${mood}\n` : ''}${details ? `Additional details: ${details}\n` : ''}

Please create a single, detailed prompt that incorporates all these elements. The prompt should be descriptive but concise, focusing on visual elements. Include specific details about style, perspective, lighting, and mood where appropriate.

Only respond with the prompt itself, nothing else.`,
                    },
                },
            ],
        }),
    );

    // Register prompt for refining existing image prompts
    server.prompt(
        'refine-image-prompt',
        {
            originalPrompt: z.string().min(1).max(1000),
            adjustments: z.string().min(1).max(500),
        },
        ({ originalPrompt, adjustments }) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `I have an existing image generation prompt that I'd like to refine:

Original prompt: "${originalPrompt}"

I'd like to make these adjustments:
${adjustments}

Please provide an improved version of this prompt that incorporates my requested adjustments while maintaining the original concept. The prompt should be optimized for AI image generation (DALL-E or similar).

Only respond with the refined prompt, nothing else.`,
                    },
                },
            ],
        }),
    );
}

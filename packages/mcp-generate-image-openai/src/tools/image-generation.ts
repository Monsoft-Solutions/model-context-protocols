import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenAIClient } from '../services/openai-client.js';
import { z } from 'zod';
import { ImageModelSchema, ImageQualitySchema, ImageSizeSchema } from '../types/image-generation.js';

/**
 * Registers the image generation tool with the MCP server
 * @param server - The MCP server instance
 * @param apiKey - OpenAI API key
 */
export function registerImageGenerationTool(server: McpServer, apiKey: string): void {
    const openAIClient = new OpenAIClient(apiKey);

    // Register the image generation tool with Zod schema
    server.tool(
        'generate-image',
        'Generate an image from a prompt',
        {
            prompt: z.string().min(1).max(4000),
            model: ImageModelSchema.optional().default('gpt-image-1'),
            n: z
                .number()
                .int()
                .min(1)
                .max(10)
                .optional()
                .default(1)
                .describe('The number of images to generate. Defaults to 1.'),
            quality: ImageQualitySchema.optional()
                .default('medium')
                .describe('The quality of the generated images. Defaults to medium.'),
            size: ImageSizeSchema.optional()
                .default('1024x1024')
                .describe('The size of the generated images. Defaults to 1024x1024.'),
            output_format: z
                .enum(['png', 'webp', 'jpeg'])
                .optional()
                .default('png')
                .describe('The format of the generated images. Defaults to png.'),
            output_compression: z
                .number()
                .int()
                .min(1)
                .max(100)
                .optional()
                .default(80)
                .describe(
                    'The compression level (0-100%) for the generated images. This parameter is only supported for gpt-image-1 with the webp or jpeg output formats, and defaults to 100.',
                ),
        },
        async (params) => {
            try {
                // Generate the image
                const result = await openAIClient.generateImage({
                    model: params.model,
                    n: params.n,
                    prompt: params.prompt,
                    size: params.size,
                    quality: params.quality,
                    output_format: params.output_format,
                    output_compression: params.output_compression,
                });

                // Build the response with appropriate content types
                const contentItems = [];

                // Add each image to the content
                for (let i = 0; i < result.images.length; i++) {
                    const image = result.images[i];

                    if (image.url) {
                        // For URL responses, return as text with the URL
                        contentItems.push({
                            type: 'text' as const,
                            text: `Generated Image ${i + 1}: ${image.url}${image.revised_prompt ? ' (Revised Prompt)' : ''}`,
                        });
                    } else if (image.b64_json) {
                        // For base64 responses, return as image type
                        contentItems.push({
                            type: 'image' as const,
                            data: image.b64_json,
                            mimeType: 'image/png',
                        });
                    }
                }

                // Add the revised prompt if available
                const revisedPrompts = result.images
                    .filter((image) => image.revised_prompt)
                    .map((image) => image.revised_prompt);

                if (revisedPrompts.length > 0) {
                    contentItems.push({
                        type: 'text' as const,
                        text: `Note: The prompt was revised to: ${revisedPrompts.join('\n')}`,
                    });
                }

                return {
                    content: contentItems,
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Error generating image: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        },
    );
}

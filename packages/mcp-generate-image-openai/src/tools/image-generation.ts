import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OpenAIClient } from '../services/openai-client.js';
import { ImageKitClient } from '../services/imagekit-client.js';
import { z } from 'zod';
import {
    ImageModelSchema,
    ImageQualitySchema,
    ImageSizeSchema,
    ImageKitUploadSchema,
} from '../types/image-generation.js';

/**
 * Registers the image generation tool with the MCP server
 * @param server - The MCP server instance
 * @param apiKey - OpenAI API key
 * @param imageKitConfig - ImageKit configuration (optional)
 */
export function registerImageGenerationTool(
    server: McpServer,
    apiKey: string,
    imageKitConfig?: { publicKey: string; privateKey: string; urlEndpoint: string },
): void {
    const openAIClient = new OpenAIClient(apiKey);

    // Initialize ImageKit client if configuration is provided

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
                .default('webp')
                .describe('The format of the generated images. Defaults to webp.'),
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
            image_content_format: z
                .enum(['url', 'base64'])
                .optional()
                .default('url')
                .describe('The format of the generated images. Defaults to url.'),
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

                    // Handle ImageKit upload if requested and b64_json is available
                    if (params.image_content_format === 'url' && image.b64_json) {
                        try {
                            if (
                                !imageKitConfig ||
                                !imageKitConfig.publicKey ||
                                !imageKitConfig.privateKey ||
                                !imageKitConfig.urlEndpoint
                            ) {
                                throw new Error(
                                    'ImageKit upload requested but ImageKit is not configured on the server. Set up the environment variables to enable ImageKit upload.',
                                );
                            }

                            const imageKitClient = new ImageKitClient(
                                imageKitConfig.publicKey,
                                imageKitConfig.privateKey,
                                imageKitConfig.urlEndpoint,
                            );
                            // Generate a filename if not provided
                            const fileName = `generated-image-${Date.now()}-${i}.${params.output_format}`;

                            // Upload to ImageKit
                            const uploadResult = await imageKitClient?.uploadImage(image.b64_json, fileName);

                            if (uploadResult?.url) {
                                // Store the ImageKit URL in the image result
                                image.imagekit_url = uploadResult.url;

                                // Add the ImageKit URL to content
                                contentItems.push({
                                    type: 'text' as const,
                                    text: `Generated Image ${i + 1} (Public URL): ${uploadResult.url}${image.revised_prompt ? ' (Revised Prompt)' : ''}`,
                                });
                            }
                        } catch (uploadError) {
                            contentItems.push({
                                type: 'text' as const,
                                text: `Error uploading to ImageKit: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`,
                            });
                        }
                    }

                    // Add the original image URL or base64 data
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
                            mimeType: `image/${params.output_format}`,
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

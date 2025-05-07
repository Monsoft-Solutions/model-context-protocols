import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ImageModelSchema, ImageSizeSchema, ImageQualitySchema, BackgroundSchema } from '../types/image-generation.js';

/**
 * Registers all resources with the MCP server
 * @param server - The MCP server instance
 */
export function registerResources(server: McpServer): void {
    // Register image generation models reference
    server.resource('image-models', 'docs://openai/image-models', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `
# OpenAI Image Generation Models

The following models are available for image generation:

${ImageModelSchema.options.map((model) => `- \`${model}\`: ${getModelDescription(model)}`).join('\n')}

## Image Sizes
${ImageSizeSchema.options.map((size) => `- \`${size}\``).join('\n')}

## Quality Options
${ImageQualitySchema.options.map((quality) => `- \`${quality}\`: ${getQualityDescription(quality)}`).join('\n')}

## Background Options
${BackgroundSchema.options.map((background) => `- \`${background}\`: ${getBackgroundDescription(background)}`).join('\n')}

                `,
            },
        ],
    }));

    // Register image generation examples
    server.resource('image-examples', 'docs://openai/image-examples', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `
# OpenAI Image Generation Examples

## Example Prompts

Here are some effective prompts you can use as templates:

1. **Landscape Photography**:
   \`A breathtaking mountain landscape at sunrise, golden light illuminating snow-capped peaks, crystal clear alpine lake in the foreground, high resolution photography, crisp details, vivid colors\`

2. **Character Design**:
   \`A detailed character portrait of a cyberpunk detective, neon lighting, rain-soaked streets, cybernetic implants, moody atmosphere, highly detailed\`

3. **Concept Art**:
   \`Concept art of a futuristic underwater city with bioluminescent architecture, tall glass domes, schools of colorful fish swimming around, deep ocean background, sci-fi, digital art\`

## Best Practices

- Be specific about styles (watercolor, oil painting, 3D render, etc.)
- Include lighting details (soft lighting, golden hour, dramatic shadows)
- Specify camera perspectives (close-up, aerial view, wide angle)
- Mention quality indicators (high resolution, detailed, 4K, photorealistic)
                `,
            },
        ],
    }));
}

/**
 * Get a description for a given model
 */
function getModelDescription(model: string): string {
    return 'gpt-image-1';
}

/**
 * Get a description for a quality option
 */
function getQualityDescription(quality: string): string {
    switch (quality) {
        case 'standard':
            return 'Standard quality (default)';
        case 'hd':
            return 'High definition quality with more details';
        default:
            return 'Image quality setting';
    }
}

/**
 * Get a description for a background option
 */
function getBackgroundDescription(background: string): string {
    return `Allows to set transparency for the background of the generated image(s). This parameter is only supported for gpt-image-1. 
    Must be one of transparent, opaque or auto (default value). When auto is used, the model will automatically determine the best background for the image.
    If transparent, the output format needs to support transparency, so it should be set to either png (default value) or webp.`;
}

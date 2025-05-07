import { z } from 'zod';

/**
 * Schema for OpenAI image generation models
 */
export const ImageModelSchema = z.enum(['gpt-image-1']);

/**
 * Schema for background options
 * 
 * Allows to set transparency for the background of the generated image(s). This parameter is only supported for gpt-image-1. Must be one of transparent, opaque or auto (default value). When auto is used, the model will automatically determine the best background for the image.

If transparent, the output format needs to support transparency, so it should be set to either png (default value) or webp.
 */
export const BackgroundSchema = z.enum(['auto', 'opaque', 'transparent'])
    .describe(`Allows to set transparency for the background of the generated image(s). This parameter is only supported for gpt-image-1. Must be one of transparent, opaque or auto (default value). 
        When auto is used, the model will automatically determine the best background for the image.
        If transparent, the output format needs to support transparency, so it should be set to either png (default value) or webp.`);

/**
 * Schema for image sizes in format "WIDTHxHEIGHT"
 */
export const ImageSizeSchema = z.enum(['1024x1024', '1536x1024', '1024x1536', 'auto'])
    .describe(`The size of the generated images. Must be one of 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait), 
    or auto (default value) for gpt-image-1`);

/**
 * Schema for image quality options
 */
export const ImageQualitySchema = z.enum(['low', 'medium', 'high']);

/**
 * Type for image generation parameters
 */
export const ImageGenerationParamsSchema = z.object({
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
});

export type ImageModel = z.infer<typeof ImageModelSchema>;
export type ImageSize = z.infer<typeof ImageSizeSchema>;
export type ImageQuality = z.infer<typeof ImageQualitySchema>;
export type ImageGenerationParams = z.infer<typeof ImageGenerationParamsSchema>;

/**
 * Image generation result
 */
export interface GeneratedImage {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
}

/**
 * Complete image generation response
 */
export interface ImageGenerationResponse {
    created: number;
    images: GeneratedImage[];
}

import OpenAI from 'openai';
import { ApiError } from '../errors/api-error.js';
import type { ImageGenerationParams, GeneratedImage, ImageGenerationResponse } from '../types/image-generation.js';

// Define a type for the OpenAI API response data structure
interface OpenAIImageData {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
}

/**
 * Service for interacting with the OpenAI API
 */
export class OpenAIClient {
    private client: OpenAI;

    /**
     * Create an OpenAI client instance
     * @param apiKey - OpenAI API key
     */
    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('OpenAI API key is required');
        }

        this.client = new OpenAI({
            apiKey,
        });
    }

    /**
     * Generate images from a prompt using OpenAI's image generation API
     * @param params - Image generation parameters
     * @returns Promise with generated images
     * @throws {ApiError} When the API request fails
     */
    async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
        try {
            const response = await this.client.images.generate({
                model: params.model,
                prompt: params.prompt,
                n: params.n,
                size: params.size,
                quality: params.quality,
                output_format: params.output_format,
                output_compression: params.output_compression,
            });

            // Transform response to our standard format
            const images: GeneratedImage[] = (response.data || []).map((image: OpenAIImageData) => ({
                url: image.url,
                b64_json: image.b64_json,
                revised_prompt: image.revised_prompt,
            }));

            return {
                created: response.created,
                images,
            };
        } catch (error: unknown) {
            // Handle OpenAI API errors
            if (error instanceof Error && 'status' in error) {
                const apiError = error as unknown as { message: string; status: number };
                throw new ApiError(`OpenAI API Error: ${apiError.message}`, apiError.status, 'images.generate');
            }
            // Handle other errors
            throw error;
        }
    }
}

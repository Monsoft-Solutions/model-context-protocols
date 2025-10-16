import ImageKit from 'imagekit';
import { ApiError } from '../errors/api-error.js';

/**
 * Service for interacting with the ImageKit API
 */
export class ImageKitClient {
    private client: ImageKit;

    /**
     * Create an ImageKit client instance
     * @param publicKey - ImageKit public key
     * @param privateKey - ImageKit private key
     * @param urlEndpoint - ImageKit URL endpoint
     */
    constructor(publicKey: string, privateKey: string, urlEndpoint: string) {
        if (!publicKey || !privateKey || !urlEndpoint) {
            throw new Error('ImageKit configuration is required (publicKey, privateKey, urlEndpoint)');
        }

        this.client = new ImageKit({
            publicKey,
            privateKey,
            urlEndpoint,
        });
    }

    /**
     * Upload an image to ImageKit
     * @param base64Data - Base64 encoded image data
     * @param fileName - File name for the uploaded image
     * @param folder - Optional folder path to store the image
     * @returns Promise with upload response
     * @throws {ApiError} When the API request fails
     */
    async uploadImage(base64Data: string, fileName: string, folder?: string): Promise<{ url: string; fileId: string }> {
        try {
            // Remove data URL prefix if present
            const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, '');

            const response = await this.client.upload({
                file: base64WithoutPrefix,
                fileName: fileName,
                folder: folder || 'generated-images',
                useUniqueFileName: true,
            });

            return {
                url: response.url,
                fileId: response.fileId,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new ApiError(`ImageKit API Error: ${error.message}`, 500, 'imagekit.upload');
            }
            throw error;
        }
    }
}

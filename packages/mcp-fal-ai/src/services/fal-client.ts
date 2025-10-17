import { request } from 'undici';
import {
    ApiError,
    ForbiddenError,
    NotFoundError,
    RateLimitError,
    ServerError,
    UnauthorizedError,
} from '../errors/api-errors.js';
import { FalModel } from '../types/model.js';

export type FalClientOptions = {
    readonly apiKey: string;
};

export class FalClient {
    private readonly _apiKey: string;
    private readonly BASE_URL = 'https://fal.ai/api';
    private readonly SYNC_BASE = 'https://fal.run';
    private readonly QUEUE_BASE = 'https://queue.fal.run';

    constructor(options: FalClientOptions) {
        this._apiKey = options.apiKey;
    }

    async listModels(params?: { limit?: number; page?: number }): Promise<FalModel[]> {
        const url = new URL(`${this.BASE_URL}/models`);
        if (params?.limit != null) url.searchParams.set('limit', String(params.limit));
        if (params?.page != null) url.searchParams.set('page', String(params.page));
        return this._getJson(url.toString()) as Promise<FalModel[]>;
    }

    async searchModels(params: {
        keyword: string;
        limit?: number;
        category?: string;
    }): Promise<{ models: FalModel[] }> {
        const url = new URL(`${this.BASE_URL}/models`);
        url.searchParams.set('keywords', params.keyword);
        if (params.limit != null) url.searchParams.set('limit', String(params.limit));
        if (params.category != null) url.searchParams.set('category', params.category);
        return this._getJson(url.toString()) as Promise<{ models: FalModel[] }>;
    }

    async getModelSchema(modelId: string): Promise<unknown> {
        if (!modelId) {
            return { error: 'modelId is required' };
        }
        const endpointId = this._normalizeModelId(modelId);
        const url = `${this.BASE_URL}/openapi/queue/openapi.json?endpoint_id=${encodeURIComponent(endpointId)}`;
        return await this._getJson(url);
    }

    async runSync(modelId: string, body: unknown) {
        const endpointId = this._normalizeModelId(modelId);
        const url = `${this.SYNC_BASE}/${endpointId}`;
        const output = await this._postJson(url, body);
        return output;
    }

    async enqueue(modelId: string, body: unknown): Promise<unknown> {
        const endpointId = this._normalizeModelId(modelId);
        const url = `${this.QUEUE_BASE}/${endpointId}`;
        return await this._postJson(url, body);
    }

    async getStatus(requestId: string, modelId: string): Promise<unknown> {
        const baseModel = this._baseModelId(this._normalizeModelId(modelId));
        const url = `${this.QUEUE_BASE}/${baseModel}/requests/${encodeURIComponent(requestId)}/status`;
        return await this._getJson(url);
    }

    async getResult(requestId: string, modelId: string): Promise<unknown> {
        const baseModel = this._baseModelId(this._normalizeModelId(modelId));
        const url = `${this.QUEUE_BASE}/${baseModel}/requests/${encodeURIComponent(requestId)}`;
        const output = await this._getJson(url);
        return output;
    }

    async cancel(requestId: string, modelId: string): Promise<unknown> {
        const baseModel = this._baseModelId(this._normalizeModelId(modelId));
        const url = `${this.QUEUE_BASE}/${baseModel}/requests/${encodeURIComponent(requestId)}/cancel`;
        const res = await request(url, {
            method: 'PUT',
            headers: {
                Authorization: `Key ${this._apiKey}`,
            },
        });
        if (res.statusCode && res.statusCode >= 400) {
            await this._throwForStatus(res.statusCode, url, await res.body.text());
        }
        return await this._safeParse(await res.body.text());
    }

    private _normalizeModelId(modelId: string): string {
        if (modelId.startsWith('fal-ai/') || modelId.startsWith('workflows/')) return modelId;
        if (modelId.includes('/')) return modelId;
        return `fal-ai/${modelId}`;
    }

    private async _getJson(url: string): Promise<unknown> {
        const res = await request(url, {
            method: 'GET',
            headers: {
                Authorization: `Key ${this._apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        if (res.statusCode && res.statusCode >= 400) {
            await this._throwForStatus(res.statusCode, url, await res.body.text());
        }

        return await this._safeParse(await res.body.text());
    }

    private async _throwForStatus(status: number, endpoint: string, rawText: string): Promise<never> {
        let details: unknown = undefined;

        try {
            details = rawText ? JSON.parse(rawText) : undefined;
        } catch {
            details = rawText;
        }
        if (status === 401) throw new UnauthorizedError(endpoint, details);
        if (status === 403) throw new ForbiddenError(endpoint, details);
        if (status === 404) throw new NotFoundError(endpoint, details);
        if (status === 429) throw new RateLimitError(endpoint, details);
        if (status >= 500) throw new ServerError(status, endpoint, details);
        throw new ApiError('HTTP Error', status, endpoint, details);
    }

    private async _postJson(url: string, body: unknown): Promise<unknown> {
        let bodyToSend = body ?? {};

        // If body is a string, parse it first
        if (typeof body === 'string') {
            try {
                bodyToSend = JSON.parse(body);
            } catch {
                // If parsing fails, keep the string as is
                throw new Error('Invalid JSON body');
            }
        }

        const res = await request(url, {
            method: 'POST',
            headers: {
                Authorization: `Key ${this._apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyToSend),
        });
        if (res.statusCode && res.statusCode >= 400) {
            await this._throwForStatus(res.statusCode, url, await res.body.text());
        }
        const text = await res.body.text();
        return await this._safeParse(text);
    }

    private _baseModelId(modelId: string): string {
        const parts = modelId.split('/').filter(Boolean);
        // Return only the first two segments: namespace/model
        return parts.slice(0, 2).join('/');
    }

    private async _safeParse(text: string): Promise<unknown> {
        try {
            return text ? JSON.parse(text) : undefined;
        } catch {
            return text;
        }
    }

    /**
     * Download an image from a URL and return its base64 content and MIME type
     */
    async downloadImage(url: string): Promise<{
        success: boolean;
        base64?: string;
        mimeType?: string;
        size?: number;
        error?: string;
    }> {
        try {
            const response = await request(url, {
                method: 'GET',
            });

            if (response.statusCode && response.statusCode >= 400) {
                return {
                    success: false,
                    error: `HTTP ${response.statusCode}`,
                };
            }

            const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';
            const buffer = await response.body.arrayBuffer();
            const base64Content = Buffer.from(buffer).toString('base64');

            return {
                success: true,
                base64: base64Content,
                mimeType: contentType,
                size: buffer.byteLength,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    private async _processOutputWithImages(output: unknown): Promise<unknown> {
        if (!output || typeof output !== 'object') {
            return output;
        }

        const result = JSON.parse(JSON.stringify(output)) as Record<string, unknown>;
        const commonImageFields = ['image', 'image_url', 'output_url', 'url', 'images', 'output', 'result'];

        const extractAndDownloadImages = async (
            obj: Record<string, unknown>,
            prefix = '',
        ): Promise<Record<string, unknown>> => {
            const imageUrls: { [key: string]: string } = {};

            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (
                    commonImageFields.some((field) => key.toLowerCase().includes(field)) &&
                    typeof value === 'string' &&
                    (value.startsWith('http://') || value.startsWith('https://'))
                ) {
                    imageUrls[fullKey] = value;
                }

                if (typeof value === 'object' && value !== null && prefix.split('.').length < 3) {
                    await extractAndDownloadImages(value as Record<string, unknown>, fullKey);
                }
            }

            if (Object.keys(imageUrls).length > 0) {
                const downloadedImages: Record<string, unknown> = {};

                for (const [key, url] of Object.entries(imageUrls)) {
                    const imageData = await this.downloadImage(url);
                    downloadedImages[key] = imageData;
                }

                obj.downloaded_images = downloadedImages;
            }

            return obj;
        };

        return await extractAndDownloadImages(result);
    }
}

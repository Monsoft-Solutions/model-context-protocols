import { request } from 'undici';
import {
    ApiError,
    ForbiddenError,
    NotFoundError,
    RateLimitError,
    ServerError,
    UnauthorizedError,
} from '../errors/api-errors.js';

export type FalClientOptions = {
    readonly apiKey: string;
};

export class FalClient {
    private readonly _apiKey: string;

    constructor(options: FalClientOptions) {
        this._apiKey = options.apiKey;
    }

    async listModels(): Promise<unknown> {
        return this._getJson('https://api.fal.ai/models');
    }

    async searchModels(params: { query: string; limit?: number; category?: string }): Promise<unknown> {
        const url = new URL('https://api.fal.ai/models/search');
        url.searchParams.set('query', params.query);
        if (params.limit != null) url.searchParams.set('limit', String(params.limit));
        if (params.category) url.searchParams.set('category', params.category);
        return this._getJson(url.toString());
    }

    async getModelSchema(modelId: string): Promise<unknown> {
        const url = `https://api.fal.ai/models/${encodeURIComponent(modelId)}/schema`;
        return this._getJson(url);
    }

    async runSync(modelId: string, body: unknown): Promise<unknown> {
        const url = `https://fal.run/fal-ai/${encodeURIComponent(modelId)}`;
        return this._postJson(url, body);
    }

    async enqueue(modelId: string, body: unknown): Promise<unknown> {
        const url = `https://queue.fal.run/fal-ai/${encodeURIComponent(modelId)}`;
        return this._postJson(url, body);
    }

    async getStatus(requestId: string): Promise<unknown> {
        const url = `https://queue.fal.run/requests/${encodeURIComponent(requestId)}/status`;
        return this._getJson(url);
    }

    async getResult(requestId: string): Promise<unknown> {
        const url = `https://queue.fal.run/requests/${encodeURIComponent(requestId)}/result`;
        return this._getJson(url);
    }

    async cancel(requestId: string): Promise<unknown> {
        const url = `https://queue.fal.run/requests/${encodeURIComponent(requestId)}/cancel`;
        return this._postJson(url, {});
    }

    private async _getJson(url: string): Promise<unknown> {
        const res = await request(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this._apiKey}`,
            },
        });
        if (res.statusCode && res.statusCode >= 400) {
            await this._throwForStatus(res.statusCode, url, await res.body.text());
        }
        const text = await res.body.text();
        return text ? JSON.parse(text) : null;
    }

    private async _postJson(url: string, body: unknown): Promise<unknown> {
        const res = await request(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this._apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (res.statusCode && res.statusCode >= 400) {
            await this._throwForStatus(res.statusCode, url, await res.body.text());
        }
        const text = await res.body.text();
        return text ? JSON.parse(text) : null;
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
}

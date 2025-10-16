export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly endpoint?: string;
    public readonly details?: unknown;

    constructor(message: string, statusCode: number, endpoint?: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.endpoint = endpoint;
        this.details = details;
    }
}

export class UnauthorizedError extends ApiError {
    constructor(endpoint?: string, details?: unknown) {
        super('Unauthorized', 401, endpoint, details);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends ApiError {
    constructor(endpoint?: string, details?: unknown) {
        super('Forbidden', 403, endpoint, details);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends ApiError {
    constructor(endpoint?: string, details?: unknown) {
        super('Not Found', 404, endpoint, details);
        this.name = 'NotFoundError';
    }
}

export class RateLimitError extends ApiError {
    public readonly resetAt?: number;

    constructor(endpoint?: string, details?: unknown, resetAt?: number) {
        super('Too Many Requests', 429, endpoint, details);
        this.name = 'RateLimitError';
        this.resetAt = resetAt;
    }
}

export class ServerError extends ApiError {
    constructor(statusCode = 500, endpoint?: string, details?: unknown) {
        super('Server Error', statusCode, endpoint, details);
        this.name = 'ServerError';
    }
}

/**
 * Error thrown when there's an issue with the OpenAI API
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly endpoint?: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Error thrown when Google Ads API returns an error
 */
export class GoogleAdsApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly endpoint?: string,
        public readonly errorDetails?: unknown,
    ) {
        super(message);
        this.name = 'GoogleAdsApiError';
        Error.captureStackTrace(this, this.constructor);
    }
}

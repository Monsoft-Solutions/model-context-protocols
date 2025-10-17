/**
 * Error thrown when Vercel Blob operations fail
 */
export class VercelBlobError extends Error {
    constructor(
        message: string,
        public readonly operation?: string,
        public readonly cause?: unknown,
    ) {
        super(message);
        this.name = 'VercelBlobError';
    }
}

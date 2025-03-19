/**
 * Error thrown when Gmail API operations fail
 */
export class GmailApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly endpoint?: string,
    ) {
        super(message);
        this.name = 'GmailApiError';
    }
}

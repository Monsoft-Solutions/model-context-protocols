/**
 * Error thrown when a Slack API request fails
 */
export class SlackApiError extends Error {
    constructor(
        message: string,
        public readonly endpoint?: string,
        public readonly statusCode?: number,
    ) {
        super(message);
        this.name = 'SlackApiError';
    }
}

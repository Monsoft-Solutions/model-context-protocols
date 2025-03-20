import { WebClient } from '@slack/web-api';
import { SlackApiError } from '../errors/slack-api-error.js';

/**
 * Base class for Slack tools
 */
export class BaseSlackTool {
    /**
     * Create a new BaseSlackTool instance
     *
     * @param client - The authenticated Slack WebClient
     * @param teamId - The Slack team ID
     */
    constructor(
        protected readonly client: WebClient,
        protected readonly teamId: string,
    ) {}

    /**
     * Create a response object with text content
     *
     * @param text - The text content
     * @returns A formatted response object
     */
    protected createResponse(text: string) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text,
                },
            ],
        };
    }

    /**
     * Create a structured response with message data
     *
     * @param data - The data to format
     * @returns A formatted response object
     */
    protected createStructuredResponse(data: unknown) {
        return {
            content: [
                {
                    type: 'text' as const,
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }

    /**
     * Handle API errors uniformly
     *
     * @param error - The caught error
     * @param operation - The operation that failed
     * @throws SlackApiError with formatted message
     */
    protected handleError(error: unknown, operation: string): never {
        throw new SlackApiError(`Failed to ${operation}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

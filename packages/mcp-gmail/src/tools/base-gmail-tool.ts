import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GmailApiError } from '../errors/gmail-api-error.js';

/**
 * Base class for Gmail tools
 */
export class BaseGmailTool {
    protected readonly gmail;

    /**
     * Create a new BaseGmailTool instance
     *
     * @param oauth2Client - The authenticated OAuth2 client
     */
    constructor(protected readonly oauth2Client: OAuth2Client) {
        this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    }

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
     * Handle API errors uniformly
     *
     * @param error - The caught error
     * @param operation - The operation that failed
     * @throws GmailApiError with formatted message
     */
    protected handleError(error: unknown, operation: string): never {
        throw new GmailApiError(`Failed to ${operation}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

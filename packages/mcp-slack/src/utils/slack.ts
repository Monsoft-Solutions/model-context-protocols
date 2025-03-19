import { WebClient } from '@slack/web-api';
import { SlackApiError } from '../errors/slack-api-error.js';

/**
 * Initialize the Slack Web API client
 *
 * @param token The Slack Bot token
 * @returns The initialized Slack Web API client
 */
export function initializeSlackClient(token: string): WebClient {
    try {
        return new WebClient(token);
    } catch (error) {
        throw new SlackApiError(
            `Failed to initialize Slack client: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}

/**
 * Validate the Slack Bot token
 *
 * @param client The Slack Web API client
 * @throws SlackApiError if validation fails
 */
export async function validateToken(client: WebClient): Promise<void> {
    try {
        // Call auth.test to validate token and get team information
        const response = await client.auth.test();

        if (!response.ok) {
            throw new SlackApiError(`Token validation failed: ${response.error ?? 'Unknown error'}`, 'auth.test');
        }

        console.log(`Connected to Slack workspace: ${response.team}`);
        console.log(`Bot name: ${response.user}`);
    } catch (error) {
        if (error instanceof SlackApiError) {
            throw error;
        }
        throw new SlackApiError(
            `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
            'auth.test',
        );
    }
}

/**
 * Represents a Slack message with essential properties
 */
export type SlackMessage = {
    /** Message timestamp that serves as a unique identifier */
    ts: string;
    /** User ID of the message author */
    user: string;
    /** The message text content */
    text: string;
    /** Channel ID where the message was posted */
    channel?: string;
    /** Parent message timestamp, if this is a reply in a thread */
    thread_ts?: string;
    /** Reactions to the message */
    reactions?: Array<{
        /** Emoji name */
        name: string;
        /** Count of users who added this reaction */
        count: number;
        /** Users who added this reaction */
        users: string[];
    }>;
    /** Message attachments */
    attachments?: Array<{
        text?: string;
        title?: string;
        fallback?: string;
    }>;
};

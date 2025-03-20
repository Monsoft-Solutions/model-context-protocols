/**
 * Represents a Slack channel with essential properties
 */
export type SlackChannel = {
    /** Channel ID */
    id: string;
    /** Channel name */
    name: string;
    /** Whether the channel is a private channel */
    is_private: boolean;
    /** Number of members in the channel */
    num_members?: number;
    /** Channel topic */
    topic?: {
        /** Topic text */
        value: string;
    };
    /** Channel purpose */
    purpose?: {
        /** Purpose text */
        value: string;
    };
};

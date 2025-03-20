/**
 * Represents a Slack user with essential properties
 */
export type SlackUser = {
    /** User ID */
    id: string;
    /** Whether the user is a bot */
    is_bot: boolean;
    /** Whether the user is an admin */
    is_admin?: boolean;
    /** Whether the user has been deleted */
    deleted: boolean;
    /** User's real name */
    real_name?: string;
    /** User's display name */
    name?: string;
    /** User's profile information */
    profile?: {
        /** Display name */
        display_name?: string;
        /** Email address */
        email?: string;
        /** Phone number */
        phone?: string;
        /** Profile picture URL */
        image_original?: string;
        /** Status text */
        status_text?: string;
        /** Status emoji */
        status_emoji?: string;
        /** Title/position */
        title?: string;
    };
};

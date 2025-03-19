/**
 * Types for Gmail settings management
 */

/**
 * Vacation responder settings
 */
export type VacationResponderSettings = {
    /**
     * Whether the vacation responder is enabled
     */
    enableAutoReply: boolean;
    /**
     * Subject line of the vacation responder
     */
    responseSubject?: string;
    /**
     * Body of the vacation responder
     */
    responseBodyPlainText: string;
    /**
     * HTML body of the vacation responder
     */
    responseBodyHtml?: string;
    /**
     * Start time of the vacation (in RFC 3339 format)
     */
    startTime?: string;
    /**
     * End time of the vacation (in RFC 3339 format)
     */
    endTime?: string;
    /**
     * Whether to restrict the responder to contacts only
     */
    restrictToContacts?: boolean;
    /**
     * Whether to restrict the responder to domain contacts only
     */
    restrictToDomain?: boolean;
};

/**
 * Email forwarding settings
 */
export type ForwardingSettings = {
    /**
     * Email address to forward to
     */
    forwardingEmail?: string;
    /**
     * Whether the forwarding is enabled
     */
    enabled?: boolean;
    /**
     * What to do with the original email
     */
    disposition?: 'leaveInInbox' | 'archive' | 'trash' | 'markRead';
};

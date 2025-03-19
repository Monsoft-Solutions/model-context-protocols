/**
 * Interface representing a part of a Gmail message structure
 * Used when parsing email content from the Gmail API
 */
export type GmailMessagePart = {
    partId?: string;
    mimeType?: string;
    filename?: string;
    headers?: Array<{
        name: string;
        value: string;
    }>;
    body?: {
        attachmentId?: string;
        size?: number;
        data?: string;
    };
    parts?: GmailMessagePart[];
};

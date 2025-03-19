/**
 * Interface representing an attachment in an email
 */
export type EmailAttachment = {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
};

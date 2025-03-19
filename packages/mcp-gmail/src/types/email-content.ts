/**
 * Interface representing the content of an email
 * Includes both text and HTML versions of the email body
 */
export type EmailContent = {
    text: string;
    html: string;
};

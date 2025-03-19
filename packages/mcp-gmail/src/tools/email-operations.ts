import { BaseGmailTool } from './base-gmail-tool.js';
import { createEmailMessage } from '../utils/email.js';
import { extractEmailContent, extractAttachments } from '../utils/gmail.js';
import { GmailMessagePart } from '../types/gmail-message-part.js';

/**
 * Tool for basic email operations like sending, drafting, and reading emails
 */
export class EmailOperationsTool extends BaseGmailTool {
    /**
     * Handle send or draft email operations
     *
     * @param action - The action to perform ('send' or 'draft')
     * @param args - The validated arguments for the operation
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async handleEmailAction(
        action: 'send' | 'draft',
        args: {
            to: string[];
            subject: string;
            body: string;
            cc?: string[];
            bcc?: string[];
        },
    ) {
        try {
            const message = createEmailMessage(args);

            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            if (action === 'send') {
                const response = await this.gmail.users.messages.send({
                    userId: 'me',
                    requestBody: {
                        raw: encodedMessage,
                    },
                });
                return this.createResponse(`Email sent successfully with ID: ${response.data.id}`);
            } else {
                const response = await this.gmail.users.drafts.create({
                    userId: 'me',
                    requestBody: {
                        message: {
                            raw: encodedMessage,
                        },
                    },
                });
                return this.createResponse(`Email draft created successfully with ID: ${response.data.id}`);
            }
        } catch (error) {
            this.handleError(error, `${action} email`);
        }
    }

    /**
     * Read a specific email
     *
     * @param messageId - The ID of the email to read
     * @returns The email content
     * @throws GmailApiError if the operation fails
     */
    async readEmail(messageId: string) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            const headers = response.data.payload?.headers || [];
            const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
            const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';
            const to = headers.find((h) => h.name?.toLowerCase() === 'to')?.value || '';
            const date = headers.find((h) => h.name?.toLowerCase() === 'date')?.value || '';

            // Extract email content
            const { text, html } = extractEmailContent((response.data.payload as GmailMessagePart) || {});

            // Use plain text content if available, otherwise use HTML content
            const body = text || html || '';

            // If we only have HTML content, add a note for the user
            const contentTypeNote =
                !text && html ? '[Note: This email is HTML-formatted. Plain text version not available.]\n\n' : '';

            // Get attachment information
            const attachments = extractAttachments((response.data.payload as GmailMessagePart) || {});

            // Add attachment info to output if any are present
            const attachmentInfo =
                attachments.length > 0
                    ? `\n\nAttachments (${attachments.length}):\n` +
                      attachments
                          .map((a) => `- ${a.filename} (${a.mimeType}, ${Math.round(a.size / 1024)} KB)`)
                          .join('\n')
                    : '';

            return this.createResponse(
                `Subject: ${subject}\nFrom: ${from}\nTo: ${to}\nDate: ${date}\n\n${contentTypeNote}${body}${attachmentInfo}`,
            );
        } catch (error) {
            this.handleError(error, 'read email');
        }
    }
}

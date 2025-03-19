import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GmailApiError } from '../errors/gmail-api-error.js';
import { createEmailMessage } from '../utils/email.js';
import { extractEmailContent, extractAttachments } from '../utils/gmail.js';
import { GmailMessagePart } from '../types/gmail-message-part.js';

/**
 * Gmail tools implementation
 */
export class GmailTools {
    private readonly gmail;

    /**
     * Create a new GmailTools instance
     *
     * @param oauth2Client - The authenticated OAuth2 client
     */
    constructor(private readonly oauth2Client: OAuth2Client) {
        this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    }

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
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Email sent successfully with ID: ${response.data.id}`,
                        },
                    ],
                };
            } else {
                const response = await this.gmail.users.drafts.create({
                    userId: 'me',
                    requestBody: {
                        message: {
                            raw: encodedMessage,
                        },
                    },
                });
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Email draft created successfully with ID: ${response.data.id}`,
                        },
                    ],
                };
            }
        } catch (error) {
            throw new GmailApiError(
                `Failed to ${action} email: ${error instanceof Error ? error.message : String(error)}`,
            );
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

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: `Subject: ${subject}\nFrom: ${from}\nTo: ${to}\nDate: ${date}\n\n${contentTypeNote}${body}${attachmentInfo}`,
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(`Failed to read email: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Search for emails using Gmail search syntax
     *
     * @param query - The search query
     * @param maxResults - Maximum number of results to return
     * @returns The search results
     * @throws GmailApiError if the operation fails
     */
    async searchEmails(query: string, maxResults: number = 10) {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: maxResults,
            });

            const messages = response.data.messages || [];
            const results = await Promise.all(
                messages.map(async (msg) => {
                    const detail = await this.gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id!,
                        format: 'metadata',
                        metadataHeaders: ['Subject', 'From', 'Date'],
                    });
                    const headers = detail.data.payload?.headers || [];
                    return {
                        id: msg.id,
                        subject: headers.find((h) => h.name === 'Subject')?.value || '',
                        from: headers.find((h) => h.name === 'From')?.value || '',
                        date: headers.find((h) => h.name === 'Date')?.value || '',
                    };
                }),
            );

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: results
                            .map((r) => `ID: ${r.id}\nSubject: ${r.subject}\nFrom: ${r.from}\nDate: ${r.date}\n`)
                            .join('\n'),
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to search emails: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Modify email labels
     *
     * @param messageId - The ID of the email to modify
     * @param labelIds - Label IDs to apply
     * @param addLabelIds - Label IDs to add
     * @param removeLabelIds - Label IDs to remove
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async modifyEmail(messageId: string, labelIds?: string[], addLabelIds?: string[], removeLabelIds?: string[]) {
        try {
            // Prepare request body
            const requestBody: { addLabelIds?: string[]; removeLabelIds?: string[] } = {};

            if (labelIds) {
                requestBody.addLabelIds = labelIds;
            }

            if (addLabelIds) {
                requestBody.addLabelIds = addLabelIds;
            }

            if (removeLabelIds) {
                requestBody.removeLabelIds = removeLabelIds;
            }

            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: requestBody,
            });

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: `Email ${messageId} labels updated successfully`,
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to modify email: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Delete an email
     *
     * @param messageId - The ID of the email to delete
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async deleteEmail(messageId: string) {
        try {
            await this.gmail.users.messages.delete({
                userId: 'me',
                id: messageId,
            });

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: `Email ${messageId} deleted successfully`,
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to delete email: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * List email labels
     *
     * @returns The list of email labels
     * @throws GmailApiError if the operation fails
     */
    async listEmailLabels() {
        try {
            const response = await this.gmail.users.labels.list({
                userId: 'me',
            });

            const labels = response.data.labels || [];
            const formattedLabels = labels.map((label) => ({
                id: label.id,
                name: label.name,
                type: label.type,
                // Include additional useful information about each label
                messageListVisibility: label.messageListVisibility,
                labelListVisibility: label.labelListVisibility,
                // Only include count if it's a system label (as custom labels don't typically have counts)
                messagesTotal: label.messagesTotal,
                messagesUnread: label.messagesUnread,
                color: label.color,
            }));

            // Group labels by type (system vs user) for better organization
            const systemLabels = formattedLabels.filter((label) => label.type === 'system');
            const userLabels = formattedLabels.filter((label) => label.type === 'user');

            return {
                content: [
                    {
                        type: 'text' as const,
                        text:
                            `Found ${labels.length} labels (${systemLabels.length} system, ${userLabels.length} user):\n\n` +
                            'System Labels:\n' +
                            systemLabels.map((l) => `ID: ${l.id}\nName: ${l.name}\n`).join('\n') +
                            '\nUser Labels:\n' +
                            userLabels.map((l) => `ID: ${l.id}\nName: ${l.name}\n`).join('\n'),
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to list email labels: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

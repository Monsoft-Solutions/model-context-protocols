import { BaseGmailTool } from './base-gmail-tool.js';

/**
 * Tool for operations related to Gmail labels
 */
export class LabelOperationsTool extends BaseGmailTool {
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

            return this.createResponse(`Email ${messageId} labels updated successfully`);
        } catch (error) {
            this.handleError(error, 'modify email');
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

            return this.createResponse(
                `Found ${labels.length} labels (${systemLabels.length} system, ${userLabels.length} user):\n\n` +
                    'System Labels:\n' +
                    systemLabels.map((l) => `ID: ${l.id}\nName: ${l.name}\n`).join('\n') +
                    '\nUser Labels:\n' +
                    userLabels.map((l) => `ID: ${l.id}\nName: ${l.name}\n`).join('\n'),
            );
        } catch (error) {
            this.handleError(error, 'list email labels');
        }
    }
}

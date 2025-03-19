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

    /**
     * Create a new Gmail label
     *
     * @param name - The name of the label to create
     * @param messageListVisibility - Visibility in message list view (show/hide)
     * @param labelListVisibility - Visibility in label list (show/hide)
     * @param backgroundColor - The background color of the label
     * @param textColor - The text color of the label
     * @returns Result of the operation with the created label ID
     * @throws GmailApiError if the operation fails
     */
    async createLabel(
        name: string,
        messageListVisibility?: string,
        labelListVisibility?: string,
        backgroundColor?: string,
        textColor?: string,
    ) {
        try {
            // Prepare request body
            const requestBody: any = {
                name: name,
            };

            if (messageListVisibility) {
                requestBody.messageListVisibility = messageListVisibility;
            }

            if (labelListVisibility) {
                requestBody.labelListVisibility = labelListVisibility;
            }

            if (backgroundColor || textColor) {
                requestBody.color = {};

                if (backgroundColor) {
                    requestBody.color.backgroundColor = backgroundColor;
                }

                if (textColor) {
                    requestBody.color.textColor = textColor;
                }
            }

            const response = await this.gmail.users.labels.create({
                userId: 'me',
                requestBody: requestBody,
            });

            const createdLabel = response.data;

            return this.createResponse(`Successfully created label "${name}" with ID: ${createdLabel.id}`);
        } catch (error) {
            this.handleError(error, 'create label');
        }
    }

    /**
     * Update an existing Gmail label
     *
     * @param labelId - The ID of the label to update
     * @param name - New name for the label
     * @param messageListVisibility - Visibility in message list view (show/hide)
     * @param labelListVisibility - Visibility in label list (show/hide)
     * @param backgroundColor - The background color of the label
     * @param textColor - The text color of the label
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async updateLabel(
        labelId: string,
        name?: string,
        messageListVisibility?: string,
        labelListVisibility?: string,
        backgroundColor?: string,
        textColor?: string,
    ) {
        try {
            // Get current label info first
            const response = await this.gmail.users.labels.get({
                userId: 'me',
                id: labelId,
            });

            const currentLabel = response.data;

            // Prepare request body with updated fields
            const requestBody: any = {
                id: labelId,
                name: name || currentLabel.name,
            };

            if (messageListVisibility) {
                requestBody.messageListVisibility = messageListVisibility;
            } else if (currentLabel.messageListVisibility) {
                requestBody.messageListVisibility = currentLabel.messageListVisibility;
            }

            if (labelListVisibility) {
                requestBody.labelListVisibility = labelListVisibility;
            } else if (currentLabel.labelListVisibility) {
                requestBody.labelListVisibility = currentLabel.labelListVisibility;
            }

            // Update color if provided
            if (backgroundColor || textColor || currentLabel.color) {
                requestBody.color = currentLabel.color || {};

                if (backgroundColor) {
                    requestBody.color.backgroundColor = backgroundColor;
                }

                if (textColor) {
                    requestBody.color.textColor = textColor;
                }
            }

            await this.gmail.users.labels.update({
                userId: 'me',
                id: labelId,
                requestBody: requestBody,
            });

            return this.createResponse(`Successfully updated label with ID: ${labelId}`);
        } catch (error) {
            this.handleError(error, 'update label');
        }
    }

    /**
     * Delete a custom Gmail label
     *
     * @param labelId - The ID of the label to delete
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async deleteLabel(labelId: string) {
        try {
            // Check if it's a system label (system labels cannot be deleted)
            const response = await this.gmail.users.labels.get({
                userId: 'me',
                id: labelId,
            });

            if (response.data.type === 'system') {
                return this.createResponse(`Cannot delete system label with ID: ${labelId}`);
            }

            await this.gmail.users.labels.delete({
                userId: 'me',
                id: labelId,
            });

            return this.createResponse(`Successfully deleted label with ID: ${labelId}`);
        } catch (error) {
            this.handleError(error, 'delete label');
        }
    }
}

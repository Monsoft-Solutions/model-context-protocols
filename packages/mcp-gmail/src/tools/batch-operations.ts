import { BaseGmailTool } from './base-gmail-tool.js';

// Gmail system label IDs that are commonly used
const SYSTEM_LABELS = {
    INBOX: 'INBOX',
    UNREAD: 'UNREAD',
    READ: 'UNREAD', // Used for removing UNREAD label
    TRASH: 'TRASH',
};

/**
 * Tool for batch email operations (batch delete, batch modify)
 */
export class BatchOperationsTool extends BaseGmailTool {
    /**
     * Delete multiple emails in a single operation
     *
     * @param messageIds - Array of email IDs to delete
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async batchDelete(messageIds: string[]) {
        try {
            await this.gmail.users.messages.batchDelete({
                userId: 'me',
                requestBody: {
                    ids: messageIds,
                },
            });

            return this.createResponse(
                `Successfully deleted ${messageIds.length} email${messageIds.length === 1 ? '' : 's'}`,
            );
        } catch (error) {
            this.handleError(error, 'batch delete emails');
        }
    }

    /**
     * Modify multiple emails in a single operation
     *
     * @param messageIds - Array of email IDs to modify
     * @param addLabelIds - Optional array of label IDs to add to all messages
     * @param removeLabelIds - Optional array of label IDs to remove from all messages
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async batchModify(messageIds: string[], addLabelIds?: string[], removeLabelIds?: string[]) {
        try {
            await this.gmail.users.messages.batchModify({
                userId: 'me',
                requestBody: {
                    ids: messageIds,
                    addLabelIds: addLabelIds || [],
                    removeLabelIds: removeLabelIds || [],
                },
            });

            // Create a descriptive message based on what was done
            let operationDescription = '';
            if (addLabelIds && addLabelIds.length > 0) {
                operationDescription += `added labels: [${addLabelIds.join(', ')}]`;
            }

            if (removeLabelIds && removeLabelIds.length > 0) {
                if (operationDescription) operationDescription += ' and ';
                operationDescription += `removed labels: [${removeLabelIds.join(', ')}]`;
            }

            return this.createResponse(
                `Successfully modified ${messageIds.length} email${messageIds.length === 1 ? '' : 's'} (${operationDescription})`,
            );
        } catch (error) {
            this.handleError(error, 'batch modify emails');
        }
    }

    /**
     * Mark multiple emails as read in a single operation
     *
     * @param messageIds - Array of email IDs to mark as read
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async batchMarkAsRead(messageIds: string[]) {
        return this.batchModify(messageIds, [], [SYSTEM_LABELS.UNREAD]);
    }

    /**
     * Mark multiple emails as unread in a single operation
     *
     * @param messageIds - Array of email IDs to mark as unread
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async batchMarkAsUnread(messageIds: string[]) {
        return this.batchModify(messageIds, [SYSTEM_LABELS.UNREAD], []);
    }

    /**
     * Archive multiple emails in a single operation
     *
     * @param messageIds - Array of email IDs to archive
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async batchArchive(messageIds: string[]) {
        return this.batchModify(messageIds, [], [SYSTEM_LABELS.INBOX]);
    }

    /**
     * Move multiple emails to trash in a single operation
     *
     * @param messageIds - Array of email IDs to move to trash
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async batchMoveToTrash(messageIds: string[]) {
        return this.batchModify(messageIds, [SYSTEM_LABELS.TRASH], [SYSTEM_LABELS.INBOX]);
    }
}

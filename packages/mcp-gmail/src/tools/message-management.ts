import { BaseGmailTool } from './base-gmail-tool.js';

// Gmail system label IDs that are needed for email management
const SYSTEM_LABELS = {
    INBOX: 'INBOX',
    UNREAD: 'UNREAD',
    READ: 'UNREAD', // Used for removing UNREAD label
    TRASH: 'TRASH',
};

/**
 * Tool for managing email messages (delete, archive, trash, etc.)
 */
export class MessageManagementTool extends BaseGmailTool {
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

            return this.createResponse(`Email ${messageId} deleted successfully`);
        } catch (error) {
            this.handleError(error, 'delete email');
        }
    }

    /**
     * Mark an email as read
     *
     * @param messageId - The ID of the email to mark as read
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async markAsRead(messageId: string) {
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: [SYSTEM_LABELS.UNREAD],
                },
            });

            return this.createResponse(`Email ${messageId} marked as read`);
        } catch (error) {
            this.handleError(error, 'mark email as read');
        }
    }

    /**
     * Mark an email as unread
     *
     * @param messageId - The ID of the email to mark as unread
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async markAsUnread(messageId: string) {
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    addLabelIds: [SYSTEM_LABELS.UNREAD],
                },
            });

            return this.createResponse(`Email ${messageId} marked as unread`);
        } catch (error) {
            this.handleError(error, 'mark email as unread');
        }
    }

    /**
     * Archive an email (remove from inbox)
     *
     * @param messageId - The ID of the email to archive
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async archiveEmail(messageId: string) {
        try {
            await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: [SYSTEM_LABELS.INBOX],
                },
            });

            return this.createResponse(`Email ${messageId} archived`);
        } catch (error) {
            this.handleError(error, 'archive email');
        }
    }

    /**
     * Move an email to trash
     *
     * @param messageId - The ID of the email to move to trash
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async moveToTrash(messageId: string) {
        try {
            await this.gmail.users.messages.trash({
                userId: 'me',
                id: messageId,
            });

            return this.createResponse(`Email ${messageId} moved to trash`);
        } catch (error) {
            this.handleError(error, 'move email to trash');
        }
    }

    /**
     * Recover an email from trash
     *
     * @param messageId - The ID of the email to recover from trash
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async recoverFromTrash(messageId: string) {
        try {
            await this.gmail.users.messages.untrash({
                userId: 'me',
                id: messageId,
            });

            return this.createResponse(`Email ${messageId} recovered from trash`);
        } catch (error) {
            this.handleError(error, 'recover email from trash');
        }
    }
}

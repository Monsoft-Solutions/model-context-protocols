import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { EmailOperationsTool } from './email-operations.js';
import { SearchOperationsTool } from './search-operations.js';
import { LabelOperationsTool } from './label-operations.js';
import { MessageManagementTool } from './message-management.js';
import { BatchOperationsTool } from './batch-operations.js';

/**
 * Register Gmail tools with the MCP server
 *
 * @param server - The MCP server instance
 * @param oauth2Client - The authenticated OAuth2 client
 */
export function registerTools(server: McpServer, oauth2Client: OAuth2Client): void {
    const emailOperations = new EmailOperationsTool(oauth2Client);
    const searchOperations = new SearchOperationsTool(oauth2Client);
    const labelOperations = new LabelOperationsTool(oauth2Client);
    const messageManagement = new MessageManagementTool(oauth2Client);
    const batchOperations = new BatchOperationsTool(oauth2Client);

    // Email Operations

    // Send Email
    server.tool(
        'gmail_send_email',
        {
            to: z.array(z.string()).describe('List of recipient email addresses'),
            subject: z.string().describe('Email subject'),
            body: z.string().describe('Email body content'),
            cc: z.array(z.string()).optional().describe('List of CC recipients'),
            bcc: z.array(z.string()).optional().describe('List of BCC recipients'),
        },
        async (params) => {
            return await emailOperations.handleEmailAction('send', params);
        },
    );

    // Draft Email
    server.tool(
        'gmail_draft_email',
        {
            to: z.array(z.string()).describe('List of recipient email addresses'),
            subject: z.string().describe('Email subject'),
            body: z.string().describe('Email body content'),
            cc: z.array(z.string()).optional().describe('List of CC recipients'),
            bcc: z.array(z.string()).optional().describe('List of BCC recipients'),
        },
        async (params) => {
            return await emailOperations.handleEmailAction('draft', params);
        },
    );

    // Read Email
    server.tool(
        'gmail_read_email',
        {
            messageId: z.string().describe('ID of the email message to retrieve'),
        },
        async (params) => {
            return await emailOperations.readEmail(params.messageId);
        },
    );

    // Search Operations

    // Search Emails
    server.tool(
        'gmail_list_emails',
        {
            query: z.string().describe("Gmail search query (e.g., 'from:example@gmail.com')"),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async (params) => {
            return await searchOperations.searchEmails(params.query, params.maxResults);
        },
    );

    // Advanced Search Emails with Filters
    server.tool(
        'gmail_list_emails_with_advanced_filters',
        {
            from: z.string().optional().describe('Filter emails from a specific sender'),
            to: z.string().optional().describe('Filter emails sent to a specific recipient'),
            subject: z.string().optional().describe('Filter by text in the subject line'),
            afterDate: z.string().optional().describe('Filter emails after this date (format: YYYY/MM/DD)'),
            beforeDate: z.string().optional().describe('Filter emails before this date (format: YYYY/MM/DD)'),
            hasAttachment: z.boolean().optional().describe('Filter emails with attachments'),
            isRead: z.boolean().optional().describe('Filter by read/unread status'),
            isStarred: z.boolean().optional().describe('Filter starred emails'),
            inFolder: z.string().optional().describe('Filter emails in a specific folder (e.g., inbox, sent, trash)'),
            hasWords: z.string().optional().describe('Filter emails containing specific words'),
            doesNotHaveWords: z.string().optional().describe('Filter out emails with specific words'),
            minSize: z.number().optional().describe('Filter emails larger than this size (in MB)'),
            maxSize: z.number().optional().describe('Filter emails smaller than this size (in MB)'),
            labels: z.array(z.string()).optional().describe('Filter by specific labels'),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async (params) => {
            return await searchOperations.searchWithFilters(params);
        },
    );

    // Label Operations

    // Modify Email Labels
    server.tool(
        'gmail_modify_email',
        {
            messageId: z.string().describe('ID of the email message to modify'),
            labelIds: z.array(z.string()).optional().describe('List of label IDs to apply'),
            addLabelIds: z.array(z.string()).optional().describe('List of label IDs to add to the message'),
            removeLabelIds: z.array(z.string()).optional().describe('List of label IDs to remove from the message'),
        },
        async (params) => {
            return await labelOperations.modifyEmail(
                params.messageId,
                params.labelIds,
                params.addLabelIds,
                params.removeLabelIds,
            );
        },
    );

    // List Email Labels
    server.tool('gmail_list_email_labels', {}, async () => {
        return await labelOperations.listEmailLabels();
    });

    // Create Label
    server.tool(
        'gmail_create_label',
        {
            name: z.string().describe('Name of the label to create'),
            messageListVisibility: z
                .enum(['show', 'hide'])
                .optional()
                .describe('Visibility in message list view (show/hide)'),
            labelListVisibility: z
                .enum(['labelShow', 'labelShowIfUnread', 'labelHide'])
                .optional()
                .describe('Visibility in label list (show/hide/showIfUnread)'),
            backgroundColor: z.string().optional().describe('Background color of the label (hex code)'),
            textColor: z.string().optional().describe('Text color of the label (hex code)'),
        },
        async (params) => {
            return await labelOperations.createLabel(
                params.name,
                params.messageListVisibility,
                params.labelListVisibility,
                params.backgroundColor,
                params.textColor,
            );
        },
    );

    // Update Label
    server.tool(
        'gmail_update_label',
        {
            labelId: z.string().describe('ID of the label to update'),
            name: z.string().optional().describe('New name for the label'),
            messageListVisibility: z
                .enum(['show', 'hide'])
                .optional()
                .describe('Visibility in message list view (show/hide)'),
            labelListVisibility: z
                .enum(['labelShow', 'labelShowIfUnread', 'labelHide'])
                .optional()
                .describe('Visibility in label list (show/hide/showIfUnread)'),
            backgroundColor: z.string().optional().describe('Background color of the label (hex code)'),
            textColor: z.string().optional().describe('Text color of the label (hex code)'),
        },
        async (params) => {
            return await labelOperations.updateLabel(
                params.labelId,
                params.name,
                params.messageListVisibility,
                params.labelListVisibility,
                params.backgroundColor,
                params.textColor,
            );
        },
    );

    // Delete Label
    server.tool(
        'gmail_delete_label',
        {
            labelId: z.string().describe('ID of the label to delete'),
        },
        async (params) => {
            return await labelOperations.deleteLabel(params.labelId);
        },
    );

    // Message Management Operations

    // Delete Email
    server.tool(
        'gmail_delete_email',
        {
            messageId: z.string().describe('ID of the email message to delete'),
        },
        async (params) => {
            return await messageManagement.deleteEmail(params.messageId);
        },
    );

    // New Tools

    // Mark as Read
    server.tool(
        'gmail_mark_as_read',
        {
            messageId: z.string().describe('ID of the email message to mark as read'),
        },
        async (params) => {
            return await messageManagement.markAsRead(params.messageId);
        },
    );

    // Mark as Unread
    server.tool(
        'gmail_mark_as_unread',
        {
            messageId: z.string().describe('ID of the email message to mark as unread'),
        },
        async (params) => {
            return await messageManagement.markAsUnread(params.messageId);
        },
    );

    // Archive Email
    server.tool(
        'gmail_archive_email',
        {
            messageId: z.string().describe('ID of the email message to archive'),
        },
        async (params) => {
            return await messageManagement.archiveEmail(params.messageId);
        },
    );

    // Move to Trash
    server.tool(
        'gmail_move_to_trash',
        {
            messageId: z.string().describe('ID of the email message to move to trash'),
        },
        async (params) => {
            return await messageManagement.moveToTrash(params.messageId);
        },
    );

    // Recover from Trash
    server.tool(
        'gmail_recover_from_trash',
        {
            messageId: z.string().describe('ID of the email message to recover from trash'),
        },
        async (params) => {
            return await messageManagement.recoverFromTrash(params.messageId);
        },
    );

    // Batch Operations

    // Batch Delete Emails
    server.tool(
        'gmail_batch_delete',
        {
            messageIds: z.array(z.string()).describe('Array of email message IDs to delete'),
        },
        async (params) => {
            return await batchOperations.batchDelete(params.messageIds);
        },
    );

    // Batch Modify Emails
    server.tool(
        'gmail_batch_modify',
        {
            messageIds: z.array(z.string()).describe('Array of email message IDs to modify'),
            addLabelIds: z.array(z.string()).optional().describe('List of label IDs to add to the messages'),
            removeLabelIds: z.array(z.string()).optional().describe('List of label IDs to remove from the messages'),
        },
        async (params) => {
            return await batchOperations.batchModify(params.messageIds, params.addLabelIds, params.removeLabelIds);
        },
    );

    // Batch Mark as Read
    server.tool(
        'gmail_batch_mark_as_read',
        {
            messageIds: z.array(z.string()).describe('Array of email message IDs to mark as read'),
        },
        async (params) => {
            return await batchOperations.batchMarkAsRead(params.messageIds);
        },
    );

    // Batch Mark as Unread
    server.tool(
        'gmail_batch_mark_as_unread',
        {
            messageIds: z.array(z.string()).describe('Array of email message IDs to mark as unread'),
        },
        async (params) => {
            return await batchOperations.batchMarkAsUnread(params.messageIds);
        },
    );

    // Batch Archive Emails
    server.tool(
        'gmail_batch_archive',
        {
            messageIds: z.array(z.string()).describe('Array of email message IDs to archive'),
        },
        async (params) => {
            return await batchOperations.batchArchive(params.messageIds);
        },
    );

    // Batch Move to Trash
    server.tool(
        'gmail_batch_move_to_trash',
        {
            messageIds: z.array(z.string()).describe('Array of email message IDs to move to trash'),
        },
        async (params) => {
            return await batchOperations.batchMoveToTrash(params.messageIds);
        },
    );
}

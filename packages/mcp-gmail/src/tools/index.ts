import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { GmailTools } from './gmail-tools.js';

/**
 * Register Gmail tools with the MCP server
 *
 * @param server - The MCP server instance
 * @param oauth2Client - The authenticated OAuth2 client
 */
export function registerTools(server: McpServer, oauth2Client: OAuth2Client): void {
    const gmailTools = new GmailTools(oauth2Client);

    // Send Email
    server.tool(
        'send_email',
        {
            to: z.array(z.string()).describe('List of recipient email addresses'),
            subject: z.string().describe('Email subject'),
            body: z.string().describe('Email body content'),
            cc: z.array(z.string()).optional().describe('List of CC recipients'),
            bcc: z.array(z.string()).optional().describe('List of BCC recipients'),
        },
        async (params) => {
            return await gmailTools.handleEmailAction('send', params);
        },
    );

    // Draft Email
    server.tool(
        'draft_email',
        {
            to: z.array(z.string()).describe('List of recipient email addresses'),
            subject: z.string().describe('Email subject'),
            body: z.string().describe('Email body content'),
            cc: z.array(z.string()).optional().describe('List of CC recipients'),
            bcc: z.array(z.string()).optional().describe('List of BCC recipients'),
        },
        async (params) => {
            return await gmailTools.handleEmailAction('draft', params);
        },
    );

    // Read Email
    server.tool(
        'read_email',
        {
            messageId: z.string().describe('ID of the email message to retrieve'),
        },
        async (params) => {
            return await gmailTools.readEmail(params.messageId);
        },
    );

    // Search Emails
    server.tool(
        'list_emails',
        {
            query: z.string().describe("Gmail search query (e.g., 'from:example@gmail.com')"),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async (params) => {
            return await gmailTools.searchEmails(params.query, params.maxResults);
        },
    );

    // Advanced Search Emails with Filters
    server.tool(
        'list_emails_with_advanced_filters',
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
            return await gmailTools.searchWithFilters(params);
        },
    );

    // Modify Email
    server.tool(
        'modify_email',
        {
            messageId: z.string().describe('ID of the email message to modify'),
            labelIds: z.array(z.string()).optional().describe('List of label IDs to apply'),
            addLabelIds: z.array(z.string()).optional().describe('List of label IDs to add to the message'),
            removeLabelIds: z.array(z.string()).optional().describe('List of label IDs to remove from the message'),
        },
        async (params) => {
            return await gmailTools.modifyEmail(
                params.messageId,
                params.labelIds,
                params.addLabelIds,
                params.removeLabelIds,
            );
        },
    );

    // Delete Email
    server.tool(
        'delete_email',
        {
            messageId: z.string().describe('ID of the email message to delete'),
        },
        async (params) => {
            return await gmailTools.deleteEmail(params.messageId);
        },
    );

    // List Email Labels
    server.tool('list_email_labels', {}, async () => {
        return await gmailTools.listEmailLabels();
    });
}

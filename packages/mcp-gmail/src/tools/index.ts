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
        'search_emails',
        {
            query: z.string().describe("Gmail search query (e.g., 'from:example@gmail.com')"),
            maxResults: z.number().optional().describe('Maximum number of results to return'),
        },
        async (params) => {
            return await gmailTools.searchEmails(params.query, params.maxResults);
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

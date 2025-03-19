import { z } from 'zod';

/**
 * Schema for sending or drafting an email
 */
export const SendEmailSchema = z.object({
    to: z.array(z.string()).describe('List of recipient email addresses'),
    subject: z.string().describe('Email subject'),
    body: z.string().describe('Email body content'),
    cc: z.array(z.string()).optional().describe('List of CC recipients'),
    bcc: z.array(z.string()).optional().describe('List of BCC recipients'),
});

/**
 * Schema for reading a specific email
 */
export const ReadEmailSchema = z.object({
    messageId: z.string().describe('ID of the email message to retrieve'),
});

/**
 * Schema for searching emails
 */
export const SearchEmailsSchema = z.object({
    query: z.string().describe("Gmail search query (e.g., 'from:example@gmail.com')"),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
});

/**
 * Schema for modifying an email's labels
 */
export const ModifyEmailSchema = z.object({
    messageId: z.string().describe('ID of the email message to modify'),
    labelIds: z.array(z.string()).optional().describe('List of label IDs to apply'),
    addLabelIds: z.array(z.string()).optional().describe('List of label IDs to add to the message'),
    removeLabelIds: z.array(z.string()).optional().describe('List of label IDs to remove from the message'),
});

/**
 * Schema for deleting an email
 */
export const DeleteEmailSchema = z.object({
    messageId: z.string().describe('ID of the email message to delete'),
});

/**
 * Schema for listing email labels
 */
export const ListEmailLabelsSchema = z.object({}).describe('Retrieves all available Gmail labels');

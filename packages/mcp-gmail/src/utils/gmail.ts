import fs from 'fs';
import path from 'path';
import http from 'http';
import open from 'open';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GmailApiError } from '../errors/gmail-api-error.js';
import { GmailMessagePart } from '../types/gmail-message-part.js';
import { EmailContent } from '../types/email-content.js';
import { EmailAttachment } from '../types/email-attachment.js';

/**
 * Recursively extract email body content from MIME message parts
 * Handles complex email structures with nested parts
 *
 * @param messagePart - The message part to extract content from
 * @returns The extracted email content, with both text and HTML versions
 */
export function extractEmailContent(messagePart: GmailMessagePart): EmailContent {
    // Initialize containers for different content types
    let textContent = '';
    let htmlContent = '';

    // If the part has a body with data, process it based on MIME type
    if (messagePart.body && messagePart.body.data) {
        const content = Buffer.from(messagePart.body.data, 'base64').toString('utf8');

        // Store content based on its MIME type
        if (messagePart.mimeType === 'text/plain') {
            textContent = content;
        } else if (messagePart.mimeType === 'text/html') {
            htmlContent = content;
        }
    }

    // If the part has nested parts, recursively process them
    if (messagePart.parts && messagePart.parts.length > 0) {
        for (const part of messagePart.parts) {
            const { text, html } = extractEmailContent(part);
            if (text) textContent += text;
            if (html) htmlContent += html;
        }
    }

    // Return both plain text and HTML content
    return { text: textContent, html: htmlContent };
}

/**
 * Extract attachments from email message parts
 *
 * @param messagePart - The message part to extract attachments from
 * @returns Array of email attachments
 */
export function extractAttachments(messagePart: GmailMessagePart): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];

    const processAttachmentParts = (part: GmailMessagePart) => {
        if (part.body && part.body.attachmentId) {
            const filename = part.filename || `attachment-${part.body.attachmentId}`;
            attachments.push({
                id: part.body.attachmentId,
                filename: filename,
                mimeType: part.mimeType || 'application/octet-stream',
                size: part.body.size || 0,
            });
        }

        if (part.parts) {
            part.parts.forEach((subpart: GmailMessagePart) => processAttachmentParts(subpart));
        }
    };

    processAttachmentParts(messagePart);
    return attachments;
}

/**
 * Load OAuth credentials from file
 *
 * @param configDir - The directory where config files are stored
 * @param oauthPath - Path to the OAuth keys file
 * @param credentialsPath - Path to the credentials file
 * @returns OAuth2Client instance
 * @throws GmailApiError if credentials cannot be loaded
 */
export async function loadCredentials(
    configDir: string,
    oauthPath: string,
    credentialsPath: string,
): Promise<OAuth2Client> {
    try {
        // Create config directory if it doesn't exist
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // Check for OAuth keys in current directory first, then in config directory
        const localOAuthPath = path.join(process.cwd(), 'gcp-oauth.keys.json');

        if (fs.existsSync(localOAuthPath)) {
            // If found in current directory, copy to config directory
            fs.copyFileSync(localOAuthPath, oauthPath);
            console.log('OAuth keys found in current directory, copied to global config.');
        }

        if (!fs.existsSync(oauthPath)) {
            throw new GmailApiError(
                'OAuth keys file not found. Please place gcp-oauth.keys.json in current directory or ' + configDir,
            );
        }

        const keysContent = JSON.parse(fs.readFileSync(oauthPath, 'utf8'));
        const keys = keysContent.installed || keysContent.web;

        if (!keys) {
            throw new GmailApiError(
                'Invalid OAuth keys file format. File should contain either "installed" or "web" credentials.',
            );
        }

        const oauth2Client = new OAuth2Client(
            keys.client_id,
            keys.client_secret,
            'http://localhost:3000/oauth2callback',
        );

        if (fs.existsSync(credentialsPath)) {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            oauth2Client.setCredentials(credentials);
        }

        return oauth2Client;
    } catch (error) {
        if (error instanceof GmailApiError) {
            throw error;
        }
        throw new GmailApiError(`Error loading credentials: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Authenticate with Gmail API
 *
 * @param oauth2Client - The OAuth2 client to authenticate
 * @param credentialsPath - Path to save credentials to
 * @returns Promise that resolves when authentication is complete
 * @throws GmailApiError if authentication fails
 */
export async function authenticate(oauth2Client: OAuth2Client, credentialsPath: string): Promise<void> {
    const server = http.createServer();
    server.listen(3000);

    return new Promise<void>((resolve, reject) => {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/gmail.modify'],
        });

        console.log('Please visit this URL to authenticate:', authUrl);
        open(authUrl);

        server.on('request', async (req, res) => {
            if (!req.url?.startsWith('/oauth2callback')) return;

            const url = new URL(req.url, 'http://localhost:3000');
            const code = url.searchParams.get('code');

            if (!code) {
                res.writeHead(400);
                res.end('No code provided');
                reject(new GmailApiError('No code provided'));
                return;
            }

            try {
                const { tokens } = await oauth2Client.getToken(code);
                oauth2Client.setCredentials(tokens);
                fs.writeFileSync(credentialsPath, JSON.stringify(tokens));

                res.writeHead(200);
                res.end('Authentication successful! You can close this window.');
                server.close();
                resolve();
            } catch (error) {
                res.writeHead(500);
                res.end('Authentication failed');
                reject(
                    new GmailApiError(
                        `Authentication failed: ${error instanceof Error ? error.message : String(error)}`,
                    ),
                );
            }
        });
    });
}

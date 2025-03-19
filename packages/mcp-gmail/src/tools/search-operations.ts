import { BaseGmailTool } from './base-gmail-tool.js';

/**
 * Tool for searching and filtering emails
 */
export class SearchOperationsTool extends BaseGmailTool {
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

            return this.createResponse(
                results.map((r) => `ID: ${r.id}\nSubject: ${r.subject}\nFrom: ${r.from}\nDate: ${r.date}\n`).join('\n'),
            );
        } catch (error) {
            this.handleError(error, 'search emails');
        }
    }

    /**
     * Search emails with advanced filtering options
     *
     * @param filters - Object containing various filter criteria
     * @returns The search results
     * @throws GmailApiError if the operation fails
     */
    async searchWithFilters(filters: {
        from?: string;
        to?: string;
        subject?: string;
        afterDate?: string;
        beforeDate?: string;
        hasAttachment?: boolean;
        isRead?: boolean;
        isStarred?: boolean;
        inFolder?: string;
        hasWords?: string;
        doesNotHaveWords?: string;
        minSize?: number;
        maxSize?: number;
        labels?: string[];
        maxResults?: number;
    }) {
        try {
            // Build Gmail search query based on provided filters
            const queryParts: string[] = [];

            // Sender filter
            if (filters.from) {
                queryParts.push(`from:${filters.from}`);
            }

            // Recipient filter
            if (filters.to) {
                queryParts.push(`to:${filters.to}`);
            }

            // Subject filter
            if (filters.subject) {
                queryParts.push(`subject:${filters.subject}`);
            }

            // Date range filters
            if (filters.afterDate) {
                queryParts.push(`after:${filters.afterDate}`);
            }

            if (filters.beforeDate) {
                queryParts.push(`before:${filters.beforeDate}`);
            }

            // Attachment filter
            if (filters.hasAttachment) {
                queryParts.push('has:attachment');
            }

            // Read/unread status
            if (filters.isRead !== undefined) {
                queryParts.push(filters.isRead ? 'is:read' : 'is:unread');
            }

            // Starred status
            if (filters.isStarred) {
                queryParts.push('is:starred');
            }

            // Folder/location filter
            if (filters.inFolder) {
                queryParts.push(`in:${filters.inFolder}`);
            }

            // Content word filters
            if (filters.hasWords) {
                queryParts.push(filters.hasWords); // Simple word search doesn't need operator
            }

            // Negative content word filters
            if (filters.doesNotHaveWords) {
                queryParts.push(`-${filters.doesNotHaveWords}`);
            }

            // Size filters (convert to bytes)
            if (filters.minSize) {
                queryParts.push(`larger:${filters.minSize}m`); // Size in MB
            }

            if (filters.maxSize) {
                queryParts.push(`smaller:${filters.maxSize}m`); // Size in MB
            }

            // Label filters
            if (filters.labels && filters.labels.length > 0) {
                filters.labels.forEach((label) => {
                    queryParts.push(`label:${label}`);
                });
            }

            // Join all query parts with spaces
            const query = queryParts.join(' ');

            // Use existing search emails method with the constructed query
            return await this.searchEmails(query, filters.maxResults);
        } catch (error) {
            this.handleError(error, 'search emails with filters');
        }
    }
}

import { BaseSlackTool } from './base-slack-tool.js';
import { SlackChannel } from '../types/slack-channel.js';

/**
 * Tool for Slack channel operations
 */
export class ChannelOperationsTool extends BaseSlackTool {
    /**
     * List channels in the workspace
     *
     * @param limit Maximum number of channels to return (default: 100, max: 200)
     * @param cursor Pagination cursor for next page
     * @returns Formatted response with channels information
     */
    async listChannels(limit?: number, cursor?: string) {
        try {
            // Set reasonable defaults and limits
            const actualLimit = limit && limit > 0 ? Math.min(limit, 200) : 100;

            const result = await this.client.conversations.list({
                limit: actualLimit,
                cursor: cursor,
                types: 'public_channel',
                exclude_archived: true,
            });

            const channels = result.channels as unknown as SlackChannel[];

            const formattedChannels = channels.map((channel) => ({
                id: channel.id,
                name: channel.name,
                is_private: channel.is_private,
                num_members: channel.num_members,
                topic: channel.topic?.value ? channel.topic.value : '',
                purpose: channel.purpose?.value ? channel.purpose.value : '',
            }));

            let responseText = `Found ${formattedChannels.length} channels`;

            if (result.response_metadata?.next_cursor) {
                responseText += `\nUse cursor: ${result.response_metadata.next_cursor} to get the next page`;
            }

            responseText += `\n\n${JSON.stringify(formattedChannels, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, 'list channels');
        }
    }

    /**
     * Get channel history (recent messages)
     *
     * @param channelId The channel ID
     * @param limit Number of messages to retrieve (default: 10)
     * @returns Formatted response with channel messages
     */
    async getChannelHistory(channelId: string, limit?: number) {
        try {
            // Set reasonable defaults
            const actualLimit = limit && limit > 0 ? Math.min(limit, 100) : 10;

            const result = await this.client.conversations.history({
                channel: channelId,
                limit: actualLimit,
            });

            const messages = result.messages || [];

            let responseText = `Retrieved ${messages.length} messages from channel ${channelId}`;
            responseText += `\n\n${JSON.stringify(messages, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `get history for channel ${channelId}`);
        }
    }
}

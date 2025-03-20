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

    /**
     * Create a new channel
     *
     * @param name Channel name (must be lowercase, no spaces/special chars except underscore)
     * @param isPrivate Whether to create a private channel
     * @param description Optional initial description/purpose for the channel
     * @returns Formatted response with the new channel information
     */
    async createChannel(name: string, isPrivate: boolean, description?: string) {
        try {
            // Channel names must only contain lowercase letters, numbers, hyphens, and underscores
            const sanitizedName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '');

            if (sanitizedName !== name) {
                console.warn(`Channel name was sanitized from "${name}" to "${sanitizedName}"`);
            }

            const result = await this.client.conversations.create({
                name: sanitizedName,
                is_private: isPrivate,
            });

            // Set channel purpose if provided
            if (description && result.channel?.id) {
                await this.client.conversations.setPurpose({
                    channel: result.channel.id,
                    purpose: description,
                });
            }

            const channel = result.channel as unknown as SlackChannel;
            let responseText = `Successfully created ${isPrivate ? 'private' : 'public'} channel #${channel.name} (${channel.id})`;

            if (description) {
                responseText += ` with purpose: "${description}"`;
            }

            responseText += `\n\n${JSON.stringify(channel, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, 'create channel');
        }
    }

    /**
     * Archive a channel
     *
     * @param channelId The channel ID to archive
     * @returns Formatted response with the operation result
     */
    async archiveChannel(channelId: string) {
        try {
            await this.client.conversations.archive({
                channel: channelId,
            });

            return this.createResponse(`Successfully archived channel ${channelId}`);
        } catch (error) {
            return this.handleError(error, `archive channel ${channelId}`);
        }
    }

    /**
     * Unarchive a channel
     *
     * @param channelId The channel ID to unarchive
     * @returns Formatted response with the operation result
     */
    async unarchiveChannel(channelId: string) {
        try {
            await this.client.conversations.unarchive({
                channel: channelId,
            });

            return this.createResponse(`Successfully unarchived channel ${channelId}`);
        } catch (error) {
            return this.handleError(error, `unarchive channel ${channelId}`);
        }
    }

    /**
     * Invite users to a channel
     *
     * @param channelId The channel ID
     * @param userIds Array of user IDs to invite
     * @returns Formatted response with the operation result
     */
    async inviteToChannel(channelId: string, userIds: string[]) {
        try {
            if (!userIds.length) {
                return this.createResponse('No users specified to invite');
            }

            const promises = userIds.map((userId) =>
                this.client.conversations.invite({
                    channel: channelId,
                    users: userId,
                }),
            );

            await Promise.all(promises);

            return this.createResponse(`Successfully invited ${userIds.length} user(s) to channel ${channelId}`);
        } catch (error) {
            return this.handleError(error, `invite users to channel ${channelId}`);
        }
    }

    /**
     * Get detailed information about a channel
     *
     * @param channelId The channel ID
     * @returns Formatted response with channel information
     */
    async getChannelInfo(channelId: string) {
        try {
            const result = await this.client.conversations.info({
                channel: channelId,
            });

            const channel = result.channel as unknown as SlackChannel;

            // Get member count
            const memberResult = await this.client.conversations.members({
                channel: channelId,
                limit: 1, // We only need the count, not the actual members
            });

            const memberCount = memberResult.members?.length || 0;
            const hasMoreMembers = !!memberResult.response_metadata?.next_cursor;

            let responseText = `Channel Information for ${channel.name} (${channel.id}):\n`;
            responseText += `- Type: ${channel.is_private ? 'Private' : 'Public'}\n`;
            responseText += `- Members: ${memberCount}${hasMoreMembers ? '+' : ''}\n`;

            if (channel.topic?.value) {
                responseText += `- Topic: ${channel.topic.value}\n`;
            }

            if (channel.purpose?.value) {
                responseText += `- Purpose: ${channel.purpose.value}\n`;
            }

            responseText += `\n${JSON.stringify(channel, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `get info for channel ${channelId}`);
        }
    }
}

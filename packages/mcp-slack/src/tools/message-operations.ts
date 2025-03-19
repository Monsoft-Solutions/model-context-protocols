import { BaseSlackTool } from './base-slack-tool.js';

/**
 * Tool for Slack message operations
 */
export class MessageOperationsTool extends BaseSlackTool {
    /**
     * Post a new message to a Slack channel
     *
     * @param channelId The channel ID to post to
     * @param text The message text to post
     * @returns Formatted response with posting confirmation
     */
    async postMessage(channelId: string, text: string) {
        try {
            const result = await this.client.chat.postMessage({
                channel: channelId,
                text: text,
            });

            const responseText = `Message successfully posted to channel ${channelId}`;

            if (result.ts) {
                const messageInfo = {
                    text: text,
                    channel: channelId,
                    timestamp: result.ts,
                };

                return this.createResponse(
                    `${responseText}\n\nMessage details:\n${JSON.stringify(messageInfo, null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `post message to channel ${channelId}`);
        }
    }

    /**
     * Reply to a specific message thread
     *
     * @param channelId The channel containing the thread
     * @param threadTs Timestamp of the parent message
     * @param text The reply text
     * @returns Formatted response with reply confirmation
     */
    async replyToThread(channelId: string, threadTs: string, text: string) {
        try {
            const result = await this.client.chat.postMessage({
                channel: channelId,
                thread_ts: threadTs,
                text: text,
            });

            const responseText = `Reply successfully posted to thread in channel ${channelId}`;

            if (result.ts) {
                const messageInfo = {
                    text: text,
                    channel: channelId,
                    thread_ts: threadTs,
                    reply_ts: result.ts,
                };

                return this.createResponse(
                    `${responseText}\n\nReply details:\n${JSON.stringify(messageInfo, null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `reply to thread in channel ${channelId}`);
        }
    }

    /**
     * Add an emoji reaction to a message
     *
     * @param channelId The channel containing the message
     * @param timestamp Message timestamp to react to
     * @param reaction Emoji name without colons
     * @returns Formatted response with reaction confirmation
     */
    async addReaction(channelId: string, timestamp: string, reaction: string) {
        try {
            // Remove colons if they were included
            const cleanReaction = reaction.replace(/:/g, '');

            await this.client.reactions.add({
                channel: channelId,
                timestamp: timestamp,
                name: cleanReaction,
            });

            const responseText = `Reaction :${cleanReaction}: added to message in channel ${channelId}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `add reaction to message in channel ${channelId}`);
        }
    }

    /**
     * Get all replies in a message thread
     *
     * @param channelId The channel containing the thread
     * @param threadTs Timestamp of the parent message
     * @returns Formatted response with thread replies
     */
    async getThreadReplies(channelId: string, threadTs: string) {
        try {
            const result = await this.client.conversations.replies({
                channel: channelId,
                ts: threadTs,
            });

            const messages = result.messages || [];

            let responseText = `Retrieved ${messages.length} messages from thread in channel ${channelId}`;
            responseText += `\n\n${JSON.stringify(messages, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `get thread replies in channel ${channelId}`);
        }
    }
}

import { BaseSlackTool } from './base-slack-tool.js';
import type { Block, KnownBlock } from '@slack/web-api';

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
     * Post a message with attachments and/or blocks to a Slack channel
     *
     * @param channelId The channel ID to post to
     * @param text The fallback text for the message
     * @param blocks Optional layout blocks for rich formatting
     * @param attachments Optional attachments for the message
     * @returns Formatted response with posting confirmation
     */
    async postRichMessage(
        channelId: string,
        text: string,
        blocks?: Array<Block | KnownBlock>,
        attachments?: Array<Record<string, unknown>>,
    ) {
        try {
            const result = await this.client.chat.postMessage({
                channel: channelId,
                text: text,
                blocks: blocks,
                attachments: attachments,
            });

            const responseText = `Rich message successfully posted to channel ${channelId}`;

            if (result.ts) {
                const messageInfo = {
                    text: text,
                    channel: channelId,
                    timestamp: result.ts,
                    has_blocks: !!blocks,
                    has_attachments: !!attachments,
                };

                return this.createResponse(
                    `${responseText}\n\nMessage details:\n${JSON.stringify(messageInfo, null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `post rich message to channel ${channelId}`);
        }
    }

    /**
     * Update an existing message
     *
     * @param channelId The channel containing the message
     * @param timestamp Timestamp of the message to update
     * @param text New text for the message
     * @param blocks Optional new blocks for the message
     * @param attachments Optional new attachments for the message
     * @returns Formatted response with update confirmation
     */
    async updateMessage(
        channelId: string,
        timestamp: string,
        text: string,
        blocks?: Array<Block | KnownBlock>,
        attachments?: Array<Record<string, unknown>>,
    ) {
        try {
            const result = await this.client.chat.update({
                channel: channelId,
                ts: timestamp,
                text: text,
                blocks: blocks,
                attachments: attachments,
            });

            const responseText = `Message successfully updated in channel ${channelId}`;

            if (result.ts) {
                const messageInfo = {
                    text: text,
                    channel: channelId,
                    timestamp: result.ts,
                    has_blocks: !!blocks,
                    has_attachments: !!attachments,
                };

                return this.createResponse(
                    `${responseText}\n\nMessage details:\n${JSON.stringify(messageInfo, null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `update message in channel ${channelId}`);
        }
    }

    /**
     * Delete a message
     *
     * @param channelId The channel containing the message
     * @param timestamp Timestamp of the message to delete
     * @returns Formatted response with deletion confirmation
     */
    async deleteMessage(channelId: string, timestamp: string) {
        try {
            await this.client.chat.delete({
                channel: channelId,
                ts: timestamp,
            });

            const responseText = `Message successfully deleted from channel ${channelId}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `delete message from channel ${channelId}`);
        }
    }

    /**
     * Schedule a message for future delivery
     *
     * @param channelId The channel ID to post to
     * @param text The message text to post
     * @param postAt Unix timestamp for when message should be sent
     * @param blocks Optional layout blocks for rich formatting
     * @param attachments Optional attachments for the message
     * @returns Formatted response with scheduling confirmation
     */
    async scheduleMessage(
        channelId: string,
        text: string,
        postAt: number,
        blocks?: Array<Block | KnownBlock>,
        attachments?: Array<Record<string, unknown>>,
    ) {
        try {
            const result = await this.client.chat.scheduleMessage({
                channel: channelId,
                text: text,
                post_at: postAt,
                blocks: blocks,
                attachments: attachments,
            });

            const responseText = `Message successfully scheduled for channel ${channelId}`;

            if (result.scheduled_message_id) {
                const scheduledDate = new Date(postAt * 1000).toISOString();

                const messageInfo = {
                    text: text,
                    channel: channelId,
                    scheduled_message_id: result.scheduled_message_id,
                    post_at: postAt,
                    scheduled_for: scheduledDate,
                    has_blocks: !!blocks,
                    has_attachments: !!attachments,
                };

                return this.createResponse(
                    `${responseText}\n\nScheduled message details:\n${JSON.stringify(messageInfo, null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `schedule message for channel ${channelId}`);
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

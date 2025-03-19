import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebClient } from '@slack/web-api';
import { z } from 'zod';
import { ChannelOperationsTool } from './channel-operations.js';
import { MessageOperationsTool } from './message-operations.js';
import { UserOperationsTool } from './user-operations.js';

/**
 * Register Slack tools with the MCP server
 *
 * @param server - The MCP server instance
 * @param slackClient - The authenticated Slack WebClient
 * @param teamId - The Slack team ID
 */
export function registerTools(server: McpServer, slackClient: WebClient, teamId: string): void {
    const channelOperations = new ChannelOperationsTool(slackClient, teamId);
    const messageOperations = new MessageOperationsTool(slackClient, teamId);
    const userOperations = new UserOperationsTool(slackClient, teamId);

    // Channel Operations

    // List Channels
    server.tool(
        'slack_list_channels',
        {
            limit: z.number().optional().describe('Maximum number of channels to return (default: 100, max: 200)'),
            cursor: z.string().optional().describe('Pagination cursor for next page'),
        },
        async (params) => {
            return await channelOperations.listChannels(params.limit, params.cursor);
        },
    );

    // Get Channel History
    server.tool(
        'slack_get_channel_history',
        {
            channel_id: z.string().describe('The channel ID'),
            limit: z.number().optional().describe('Number of messages to retrieve (default: 10)'),
        },
        async (params) => {
            return await channelOperations.getChannelHistory(params.channel_id, params.limit);
        },
    );

    // Message Operations

    // Post Message
    server.tool(
        'slack_post_message',
        {
            channel_id: z.string().describe('The ID of the channel to post to'),
            text: z.string().describe('The message text to post'),
        },
        async (params) => {
            return await messageOperations.postMessage(params.channel_id, params.text);
        },
    );

    // Reply to Thread
    server.tool(
        'slack_reply_to_thread',
        {
            channel_id: z.string().describe('The channel containing the thread'),
            thread_ts: z.string().describe('Timestamp of the parent message'),
            text: z.string().describe('The reply text'),
        },
        async (params) => {
            return await messageOperations.replyToThread(params.channel_id, params.thread_ts, params.text);
        },
    );

    // Add Reaction
    server.tool(
        'slack_add_reaction',
        {
            channel_id: z.string().describe('The channel containing the message'),
            timestamp: z.string().describe('Message timestamp to react to'),
            reaction: z.string().describe('Emoji name without colons'),
        },
        async (params) => {
            return await messageOperations.addReaction(params.channel_id, params.timestamp, params.reaction);
        },
    );

    // Get Thread Replies
    server.tool(
        'slack_get_thread_replies',
        {
            channel_id: z.string().describe('The channel containing the thread'),
            thread_ts: z.string().describe('Timestamp of the parent message'),
        },
        async (params) => {
            return await messageOperations.getThreadReplies(params.channel_id, params.thread_ts);
        },
    );

    // User Operations

    // Get Users
    server.tool(
        'slack_get_users',
        {
            cursor: z.string().optional().describe('Pagination cursor for next page'),
            limit: z.number().optional().describe('Maximum users to return (default: 100, max: 200)'),
        },
        async (params) => {
            return await userOperations.getUsers(params.cursor, params.limit);
        },
    );

    // Get User Profile
    server.tool(
        'slack_get_user_profile',
        {
            user_id: z.string().describe("The user's ID"),
        },
        async (params) => {
            return await userOperations.getUserProfile(params.user_id);
        },
    );
}

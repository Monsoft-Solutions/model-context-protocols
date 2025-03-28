import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebClient, Block, KnownBlock } from '@slack/web-api';
import { z } from 'zod';
import { ChannelOperationsTool } from './channel-operations.js';
import { MessageOperationsTool } from './message-operations.js';
import { UserOperationsTool } from './user-operations.js';
import { FileOperationsTool } from './file-operations.js';
import { FileType, FileTypeEnum } from '../types/file-type.js';

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
    const fileOperations = new FileOperationsTool(slackClient, teamId);

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

    // Create Channel
    server.tool(
        'slack_create_channel',
        {
            name: z
                .string()
                .describe('Channel name (lowercase, no spaces/special chars except hyphens and underscores)'),
            is_private: z.boolean().describe('Whether to create a private channel'),
            description: z.string().optional().describe('Optional initial description/purpose for the channel'),
        },
        async (params) => {
            return await channelOperations.createChannel(params.name, params.is_private, params.description);
        },
    );

    // Archive Channel
    server.tool(
        'slack_archive_channel',
        {
            channel_id: z.string().describe('The channel ID to archive'),
        },
        async (params) => {
            return await channelOperations.archiveChannel(params.channel_id);
        },
    );

    // Unarchive Channel
    server.tool(
        'slack_unarchive_channel',
        {
            channel_id: z.string().describe('The channel ID to unarchive'),
        },
        async (params) => {
            return await channelOperations.unarchiveChannel(params.channel_id);
        },
    );

    // Invite to Channel
    server.tool(
        'slack_invite_to_channel',
        {
            channel_id: z.string().describe('The channel ID'),
            user_ids: z.array(z.string()).describe('Array of user IDs to invite'),
        },
        async (params) => {
            return await channelOperations.inviteToChannel(params.channel_id, params.user_ids);
        },
    );

    // Get Channel Info
    server.tool(
        'slack_get_channel_info',
        {
            channel_id: z.string().describe('The channel ID'),
        },
        async (params) => {
            return await channelOperations.getChannelInfo(params.channel_id);
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

    // Post Rich Message with Blocks and/or Attachments
    server.tool(
        'slack_post_rich_message',
        {
            channel_id: z.string().describe('The ID of the channel to post to'),
            text: z.string().describe('The fallback text for the message'),
            blocks: z
                .array(z.record(z.any()))
                .optional()
                .describe(
                    'Layout blocks for rich formatting (Section, Header, Divider, Image, Context blocks). Example: [{"type":"header","text":{"type":"plain_text","text":"Title"}},{"type":"section","text":{"type":"mrkdwn","text":"Hello *world*"}}]',
                ),
            attachments: z
                .array(z.record(z.any()))
                .optional()
                .describe(
                    'Attachments for the message with colored sidebars, fields, etc. Example: [{"color":"#36a64f","title":"Title","fields":[{"title":"Priority","value":"High","short":true}]}]',
                ),
        },
        async (params) => {
            return await messageOperations.postRichMessage(
                params.channel_id,
                params.text,
                params.blocks as Array<Block | KnownBlock> | undefined,
                params.attachments,
            );
        },
    );

    // Update Message
    server.tool(
        'slack_update_message',
        {
            channel_id: z.string().describe('The channel containing the message'),
            timestamp: z.string().describe('Timestamp of the message to update'),
            text: z.string().describe('New text for the message'),
            blocks: z
                .array(z.record(z.any()))
                .optional()
                .describe(
                    'New blocks for the message, replacing any existing ones. Example: [{"type":"header","text":{"type":"plain_text","text":"Updated Title"}},{"type":"section","text":{"type":"mrkdwn","text":"Updated content with *formatting*"}}]',
                ),
            attachments: z
                .array(z.record(z.any()))
                .optional()
                .describe(
                    'New attachments for the message, replacing any existing ones. Example: [{"color":"#36a64f","title":"Updated Status","fields":[{"title":"Status","value":"Completed","short":true}]}]',
                ),
        },
        async (params) => {
            return await messageOperations.updateMessage(
                params.channel_id,
                params.timestamp,
                params.text,
                params.blocks as Array<Block | KnownBlock> | undefined,
                params.attachments,
            );
        },
    );

    // Delete Message
    server.tool(
        'slack_delete_message',
        {
            channel_id: z.string().describe('The channel containing the message'),
            timestamp: z.string().describe('Timestamp of the message to delete'),
        },
        async (params) => {
            return await messageOperations.deleteMessage(params.channel_id, params.timestamp);
        },
    );

    // Schedule Message
    server.tool(
        'slack_schedule_message',
        {
            channel_id: z.string().describe('The ID of the channel to post to'),
            text: z.string().describe('The message text to post'),
            post_at: z.number().describe('Unix timestamp for when message should be sent (seconds since epoch)'),
            blocks: z
                .array(z.record(z.any()))
                .optional()
                .describe(
                    'Layout blocks for rich formatting. Example: [{"type":"header","text":{"type":"plain_text","text":"Scheduled Announcement"}},{"type":"section","text":{"type":"mrkdwn","text":"This message was scheduled to appear at a specific time"}}]',
                ),
            attachments: z
                .array(z.record(z.any()))
                .optional()
                .describe(
                    'Attachments for the message. Example: [{"color":"#36a64f","title":"Event Details","fields":[{"title":"Event","value":"Team Meeting","short":true},{"title":"Location","value":"Conference Room","short":true}]}]',
                ),
        },
        async (params) => {
            return await messageOperations.scheduleMessage(
                params.channel_id,
                params.text,
                params.post_at,
                params.blocks as Array<Block | KnownBlock> | undefined,
                params.attachments,
            );
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

    // File Operations

    // Upload File
    server.tool(
        'slack_upload_file',
        {
            file_path: z.string().describe('Local file path to upload'),
            file_name: z
                .string()
                .optional()
                .describe('Name to use for the file in Slack (defaults to filename from path if not provided)'),
            channel_id: z.string().optional().describe('Channel ID to share the file with'),
            file_type: FileTypeEnum.optional().describe(
                'File type identifier (e.g., pdf, jpg, docx). Use "auto" to let Slack detect the file type automatically.',
            ),
            title: z.string().optional().describe('Title for the file (defaults to filename if not provided)'),
            initial_comment: z.string().optional().describe('Initial comment to include with the file when sharing'),
        },
        async (params) => {
            return await fileOperations.uploadFile(
                params.file_path,
                params.file_name,
                params.channel_id,
                params.file_type as FileType,
                params.title,
                params.initial_comment,
            );
        },
    );

    // Upload File Content
    server.tool(
        'slack_upload_file_content',
        {
            content: z.string().describe('Content to upload as a file (text content)'),
            file_name: z.string().describe('Name for the file including extension (e.g., "report.txt")'),
            channel_id: z.string().optional().describe('Channel ID to share the file with'),
            file_type: FileTypeEnum.optional().describe(
                'File type identifier (e.g., "text", "markdown", "html"). Common types include: "text", "pdf", "csv", "markdown".',
            ),
            title: z.string().optional().describe('Title for the file (defaults to file_name if not provided)'),
            initial_comment: z.string().optional().describe('Initial comment to include with the file when sharing'),
        },
        async (params) => {
            return await fileOperations.uploadFileContent(
                params.content,
                params.file_name,
                params.channel_id,
                params.file_type as FileType,
                params.title,
                params.initial_comment,
            );
        },
    );

    // Get File Info
    server.tool(
        'slack_get_file_info',
        {
            file_id: z.string().describe('The ID of the file to get information about (starts with "F")'),
        },
        async (params) => {
            return await fileOperations.getFileInfo(params.file_id);
        },
    );

    // Share File
    server.tool(
        'slack_share_file',
        {
            file_id: z.string().describe('The ID of the file to share (starts with "F")'),
            channel_id: z.string().describe('The channel ID to share the file in (starts with "C")'),
        },
        async (params) => {
            return await fileOperations.shareFile(params.file_id, params.channel_id);
        },
    );

    // Enable Public URL
    server.tool(
        'slack_enable_public_url',
        {
            file_id: z
                .string()
                .describe('The ID of the file to make public (starts with "F") - creates a publicly accessible URL'),
        },
        async (params) => {
            return await fileOperations.enablePublicURL(params.file_id);
        },
    );

    // Disable Public URL
    server.tool(
        'slack_disable_public_url',
        {
            file_id: z
                .string()
                .describe('The ID of the file to make private (starts with "F") - revokes the public URL'),
        },
        async (params) => {
            return await fileOperations.disablePublicURL(params.file_id);
        },
    );

    // List Files
    server.tool(
        'slack_list_files',
        {
            channel_id: z
                .string()
                .optional()
                .describe('Channel ID to filter files by (only returns files shared in this channel)'),
            user_id: z
                .string()
                .optional()
                .describe('User ID to filter files by (only returns files uploaded by this user)'),
            limit: z.number().optional().describe('Maximum number of files to return (default: 10, max: 100)'),
        },
        async (params) => {
            return await fileOperations.listFiles(params.channel_id, params.user_id, params.limit);
        },
    );

    // Delete File
    server.tool(
        'slack_delete_file',
        {
            file_id: z.string().describe('The ID of the file to delete (starts with "F") - this action is permanent'),
        },
        async (params) => {
            return await fileOperations.deleteFile(params.file_id);
        },
    );
}

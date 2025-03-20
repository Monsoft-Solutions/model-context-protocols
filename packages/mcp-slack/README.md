# Slack MCP Server

A Model Context Protocol (MCP) server for Slack integration in Claude Desktop. This server enables AI assistants to interact with Slack workspaces through natural language conversations.

> This package is maintained by [Monsoft Solutions](https://monsoftsolutions.com), a software development company specializing in AI-powered solutions and developer tools.

![](https://badge.mcpx.dev?type=server 'MCP Server')

## Features

- List public channels in the workspace with pagination support
- Post new messages to Slack channels
- Reply to existing message threads
- Add emoji reactions to messages
- View channel message history
- Get thread replies and conversation context
- List workspace users with basic profile information
- Get detailed user profile information
- Full integration with Slack API
- Simple configuration with Bot User OAuth Token
- Support for both stdio and SSE server transports

## Installation & Setup

### Prerequisites

1. Create a Slack App:

    - Visit the [Slack Apps page](https://api.slack.com/apps)
    - Click "Create New App"
    - Choose "From scratch"
    - Name your app and select your workspace

2. Configure Bot Token Scopes:

    Navigate to "OAuth & Permissions" and add these scopes:

    - `channels:history` - View messages and other content in public channels
    - `channels:read` - View basic channel information
    - `chat:write` - Send messages as the app
    - `chat:write.customize` - Post rich messages with attachments and blocks
    - `chat:write.public` - Post in public channels without being invited
    - `chat:update` - Update messages
    - `chat:delete` - Delete messages
    - `chat:schedule` - Schedule messages
    - `reactions:write` - Add emoji reactions to messages
    - `users:read` - View users and their basic information
    - `files:read` - View files shared in channels
    - `files:write` - Upload, edit, and delete files
    - `remote_files:read` - View remote files
    - `remote_files:write` - Add, edit, and delete remote files
    - `remote_files:share` - Share remote files

3. Install App to Workspace:

    - Click "Install to Workspace" and authorize the app
    - Save the "Bot User OAuth Token" that starts with `xoxb-`

4. Get your Team ID:

    - Your Team ID starts with `T` followed by numbers and letters
    - Find it by following [this guide](https://slack.com/help/articles/221769328-Locate-your-Slack-URL-or-ID#find-your-workspace-or-org-id)

### Configure in Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
    "mcpServers": {
        "slack": {
            "command": "npx",
            "args": ["@monsoft/mcp-slack"],
            "env": {
                "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
                "SLACK_TEAM_ID": "T01234567"
            }
        }
    }
}
```

### Command Line Usage

You can also run the server directly from the command line:

```bash
# With environment variables
SLACK_BOT_TOKEN=xoxb-your-bot-token SLACK_TEAM_ID=T01234567 npx @monsoft/mcp-slack

# Or with command-line arguments
npx @monsoft/mcp-slack --token=xoxb-your-bot-token --team-id=T01234567
```

### Docker Support

Coming soon.

## Available Tools

The server provides the following tools that can be used through Claude Desktop:

### Channel Operations

#### 1. List Channels (`slack_list_channels`)

Retrieves a list of channels in the workspace.

```json
{
    "limit": 50,
    "cursor": "dXNlcjpVMDYxTkZUVDI="
}
```

#### 2. Get Channel History (`slack_get_channel_history`)

Retrieves recent messages from a channel.

```json
{
    "channel_id": "C01234ABCD",
    "limit": 20
}
```

### Message Operations

#### 1. Post Message (`slack_post_message`)

Sends a simple text message to a Slack channel.

```json
{
    "channel_id": "C01234ABCD",
    "text": "Hello from Claude!"
}
```

#### 2. Post Rich Message (`slack_post_rich_message`)

Sends a message with blocks and/or attachments for rich formatting.

```json
{
    "channel_id": "C01234ABCD",
    "text": "Backup message for clients that don't support blocks",
    "blocks": [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Important Announcement"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Hello! This is a *rich message* with formatting."
            }
        }
    ],
    "attachments": [
        {
            "color": "#36a64f",
            "title": "Task Status",
            "fields": [
                {
                    "title": "Project",
                    "value": "AI Assistant",
                    "short": true
                },
                {
                    "title": "Status",
                    "value": "In Progress",
                    "short": true
                }
            ]
        }
    ]
}
```

#### 3. Update Message (`slack_update_message`)

Updates an existing message.

```json
{
    "channel_id": "C01234ABCD",
    "timestamp": "1647357967.655841",
    "text": "Updated message text",
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "This message has been updated."
            }
        }
    ]
}
```

#### 4. Delete Message (`slack_delete_message`)

Deletes a message.

```json
{
    "channel_id": "C01234ABCD",
    "timestamp": "1647357967.655841"
}
```

#### 5. Schedule Message (`slack_schedule_message`)

Schedules a message to be sent at a future time.

```json
{
    "channel_id": "C01234ABCD",
    "text": "This is a scheduled message",
    "post_at": 1701385200,
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "This message was *scheduled* to be sent automatically."
            }
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Scheduled by Claude"
                }
            ]
        }
    ]
}
```

#### 6. Reply to Thread (`slack_reply_to_thread`)

Replies to an existing message thread.

```json
{
    "channel_id": "C01234ABCD",
    "thread_ts": "1647357967.655841",
    "text": "This is a reply to the thread from Claude!"
}
```

#### 7. Add Reaction (`slack_add_reaction`)

Adds an emoji reaction to a message.

```json
{
    "channel_id": "C01234ABCD",
    "timestamp": "1647357967.655841",
    "reaction": "thumbsup"
}
```

#### 8. Get Thread Replies (`slack_get_thread_replies`)

Retrieves all replies in a thread.

```json
{
    "channel_id": "C01234ABCD",
    "thread_ts": "1647357967.655841"
}
```

### User Operations

#### 1. Get Users (`slack_get_users`)

Lists users in the workspace.

```json
{
    "limit": 100,
    "cursor": "dXNlcjpVMDYxTkZUVDI="
}
```

#### 2. Get User Profile (`slack_get_user_profile`)

Gets detailed information about a specific user.

```json
{
    "user_id": "U01234ABCD"
}
```

### File Operations

#### 1. Upload File (`slack_upload_file`)

Uploads a file from a local path to Slack.

```json
{
    "file_path": "/path/to/document.pdf",
    "file_name": "Important Document.pdf",
    "channel_id": "C01234ABCD",
    "file_type": "pdf",
    "title": "Q4 Report",
    "initial_comment": "Here's the latest quarterly report."
}
```

#### 2. Upload File Content (`slack_upload_file_content`)

Uploads string content as a file to Slack.

```json
{
    "content": "This is the content of the file that will be created in Slack.",
    "file_name": "notes.txt",
    "channel_id": "C01234ABCD",
    "file_type": "text",
    "title": "Meeting Notes",
    "initial_comment": "Notes from today's meeting."
}
```

#### 3. Get File Info (`slack_get_file_info`)

Retrieves information about a specific file.

```json
{
    "file_id": "F01234ABCD"
}
```

#### 4. Share File (`slack_share_file`)

Shares an existing file to a channel.

```json
{
    "file_id": "F01234ABCD",
    "channel_id": "C01234ABCD"
}
```

#### 5. Enable Public URL (`slack_enable_public_url`)

Enables a public URL for a file.

```json
{
    "file_id": "F01234ABCD"
}
```

#### 6. Disable Public URL (`slack_disable_public_url`)

Disables the public URL for a file.

```json
{
    "file_id": "F01234ABCD"
}
```

#### 7. List Files (`slack_list_files`)

Lists files visible to the user, with optional filtering.

```json
{
    "channel_id": "C01234ABCD",
    "user_id": "U01234ABCD",
    "limit": 25
}
```

#### 8. Delete File (`slack_delete_file`)

Deletes a file from Slack.

```json
{
    "file_id": "F01234ABCD"
}
```

## Advanced Features

### Pagination Support

For methods that return potentially large datasets (channels, users), the MCP server supports pagination:

- Use the `limit` parameter to control how many items to return in a single request
- The response includes a `next_cursor` value when more data is available
- Pass this cursor in the next request to retrieve the next set of results

### Error Handling

The MCP server provides informative error messages for common issues:

- Authentication failures
- Invalid parameters
- Rate limiting
- Missing permissions
- Non-existent resources (channels, users, messages)

## Security Notes

- Store your Bot Token securely and never share it
- Only grant the OAuth scopes your application actually needs
- The bot can only access channels it has been invited to
- Regularly review and audit your app's permissions and usage
- Consider using app-level tokens for enhanced security

## Troubleshooting

If you encounter issues:

1. **Permission Errors**

    - Verify all required scopes are added to your Slack app
    - Ensure the app is properly installed to your workspace
    - Check that tokens and team ID are correctly copied to your configuration
    - Make sure the bot has been invited to channels it needs to access

2. **Connection Issues**

    - Verify your network connectivity
    - Check that the server can reach the Slack API endpoints
    - Validate your token hasn't been revoked or expired

3. **Rate Limiting**
    - If you see rate limit errors, reduce the frequency of your requests
    - Implement exponential backoff for retries

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This MCP server is licensed under the MIT License. See the LICENSE file for details.

## Support

For support, feature requests, or bug reports, please open an issue on our [GitHub repository](https://github.com/monsoft-solutions/model-context-protocols/issues).

## About Monsoft Solutions

[Monsoft Solutions](https://monsoftsolutions.com) is a software development company that specializes in creating AI-powered solutions and developer tools. We focus on building robust, scalable, and user-friendly applications that help developers and businesses leverage the power of artificial intelligence.

## Future Enhancements

We've implemented the following message management features:

✅ Post messages with attachments and blocks
✅ Update existing messages
✅ Delete messages
✅ Schedule messages for future delivery
✅ Upload files to Slack
✅ Get file information
✅ Share files in channels
✅ Enable/disable public file URLs
✅ List and delete files

Additional features planned for future implementation:

### Channel Management

- Create new channels
- Archive/unarchive channels
- Invite users to channels
- Get channel information

### User Management

- Set user status
- Update user profile information
- Manage user groups

## Development

### Prerequisites

- Node.js 18 or higher
- npm or yarn

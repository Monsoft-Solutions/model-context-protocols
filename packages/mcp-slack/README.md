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
    - `reactions:write` - Add emoji reactions to messages
    - `users:read` - View users and their basic information

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

### 1. List Channels (`slack_list_channels`)

Lists public channels in the workspace with pagination support.

```json
{
    "limit": 50,
    "cursor": "dXNlcjpVMDYxTkZUUjI="
}
```

### 2. Post Message (`slack_post_message`)

Posts a new message to a Slack channel.

```json
{
    "channel_id": "C01234ABCD",
    "text": "Hello from Claude! This message was sent through the Slack MCP."
}
```

### 3. Reply to Thread (`slack_reply_to_thread`)

Replies to an existing message thread.

```json
{
    "channel_id": "C01234ABCD",
    "thread_ts": "1647357967.655841",
    "text": "This is a reply to the thread from Claude!"
}
```

### 4. Add Reaction (`slack_add_reaction`)

Adds an emoji reaction to a message.

```json
{
    "channel_id": "C01234ABCD",
    "timestamp": "1647357967.655841",
    "reaction": "thumbsup"
}
```

### 5. Get Channel History (`slack_get_channel_history`)

Retrieves recent messages from a channel.

```json
{
    "channel_id": "C01234ABCD",
    "limit": 20
}
```

### 6. Get Thread Replies (`slack_get_thread_replies`)

Gets all replies in a message thread.

```json
{
    "channel_id": "C01234ABCD",
    "thread_ts": "1647357967.655841"
}
```

### 7. Get Users (`slack_get_users`)

Lists workspace users with basic profile information.

```json
{
    "limit": 50,
    "cursor": "dXNlcjpVMDYxTkZUUjI="
}
```

### 8. Get User Profile (`slack_get_user_profile`)

Gets detailed profile information for a specific user.

```json
{
    "user_id": "U061NFTR2"
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

The following Slack API tools are planned for future implementation:

### Message Management

- Post messages with attachments and blocks
- Update existing messages
- Delete messages
- Schedule messages for future delivery

### Channel Management

- Create new channels
- Archive/unarchive channels
- Invite users to channels
- Get channel information

### User Management

- Set user status
- Update user profile information
- Manage user groups

### File Operations

- Upload files to Slack
- Get file information
- Share files in channels
- Download files

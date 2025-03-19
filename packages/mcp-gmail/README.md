# Gmail MCP Server

A Model Context Protocol (MCP) server for Gmail integration in Claude Desktop with auto authentication support. This server enables AI assistants to manage Gmail through natural language interactions.

> This package is maintained by [Monsoft Solutions](https://monsoftsolutions.com), a software development company specializing in AI-powered solutions and developer tools. This is a fork and enhancement of the original work by [@gongrzhe](https://github.com/gongrzhe).

![](https://badge.mcpx.dev?type=server 'MCP Server')
[![smithery badge](https://smithery.ai/badge/@gongrzhe/server-gmail-autoauth-mcp)](https://smithery.ai/server/@gongrzhe/server-gmail-autoauth-mcp)

## Features

- Send emails with subject, content, attachments, and recipients
- Full support for international characters in subject lines and email content
- Read email messages by ID with advanced MIME structure handling
- View email attachments information (filenames, types, sizes)
- Search emails with various criteria (subject, sender, date range)
- List all available Gmail labels (system and user-defined)
- List emails in inbox, sent, or custom labels
- Mark emails as read/unread
- Move emails to different labels/folders
- Delete emails
- Full integration with Gmail API
- Simple OAuth2 authentication flow with auto browser launch
- Support for both Desktop and Web application credentials
- Global credential storage for convenience

## Installation & Authentication

### Prerequisites

1. Create a Google Cloud Project and obtain credentials:

    a. Create a Google Cloud Project:

    - Go to [Google Cloud Console](https://console.cloud.google.com/)
    - Create a new project or select an existing one
    - Enable the Gmail API for your project

    b. Create OAuth 2.0 Credentials:

    - Go to "APIs & Services" > "Credentials"
    - Click "Create Credentials" > "OAuth client ID"
    - Choose either "Desktop app" or "Web application" as application type
    - Give it a name and click "Create"
    - For Web application, add `http://localhost:3000/oauth2callback` to the authorized redirect URIs
    - Download the JSON file of your client's OAuth keys
    - Rename the key file to `gcp-oauth.keys.json`

### Authentication Setup

You can authenticate in two ways:

1. Global Authentication (Recommended):

```bash
# First time: Place gcp-oauth.keys.json in your home directory's .gmail-mcp folder
mkdir -p ~/.gmail-mcp
mv gcp-oauth.keys.json ~/.gmail-mcp/

# Run authentication from anywhere
npx @monsoft/mcp-gmail auth
```

2. Local Authentication:

```bash
# Place gcp-oauth.keys.json in your current directory
# The file will be automatically copied to global config
npx @monsoft/mcp-gmail auth
```

The authentication process will:

- Look for `gcp-oauth.keys.json` in the current directory or `~/.gmail-mcp/`
- If found in current directory, copy it to `~/.gmail-mcp/`
- Open your default browser for Google authentication
- Save credentials as `~/.gmail-mcp/credentials.json`

> **Note**:
>
> - After successful authentication, credentials are stored globally in `~/.gmail-mcp/` and can be used from any directory
> - Both Desktop app and Web application credentials are supported
> - For Web application credentials, make sure to add `http://localhost:3000/oauth2callback` to your authorized redirect URIs

### Configure in Claude Desktop

```json
{
    "mcpServers": {
        "gmail": {
            "command": "npx",
            "args": ["@monsoft/mcp-gmail"]
        }
    }
}
```

### Docker Support

If you prefer using Docker:

1. Authentication:

```bash
docker run -i --rm \
  --mount type=bind,source=/path/to/gcp-oauth.keys.json,target=/gcp-oauth.keys.json \
  -v mcp-gmail:/gmail-server \
  -e GMAIL_OAUTH_PATH=/gcp-oauth.keys.json \
  -e "GMAIL_CREDENTIALS_PATH=/gmail-server/credentials.json" \
  -p 3000:3000 \
  monsoft/mcp-gmail auth
```

2. Usage:

```json
{
    "mcpServers": {
        "gmail": {
            "command": "docker",
            "args": [
                "run",
                "-i",
                "--rm",
                "-v",
                "mcp-gmail:/gmail-server",
                "-e",
                "GMAIL_CREDENTIALS_PATH=/gmail-server/credentials.json",
                "monsoft/mcp-gmail"
            ]
        }
    }
}
```

## Available Tools

The server provides the following tools that can be used through Claude Desktop:

### 1. Send Email (`gmail_send_email`)

Sends a new email immediately.

```json
{
    "to": ["recipient@example.com"],
    "subject": "Meeting Tomorrow",
    "body": "Hi,\n\nJust a reminder about our meeting tomorrow at 10 AM.\n\nBest regards",
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"]
}
```

### 2. Draft Email (`gmail_draft_email`)

Creates a draft email without sending it.

```json
{
    "to": ["recipient@example.com"],
    "subject": "Draft Report",
    "body": "Here's the draft report for your review.",
    "cc": ["manager@example.com"]
}
```

### 3. Read Email (`gmail_read_email`)

Retrieves the content of a specific email by its ID.

```json
{
    "messageId": "182ab45cd67ef"
}
```

### 4. Search Emails (`gmail_list_emails`)

Searches for emails using Gmail search syntax.

```json
{
    "query": "from:sender@example.com after:2024/01/01 has:attachment",
    "maxResults": 10
}
```

### 5. Modify Email (`gmail_modify_email`)

Adds or removes labels from emails (move to different folders, archive, etc.).

```json
{
    "messageId": "182ab45cd67ef",
    "addLabelIds": ["IMPORTANT"],
    "removeLabelIds": ["INBOX"]
}
```

### 6. Delete Email (`gmail_delete_email`)

Permanently deletes an email.

```json
{
    "messageId": "182ab45cd67ef"
}
```

### 7. List Email Labels (`gmail_list_email_labels`)

Retrieves all available Gmail labels.

```json
{}
```

### 8. Advanced Search Emails (`gmail_list_emails_with_advanced_filters`)

Searches for emails using structured filtering options instead of raw Gmail query syntax.

```json
{
    "from": "john@example.com",
    "afterDate": "2024/01/01",
    "beforeDate": "2024/03/31",
    "hasAttachment": true,
    "isRead": false,
    "subject": "report",
    "maxResults": 20
}
```

Key filter parameters:

- `from` - Filter by sender email address
- `to` - Filter by recipient email address
- `subject` - Search for text in the subject line
- `afterDate` and `beforeDate` - Date range filters (format: YYYY/MM/DD)
- `hasAttachment` - Filter emails with attachments
- `isRead` - Filter by read/unread status
- `isStarred` - Filter starred emails
- `inFolder` - Filter by folder location (inbox, sent, trash, etc.)
- `hasWords` - Filter emails containing specific words
- `doesNotHaveWords` - Exclude emails containing specific words
- `minSize` and `maxSize` - Filter by email size (in MB)
- `labels` - Filter by specific Gmail labels
- `maxResults` - Maximum number of results to return

## Advanced Search Syntax

The `search_emails` tool supports Gmail's powerful search operators:

| Operator         | Example                   | Description                              |
| ---------------- | ------------------------- | ---------------------------------------- |
| `from:`          | `from:john@example.com`   | Emails from a specific sender            |
| `to:`            | `to:mary@example.com`     | Emails sent to a specific recipient      |
| `subject:`       | `subject:"meeting notes"` | Emails with specific text in the subject |
| `has:attachment` | `has:attachment`          | Emails with attachments                  |
| `after:`         | `after:2024/01/01`        | Emails received after a date             |
| `before:`        | `before:2024/02/01`       | Emails received before a date            |
| `is:`            | `is:unread`               | Emails with a specific state             |
| `label:`         | `label:work`              | Emails with a specific label             |

You can combine multiple operators: `from:john@example.com after:2024/01/01 has:attachment`

## Advanced Features

### Email Content Extraction

The server intelligently extracts email content from complex MIME structures:

- Prioritizes plain text content when available
- Falls back to HTML content if plain text is not available
- Handles multi-part MIME messages with nested parts
- Processes attachments information (filename, type, size)
- Preserves original email headers (From, To, Subject, Date)

### International Character Support

The server fully supports non-ASCII characters in email subjects and content, including:

- Turkish, Chinese, Japanese, Korean, and other non-Latin alphabets
- Special characters and symbols
- Proper encoding ensures correct display in email clients

## Security Notes

- OAuth credentials are stored securely in your local environment (`~/.gmail-mcp/`)
- The server uses offline access to maintain persistent authentication
- Never share or commit your credentials to version control
- Regularly review and revoke unused access in your Google Account settings
- Credentials are stored globally but are only accessible by the current user

## Troubleshooting

1. **OAuth Keys Not Found**

    - Make sure `gcp-oauth.keys.json` is in either your current directory or `~/.gmail-mcp/`
    - Check file permissions

2. **Invalid Credentials Format**

    - Ensure your OAuth keys file contains either `web` or `installed` credentials
    - For web applications, verify the redirect URI is correctly configured

3. **Port Already in Use**
    - If port 3000 is already in use, please free it up before running authentication
    - You can find and stop the process using that port

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports, please open an issue on our [GitHub repository](https://github.com/monsoft-solutions/model-context-protocols/issues).

## About Monsoft Solutions

[Monsoft Solutions](https://monsoftsolutions.com) is a software development company that specializes in creating AI-powered solutions and developer tools. We focus on building robust, scalable, and user-friendly applications that help developers and businesses leverage the power of artificial intelligence.

## TODO: Additional Gmail Tools

The following Gmail API tools are planned for future implementation:

### Attachment Management

- `download_attachment` - Download email attachments
- `upload_attachment` - Add attachments to draft emails

### Thread Management

- `get_thread` - Retrieve an entire email conversation thread
- `modify_thread` - Apply labels or actions to all emails in a thread

### Draft Management

- `update_draft` - Modify an existing draft email
- `delete_draft` - Remove a draft email
- `list_drafts` - Get all saved draft emails

### Label Management

- `create_label` - Create a new Gmail label
- `update_label` - Modify an existing label
- `delete_label` - Remove a custom label

### Settings Management

- `get_vacation_responder` - Get auto-reply settings
- `set_vacation_responder` - Configure out-of-office responses
- `get_forwarding` - Get email forwarding settings
- `update_forwarding` - Modify email forwarding settings

### Message Actions

- `mark_as_read` - Mark messages as read
- `mark_as_unread` - Mark messages as unread
- `archive_email` - Move messages to archive
- `move_to_trash` - Move messages to trash
- `recover_from_trash` - Restore messages from trash

### Advanced Search

- `search_with_filters` - Search with complex criteria (date ranges, attachments, etc.)

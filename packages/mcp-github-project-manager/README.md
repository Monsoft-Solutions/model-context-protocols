# MCP GitHub Project Manager

A Model Context Protocol (MCP) implementation for managing GitHub issues and projects.

## Features

### GitHub Issue Management

- Create issues
- Update issues
- List issues with filtering options
- Get issue details
- Add comments to issues
- Close issues

### GitHub Project Management

- Create projects
- Add issues to projects
- Update project items (move between columns)
- List project items

## Installation

```bash
npm install @monsoft/mcp-github-project-manager
```

## Usage

### Environment Setup

Before using the GitHub Project Manager, you need to set up a GitHub token:

```bash
npm run setup
```

This will prompt you to enter your GitHub token and save it to a `.env` file.

### Running the Server

There are several ways to run the GitHub Project Manager server:

#### Using the Shell Script

The easiest way to run the server is to use the provided shell script:

```bash
./github-project-manager.sh
```

This script will automatically load the GitHub token from the `.env` file and start the server.

#### Using Node.js

You can also run the server directly using Node.js:

```bash
# Using the environment variable
GITHUB_TOKEN=your_github_token node dist/server/index.js

# Or using the .env file
node scripts/run-example.js
```

#### Using the API

```javascript
import { startGitHubProjectManagerServer } from '@monsoft/mcp-github-project-manager';

// Start the server with a token
startGitHubProjectManagerServer('your_github_token');
```

## Available Tools

### Issue Management

#### create_issue

Create a new issue in a GitHub repository.

Parameters:

- `owner` (string): Repository owner (username or organization)
- `repo` (string): Repository name
- `title` (string): Issue title
- `body` (string, optional): Issue body/description
- `labels` (string[], optional): Labels to add to this issue
- `assignees` (string[], optional): GitHub usernames to assign to this issue
- `milestone` (number, optional): Milestone number to associate with this issue

#### update_issue

Update an existing issue in a GitHub repository.

Parameters:

- `owner` (string): Repository owner (username or organization)
- `repo` (string): Repository name
- `issue_number` (number): Issue number
- `title` (string, optional): New issue title
- `body` (string, optional): New issue body
- `state` (string, optional): New issue state ('open' or 'closed')
- `labels` (string[], optional): Labels to set
- `assignees` (string[], optional): GitHub usernames to assign
- `milestone` (number, optional): Milestone to set

#### list_issues

List issues in a GitHub repository with filtering options.

Parameters:

- `owner` (string): Repository owner (username or organization)
- `repo` (string): Repository name
- `state` (string, optional): Issue state ('open', 'closed', or 'all')
- `sort` (string, optional): Sort field ('created', 'updated', or 'comments')
- `direction` (string, optional): Sort direction ('asc' or 'desc')
- `since` (string, optional): Filter by updated date (ISO 8601 format)
- `per_page` (number, optional): Results per page
- `page` (number, optional): Page number
- `labels` (string[], optional): Filter by labels
- `assignee` (string, optional): Filter by assignee
- `creator` (string, optional): Filter by creator
- `mentioned` (string, optional): Filter by mentioned user
- `milestone` (string, optional): Filter by milestone number or title

#### get_issue

Get details of a specific issue in a GitHub repository.

Parameters:

- `owner` (string): Repository owner (username or organization)
- `repo` (string): Repository name
- `issue_number` (number): Issue number

#### add_issue_comment

Add a comment to an existing issue.

Parameters:

- `owner` (string): Repository owner (username or organization)
- `repo` (string): Repository name
- `issue_number` (number): Issue number
- `body` (string): Comment text

### Project Management

#### create_project

Create a new GitHub project board.

Parameters:

- `owner` (string): Organization name or username
- `name` (string): Project name
- `body` (string, optional): Project description

#### add_project_item

Add an issue or pull request to a GitHub project.

Parameters:

- `project_id` (number): Project ID
- `content_id` (number): Issue or PR ID
- `content_type` (string): Type of content to add ('Issue' or 'PullRequest')

#### update_project_item

Move an item between columns in a GitHub project.

Parameters:

- `project_id` (number): Project ID
- `item_id` (number): Card ID to move
- `column_id` (number): Column ID to move the card to
- `position` (string or number, optional): Position in the column ('top', 'bottom', or specific position)

#### list_project_items

List items in a GitHub project.

Parameters:

- `project_id` (number): Project ID
- `column_id` (number, optional): Column ID to filter by

## Error Handling

The GitHub Project Manager provides detailed error information for various scenarios:

- Authentication errors
- Resource not found errors
- Validation errors
- Rate limit errors
- Network errors

## License

MIT

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

## Build Process

When you build the project with `npm run build`, the following happens:

1. The TypeScript code is compiled to JavaScript in the `dist` folder
2. The `.env` file (if it exists) is automatically copied to the `dist` folder
3. If no `.env` file exists, the `.env.example` file is copied to the `dist` folder as a template

This ensures that your environment configuration is always available when running the compiled code, making deployment easier.

```bash
# Build the project
npm run build
```

## Usage

### Environment Setup

Before using the GitHub Project Manager, you need to set up a GitHub token:

#### Using npm Scripts (Recommended)

The easiest way to set up your environment is to use the provided npm scripts:

```bash
# Generate a new .env file with your GitHub token
npm run generate-env
```

This interactive script will prompt you for your GitHub Personal Access Token and create a properly formatted `.env` file. When you build the project with `npm run build`, this file will be automatically copied to the `dist` folder.

#### Using Environment File Manually

You can also manually create an environment file. Create a `.env` file in the root directory of your project based on the provided `.env.example`:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your GitHub token
nano .env
```

Your `.env` file should contain at least:

```
GITHUB_PERSONAL_TOKEN=your_github_personal_access_token_here
```

When you build the project with `npm run build`, the `.env` file will be automatically copied to the `dist` folder, making it available when running the compiled code.

#### Using Environment Variables

You can also set the GitHub token as an environment variable:

```bash
# Set the environment variable directly (temporary)
export GITHUB_PERSONAL_TOKEN=your_github_personal_access_token_here

# Or use the legacy setup script
npm run setup
```

### Running the Server

There are several ways to run the GitHub Project Manager server:

#### Using the Shell Script

The easiest way to run the server is to use the provided shell script:

```bash
./github-project-manager.sh
```

This script will automatically look for the `.env` file in both the `dist` folder and the project root, and load the environment variables before starting the server.

#### Using Node.js

You can also run the server directly using Node.js:

```bash
# Using the environment variable
GITHUB_PERSONAL_TOKEN=your_github_token node dist/server/index.js

# Or using the built-in environment loader (recommended)
node dist/server/index.js
```

The server will automatically look for the `.env` file in the appropriate locations.

#### Using the API

```javascript
import { startGitHubProjectManagerServer } from "@monsoft/mcp-github-project-manager";

// Start the server with a token
startGitHubProjectManagerServer("your_github_token");
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

## Troubleshooting

### Environment Configuration Issues

If you encounter issues with the environment configuration:

1. **Missing GitHub Token**: If you see an error about a missing GitHub token, make sure you've created a `.env` file with your `GITHUB_PERSONAL_TOKEN` using one of the methods described above.

2. **Environment File Not Found**: If the server can't find your `.env` file, try running `npm run generate-env` to create one, or manually copy `.env.example` to `.env` and add your token.

3. **Token Permissions**: Ensure your GitHub token has the necessary permissions for the operations you're trying to perform (repo, project, etc.).

4. **Build Issues**: If you've modified the environment configuration, make sure to rebuild the project with `npm run build` to copy the updated `.env` file to the `dist` folder.

## License

MIT

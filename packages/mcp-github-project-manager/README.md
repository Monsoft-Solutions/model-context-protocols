# GitHub Project Manager

A Model Context Protocol (MCP) implementation for managing GitHub projects and issues. This package provides a seamless interface for AI assistants and applications to interact with GitHub repositories, issues, pull requests, and projects.

## Features

### GitHub Issue Management

- Create issues
- Update issues
- List issues with filtering options
- Get issue details
- Add comments to issues
- Close issues

### GitHub Pull Request Management

- Create pull requests
- Update pull requests
- List pull requests with filtering options
- Get pull request details
- Merge pull requests
- Check if a pull request has been merged
- Create and manage pull request reviews
- Add and list review comments
- Request and remove reviewers
- Update pull request branches

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

### Quick Start with npx

The quickest way to use the GitHub Project Manager is directly with npx:

```bash
npx -y @monsoft/mcp-github-project-manager --GITHUB_PERSONAL_TOKEN=your_github_token_here
```

This starts the MCP server which can then be connected to by MCP clients.

### Setting Up with MCP Clients

To use this with AI assistants like Claude in Anthropic or Cursor:

```bash
# Start the MCP server in your terminal
npx -y @monsoft/mcp-github-project-manager --GITHUB_PERSONAL_TOKEN=your_github_token_here
```

Then configure your AI assistant to use this MCP server. The exact configuration depends on the client you're using.

### Programmatic Usage

To use the GitHub Project Manager in your own code:

```typescript
import { GitHubProjectManager } from '@monsoft/mcp-github-project-manager';

// The token will be automatically loaded from command line arguments
const manager = new GitHubProjectManager();

// Now you can use the manager to interact with GitHub projects
```

When running your application, provide the GitHub token as a command-line argument:

```bash
node your-app.js --GITHUB_PERSONAL_TOKEN=your_github_token_here
```

## API Reference

### Issue Management

#### Create an Issue

```typescript
const newIssue = await manager.createIssue({
    owner: 'organization-name',
    repo: 'repository-name',
    title: 'Issue title',
    body: 'Detailed description of the issue',
    labels: ['bug', 'priority-high'],
    assignees: ['username1', 'username2'],
});
```

#### Get Issue Details

```typescript
const issue = await manager.getIssue({
    owner: 'organization-name',
    repo: 'repository-name',
    issue_number: 123,
});
```

#### Update an Issue

```typescript
await manager.updateIssue({
    owner: 'organization-name',
    repo: 'repository-name',
    issue_number: 123,
    title: 'Updated title',
    body: 'Updated description',
    state: 'closed',
});
```

#### List Issues

```typescript
const issues = await manager.listIssues({
    owner: 'organization-name',
    repo: 'repository-name',
    state: 'open',
    labels: ['bug'],
    sort: 'created',
    direction: 'desc',
});
```

#### Add Issue Comment

```typescript
await manager.addIssueComment({
    owner: 'organization-name',
    repo: 'repository-name',
    issue_number: 123,
    body: 'This is a comment',
});
```

### Pull Request Management

#### Create a Pull Request

```typescript
const pr = await manager.createPullRequest({
    owner: 'organization-name',
    repo: 'repository-name',
    title: 'Pull request title',
    body: 'Description of changes',
    head: 'feature-branch',
    base: 'main',
});
```

#### Get Pull Request Details

```typescript
const pullRequest = await manager.getPullRequest({
    owner: 'organization-name',
    repo: 'repository-name',
    pull_number: 456,
});
```

#### Merge a Pull Request

```typescript
await manager.mergePullRequest({
    owner: 'organization-name',
    repo: 'repository-name',
    pull_number: 456,
    merge_method: 'squash',
});
```

#### Create a Review

```typescript
await manager.createPullRequestReview({
    owner: 'organization-name',
    repo: 'repository-name',
    pull_number: 456,
    event: 'APPROVE',
    body: 'LGTM! Great work.',
});
```

### Project Management

#### Create a Project

```typescript
const project = await manager.createProject({
    owner: 'organization-name',
    name: 'Project Name',
    body: 'Project description',
});
```

#### Add Item to Project

```typescript
await manager.addProjectItem({
    project_id: 12345,
    content_id: issue.id,
    content_type: 'Issue',
});
```

#### List Project Items

```typescript
const items = await manager.listProjectItems({
    project_id: 12345,
});
```

## Error Handling

The package provides custom error classes for handling common error scenarios:

```typescript
try {
    // GitHub operations
} catch (error) {
    if (error instanceof MissingGitHubTokenError) {
        console.error('GitHub token is missing. Please provide one via command line.');
    } else if (error instanceof AuthenticationError) {
        console.error('Failed to authenticate with GitHub. Check your token.');
    } else if (error instanceof RateLimitError) {
        console.error('GitHub API rate limit exceeded.');
    } else {
        console.error('An unexpected error occurred:', error.message);
    }
}
```

Available error classes:

- `MissingGitHubTokenError`: Thrown when a GitHub token is not provided
- `AuthenticationError`: Thrown when authentication fails
- `ResourceNotFoundError`: Thrown when a requested resource doesn't exist
- `ValidationError`: Thrown when input validation fails
- `RateLimitError`: Thrown when GitHub API rate limits are exceeded
- `NetworkError`: Thrown when network communication issues occur
- `GitHubApiError`: General error for GitHub API issues

## GitHub Token Permissions

Your GitHub personal access token needs the following permissions:

- `repo` - Full access to repositories
- `project` - Access to projects
- `issues` - Access to issues

## Development

### Building

```bash
npm run build
```

### Validation

```bash
npm run validate
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT

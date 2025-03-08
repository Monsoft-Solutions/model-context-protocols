import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { GitHubIssueService, GitHubProjectService, GitHubPullRequestService } from '../services/index.js';
import { AuthenticationError, ResourceNotFoundError, ValidationError } from '../errors/index.js';

// Environment variable for GitHub token

/**
 * Initialize and start the MCP GitHub Project Manager server
 */
export async function startGitHubProjectManagerServer(token: string) {
    // Use provided token or environment variable
    const githubToken = token;

    // Validate GitHub token
    if (!githubToken) {
        console.error('GITHUB_TOKEN environment variable is required');
        process.exit(1);
    }

    // Create services
    const issueService = new GitHubIssueService(githubToken);
    const projectService = new GitHubProjectService(githubToken);
    const pullRequestService = new GitHubPullRequestService(githubToken);

    // Create a new MCP server
    const server = new McpServer({
        name: 'MCP GitHub Project Manager',
        version: '1.0.0',
    });

    // Register GitHub Issue Management tools
    registerIssueTools(server, issueService);

    // Register GitHub Project Management tools
    registerProjectTools(server, projectService);

    // Register GitHub Pull Request Management tools
    registerPullRequestTools(server, pullRequestService);

    // Set up server transport using Standard I/O
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log('MCP GitHub Project Manager server started');

    // Keep the server running
    return server;
}

/**
 * Register GitHub Issue Management tools
 */
function registerIssueTools(server: McpServer, issueService: GitHubIssueService) {
    // Create Issue Tool
    server.tool(
        'create_issue',
        'Create a new issue in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            title: z.string().describe('Issue title'),
            body: z.string().optional().describe('Issue body/description'),
            labels: z.array(z.string()).optional().describe('Labels to add to this issue'),
            assignees: z.array(z.string()).optional().describe('GitHub usernames to assign to this issue'),
            milestone: z.number().optional().describe('Milestone number to associate with this issue'),
        },
        async (args, _extra) => {
            try {
                const issue = await issueService.createIssue(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                issue: {
                                    number: issue.number,
                                    title: issue.title,
                                    html_url: issue.html_url,
                                    state: issue.state,
                                    created_at: issue.created_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Update Issue Tool
    server.tool(
        'update_issue',
        'Update an existing issue in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            issue_number: z.number().describe('Issue number'),
            title: z.string().optional().describe('New issue title'),
            body: z.string().optional().describe('New issue body'),
            state: z.enum(['open', 'closed']).optional().describe('New issue state'),
            labels: z.array(z.string()).optional().describe('Labels to set'),
            assignees: z.array(z.string()).optional().describe('GitHub usernames to assign'),
            milestone: z.number().nullable().optional().describe('Milestone to set'),
        },
        async (args, _extra) => {
            try {
                const issue = await issueService.updateIssue(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                issue: {
                                    number: issue.number,
                                    title: issue.title,
                                    html_url: issue.html_url,
                                    state: issue.state,
                                    updated_at: issue.updated_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // List Issues Tool
    server.tool(
        'list_issues',
        'List issues in a GitHub repository with filtering options',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            state: z.enum(['open', 'closed', 'all']).optional().describe('Issue state'),
            sort: z.enum(['created', 'updated', 'comments']).optional().describe('Sort field'),
            direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
            since: z.string().optional().describe('Filter by updated date (ISO 8601 format)'),
            per_page: z.number().optional().describe('Results per page'),
            page: z.number().optional().describe('Page number'),
            labels: z.array(z.string()).optional().describe('Filter by labels'),
            assignee: z.string().optional().describe('Filter by assignee'),
            creator: z.string().optional().describe('Filter by creator'),
            mentioned: z.string().optional().describe('Filter by mentioned user'),
            milestone: z.string().optional().describe('Filter by milestone number or title'),
        },
        async (args, _extra) => {
            try {
                const issues = await issueService.listIssues(args);

                // Format the response to include only necessary information
                const formattedIssues = issues.map((issue: any) => ({
                    number: issue.number,
                    title: issue.title,
                    state: issue.state,
                    html_url: issue.html_url,
                    created_at: issue.created_at,
                    updated_at: issue.updated_at,
                    labels: issue.labels.map((label: any) => ({
                        name: label.name,
                        color: label.color,
                    })),
                    assignees: issue.assignees.map((assignee: any) => assignee.login),
                }));

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                count: formattedIssues.length,
                                issues: formattedIssues,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Get Issue Tool
    server.tool(
        'get_issue',
        'Get details of a specific issue in a GitHub repository.',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            issue_number: z.number().describe('Issue number'),
        },
        async (args, _extra) => {
            try {
                const issue = await issueService.getIssue(args);

                // Format the response
                const formattedIssue = {
                    number: issue.number,
                    title: issue.title,
                    body: issue.body,
                    state: issue.state,
                    html_url: issue.html_url,
                    created_at: issue.created_at,
                    updated_at: issue.updated_at,
                    closed_at: issue.closed_at,
                    labels: issue.labels.map((label: any) => ({
                        name: label.name,
                        color: label.color,
                    })),
                    assignees: issue.assignees?.map((assignee: any) => assignee.login) || [],
                    milestone: issue.milestone
                        ? {
                              number: issue.milestone.number,
                              title: issue.milestone.title,
                          }
                        : null,
                    comments: issue.comments,
                };

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                issue: formattedIssue,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Add Issue Comment Tool
    server.tool(
        'add_issue_comment',
        'Add a comment to an existing issue',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            issue_number: z.number().describe('Issue number'),
            body: z.string().describe('Comment text'),
        },
        async (args, _extra) => {
            try {
                const comment = await issueService.addIssueComment(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                comment: {
                                    id: comment.id,
                                    body: comment.body,
                                    html_url: comment.html_url,
                                    created_at: comment.created_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );
}

/**
 * Register GitHub Project Management tools
 */
function registerProjectTools(server: McpServer, projectService: GitHubProjectService) {
    // Create Project Tool
    server.tool(
        'create_project',
        'Create a new GitHub project board',
        {
            owner: z.string().describe('Organization name or username'),
            name: z.string().describe('Project name'),
            body: z.string().optional().describe('Project description'),
        },
        async (args, _extra) => {
            try {
                const project = await projectService.createProject(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                project: {
                                    id: project.id,
                                    name: project.name,
                                    html_url: project.html_url,
                                    created_at: project.created_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Add Project Item Tool
    server.tool(
        'add_project_item',
        'Add an issue or pull request to a GitHub project',
        {
            project_id: z.number().describe('Project ID'),
            content_id: z.number().describe('Issue or PR ID'),
            content_type: z.enum(['Issue', 'PullRequest']).describe('Type of content to add'),
        },
        async (args, _extra) => {
            try {
                const card = await projectService.addProjectItem(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                card: {
                                    id: card.id,
                                    url: card.url,
                                    created_at: card.created_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Update Project Item Tool
    server.tool(
        'update_project_item',
        'Move an item between columns in a GitHub project',
        {
            project_id: z.number().describe('Project ID'),
            item_id: z.number().describe('Card ID to move'),
            column_id: z.number().describe('Column ID to move the card to'),
            position: z
                .union([z.enum(['top', 'bottom']), z.number()])
                .optional()
                .describe('Position in the column (top, bottom, or specific position)'),
        },
        async (args, _extra) => {
            try {
                await projectService.updateProjectItem({
                    project_id: Number(args.project_id),
                    item_id: Number(args.item_id),
                    column_id: Number(args.column_id),
                    position: args.position,
                });

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                message: `Card ${args.item_id} moved to column ${args.column_id}`,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // List Project Items Tool
    server.tool(
        'list_project_items',
        'List items in a GitHub project',
        {
            project_id: z.number().describe('Project ID'),
            column_id: z.number().optional().describe('Column ID to filter by'),
        },
        async (args, _extra) => {
            try {
                const cards = await projectService.listProjectItems(args);

                // Format the response
                const formattedCards = cards.map((card: any) => ({
                    id: card.id,
                    url: card.url,
                    created_at: card.created_at,
                    updated_at: card.updated_at,
                    column: card.column,
                    content_url: card.content_url,
                    note: card.note,
                }));

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                count: formattedCards.length,
                                cards: formattedCards,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );
}

/**
 * Register GitHub Pull Request Management tools
 */
function registerPullRequestTools(server: McpServer, pullRequestService: GitHubPullRequestService) {
    // Create Pull Request Tool
    server.tool(
        'create_pull_request',
        'Create a new pull request in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            title: z.string().describe('Pull request title'),
            body: z.string().optional().describe('Pull request body/description'),
            head: z.string().describe('The name of the branch where your changes are implemented'),
            base: z.string().describe('The name of the branch you want the changes pulled into'),
            draft: z.boolean().optional().describe('Whether to create the pull request as a draft'),
            maintainer_can_modify: z.boolean().optional().describe('Whether maintainers can modify the pull request'),
        },
        async (args, _extra) => {
            try {
                const pullRequest = await pullRequestService.createPullRequest(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                pull_request: {
                                    number: pullRequest.number,
                                    title: pullRequest.title,
                                    html_url: pullRequest.html_url,
                                    state: pullRequest.state,
                                    created_at: pullRequest.created_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Update Pull Request Tool
    server.tool(
        'update_pull_request',
        'Update an existing pull request in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            title: z.string().optional().describe('New pull request title'),
            body: z.string().optional().describe('New pull request body'),
            state: z.enum(['open', 'closed']).optional().describe('New pull request state'),
            base: z.string().optional().describe('The name of the branch you want the changes pulled into'),
            maintainer_can_modify: z.boolean().optional().describe('Whether maintainers can modify the pull request'),
        },
        async (args, _extra) => {
            try {
                const pullRequest = await pullRequestService.updatePullRequest(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                pull_request: {
                                    number: pullRequest.number,
                                    title: pullRequest.title,
                                    html_url: pullRequest.html_url,
                                    state: pullRequest.state,
                                    updated_at: pullRequest.updated_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // List Pull Requests Tool
    server.tool(
        'list_pull_requests',
        'List pull requests in a GitHub repository with filtering options',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            state: z.enum(['open', 'closed', 'all']).optional().describe('Pull request state'),
            head: z.string().optional().describe('Filter by head branch'),
            base: z.string().optional().describe('Filter by base branch'),
            sort: z.enum(['created', 'updated', 'popularity', 'long-running']).optional().describe('Sort field'),
            direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
            per_page: z.number().optional().describe('Results per page'),
            page: z.number().optional().describe('Page number'),
        },
        async (args, _extra) => {
            try {
                const pullRequests = await pullRequestService.listPullRequests(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                pull_requests: pullRequests.map((pr) => ({
                                    number: pr.number,
                                    title: pr.title,
                                    html_url: pr.html_url,
                                    state: pr.state,
                                    created_at: pr.created_at,
                                    updated_at: pr.updated_at,
                                })),
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Get Pull Request Tool
    server.tool(
        'get_pull_request',
        'Get details of a specific pull request in a GitHub repository',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
        },
        async (args, _extra) => {
            try {
                const pullRequest = await pullRequestService.getPullRequest(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                pull_request: {
                                    number: pullRequest.number,
                                    title: pullRequest.title,
                                    body: pullRequest.body,
                                    html_url: pullRequest.html_url,
                                    state: pullRequest.state,
                                    created_at: pullRequest.created_at,
                                    updated_at: pullRequest.updated_at,
                                    merged_at: pullRequest.merged_at,
                                    head: pullRequest.head,
                                    base: pullRequest.base,
                                    user: pullRequest.user,
                                    assignees: pullRequest.assignees,
                                    requested_reviewers: pullRequest.requested_reviewers,
                                    labels: pullRequest.labels,
                                    draft: pullRequest.draft,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Merge Pull Request Tool
    server.tool(
        'merge_pull_request',
        'Merge a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            commit_title: z.string().optional().describe('Title for the automatic commit message'),
            commit_message: z.string().optional().describe('Extra detail to append to automatic commit message'),
            merge_method: z.enum(['merge', 'squash', 'rebase']).optional().describe('Merge method to use'),
        },
        async (args, _extra) => {
            try {
                const result = await pullRequestService.mergePullRequest(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                merged: result.merged,
                                message: result.message,
                                sha: result.sha,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Check If Pull Request Is Merged Tool
    server.tool(
        'is_pull_request_merged',
        'Check if a pull request has been merged',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
        },
        async (args, _extra) => {
            try {
                const { owner, repo, pull_number } = args;
                const isMerged = await pullRequestService.isPullRequestMerged(owner, repo, pull_number);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                merged: isMerged,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Create Pull Request Review Tool
    server.tool(
        'create_pull_request_review',
        'Create a review for a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            body: z.string().optional().describe('The body text of the review'),
            event: z
                .enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT'])
                .optional()
                .describe('The review action to perform'),
            comments: z
                .array(
                    z.object({
                        path: z.string().describe('The relative path to the file being commented on'),
                        position: z.number().describe('The position in the diff where the comment should be placed'),
                        body: z.string().describe('The text of the comment'),
                    }),
                )
                .optional()
                .describe('Comments to post as part of the review'),
        },
        async (args, _extra) => {
            try {
                const review = await pullRequestService.createPullRequestReview(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                review: {
                                    id: review.id,
                                    body: review.body,
                                    state: review.state,
                                    html_url: review.html_url,
                                    user: review.user,
                                    submitted_at: review.submitted_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // List Pull Request Reviews Tool
    server.tool(
        'list_pull_request_reviews',
        'List reviews for a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            per_page: z.number().optional().describe('Results per page'),
            page: z.number().optional().describe('Page number'),
        },
        async (args, _extra) => {
            try {
                const reviews = await pullRequestService.listPullRequestReviews(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                reviews: reviews.map((review) => ({
                                    id: review.id,
                                    body: review.body,
                                    state: review.state,
                                    html_url: review.html_url,
                                    user: review.user,
                                    submitted_at: review.submitted_at,
                                })),
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Create Pull Request Review Comment Tool
    server.tool(
        'create_pull_request_review_comment',
        'Create a review comment for a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            body: z.string().describe('The text of the review comment'),
            commit_id: z.string().optional().describe('The SHA of the commit to comment on'),
            path: z.string().optional().describe('The relative path to the file being commented on'),
            position: z.number().optional().describe('The position in the diff where the comment should be placed'),
            in_reply_to: z.number().optional().describe('The comment ID to reply to'),
        },
        async (args, _extra) => {
            try {
                const comment = await pullRequestService.createPullRequestReviewComment(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                comment: {
                                    id: comment.id,
                                    body: comment.body,
                                    html_url: comment.html_url,
                                    user: comment.user,
                                    created_at: comment.created_at,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // List Pull Request Review Comments Tool
    server.tool(
        'list_pull_request_review_comments',
        'List review comments for a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            sort: z.enum(['created', 'updated']).optional().describe('Sort field'),
            direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
            since: z.string().optional().describe('Only comments updated at or after this time are returned'),
            per_page: z.number().optional().describe('Results per page'),
            page: z.number().optional().describe('Page number'),
        },
        async (args, _extra) => {
            try {
                const comments = await pullRequestService.listPullRequestReviewComments(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                comments: comments.map((comment) => ({
                                    id: comment.id,
                                    body: comment.body,
                                    html_url: comment.html_url,
                                    user: comment.user,
                                    created_at: comment.created_at,
                                    updated_at: comment.updated_at,
                                })),
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Request Reviewers Tool
    server.tool(
        'request_reviewers',
        'Request reviewers for a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            reviewers: z.array(z.string()).optional().describe('Usernames of people to request a review from'),
            team_reviewers: z.array(z.string()).optional().describe('Names of teams to request a review from'),
        },
        async (args, _extra) => {
            try {
                const pullRequest = await pullRequestService.requestReviewers(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                pull_request: {
                                    number: pullRequest.number,
                                    requested_reviewers: pullRequest.requested_reviewers,
                                    requested_teams: pullRequest.requested_teams,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Remove Requested Reviewers Tool
    server.tool(
        'remove_requested_reviewers',
        'Remove requested reviewers from a pull request',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            reviewers: z.array(z.string()).describe('Usernames of people to remove from the review request'),
            team_reviewers: z.array(z.string()).optional().describe('Names of teams to remove from the review request'),
        },
        async (args, _extra) => {
            try {
                const { owner, repo, pull_number, reviewers, team_reviewers } = args;
                const pullRequest = await pullRequestService.removeRequestedReviewers(
                    owner,
                    repo,
                    pull_number,
                    reviewers,
                    team_reviewers,
                );

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                pull_request: {
                                    number: pullRequest.number,
                                    requested_reviewers: pullRequest.requested_reviewers,
                                    requested_teams: pullRequest.requested_teams,
                                },
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Update Pull Request Branch Tool
    server.tool(
        'update_pull_request_branch',
        'Update a pull request branch with the latest upstream changes',
        {
            owner: z.string().describe('Repository owner (username or organization)'),
            repo: z.string().describe('Repository name'),
            pull_number: z.number().describe('Pull request number'),
            expected_head_sha: z.string().optional().describe('The expected SHA of the pull request head'),
        },
        async (args, _extra) => {
            try {
                const result = await pullRequestService.updatePullRequestBranch(args);

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                message: result.message,
                                url: result.url,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );
}

/**
 * Handle errors from tool execution
 */
function handleToolError(error: unknown) {
    let errorMessage = 'An unknown error occurred';
    let errorType = 'UnknownError';

    if (error instanceof AuthenticationError) {
        errorMessage = error.message;
        errorType = 'AuthenticationError';
    } else if (error instanceof ResourceNotFoundError) {
        errorMessage = error.message;
        errorType = 'ResourceNotFoundError';
    } else if (error instanceof ValidationError) {
        errorMessage = error.message;
        errorType = 'ValidationError';
    } else if (error instanceof Error) {
        errorMessage = error.message;
        errorType = error.name;
    }

    return {
        content: [
            {
                type: 'text' as const,
                text: JSON.stringify({
                    success: false,
                    error: {
                        type: errorType,
                        message: errorMessage,
                    },
                }),
            },
        ],
    };
}

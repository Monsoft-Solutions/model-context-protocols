import { z } from 'zod';

/**
 * Register GitHub Issue Management tools
 *
 * @param {object} server - McpServer instance
 * @param {object} issueService - GitHub Issue Service
 */
export function registerIssueTools(server, issueService) {
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
                            type: 'text',
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
                            type: 'text',
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

                // Format the response
                const formattedIssues = issues.map((issue) => ({
                    number: issue.number,
                    title: issue.title,
                    state: issue.state,
                    html_url: issue.html_url,
                    created_at: issue.created_at,
                    updated_at: issue.updated_at,
                    labels: issue.labels.map((label) => ({
                        name: label.name,
                        color: label.color,
                    })),
                    assignees: issue.assignees.map((assignee) => assignee.login),
                }));

                return {
                    content: [
                        {
                            type: 'text',
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
                    labels: issue.labels.map((label) => ({
                        name: label.name,
                        color: label.color,
                    })),
                    assignees: issue.assignees?.map((assignee) => assignee.login) || [],
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
                            type: 'text',
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
}

/**
 * Register GitHub Project Management tools
 *
 * @param {object} server - McpServer instance
 * @param {object} projectService - GitHub Project Service
 */
export function registerProjectTools(server, projectService) {
    // List Projects Tool
    server.tool(
        'list_projects',
        'List projects for a GitHub repository or organization',
        {
            owner: z.string().describe('Repository owner or organization name'),
            repo: z.string().optional().describe('Repository name (optional, if listing org projects)'),
            state: z.enum(['open', 'closed', 'all']).optional().describe('Project state'),
            per_page: z.number().optional().describe('Results per page (max 100)'),
            page: z.number().optional().describe('Page number'),
        },
        async (args, _extra) => {
            try {
                const projects = await projectService.listProjects(args);

                // Format the response
                const formattedProjects = projects.map((project) => ({
                    id: project.id,
                    number: project.number,
                    name: project.name,
                    body: project.body,
                    state: project.state,
                    html_url: project.html_url,
                    created_at: project.created_at,
                    updated_at: project.updated_at,
                    creator: project.creator
                        ? {
                              login: project.creator.login,
                              avatar_url: project.creator.avatar_url,
                          }
                        : null,
                }));

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                count: formattedProjects.length,
                                projects: formattedProjects,
                            }),
                        },
                    ],
                };
            } catch (error) {
                return handleToolError(error);
            }
        },
    );

    // Other project management tools would go here...
}

/**
 * Register GitHub Pull Request Management tools
 *
 * @param {object} server - McpServer instance
 * @param {object} pullRequestService - GitHub Pull Request Service
 */
export function registerPullRequestTools(server, pullRequestService) {
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
            draft: z.boolean().optional().describe('Whether this PR is a draft'),
            maintainer_can_modify: z.boolean().optional().describe('Whether repo maintainers can modify the PR'),
        },
        async (args, _extra) => {
            try {
                const pr = await pullRequestService.createPullRequest(args);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                pull_request: {
                                    number: pr.number,
                                    title: pr.title,
                                    html_url: pr.html_url,
                                    state: pr.state,
                                    created_at: pr.created_at,
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

    // Other pull request management tools would go here...
}

/**
 * Handle errors from tool operations
 *
 * @param {Error} error - The error that occurred
 * @returns {object} Error response in the expected format
 */
function handleToolError(error) {
    console.error('Tool error:', error);
    let errorMessage = error.message || 'An unknown error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    // Determine error type and set appropriate message and code
    if (error.name === 'AuthenticationError') {
        errorCode = 'AUTHENTICATION_ERROR';
    } else if (error.name === 'ResourceNotFoundError') {
        errorCode = 'RESOURCE_NOT_FOUND';
    } else if (error.name === 'ValidationError') {
        errorCode = 'VALIDATION_ERROR';
    }

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    success: false,
                    error: {
                        code: errorCode,
                        message: errorMessage,
                    },
                }),
            },
        ],
    };
}

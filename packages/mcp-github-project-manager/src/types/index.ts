/**
 * GitHub Issue types
 */

// Issue creation parameters
export type CreateIssueParams = {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    labels?: string[];
    assignees?: string[];
    milestone?: number;
};

// Issue update parameters
export type UpdateIssueParams = {
    owner: string;
    repo: string;
    issue_number: number;
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    labels?: string[];
    assignees?: string[];
    milestone?: number | null;
};

// Issue listing parameters
export type ListIssuesParams = {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    since?: string;
    per_page?: number;
    page?: number;
    labels?: string[];
    assignee?: string;
    creator?: string;
    mentioned?: string;
    milestone?: string;
};

// Issue comment parameters
export type AddIssueCommentParams = {
    owner: string;
    repo: string;
    issue_number: number;
    body: string;
};

// Get issue parameters
export type GetIssueParams = {
    owner: string;
    repo: string;
    issue_number: number;
};

/**
 * GitHub Project types
 */

// Project creation parameters
export type CreateProjectParams = {
    owner: string;
    name: string;
    body?: string;
};

// Project item addition parameters
export type AddProjectItemParams = {
    project_id: number;
    content_id: number;
    content_type: 'Issue' | 'PullRequest';
};

// Project item update parameters
export type UpdateProjectItemParams = {
    project_id: number;
    item_id: number;
    column_id?: number;
    position?: 'top' | 'bottom' | number;
};

// Project item listing parameters
export type ListProjectItemsParams = {
    project_id: number;
    column_id?: number;
};

/**
 * Error types
 */
export type GitHubApiError = {
    status: number;
    message: string;
    documentation_url?: string;
};

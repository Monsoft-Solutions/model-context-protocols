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
 * GitHub Milestone types
 */

// Milestone creation parameters
export type CreateMilestoneParams = {
    owner: string;
    repo: string;
    title: string;
    description?: string;
    due_on?: string;
    state?: 'open' | 'closed';
};

// Milestone update parameters
export type UpdateMilestoneParams = {
    owner: string;
    repo: string;
    milestone_number: number;
    title?: string;
    description?: string;
    due_on?: string;
    state?: 'open' | 'closed';
};

// Milestone listing parameters
export type ListMilestonesParams = {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    sort?: 'due_on' | 'completeness';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
};

// Milestone get parameters
export type GetMilestoneParams = {
    owner: string;
    repo: string;
    milestone_number: number;
};

/**
 * GitHub Pull Request types
 */

// Pull request creation parameters
export type CreatePullRequestParams = {
    owner: string;
    repo: string;
    title: string;
    body?: string;
    head: string;
    base: string;
    draft?: boolean;
    maintainer_can_modify?: boolean;
};

// Pull request update parameters
export type UpdatePullRequestParams = {
    owner: string;
    repo: string;
    pull_number: number;
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    base?: string;
    maintainer_can_modify?: boolean;
};

// Pull request listing parameters
export type ListPullRequestsParams = {
    owner: string;
    repo: string;
    state?: 'open' | 'closed' | 'all';
    head?: string;
    base?: string;
    sort?: 'created' | 'updated' | 'popularity' | 'long-running';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
};

// Get pull request parameters
export type GetPullRequestParams = {
    owner: string;
    repo: string;
    pull_number: number;
};

// Merge pull request parameters
export type MergePullRequestParams = {
    owner: string;
    repo: string;
    pull_number: number;
    commit_title?: string;
    commit_message?: string;
    merge_method?: 'merge' | 'squash' | 'rebase';
};

// Pull request review parameters
export type CreatePullRequestReviewParams = {
    owner: string;
    repo: string;
    pull_number: number;
    body?: string;
    event?: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
    comments?: Array<{
        path: string;
        position: number;
        body: string;
    }>;
};

// List pull request reviews parameters
export type ListPullRequestReviewsParams = {
    owner: string;
    repo: string;
    pull_number: number;
    per_page?: number;
    page?: number;
};

// Pull request review comment parameters
export type CreatePullRequestReviewCommentParams = {
    owner: string;
    repo: string;
    pull_number: number;
    body: string;
    commit_id?: string;
    path?: string;
    position?: number;
    in_reply_to?: number;
};

// List pull request review comments parameters
export type ListPullRequestReviewCommentsParams = {
    owner: string;
    repo: string;
    pull_number: number;
    sort?: 'created' | 'updated';
    direction?: 'asc' | 'desc';
    since?: string;
    per_page?: number;
    page?: number;
};

// Request reviewers parameters
export type RequestReviewersParams = {
    owner: string;
    repo: string;
    pull_number: number;
    reviewers?: string[];
    team_reviewers?: string[];
};

// Update pull request branch parameters
export type UpdatePullRequestBranchParams = {
    owner: string;
    repo: string;
    pull_number: number;
    expected_head_sha?: string;
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

import { Octokit } from '@octokit/rest';
import {
    CreatePullRequestParams,
    UpdatePullRequestParams,
    ListPullRequestsParams,
    GetPullRequestParams,
    MergePullRequestParams,
    CreatePullRequestReviewParams,
    ListPullRequestReviewsParams,
    CreatePullRequestReviewCommentParams,
    ListPullRequestReviewCommentsParams,
    RequestReviewersParams,
    UpdatePullRequestBranchParams,
} from '../types/index.js';
import { GitHubError, handleGitHubError } from '../errors/index.js';

/**
 * Service for managing GitHub pull requests
 */
export class GitHubPullRequestService {
    private octokit: Octokit;

    /**
     * Create a new GitHub Pull Request Service
     * @param token GitHub API token
     */
    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token,
        });
    }

    /**
     * Create a new pull request in a GitHub repository
     * @param params Pull request creation parameters
     * @returns The created pull request
     */
    async createPullRequest(params: CreatePullRequestParams) {
        try {
            const { owner, repo, title, body, head, base, draft, maintainer_can_modify } = params;

            const response = await this.octokit.pulls.create({
                owner,
                repo,
                title,
                body,
                head,
                base,
                draft,
                maintainer_can_modify,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Update an existing pull request in a GitHub repository
     * @param params Pull request update parameters
     * @returns The updated pull request
     */
    async updatePullRequest(params: UpdatePullRequestParams) {
        try {
            const { owner, repo, pull_number, title, body, state, base, maintainer_can_modify } = params;

            const response = await this.octokit.pulls.update({
                owner,
                repo,
                pull_number,
                title,
                body,
                state,
                base,
                maintainer_can_modify,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * List pull requests in a GitHub repository
     * @param params Pull request listing parameters
     * @returns List of pull requests
     */
    async listPullRequests(params: ListPullRequestsParams) {
        try {
            const { owner, repo, state, head, base, sort, direction, per_page, page } = params;

            const response = await this.octokit.pulls.list({
                owner,
                repo,
                state,
                head,
                base,
                sort,
                direction,
                per_page,
                page,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Get a specific pull request from a GitHub repository
     * @param params Pull request parameters
     * @returns The requested pull request
     */
    async getPullRequest(params: GetPullRequestParams) {
        try {
            const { owner, repo, pull_number } = params;

            const response = await this.octokit.pulls.get({
                owner,
                repo,
                pull_number,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Merge a pull request
     * @param params Merge pull request parameters
     * @returns The merge result
     */
    async mergePullRequest(params: MergePullRequestParams) {
        try {
            const { owner, repo, pull_number, commit_title, commit_message, merge_method } = params;

            const response = await this.octokit.pulls.merge({
                owner,
                repo,
                pull_number,
                commit_title,
                commit_message,
                merge_method,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Check if a pull request has been merged
     * @param owner Repository owner
     * @param repo Repository name
     * @param pull_number Pull request number
     * @returns Boolean indicating if the pull request has been merged
     */
    async isPullRequestMerged(owner: string, repo: string, pull_number: number) {
        try {
            const response = await this.octokit.pulls.checkIfMerged({
                owner,
                repo,
                pull_number,
            });

            return response.status === 204;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Create a review for a pull request
     * @param params Pull request review parameters
     * @returns The created review
     */
    async createPullRequestReview(params: CreatePullRequestReviewParams) {
        try {
            const { owner, repo, pull_number, body, event, comments } = params;

            const response = await this.octokit.pulls.createReview({
                owner,
                repo,
                pull_number,
                body,
                event,
                comments,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * List reviews for a pull request
     * @param params List pull request reviews parameters
     * @returns List of reviews
     */
    async listPullRequestReviews(params: ListPullRequestReviewsParams) {
        try {
            const { owner, repo, pull_number, per_page, page } = params;

            const response = await this.octokit.pulls.listReviews({
                owner,
                repo,
                pull_number,
                per_page,
                page,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Create a review comment for a pull request
     * @param params Pull request review comment parameters
     * @returns The created comment
     */
    async createPullRequestReviewComment(params: CreatePullRequestReviewCommentParams) {
        try {
            const { owner, repo, pull_number, body, commit_id, path, position, in_reply_to } = params;

            // Create parameters with required fields
            const requestParams = {
                owner,
                repo,
                pull_number,
                body,
                ...(commit_id && { commit_id }),
                ...(path && { path }),
                ...(position !== undefined && { position }),
                ...(in_reply_to !== undefined && { in_reply_to }),
            };

            // Ensure required parameters are present
            if (!commit_id) {
                throw new Error('commit_id is required for creating a review comment');
            }
            if (!path) {
                throw new Error('path is required for creating a review comment');
            }

            // Now we're sure commit_id and path are defined
            const response = await this.octokit.pulls.createReviewComment({
                ...requestParams,
                commit_id: commit_id,
                path: path,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * List review comments for a pull request
     * @param params List pull request review comments parameters
     * @returns List of review comments
     */
    async listPullRequestReviewComments(params: ListPullRequestReviewCommentsParams) {
        try {
            const { owner, repo, pull_number, sort, direction, since, per_page, page } = params;

            const response = await this.octokit.pulls.listReviewComments({
                owner,
                repo,
                pull_number,
                sort,
                direction,
                since,
                per_page,
                page,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Request reviewers for a pull request
     * @param params Request reviewers parameters
     * @returns The updated pull request
     */
    async requestReviewers(params: RequestReviewersParams) {
        try {
            const { owner, repo, pull_number, reviewers, team_reviewers } = params;

            const response = await this.octokit.pulls.requestReviewers({
                owner,
                repo,
                pull_number,
                reviewers,
                team_reviewers,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Remove requested reviewers from a pull request
     * @param owner Repository owner
     * @param repo Repository name
     * @param pull_number Pull request number
     * @param reviewers Reviewers to remove
     * @param team_reviewers Team reviewers to remove
     * @returns The updated pull request
     */
    async removeRequestedReviewers(
        owner: string,
        repo: string,
        pull_number: number,
        reviewers: string[],
        team_reviewers?: string[],
    ) {
        try {
            const response = await this.octokit.pulls.removeRequestedReviewers({
                owner,
                repo,
                pull_number,
                reviewers,
                team_reviewers: team_reviewers || [],
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Update a pull request branch
     * @param params Update pull request branch parameters
     * @returns The update result
     */
    async updatePullRequestBranch(params: UpdatePullRequestBranchParams) {
        try {
            const { owner, repo, pull_number, expected_head_sha } = params;

            const response = await this.octokit.pulls.updateBranch({
                owner,
                repo,
                pull_number,
                expected_head_sha,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }
}

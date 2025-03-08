import { Octokit } from '@octokit/rest';
import {
    CreateIssueParams,
    UpdateIssueParams,
    ListIssuesParams,
    AddIssueCommentParams,
    GetIssueParams,
} from '../types/index.js';
import { handleGitHubError } from '../errors/index.js';

/**
 * Service for managing GitHub issues
 */
export class GitHubIssueService {
    private octokit: Octokit;

    /**
     * Create a new GitHub Issue Service
     * @param token GitHub API token
     */
    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token,
        });
    }

    /**
     * Create a new issue in a GitHub repository
     * @param params Issue creation parameters
     * @returns The created issue
     */
    async createIssue(params: CreateIssueParams) {
        try {
            const { owner, repo, title, body, labels, assignees, milestone } = params;

            const response = await this.octokit.issues.create({
                owner,
                repo,
                title,
                body,
                labels,
                assignees,
                milestone,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * Update an existing issue in a GitHub repository
     * @param params Issue update parameters
     * @returns The updated issue
     */
    async updateIssue(params: UpdateIssueParams) {
        try {
            const { owner, repo, issue_number, title, body, state, labels, assignees, milestone } = params;

            const response = await this.octokit.issues.update({
                owner,
                repo,
                issue_number,
                title,
                body,
                state,
                labels,
                assignees,
                milestone,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * List issues in a GitHub repository
     * @param params Issue listing parameters
     * @returns List of issues
     */
    async listIssues(params: ListIssuesParams) {
        try {
            const {
                owner,
                repo,
                state,
                sort,
                direction,
                since,
                per_page,
                page,
                labels,
                assignee,
                creator,
                mentioned,
                milestone,
            } = params;

            const response = await this.octokit.issues.listForRepo({
                owner,
                repo,
                state,
                sort,
                direction,
                since,
                per_page,
                page,
                labels: labels?.join(','),
                assignee,
                creator,
                mentioned,
                milestone,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * Get details of a specific issue
     * @param params Get issue parameters
     * @returns Issue details
     */
    async getIssue(params: GetIssueParams) {
        try {
            const { owner, repo, issue_number } = params;

            const response = await this.octokit.issues.get({
                owner,
                repo,
                issue_number,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * Add a comment to an issue
     * @param params Issue comment parameters
     * @returns The created comment
     */
    async addIssueComment(params: AddIssueCommentParams) {
        try {
            const { owner, repo, issue_number, body } = params;

            const response = await this.octokit.issues.createComment({
                owner,
                repo,
                issue_number,
                body,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * Close an issue
     * @param owner Repository owner
     * @param repo Repository name
     * @param issue_number Issue number
     * @returns The updated issue
     */
    async closeIssue(owner: string, repo: string, issue_number: number) {
        try {
            const response = await this.octokit.issues.update({
                owner,
                repo,
                issue_number,
                state: 'closed',
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }
}

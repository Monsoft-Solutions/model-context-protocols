import { Octokit } from '@octokit/rest';
import {
    CreateMilestoneParams,
    UpdateMilestoneParams,
    ListMilestonesParams,
    GetMilestoneParams,
} from '../types/index.js';
import { GitHubError, handleGitHubError } from '../errors/index.js';

/**
 * Service for managing GitHub milestones
 */
export class GitHubMilestoneService {
    private octokit: Octokit;

    /**
     * Create a new GitHub Milestone Service
     * @param token GitHub API token
     */
    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token,
        });
    }

    /**
     * Create a new milestone in a GitHub repository
     * @param params Milestone creation parameters
     * @returns The created milestone
     */
    async createMilestone(params: CreateMilestoneParams) {
        try {
            const { owner, repo, title, description, due_on, state } = params;

            const response = await this.octokit.issues.createMilestone({
                owner,
                repo,
                title,
                description,
                due_on,
                state,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Update an existing milestone in a GitHub repository
     * @param params Milestone update parameters
     * @returns The updated milestone
     */
    async updateMilestone(params: UpdateMilestoneParams) {
        try {
            const { owner, repo, milestone_number, title, description, due_on, state } = params;

            const response = await this.octokit.issues.updateMilestone({
                owner,
                repo,
                milestone_number,
                title,
                description,
                due_on,
                state,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Get a milestone from a GitHub repository
     * @param params Milestone retrieval parameters
     * @returns The requested milestone
     */
    async getMilestone(params: GetMilestoneParams) {
        try {
            const { owner, repo, milestone_number } = params;

            const response = await this.octokit.issues.getMilestone({
                owner,
                repo,
                milestone_number,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * List milestones in a GitHub repository
     * @param params Milestone listing parameters
     * @returns List of milestones
     */
    async listMilestones(params: ListMilestonesParams) {
        try {
            const { owner, repo, state, sort, direction, per_page, page } = params;

            const response = await this.octokit.issues.listMilestones({
                owner,
                repo,
                state,
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
     * Delete a milestone from a GitHub repository
     * @param owner Repository owner
     * @param repo Repository name
     * @param milestone_number Milestone number
     * @returns void
     */
    async deleteMilestone(owner: string, repo: string, milestone_number: number) {
        try {
            await this.octokit.issues.deleteMilestone({
                owner,
                repo,
                milestone_number,
            });
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }
}

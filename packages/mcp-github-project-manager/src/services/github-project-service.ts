import { Octokit } from '@octokit/rest';
import {
    CreateProjectParams,
    AddProjectItemParams,
    UpdateProjectItemParams,
    ListProjectItemsParams,
} from '../types/index.js';
import { handleGitHubError } from '../errors/index.js';

/**
 * Service for managing GitHub projects
 */
export class GitHubProjectService {
    private octokit: Octokit;

    /**
     * Create a new GitHub Project Service
     * @param token GitHub API token
     */
    constructor(token: string) {
        this.octokit = new Octokit({
            auth: token,
            previews: ['inertia-preview'], // Required for Projects API
        });
    }

    /**
     * Create a new project
     * @param params Project creation parameters
     * @returns The created project
     */
    async createProject(params: CreateProjectParams) {
        try {
            const { owner, name, body } = params;

            const response = await this.octokit.projects.createForOrg({
                org: owner,
                name,
                body,
            });

            return response.data;
        } catch (error) {
            // Try creating for user if org fails
            try {
                const { name, body } = params;

                const response = await this.octokit.projects.createForAuthenticatedUser({
                    name,
                    body,
                });

                return response.data;
            } catch (secondError) {
                throw handleGitHubError(secondError);
            }
        }
    }

    /**
     * Add an issue or pull request to a project
     * @param params Project item addition parameters
     * @returns The created project card
     */
    async addProjectItem(params: AddProjectItemParams) {
        try {
            const { project_id, content_id, content_type } = params;

            // First, get the project columns
            const columnsResponse = await this.octokit.projects.listColumns({
                project_id,
            });

            if (columnsResponse.data.length === 0) {
                throw new Error(`Project ${project_id} has no columns`);
            }

            // Use the first column (usually "To Do" or similar)
            const column_id = columnsResponse.data[0].id;

            // Create the card in the column
            const response = await this.octokit.projects.createCard({
                column_id,
                content_id,
                content_type,
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * Update a project item (move between columns)
     * @param params Project item update parameters
     * @returns The updated project card
     */
    async updateProjectItem(params: UpdateProjectItemParams) {
        try {
            const { item_id, column_id, position } = params;

            // If column_id is not provided, we can't move the card
            if (!column_id) {
                throw new Error('Column ID is required to move a project card');
            }

            const response = await this.octokit.projects.moveCard({
                card_id: item_id,
                column_id,
                position: position ? position.toString() : 'top',
            });

            return response.data;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }

    /**
     * List items in a project
     * @param params Project item listing parameters
     * @returns List of project cards
     */
    async listProjectItems(params: ListProjectItemsParams) {
        try {
            const { project_id, column_id } = params;

            // If column_id is provided, list cards in that column
            if (column_id) {
                const response = await this.octokit.projects.listCards({
                    column_id,
                });

                return response.data;
            }

            // Otherwise, get all columns and their cards
            const columnsResponse = await this.octokit.projects.listColumns({
                project_id,
            });

            // Collect all cards from all columns
            const allCards = [];
            for (const column of columnsResponse.data) {
                const cardsResponse = await this.octokit.projects.listCards({
                    column_id: column.id,
                });

                // Add column information to each card
                const cardsWithColumn = cardsResponse.data.map((card: any) => ({
                    ...card,
                    column: {
                        id: column.id,
                        name: column.name,
                    },
                }));

                allCards.push(...cardsWithColumn);
            }

            return allCards;
        } catch (error) {
            throw handleGitHubError(error);
        }
    }
}

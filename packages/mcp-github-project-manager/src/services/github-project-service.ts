import { graphql } from '@octokit/graphql';
import {
    CreateProjectParams,
    AddProjectItemParams,
    UpdateProjectItemParams,
    ListProjectItemsParams,
    GetProjectFieldsParams,
    ProjectField,
    GetProjectColumnsParams,
    ProjectColumn,
    AddProjectItemWithColumnParams,
    ListProjectsParams,
} from '../types/index.js';
import { GitHubError, handleGitHubError } from '../errors/index.js';

/**
 * Service for managing GitHub projects using the Projects v2 GraphQL API
 */
export class GitHubProjectService {
    private graphqlWithAuth: typeof graphql;

    /**
     * Create a new GitHub Project Service
     * @param token GitHub API token with 'project' scope
     */
    constructor(token: string) {
        this.graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `token ${token}`,
            },
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

            // First get the owner ID (either user or organization)
            let ownerId: string;

            try {
                // Try as organization first
                const orgResult = await this.graphqlWithAuth<{ organization: { id: string } }>(`
                    query {
                        organization(login: "${owner}") {
                            id
                        }
                    }
                `);
                ownerId = orgResult.organization.id;
            } catch (error) {
                // If not an org, try as user
                const userResult = await this.graphqlWithAuth<{ user: { id: string } }>(`
                    query {
                        user(login: "${owner}") {
                            id
                        }
                    }
                `);
                ownerId = userResult.user.id;
            }

            // Create the project
            const result = await this.graphqlWithAuth<{ createProjectV2: { projectV2: any } }>(`
                mutation {
                    createProjectV2(input: {
                        ownerId: "${ownerId}",
                        title: "${name}",
                        ${body ? `readme: "${body.replace(/"/g, '\\"')}"` : ''}
                    }) {
                        projectV2 {
                            id
                            title
                            url
                            number
                            readme
                            createdAt
                        }
                    }
                }
            `);

            return result.createProjectV2.projectV2;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * List all projects for an organization or user
     * @param params Parameters to list projects
     * @returns List of projects
     */
    async listProjects(params: ListProjectsParams) {
        try {
            const { owner, first = 20 } = params;

            let projects: any[] = [];

            try {
                // Try as organization first
                const orgResult = await this.graphqlWithAuth<{ organization: { projectsV2: { nodes: any[] } } }>(`
                    query {
                        organization(login: "${owner}") {
                            projectsV2(first: ${first}) {
                                nodes {
                                    id
                                    title
                                    url
                                    number
                                    readme
                                    createdAt
                                    closed
                                    shortDescription
                                }
                            }
                        }
                    }
                `);
                projects = orgResult.organization.projectsV2.nodes;
            } catch (error) {
                // If not an org, try as user
                const userResult = await this.graphqlWithAuth<{ user: { projectsV2: { nodes: any[] } } }>(`
                    query {
                        user(login: "${owner}") {
                            projectsV2(first: ${first}) {
                                nodes {
                                    id
                                    title
                                    url
                                    number
                                    readme
                                    createdAt
                                    closed
                                    shortDescription
                                }
                            }
                        }
                    }
                `);
                projects = userResult.user.projectsV2.nodes;
            }

            return projects;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Add an issue or pull request to a project
     * @param params Project item addition parameters
     * @returns The created project item
     */
    async addProjectItem(params: AddProjectItemParams) {
        try {
            const { projectId, contentId } = params;

            const result = await this.graphqlWithAuth<{ addProjectV2ItemById: { item: any } }>(`
                mutation {
                    addProjectV2ItemById(input: {
                        projectId: "${projectId}",
                        contentId: "${contentId}"
                    }) {
                        item {
                            id
                        }
                    }
                }
            `);

            return result.addProjectV2ItemById.item;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Update a project item (move between columns)
     * @param params Project item update parameters
     * @returns The updated project item
     */
    async updateProjectItem(params: UpdateProjectItemParams) {
        try {
            const { projectId, itemId, fieldId, columnId } = params;

            if (fieldId && columnId) {
                // If we have both a field ID and column ID, we need to update the field value
                const result = await this.graphqlWithAuth<{ updateProjectV2ItemFieldValue: { projectV2Item: any } }>(`
                    mutation {
                        updateProjectV2ItemFieldValue(input: {
                            projectId: "${projectId}",
                            itemId: "${itemId}",
                            fieldId: "${fieldId}",
                            value: {
                                singleSelectOptionId: "${columnId}"
                            }
                        }) {
                            projectV2Item {
                                id
                            }
                        }
                    }
                `);

                return result.updateProjectV2ItemFieldValue.projectV2Item;
            } else {
                throw new Error('fieldId and columnId are required to update a project item');
            }
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * List items in a project
     * @param params Project item listing parameters
     * @returns List of project items
     */
    async listProjectItems(params: ListProjectItemsParams) {
        try {
            const { projectId, first = 20 } = params;

            // Query the project items
            const result = await this.graphqlWithAuth<{ node: { items: { nodes: any[] } } }>(`
                query {
                    node(id: "${projectId}") {
                        ... on ProjectV2 {
                            items(first: ${first}) {
                                nodes {
                                    id
                                    content {
                                        ... on Issue {
                                            title
                                            url
                                        }
                                        ... on PullRequest {
                                            title
                                            url
                                        }
                                        ... on DraftIssue {
                                            title
                                        }
                                    }
                                    fieldValues(first: 10) {
                                        nodes {
                                            ... on ProjectV2ItemFieldTextValue {
                                                text
                                                field {
                                                    ... on ProjectV2FieldCommon {
                                                        name
                                                    }
                                                }
                                            }
                                            ... on ProjectV2ItemFieldDateValue {
                                                date
                                                field {
                                                    ... on ProjectV2FieldCommon {
                                                        name
                                                    }
                                                }
                                            }
                                            ... on ProjectV2ItemFieldSingleSelectValue {
                                                name
                                                field {
                                                    ... on ProjectV2FieldCommon {
                                                        name
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            return result.node.items.nodes;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Get all fields for a project
     * @param params Parameters to get project fields
     * @returns List of project fields with their options
     */
    async getProjectFields(params: GetProjectFieldsParams): Promise<ProjectField[]> {
        try {
            const { projectId } = params;

            const result = await this.graphqlWithAuth<{ node: { fields: { nodes: any[] } } }>(`
                query {
                    node(id: "${projectId}") {
                        ... on ProjectV2 {
                            fields(first: 20) {
                                nodes {
                                    ... on ProjectV2FieldCommon {
                                        id
                                        name
                                        dataType
                                    }
                                    ... on ProjectV2SingleSelectField {
                                        id
                                        name
                                        dataType
                                        options {
                                            id
                                            name
                                        }
                                    }
                                    ... on ProjectV2IterationField {
                                        id
                                        name
                                        dataType
                                        configuration {
                                            iterations {
                                                id
                                                title
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            return result.node.fields.nodes.map((field) => {
                const projectField: ProjectField = {
                    id: field.id,
                    name: field.name,
                    type: field.dataType || 'UNKNOWN',
                };

                // Add options for single select fields
                if (field.options) {
                    projectField.options = field.options.map((option: any) => ({
                        id: option.id,
                        name: option.name,
                    }));
                }

                // Add options for iteration fields
                if (field.configuration?.iterations) {
                    projectField.options = field.configuration.iterations.map((iteration: any) => ({
                        id: iteration.id,
                        name: iteration.title,
                    }));
                }

                return projectField;
            });
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Get columns (status options) for a project
     * @param params Parameters to get project columns
     * @returns List of status field options (columns)
     */
    async getProjectColumns(
        params: GetProjectColumnsParams,
    ): Promise<{ statusFieldId: string; columns: ProjectColumn[] }> {
        try {
            const { projectId } = params;

            const fields = await this.getProjectFields({ projectId });

            // Find the Status field (or any single select field that looks like status)
            const statusField = fields.find(
                (field) =>
                    field.name === 'Status' ||
                    (field.options &&
                        field.options.length > 0 &&
                        field.options.some((option) => ['Todo', 'In Progress', 'Done', 'To Do'].includes(option.name))),
            );

            if (!statusField || !statusField.options) {
                throw new Error('Status field not found in project or has no options');
            }

            return {
                statusFieldId: statusField.id,
                columns: statusField.options.map((option) => ({
                    id: option.id,
                    name: option.name,
                })),
            };
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }

    /**
     * Add an item to a project and place it in a specific column in one operation
     * @param params Parameters to add project item with column
     * @returns The created project item
     */
    async addProjectItemWithColumn(params: AddProjectItemWithColumnParams) {
        try {
            const { projectId, contentId, fieldId, columnId } = params;

            // First add the item to the project
            const addResult = await this.addProjectItem({
                projectId,
                contentId,
            });

            // Then update its status field
            await this.updateProjectItem({
                projectId,
                itemId: addResult.id,
                fieldId,
                columnId,
            });

            // Return the newly added item
            return addResult;
        } catch (error) {
            throw handleGitHubError(error as GitHubError);
        }
    }
}

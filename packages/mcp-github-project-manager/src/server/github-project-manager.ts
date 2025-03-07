import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GitHubIssueService, GitHubProjectService } from "../services/index.js";
import {
  AuthenticationError,
  ResourceNotFoundError,
  ValidationError,
} from "../errors/index.js";

// Environment variable for GitHub token

/**
 * Initialize and start the MCP GitHub Project Manager server
 */
export async function startGitHubProjectManagerServer(token: string) {
  // Use provided token or environment variable
  const githubToken = token;

  // Validate GitHub token
  if (!githubToken) {
    console.error("GITHUB_TOKEN environment variable is required");
    process.exit(1);
  }

  // Create services
  const issueService = new GitHubIssueService(githubToken);
  const projectService = new GitHubProjectService(githubToken);

  // Create a new MCP server
  const server = new McpServer({
    name: "MCP GitHub Project Manager",
    version: "1.0.0",
  });

  // Register GitHub Issue Management tools
  registerIssueTools(server, issueService);

  // Register GitHub Project Management tools
  registerProjectTools(server, projectService);

  // Set up server transport using Standard I/O
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("MCP GitHub Project Manager server started");

  // Keep the server running
  return server;
}

/**
 * Register GitHub Issue Management tools
 */
function registerIssueTools(
  server: McpServer,
  issueService: GitHubIssueService
) {
  // Create Issue Tool
  server.tool(
    "create_issue",
    "Create a new issue in a GitHub repository",
    {
      owner: z.string().describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Issue title"),
      body: z.string().optional().describe("Issue body/description"),
      labels: z
        .array(z.string())
        .optional()
        .describe("Labels to add to this issue"),
      assignees: z
        .array(z.string())
        .optional()
        .describe("GitHub usernames to assign to this issue"),
      milestone: z
        .number()
        .optional()
        .describe("Milestone number to associate with this issue"),
    },
    async (args, _extra) => {
      try {
        const issue = await issueService.createIssue(args);

        return {
          content: [
            {
              type: "text" as const,
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
    }
  );

  // Update Issue Tool
  server.tool(
    "update_issue",
    "Update an existing issue in a GitHub repository",
    {
      owner: z.string().describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      issue_number: z.number().describe("Issue number"),
      title: z.string().optional().describe("New issue title"),
      body: z.string().optional().describe("New issue body"),
      state: z.enum(["open", "closed"]).optional().describe("New issue state"),
      labels: z.array(z.string()).optional().describe("Labels to set"),
      assignees: z
        .array(z.string())
        .optional()
        .describe("GitHub usernames to assign"),
      milestone: z.number().nullable().optional().describe("Milestone to set"),
    },
    async (args, _extra) => {
      try {
        const issue = await issueService.updateIssue(args);

        return {
          content: [
            {
              type: "text" as const,
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
    }
  );

  // List Issues Tool
  server.tool(
    "list_issues",
    "List issues in a GitHub repository with filtering options",
    {
      owner: z.string().describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      state: z
        .enum(["open", "closed", "all"])
        .optional()
        .describe("Issue state"),
      sort: z
        .enum(["created", "updated", "comments"])
        .optional()
        .describe("Sort field"),
      direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
      since: z
        .string()
        .optional()
        .describe("Filter by updated date (ISO 8601 format)"),
      per_page: z.number().optional().describe("Results per page"),
      page: z.number().optional().describe("Page number"),
      labels: z.array(z.string()).optional().describe("Filter by labels"),
      assignee: z.string().optional().describe("Filter by assignee"),
      creator: z.string().optional().describe("Filter by creator"),
      mentioned: z.string().optional().describe("Filter by mentioned user"),
      milestone: z
        .string()
        .optional()
        .describe("Filter by milestone number or title"),
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
              type: "text" as const,
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
    }
  );

  // Get Issue Tool
  server.tool(
    "get_issue",
    "Get details of a specific issue in a GitHub repository.",
    {
      owner: z.string().describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      issue_number: z.number().describe("Issue number"),
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
          assignees:
            issue.assignees?.map((assignee: any) => assignee.login) || [],
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
              type: "text" as const,
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
    }
  );

  // Add Issue Comment Tool
  server.tool(
    "add_issue_comment",
    "Add a comment to an existing issue",
    {
      owner: z.string().describe("Repository owner (username or organization)"),
      repo: z.string().describe("Repository name"),
      issue_number: z.number().describe("Issue number"),
      body: z.string().describe("Comment text"),
    },
    async (args, _extra) => {
      try {
        const comment = await issueService.addIssueComment(args);

        return {
          content: [
            {
              type: "text" as const,
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
    }
  );
}

/**
 * Register GitHub Project Management tools
 */
function registerProjectTools(
  server: McpServer,
  projectService: GitHubProjectService
) {
  // Create Project Tool
  server.tool(
    "create_project",
    "Create a new GitHub project board",
    {
      owner: z.string().describe("Organization name or username"),
      name: z.string().describe("Project name"),
      body: z.string().optional().describe("Project description"),
    },
    async (args, _extra) => {
      try {
        const project = await projectService.createProject(args);

        return {
          content: [
            {
              type: "text" as const,
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
    }
  );

  // Add Project Item Tool
  server.tool(
    "add_project_item",
    "Add an issue or pull request to a GitHub project",
    {
      project_id: z.number().describe("Project ID"),
      content_id: z.number().describe("Issue or PR ID"),
      content_type: z
        .enum(["Issue", "PullRequest"])
        .describe("Type of content to add"),
    },
    async (args, _extra) => {
      try {
        const card = await projectService.addProjectItem(args);

        return {
          content: [
            {
              type: "text" as const,
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
    }
  );

  // Update Project Item Tool
  server.tool(
    "update_project_item",
    "Move an item between columns in a GitHub project",
    {
      project_id: z.number().describe("Project ID"),
      item_id: z.number().describe("Card ID to move"),
      column_id: z.number().describe("Column ID to move the card to"),
      position: z
        .union([z.enum(["top", "bottom"]), z.number()])
        .optional()
        .describe("Position in the column (top, bottom, or specific position)"),
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
              type: "text" as const,
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
    }
  );

  // List Project Items Tool
  server.tool(
    "list_project_items",
    "List items in a GitHub project",
    {
      project_id: z.number().describe("Project ID"),
      column_id: z.number().optional().describe("Column ID to filter by"),
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
              type: "text" as const,
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
    }
  );
}

/**
 * Handle errors from tool execution
 */
function handleToolError(error: unknown) {
  let errorMessage = "An unknown error occurred";
  let errorType = "UnknownError";

  if (error instanceof AuthenticationError) {
    errorMessage = error.message;
    errorType = "AuthenticationError";
  } else if (error instanceof ResourceNotFoundError) {
    errorMessage = error.message;
    errorType = "ResourceNotFoundError";
  } else if (error instanceof ValidationError) {
    errorMessage = error.message;
    errorType = "ValidationError";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorType = error.name;
  }

  return {
    content: [
      {
        type: "text" as const,
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

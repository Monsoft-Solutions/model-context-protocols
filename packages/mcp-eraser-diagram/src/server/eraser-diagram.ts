import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import axios from 'axios';

/**
 * Supported diagram types
 */
export type DiagramType =
    | 'entity-relationship-diagram'
    | 'cloud-architecture-diagram'
    | 'sequence-diagram'
    | 'flowchart'
    | 'mindmap'
    | 'class-diagram';

/**
 * Theme options for diagrams
 */
export type Theme = 'light' | 'dark';

/**
 * Mode options for diagram generation
 */
export type Mode = 'standard' | 'premium';

/**
 * Arguments for the eraser diagram generation
 */

/**
 * Response from the Eraser API
 */
interface EraserApiResponse {
    imageUrl: string;
    createEraserFileUrl: string;
    diagrams: {
        diagramType: string;
        code: string;
    }[];
}

/**
 * Result of the diagram generation
 */
interface EraserDiagramResult {
    imageUrl: string;
    createEraserFileUrl: string;
    diagramType: string;
    code: string;
}

/**
 * Initialize and start the MCP Eraser Diagram server
 * @param apiToken The Eraser API token
 */
export async function startEraserDiagramServer(apiToken: string) {
    if (!apiToken) {
        throw new Error('Eraser API token is required');
    }

    // Create a new MCP server
    const server = new McpServer({
        name: 'MCP Eraser Diagram',
        version: '1.0.0',
    });

    // Register the eraser diagram function
    server.tool(
        'generate_diagram',
        'Generates an Entity Relationship Diagram (ERD) or other diagram types using Eraser API',
        {
            text: z
                .string()
                .describe(
                    'The prompt. The input code or natural language which describes a diagram.',
                ),
            diagramType: z
                .enum([
                    'entity-relationship-diagram',
                    'cloud-architecture-diagram',
                    'sequence-diagram',
                    'flowchart',
                    'mindmap',
                    'class-diagram',
                ])
                .optional()
                .describe(
                    'Select desired diagram type. Will automatically detect diagram type when unspecified.',
                ),
            theme: z
                .enum(['light', 'dark'])
                .optional()
                .describe(
                    'Select "light" or "dark" theme. Defaults to "light".',
                ),
            mode: z
                .enum(['standard', 'premium'])
                .optional()
                .describe(
                    'Select "standard" for GPT-4o or "premium" for OpenAI-o1. Defaults to "standard"',
                ),
            background: z
                .boolean()
                .optional()
                .describe(
                    'Select transparent (false) or solid (true) background. Defaults to false.',
                ),
            scale: z
                .enum(['1', '2', '3'])
                .optional()
                .describe(
                    'Scale factor of returned image file. Use 1, 2, or 3. Defaults to 2.',
                ),
        },
        async (args) => {
            const { text, diagramType, theme, mode, background, scale } = args;

            try {
                // Call the Eraser API
                const response = await axios.post<EraserApiResponse>(
                    'https://app.eraser.io/api/render/prompt',
                    {
                        text,
                        diagramType,
                        theme: theme || 'light',
                        mode: mode || 'standard',
                        background: background || false,
                        scale: scale || '2',
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${apiToken}`,
                        },
                    },
                );

                // Extract the diagram information
                const { imageUrl, createEraserFileUrl, diagrams } =
                    response.data;

                // Get the first diagram (there should only be one)
                const diagram = diagrams[0];

                const result: EraserDiagramResult = {
                    imageUrl,
                    createEraserFileUrl,
                    diagramType: diagram.diagramType,
                    code: diagram.code,
                };

                // Return in the format expected by MCP SDK
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const statusCode = error.response?.status;
                    const errorMessage =
                        error.response?.data?.message || error.message;

                    let userFriendlyMessage = 'Error generating diagram';

                    if (statusCode === 400) {
                        userFriendlyMessage =
                            'The request is missing required parameters';
                    } else if (statusCode === 403) {
                        userFriendlyMessage =
                            'Unauthorized. Please check your API token';
                    } else if (statusCode === 500) {
                        userFriendlyMessage =
                            'Eraser was unable to generate a result';
                    } else if (statusCode === 503) {
                        userFriendlyMessage =
                            'Service temporarily unavailable. This may be the result of too many requests';
                    }

                    throw new Error(`${userFriendlyMessage}: ${errorMessage}`);
                }

                throw error;
            }
        },
    );

    // Set up server transport using Standard I/O
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log('MCP Eraser Diagram server started');

    // Keep the server running
    return server;
}

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { DocumentService } from '../services/document-service.js';
import { DocumentType } from '../types/documentation-types.js';

type ServerParams = {
    token: string;
    aiProvider?: 'anthropic' | 'openai';
    port?: number;
    runSse?: boolean;
};

/**
 * Starts the DocScribe MCP server
 * @param params - Server parameters
 * @returns Promise resolving when the server is ready
 */
export async function startDocScribeServer(params: ServerParams): Promise<void> {
    const { token, aiProvider = 'anthropic', port = 3000, runSse = false } = params;

    // Create MCP server
    const server = new McpServer({
        name: 'DocScribe',
        version: '0.1.0',
    });

    // Register document generation tool
    registerDocumentGenerationTool(server, token, aiProvider);

    // Start the server with the appropriate transport
    if (runSse) {
        await startWithSseTransport(server, port);
    } else {
        await startWithStdioTransport(server);
    }
}

/**
 * Registers the document generation tool with the MCP server
 * @param server - MCP server instance
 * @param token - API token
 * @param aiProvider - AI provider to use
 */
function registerDocumentGenerationTool(server: McpServer, token: string, aiProvider: 'anthropic' | 'openai'): void {
    const documentService = new DocumentService(token, aiProvider);

    // Register the tool
    server.tool(
        'generate-documentation',
        {
            documentType: z.enum(['technical', 'database', 'uiux', 'audience', 'accessibility', 'api', 'all']),
            projectName: z.string().min(1),
            description: z.string().min(1),
            additionalContext: z.string().optional(),
            targetAudience: z.string().optional(),
            implementationDetails: z.string().optional(),
            integrationPoints: z.string().optional(),
        },
        async (params) => {
            const result = await documentService.generateDocumentation({
                documentType: params.documentType as DocumentType,
                projectName: params.projectName,
                description: params.description,
                additionalContext: params.additionalContext,
                targetAudience: params.targetAudience,
                implementationDetails: params.implementationDetails,
                integrationPoints: params.integrationPoints,
            });

            if (!result.success) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Failed to generate documentation: ${result.error}`,
                        },
                    ],
                };
            }

            // Return success with document contents
            return {
                content: result.documents.map((doc) => ({
                    type: 'text',
                    text: `# ${doc.title}\n\n${doc.content}`,
                })),
            };
        },
    );

    // Register documentation templates resource
    server.resource('documentation-templates', 'docscribe://templates', async () => ({
        contents: [
            {
                uri: 'docscribe://templates/technical',
                text: 'Technical Specification Template',
            },
            {
                uri: 'docscribe://templates/database',
                text: 'Database Specification Template',
            },
            {
                uri: 'docscribe://templates/uiux',
                text: 'UI/UX Specification Template',
            },
            {
                uri: 'docscribe://templates/audience',
                text: 'Audience Definition Template',
            },
            {
                uri: 'docscribe://templates/accessibility',
                text: 'Accessibility Specification Template',
            },
            {
                uri: 'docscribe://templates/api',
                text: 'API Documentation Template',
            },
        ],
    }));

    // Register documentation types resource
    server.resource('documentation-types', 'docscribe://types', async () => ({
        contents: [
            {
                uri: 'docscribe://types',
                text: `Available Documentation Types:
- technical: Technical specification document
- database: Database specification document
- uiux: UI/UX specification document
- audience: Audience definition document
- accessibility: Accessibility specification document
- api: API documentation
- all: Generate all applicable document types`,
            },
        ],
    }));
}

/**
 * Starts the server with stdio transport
 * @param server - MCP server instance
 */
async function startWithStdioTransport(server: McpServer): Promise<void> {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('DocScribe MCP server started with stdio transport');
}

/**
 * Starts the server with SSE transport
 * @param server - MCP server instance
 * @param port - HTTP server port
 */
async function startWithSseTransport(server: McpServer, port: number): Promise<void> {
    // Set up Express app for SSE
    const app = express();
    const transports = new Map<string, SSEServerTransport>();

    app.get('/sse', async (req, res) => {
        const sessionId = (req.query.sessionId as string) || 'default';
        const transport = new SSEServerTransport('/messages', res);
        transports.set(sessionId, transport);

        await server.connect(transport);

        // Clean up when the connection is closed
        res.on('close', () => {
            transports.delete(sessionId);
        });
    });

    app.post('/messages', async (req, res) => {
        const sessionId = (req.query.sessionId as string) || 'default';
        const transport = transports.get(sessionId);

        if (transport) {
            await transport.handlePostMessage(req, res);
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    });

    // Start the HTTP server
    app.listen(port, () => {
        console.log(`DocScribe MCP server listening on port ${port}`);
    });
}

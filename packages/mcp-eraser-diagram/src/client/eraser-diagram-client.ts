import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Diagram types supported by Eraser API
 */
type DiagramType =
    | 'entity-relationship-diagram'
    | 'cloud-architecture-diagram'
    | 'sequence-diagram'
    | 'flowchart'
    | 'mindmap'
    | 'class-diagram';

/**
 * Theme options for the diagram
 */
type Theme = 'light' | 'dark';

/**
 * Mode options for the diagram generation
 */
type Mode = 'standard' | 'premium';

/**
 * Arguments for the eraser diagram generation
 */
interface EraserDiagramArgs {
    text: string;
    diagramType?: DiagramType;
    theme?: Theme;
    mode?: Mode;
    background?: boolean;
    scale?: '1' | '2' | '3';
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
 * MCP Eraser Diagram Client
 */
export class EraserDiagramClient {
    private client: Client;
    private connected: boolean = false;

    /**
     * Create a new eraser diagram client
     */
    constructor() {
        this.client = new Client({ name: 'MCP Eraser Diagram Client', version: '1.0.0' }, { capabilities: {} });
    }

    /**
     * Connect to the MCP Eraser Diagram server
     * @param apiToken Optional API token to pass as an environment variable to the server
     */
    async connect(apiToken?: string): Promise<void> {
        if (this.connected) {
            return;
        }

        // Get the directory name of the current module
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Path to the server script, relative to the current file
        const serverScriptPath = path.resolve(__dirname, '../server/index.js');

        // Set up client transport pointing to the MCP server script
        const transport = new StdioClientTransport({
            command: `node ${serverScriptPath}`,
            env: apiToken ? { ERASER_API_TOKEN: apiToken } : undefined,
        });

        await this.client.connect(transport);
        this.connected = true;

        console.log('Connected to MCP Eraser Diagram server');
    }

    /**
     * Generate a diagram using Eraser API
     * @param text The prompt text describing the diagram
     * @param options Additional options for diagram generation
     * @returns The diagram generation result
     */
    async generateDiagram(
        text: string,
        options?: {
            diagramType?: DiagramType;
            theme?: Theme;
            mode?: Mode;
            background?: boolean;
            scale?: '1' | '2' | '3';
        },
    ): Promise<EraserDiagramResult> {
        if (!this.connected) {
            throw new Error('Client is not connected. Call connect() first.');
        }

        const args: EraserDiagramArgs = {
            text,
            ...options,
        };

        try {
            // Use the callTool method to invoke the tool
            const response = await this.client.callTool({
                name: 'generate_diagram',
                arguments: args as unknown as { [key: string]: unknown },
            });

            // Parse the result from the text content
            if (response.content && Array.isArray(response.content) && response.content.length > 0) {
                const textContent = response.content.find(
                    (item: { type: string; text?: string }) => item.type === 'text',
                );
                if (textContent && 'text' in textContent) {
                    return JSON.parse(textContent.text) as EraserDiagramResult;
                }
            }

            throw new Error('Invalid response format from eraser diagram server');
        } catch (error) {
            console.error('Error generating diagram:', error);
            throw error;
        }
    }

    /**
     * Disconnect from the MCP Eraser Diagram server
     */
    async disconnect(): Promise<void> {
        if (!this.connected) {
            return;
        }

        // Close the connection
        await this.client.close();
        this.connected = false;

        console.log('Disconnected from MCP Eraser Diagram server');
    }
}

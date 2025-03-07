import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Arguments for the code architect tool
 */
interface CodeArchitectArgs {
    codeContext: string;
    customInstructions: string;
}

/**
 * Result of the code architect operation
 */
interface CodeArchitectResult {
    implementationPlan: string;
}

/**
 * MCP Code Architect Client
 */
export class CodeArchitectClient {
    private client: Client;
    private connected: boolean = false;

    /**
     * Create a new code architect client
     */
    constructor() {
        this.client = new Client(
            { name: 'MCP Code Architect Client', version: '1.0.0' },
            { capabilities: {} },
        );
    }

    /**
     * Connect to the MCP Code Architect server
     */
    async connect(): Promise<void> {
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
        });

        await this.client.connect(transport);
        this.connected = true;

        console.log('Connected to MCP Code Architect server');
    }

    /**
     * Generate an implementation plan
     * @param codeContext The code context to analyze
     * @param customInstructions Custom instructions for the implementation plan
     * @returns The implementation plan
     */
    async generateImplementationPlan(
        codeContext: string,
        customInstructions: string,
    ): Promise<CodeArchitectResult> {
        if (!this.connected) {
            await this.connect();
        }

        const args: CodeArchitectArgs = { codeContext, customInstructions };

        try {
            // Use the callTool method to invoke the tool
            const response = await this.client.callTool({
                name: 'generateImplementationPlan',
                arguments: args as unknown as { [key: string]: unknown },
            });

            // Parse the result from the text content
            if (
                response.content &&
                Array.isArray(response.content) &&
                response.content.length > 0
            ) {
                const textContent = response.content.find(
                    (item: { type: string; text?: string }) =>
                        item.type === 'text',
                );
                if (textContent && 'text' in textContent) {
                    return JSON.parse(textContent.text) as CodeArchitectResult;
                }
            }

            throw new Error(
                'Invalid response format from code architect server',
            );
        } catch (error) {
            console.error('Error generating implementation plan:', error);
            throw error;
        }
    }

    /**
     * Disconnect from the MCP Code Architect server
     */
    async disconnect(): Promise<void> {
        if (!this.connected) {
            return;
        }

        // Close the connection
        await this.client.close();
        this.connected = false;

        console.log('Disconnected from MCP Code Architect server');
    }
}

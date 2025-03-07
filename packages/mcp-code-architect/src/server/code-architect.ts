import { Anthropic } from '@anthropic-ai/sdk';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * Result of the code architect operation
 */
type CodeArchitectResult = {
    implementationPlan: string;
};

const ANTHROPIC_API_KEY = 'sk-ant-api03-';

/**
 * Initialize and start the MCP Code Architect server
 */
export async function startCodeArchitectServer() {
    // Create a new MCP server
    const server = new McpServer({
        name: 'MCP Code Architect',
        version: '1.0.0',
    });

    // Initialize Anthropic client
    const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
    });

    // Register the code architect function
    server.tool(
        'generateImplementationPlan',
        'Generates a detailed implementation plan based on code context and custom instructions',
        {
            codeContext: z.string().describe('The code context to analyze'),
            customInstructions: z
                .string()
                .describe('Custom instructions for the implementation plan'),
        },
        async (args) => {
            const { codeContext, customInstructions } = args;

            try {
                // Validate API key
                if (!ANTHROPIC_API_KEY) {
                    throw new Error(
                        'ANTHROPIC_API_KEY environment variable is not set',
                    );
                }

                // Create the prompt for Claude
                const prompt = `
                You are a code architect tasked with creating a detailed implementation plan.
                
                # Code Context
                ${codeContext}
                
                # Custom Instructions
                ${customInstructions}
                
                Based on the code context and custom instructions, please generate a detailed implementation plan that includes:
                
                1. A high-level overview of the implementation
                2. The key components and their responsibilities
                3. The data flow between components
                4. The API design (if applicable)
                5. Any important considerations or potential challenges
                6. A step-by-step implementation guide
                
                Format your response as a well-structured markdown document.
                `;

                // Call Claude to generate the implementation plan
                const response = await anthropic.messages.create({
                    model: 'claude-3-5-sonnet-latest',
                    max_tokens: 100000,
                    temperature: 0.2,
                    system: 'You are a code architect expert who creates detailed implementation plans based on code context and custom instructions.',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    stream: false,
                });

                // Extract the implementation plan from Claude's response
                const content = response.content[0];
                const implementationPlan =
                    typeof content === 'object' && 'text' in content
                        ? content.text
                        : '';

                const result: CodeArchitectResult = {
                    implementationPlan,
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
                console.error('Error generating implementation plan:', error);
                throw error;
            }
        },
    );

    // Set up server transport using Standard I/O
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log('MCP Code Architect server started');

    // Keep the server running
    return server;
}

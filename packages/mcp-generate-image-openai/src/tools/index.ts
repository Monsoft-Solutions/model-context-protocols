import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerImageGenerationTool } from './image-generation.js';

/**
 * Registers all tools with the MCP server
 * @param server - The MCP server instance
 * @param apiKey - OpenAI API key
 * @param imageKitConfig - Optional ImageKit configuration
 */
export function registerTools(
    server: McpServer,
    apiKey: string,
    imageKitConfig?: { publicKey: string; privateKey: string; urlEndpoint: string },
): void {
    registerImageGenerationTool(server, apiKey, imageKitConfig);
}

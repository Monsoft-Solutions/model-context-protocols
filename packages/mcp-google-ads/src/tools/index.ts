import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { KeywordResearchTool } from './keyword-research-tool.js';
import { GoogleAdsClient } from '../services/google-ads-client.js';
import { type Env } from '../config/env.js';

/**
 * Register all tools with the MCP server
 * @param server MCP server instance
 * @param env Environment configuration
 */
export function registerTools(server: McpServer, env: Env): void {
    // Initialize Google Ads client
    const googleAdsClient = new GoogleAdsClient(env);

    // Register keyword research tools
    KeywordResearchTool.register(server, googleAdsClient);
}

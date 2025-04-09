import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseService } from '../services/database-service.js';
import { QueryTool } from './query-tool.js';
import { SchemaTool } from './schema-tool.js';
import { InsertTool } from './insert-tool.js';
import { TableTool } from './table-tool.js';

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer, dbService: DatabaseService): void {
    // Register all tools
    QueryTool.register(server, dbService);
    InsertTool.register(server, dbService);
    SchemaTool.register(server, dbService);
    TableTool.register(server, dbService);
}

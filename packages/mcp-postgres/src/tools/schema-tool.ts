import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseService } from '../services/database-service.js';

export class SchemaTool {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    /**
     * Register the schema tool with the MCP server
     */
    static register(server: McpServer, dbService: DatabaseService): void {
        const tool = new SchemaTool(dbService);

        // Register the get schema tool
        server.tool('postgres-get-schema', {}, async (_args, _extra) => {
            try {
                const schema = await tool.getSchema();
                const schemaText = JSON.stringify(schema, null, 2);

                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Database schema retrieved successfully.',
                        },
                        {
                            type: 'text',
                            text: schemaText,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error retrieving schema: ${error.message}`,
                        },
                    ],
                };
            }
        });
    }

    /**
     * Get the database schema
     */
    async getSchema(): Promise<Record<string, any>> {
        return this.dbService.getSchema();
    }
}

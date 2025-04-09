import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseService } from '../services/database-service.js';

export class QueryTool {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    /**
     * Register the query tool with the MCP server
     */
    static register(server: McpServer, dbService: DatabaseService): void {
        const tool = new QueryTool(dbService);

        // Register the execute query tool
        server.tool(
            'postgres-execute-query',
            {
                query: z.string().min(1, 'SQL query is required'),
                params: z.array(z.any()).optional().default([]),
            },
            async ({ query, params }, extra) => {
                try {
                    const result = await tool.executeQuery(query, params);

                    // Convert to JSON string for the response
                    const jsonResult = JSON.stringify({
                        rows: result.rows,
                        rowCount: result.rowCount,
                        fields: result.fields.map((f: any) => ({
                            name: f.name,
                            dataTypeID: f.dataTypeID,
                        })),
                    });

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Query executed successfully. Rows affected: ${result.rowCount}`,
                            },
                            {
                                type: 'text',
                                text: jsonResult,
                            },
                        ],
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error executing query: ${error.message}`,
                            },
                        ],
                    };
                }
            },
        );
    }

    /**
     * Execute a SQL query against the Postgres database
     */
    async executeQuery(query: string, params: any[] = []): Promise<any> {
        return this.dbService.query(query, params);
    }
}

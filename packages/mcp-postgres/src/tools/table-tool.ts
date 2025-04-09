import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseService } from '../services/database-service.js';
import { DatabaseError } from '../errors/database-error.js';

export class TableTool {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    /**
     * Register the table tools with the MCP server
     */
    static register(server: McpServer, dbService: DatabaseService): void {
        const tool = new TableTool(dbService);

        // Register the list tables tool
        server.tool('postgres-list-tables', {}, async (_args, _extra) => {
            try {
                const tables = await tool.listTables();
                const tablesText = JSON.stringify(tables, null, 2);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Tables retrieved successfully. Count: ${tables.length}`,
                        },
                        {
                            type: 'text',
                            text: tablesText,
                        },
                    ],
                };
            } catch (error: any) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error retrieving tables: ${error.message}`,
                        },
                    ],
                };
            }
        });

        // Register the get table details tool
        server.tool(
            'postgres-get-table-details',
            {
                table: z.string().min(1, 'Table name is required'),
                includeConstraints: z.boolean().optional().default(true),
                includeIndexes: z.boolean().optional().default(true),
            },
            async ({ table, includeConstraints, includeIndexes }, _extra) => {
                try {
                    const details = await tool.getTableDetails(table, { includeConstraints, includeIndexes });
                    const detailsText = JSON.stringify(details, null, 2);

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Table details for '${table}' retrieved successfully.`,
                            },
                            {
                                type: 'text',
                                text: detailsText,
                            },
                        ],
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error retrieving table details: ${error.message}`,
                            },
                        ],
                    };
                }
            },
        );
    }

    /**
     * List all tables in the database
     * @returns Array of table names and basic info
     */
    async listTables(): Promise<any[]> {
        try {
            const query = `
                SELECT 
                    table_name,
                    table_type,
                    table_schema,
                    (SELECT count(*) FROM information_schema.columns 
                     WHERE table_name = t.table_name AND table_schema = t.table_schema) as column_count
                FROM 
                    information_schema.tables t
                WHERE 
                    table_schema = 'public'
                ORDER BY 
                    table_name
            `;

            const result = await this.dbService.query(query);
            return result.rows;
        } catch (error: any) {
            throw new DatabaseError(
                error.message || 'Failed to list tables',
                error.code || 'UNKNOWN_ERROR',
                error.detail || '',
            );
        }
    }

    /**
     * Get detailed information about a specific table
     * @param tableName Name of the table
     * @param options Options for including additional details
     * @returns Table structure details including columns and optionally constraints and indexes
     */
    async getTableDetails(
        tableName: string,
        options: { includeConstraints?: boolean; includeIndexes?: boolean } = {},
    ): Promise<any> {
        const { includeConstraints = true, includeIndexes = true } = options;

        try {
            // Get table columns
            const columnsQuery = `
                SELECT 
                    column_name, 
                    data_type, 
                    character_maximum_length,
                    is_nullable,
                    column_default,
                    ordinal_position
                FROM 
                    information_schema.columns 
                WHERE 
                    table_schema = 'public' AND 
                    table_name = $1
                ORDER BY 
                    ordinal_position
            `;

            const columnsResult = await this.dbService.query(columnsQuery, [tableName]);

            // Check if table exists
            if (columnsResult.rows.length === 0) {
                throw new DatabaseError(`Table '${tableName}' not found`, 'TABLE_NOT_FOUND', '');
            }

            const tableDetails: any = {
                name: tableName,
                columns: columnsResult.rows,
            };

            // Get primary key info
            if (includeConstraints) {
                const constraintsQuery = `
                    SELECT 
                        con.conname as constraint_name,
                        con.contype as constraint_type,
                        CASE 
                            WHEN con.contype = 'p' THEN 'PRIMARY KEY'
                            WHEN con.contype = 'f' THEN 'FOREIGN KEY'
                            WHEN con.contype = 'u' THEN 'UNIQUE'
                            WHEN con.contype = 'c' THEN 'CHECK'
                            ELSE con.contype::text
                        END as constraint_type_desc,
                        array_agg(att.attname) as column_names,
                        CASE 
                            WHEN con.contype = 'f' THEN (
                                SELECT relname FROM pg_class WHERE oid = con.confrelid
                            )
                            ELSE NULL
                        END as referenced_table
                    FROM 
                        pg_constraint con
                        JOIN pg_class rel ON rel.oid = con.conrelid
                        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
                        JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
                    WHERE 
                        nsp.nspname = 'public' AND
                        rel.relname = $1
                    GROUP BY 
                        con.conname, con.contype, con.confrelid
                    ORDER BY 
                        con.contype, con.conname
                `;

                const constraintsResult = await this.dbService.query(constraintsQuery, [tableName]);
                tableDetails.constraints = constraintsResult.rows;
            }

            // Get index info
            if (includeIndexes) {
                const indexesQuery = `
                    SELECT 
                        idx.indexname as index_name,
                        idx.indexdef as index_definition,
                        CASE 
                            WHEN idx.indexdef LIKE '%UNIQUE INDEX%' THEN true
                            ELSE false
                        END as is_unique
                    FROM 
                        pg_indexes idx
                    WHERE 
                        idx.schemaname = 'public' AND
                        idx.tablename = $1
                    ORDER BY 
                        idx.indexname
                `;

                const indexesResult = await this.dbService.query(indexesQuery, [tableName]);
                tableDetails.indexes = indexesResult.rows;
            }

            return tableDetails;
        } catch (error: any) {
            if (error instanceof DatabaseError) {
                throw error;
            }

            throw new DatabaseError(
                error.message || `Failed to get details for table '${tableName}'`,
                error.code || 'UNKNOWN_ERROR',
                error.detail || '',
            );
        }
    }
}

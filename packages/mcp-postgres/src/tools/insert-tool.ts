import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseService } from '../services/database-service.js';
import { DatabaseError } from '../errors/database-error.js';

export class InsertTool {
    private dbService: DatabaseService;

    constructor(dbService: DatabaseService) {
        this.dbService = dbService;
    }

    /**
     * Register the insert tool with the MCP server
     */
    static register(server: McpServer, dbService: DatabaseService): void {
        const tool = new InsertTool(dbService);

        // Register the insert data tool
        server.tool(
            'postgres-insert-data',
            {
                table: z.string().min(1, 'Table name is required'),
                data: z.array(z.record(z.any())).min(1, 'At least one record is required'),
                returnFields: z.array(z.string()).optional().default([]),
            },
            async ({ table, data, returnFields }, _extra) => {
                try {
                    const result = await tool.insertData(table, data, returnFields);

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
                                text: `Data inserted successfully. Rows affected: ${result.rowCount}`,
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
                                text: `Error inserting data: ${error.message}`,
                            },
                        ],
                    };
                }
            },
        );

        // Register the batch insert data tool
        server.tool(
            'postgres-batch-insert-data',
            {
                table: z.string().min(1, 'Table name is required'),
                data: z.array(z.record(z.any())).min(1, 'At least one record is required'),
                returnFields: z.array(z.string()).optional().default([]),
            },
            async ({ table, data, returnFields }, _extra) => {
                try {
                    const result = await tool.batchInsertData(table, data, returnFields);

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
                                text: `Batch data inserted successfully. Rows affected: ${result.rowCount}`,
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
                                text: `Error batch inserting data: ${error.message}`,
                            },
                        ],
                    };
                }
            },
        );
    }

    /**
     * Insert data into a table with transaction support
     * @param table Table name
     * @param data Array of records to insert
     * @param returnFields Fields to return after insertion
     * @returns Query result
     */
    async insertData(table: string, data: Record<string, any>[], returnFields: string[] = []): Promise<any> {
        let result: any;

        try {
            // Begin transaction
            await this.dbService.query('BEGIN');

            // Generate INSERT query for each record
            for (const record of data) {
                const columns = Object.keys(record);
                const values = Object.values(record);
                const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

                let query = `INSERT INTO ${table} (${columns.join(', ')})`;
                query += ` VALUES (${placeholders})`;

                // Add RETURNING clause if returnFields are specified
                if (returnFields.length > 0) {
                    query += ` RETURNING ${returnFields.join(', ')}`;
                }

                result = await this.dbService.query(query, values);
            }

            // Commit transaction
            await this.dbService.query('COMMIT');

            return result;
        } catch (error: any) {
            // Rollback transaction
            await this.dbService.query('ROLLBACK');

            throw new DatabaseError(
                error.message || 'Failed to insert data',
                error.code || 'UNKNOWN_ERROR',
                error.detail || '',
            );
        }
    }

    /**
     * Batch insert data into a table using a single query with multiple VALUES sets
     * This is more efficient for inserting large amounts of data
     * @param table Table name
     * @param data Array of records to insert
     * @param returnFields Fields to return after insertion
     * @returns Query result
     */
    async batchInsertData(table: string, data: Record<string, any>[], returnFields: string[] = []): Promise<any> {
        if (!data.length) {
            throw new DatabaseError('No data provided for batch insert', 'INVALID_PARAMETER', '');
        }

        try {
            // Ensure all records have the same structure
            const firstRecord = data[0];
            const columns = Object.keys(firstRecord);

            // Validate that all records have the same columns
            for (let i = 1; i < data.length; i++) {
                const recordColumns = Object.keys(data[i]);
                if (recordColumns.length !== columns.length || !columns.every((col) => recordColumns.includes(col))) {
                    throw new DatabaseError(
                        'All records must have the same columns for batch insert',
                        'INVALID_PARAMETER',
                        '',
                    );
                }
            }

            // Build the parameterized query
            let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES `;
            const allValues: any[] = [];
            const valueSets: string[] = [];

            // Create parameter placeholders for each record
            data.forEach((record, recordIndex) => {
                const recordValues = columns.map((col) => record[col]);
                const paramStartIndex = recordIndex * columns.length + 1;
                const placeholders = columns.map((_, colIndex) => `$${paramStartIndex + colIndex}`);

                valueSets.push(`(${placeholders.join(', ')})`);
                allValues.push(...recordValues);
            });

            query += valueSets.join(', ');

            // Add RETURNING clause if returnFields are specified
            if (returnFields.length > 0) {
                query += ` RETURNING ${returnFields.join(', ')}`;
            }

            // Execute the batch insert
            const result = await this.dbService.query(query, allValues);

            return result;
        } catch (error: any) {
            // Rollback transaction
            await this.dbService.query('ROLLBACK');

            throw new DatabaseError(
                error.message || 'Failed to batch insert data',
                error.code || 'UNKNOWN_ERROR',
                error.detail || '',
            );
        }
    }
}

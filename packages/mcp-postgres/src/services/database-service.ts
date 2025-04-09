import postgres from 'postgres';
import { DatabaseError } from '../errors/database-error.js';

export interface DatabaseConfig {
    connectionString: string;
    ssl?: boolean;
}

// Define interfaces we need
interface QueryResultRow {
    [column: string]: any;
}

/**
 * Extended QueryResult interface to match our previous API
 */
interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    fields: {
        name: string;
        dataTypeID: number;
    }[];
}

/**
 * Service for handling Postgres database connections and operations
 */
export class DatabaseService {
    private sql: postgres.Sql;

    constructor(config: DatabaseConfig) {
        this.sql = postgres(config.connectionString, {
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
            onnotice: () => {}, // Silence notices
            debug: false, // Disable debug logging
        });
    }

    /**
     * Execute a query with parameters
     * @param query SQL query string
     * @param params Query parameters
     * @returns Query result
     */
    async query<T extends QueryResultRow = any>(query: string, params: any[] = []): Promise<QueryResult<T>> {
        try {
            // Create a template literal dynamically using the query and params
            // This is needed because postgres package uses tagged template literals
            const result: T[] = await this.sql.unsafe(query, params);

            // Construct result to match expected interface
            return {
                rows: result,
                rowCount: result.length,
                command: '', // Not easily available with postgres package
                fields: Object.keys(result[0] || {}).map((name) => ({
                    name,
                    dataTypeID: 0, // Not easily available with postgres package
                })),
            };
        } catch (error: any) {
            throw new DatabaseError(
                error.message || 'Database query failed',
                error.code || 'UNKNOWN_ERROR',
                error.detail || '',
            );
        }
    }

    /**
     * Get database schema information
     * @returns Object containing tables and their schemas
     */
    async getSchema(): Promise<Record<string, any>> {
        try {
            // Get tables
            const tablesQuery = `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `;

            const tables = await this.sql.unsafe(tablesQuery);

            const schema: Record<string, any> = {};

            // For each table, get columns
            for (const table of tables) {
                const tableName = table.table_name;

                const columnsQuery = `
                    SELECT 
                        column_name, 
                        data_type, 
                        is_nullable,
                        column_default
                    FROM 
                        information_schema.columns 
                    WHERE 
                        table_schema = 'public' AND 
                        table_name = $1
                    ORDER BY 
                        ordinal_position
                `;

                const columns = await this.sql.unsafe(columnsQuery, [tableName]);
                schema[tableName] = columns;
            }

            return schema;
        } catch (error: any) {
            throw new DatabaseError('Failed to get database schema', error.code || 'UNKNOWN_ERROR', error.detail || '');
        }
    }

    /**
     * Close all database connections
     */
    async close(): Promise<void> {
        await this.sql.end();
    }
}

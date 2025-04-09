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

            const columnsResult = await this.query(columnsQuery, [tableName]);

            // Check if table exists
            if (columnsResult.rows.length === 0) {
                throw new DatabaseError(`Table '${tableName}' not found`, 'TABLE_NOT_FOUND', '');
            }

            const tableDetails: any = {
                name: tableName,
                columns: columnsResult.rows,
            };

            // Get constraint info
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

                const constraintsResult = await this.query(constraintsQuery, [tableName]);
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

                const indexesResult = await this.query(indexesQuery, [tableName]);
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

    /**
     * Close all database connections
     */
    async close(): Promise<void> {
        await this.sql.end();
    }
}

import pkg from 'pg';
import { DatabaseError } from '../errors/database-error.js';

export interface DatabaseConfig {
    connectionString: string;
    ssl?: boolean;
}

// Define interfaces we need
interface QueryResultRow {
    [column: string]: any;
}

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
    private pool: any;

    constructor(config: DatabaseConfig) {
        const { Pool } = pkg;
        this.pool = new Pool({
            connectionString: config.connectionString,
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        });

        // Handle pool errors
        this.pool.on('error', (err: Error) => {
            console.error('Unexpected error on idle client', err);
        });
    }

    /**
     * Execute a query with parameters
     * @param query SQL query string
     * @param params Query parameters
     * @returns Query result
     */
    async query<T extends QueryResultRow = any>(query: string, params: any[] = []): Promise<QueryResult<T>> {
        let client: any = null;

        try {
            client = await this.pool.connect();
            const result = await client.query(query, params);
            return result;
        } catch (error: any) {
            throw new DatabaseError(error.message || 'Database query failed', error.code, error.detail);
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    /**
     * Get database schema information
     * @returns Object containing tables and their schemas
     */
    async getSchema(): Promise<Record<string, any>> {
        try {
            // Get tables
            const tablesResult = await this.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

            const schema: Record<string, any> = {};

            // For each table, get columns
            for (const table of tablesResult.rows) {
                const tableName = table.table_name;

                const columnsResult = await this.query(
                    `
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
        `,
                    [tableName],
                );

                schema[tableName] = columnsResult.rows;
            }

            return schema;
        } catch (error: any) {
            throw new DatabaseError('Failed to get database schema', error.code, error.detail);
        }
    }

    /**
     * Close all database connections
     */
    async close(): Promise<void> {
        await this.pool.end();
    }
}

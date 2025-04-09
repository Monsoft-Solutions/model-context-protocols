import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DatabaseService } from '../services/database-service.js';
import { ListResourcesRequestSchema } from '@modelcontextprotocol/sdk/types.js';

/**
 * Register Postgres resources with the MCP server
 * @param server - MCP server instance
 * @param dbService - Database service instance
 */
export function registerResources(server: McpServer, dbService: DatabaseService): void {
    // Register table listing resource
    server.resource('postgres-tables', 'postgres://database/tables', async (uri) => {
        try {
            const schema = await dbService.getSchema();
            const tableNames = Object.keys(schema);

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(tableNames, null, 2),
                    },
                ],
            };
        } catch (error) {
            console.error('Error retrieving database tables:', error);
            throw new Error(
                `Failed to retrieve database tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    });

    // Register table schema resource
    server.resource('postgres-table-schema', 'postgres://database/tables/{tableName}/schema', async (uri) => {
        try {
            // Extract table name from the URI
            const match = uri.pathname.match(/\/tables\/([^\/]+)\/schema$/);
            if (!match) {
                throw new Error('Invalid URI format');
            }

            const tableName = decodeURIComponent(match[1]);
            if (!tableName) {
                throw new Error('Table name is required');
            }

            const schema = await dbService.getSchema();

            if (!schema[tableName]) {
                throw new Error(`Table '${tableName}' not found`);
            }

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(schema[tableName], null, 2),
                    },
                ],
            };
        } catch (error) {
            console.error(`Error retrieving schema for table:`, error);
            throw new Error(
                `Failed to retrieve schema for table: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    });

    // Register detailed table information resource
    server.resource('postgres-table-details', 'postgres://database/tables/{tableName}/details', async (uri) => {
        try {
            // Extract table name from the URI
            const match = uri.pathname.match(/\/tables\/([^\/]+)\/details$/);
            if (!match) {
                throw new Error('Invalid URI format');
            }

            const tableName = decodeURIComponent(match[1]);
            if (!tableName) {
                throw new Error('Table name is required');
            }

            // Use the getTableDetails method from DatabaseService
            const tableDetails = await dbService.getTableDetails(tableName, {
                includeConstraints: true,
                includeIndexes: true,
            });

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(tableDetails, null, 2),
                    },
                ],
            };
        } catch (error) {
            console.error(`Error retrieving details for table:`, error);
            throw new Error(
                `Failed to retrieve details for table: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    });

    // Register database size resource
    server.resource('postgres-database-size', 'postgres://database/size', async (uri) => {
        try {
            const sizeQuery = `
                    SELECT 
                        pg_size_pretty(pg_database_size(current_database())) AS database_size,
                        current_database() AS database_name
                `;

            const result = await dbService.query(sizeQuery);

            return {
                contents: [
                    {
                        uri: uri.href,
                        mimeType: 'application/json',
                        text: JSON.stringify(result.rows[0], null, 2),
                    },
                ],
            };
        } catch (error) {
            console.error('Error retrieving database size:', error);
            throw new Error(
                `Failed to retrieve database size: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    });

    // Register list handler for resources
    server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return {
            resources: [
                {
                    uri: 'postgres://database/tables',
                    name: 'PostgreSQL Tables',
                    description: 'List of all tables in the database',
                    mimeType: 'application/json',
                },
                {
                    uri: 'postgres://database/size',
                    name: 'PostgreSQL Database Size',
                    description: 'Size information of the current database',
                    mimeType: 'application/json',
                },
            ],
            resourceTemplates: [
                {
                    uriTemplate: 'postgres://database/tables/{tableName}/schema',
                    name: 'PostgreSQL Table Schema',
                    description: 'Schema for a specific database table',
                    mimeType: 'application/json',
                },
                {
                    uriTemplate: 'postgres://database/tables/{tableName}/details',
                    name: 'PostgreSQL Table Details',
                    description:
                        'Detailed information about a specific database table including constraints and indices',
                    mimeType: 'application/json',
                },
            ],
        };
    });
}

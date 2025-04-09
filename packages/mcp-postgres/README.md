# MCP Postgres

An MCP (Model Context Protocol) server that allows AI models to interact with PostgreSQL databases.

## Features

- Execute SQL queries against a Postgres database
- Retrieve database schema information
- Support for SSL connections
- Works with both stdio and SSE transports

## Installation

```bash
npm install @monsoft/mcp-postgres
```

## Configuration

The MCP Postgres server can be configured using environment variables or command line arguments:

| Environment Variable         | CLI Argument                | Description                                         | Required |
| ---------------------------- | --------------------------- | --------------------------------------------------- | -------- |
| `API_TOKEN`                  | `--token`, `-t`             | API Token for authentication                        | Yes      |
| `POSTGRES_CONNECTION_STRING` | `--connection-string`, `-c` | PostgreSQL connection string                        | Yes      |
| `RUN_SSE`                    | `--run-sse`, `-s`           | Run with SSE transport (default: false)             | No       |
| `PORT`                       | `--port`, `-p`              | Port for HTTP server when using SSE (default: 3000) | No       |

## Usage

### Starting the server

```bash
# Using stdio transport (default)
npx mcp-postgres --token=YOUR_TOKEN --connection-string="postgresql://user:password@localhost:5432/database"

# Using SSE transport
npx mcp-postgres --token=YOUR_TOKEN --connection-string="postgresql://user:password@localhost:5432/database" --run-sse --port=3000
```

### Example with environment variables

```bash
export API_TOKEN="your-api-token"
export POSTGRES_CONNECTION_STRING="postgresql://user:password@localhost:5432/database"
export RUN_SSE="true"
export PORT="3000"

npx mcp-postgres
```

## Available Tools

### postgres-execute-query

Executes a SQL query against the connected Postgres database.

Parameters:

- `query` (string): The SQL query to execute
- `params` (array, optional): Query parameters to use with parameterized queries

Example:

```sql
-- Simple query
SELECT * FROM users LIMIT 10;

-- Parameterized query
SELECT * FROM users WHERE email = $1;
-- With params: ["user@example.com"]
```

### postgres-get-schema

Retrieves the database schema information, including tables, columns, data types, etc.

This tool takes no parameters.

## Security Considerations

- The MCP server supports SSL connections to the Postgres database
- Only authenticated requests with a valid API token can use the MCP
- Do not expose the SSE server to untrusted networks

## Development

```bash
# Clone the repository
git clone https://github.com/Monsoft-Solutions/model-context-protocols.git

# Navigate to the package directory
cd packages/mcp-postgres

# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode
npm run watch
```

## License

MIT

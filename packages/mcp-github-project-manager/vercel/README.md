# GitHub Project Manager MCP Vercel Deployment

This directory contains the necessary files to deploy the GitHub Project Manager MCP to Vercel as a serverless function.

## Overview

The GitHub Project Manager MCP is deployed as a serverless function using Vercel. This allows you to run the MCP without managing servers and with the ability to scale automatically based on demand.

## Directory Structure

- `api/github-mcp.js` - The main API route handler for the MCP
- `api/tools-registration.js` - Registers all GitHub-related tools with the MCP server
- `utils/serverless-transport.js` - Custom transport implementation for SSE in serverless environments
- `../vercel.json` - Vercel configuration file for deployment

## Deployment Instructions

### Prerequisites

1. A Vercel account - Sign up at [vercel.com](https://vercel.com)
2. Vercel CLI installed - `npm install -g vercel`
3. A GitHub Personal Access Token with appropriate permissions

### Steps to Deploy

1. Set up your GitHub token as a Vercel secret:

    ```bash
    vercel secrets add github_personal_token "your-github-token-here"
    ```

2. Deploy to Vercel:

    ```bash
    cd packages/mcp-github-project-manager
    vercel
    ```

3. Follow the prompts to link your project to your Vercel account

4. For production deployment:

    ```bash
    vercel --prod
    ```

## Usage

Once deployed, the MCP will be available at the following endpoints:

- SSE Connection: `https://your-vercel-deployment.vercel.app/mcp/github-pm/sse`
- Messages: `https://your-vercel-deployment.vercel.app/mcp/github-pm/messages`

### Connecting to the MCP

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { HttpClientTransport } from '@modelcontextprotocol/sdk/client/http.js';

async function connectToMcp() {
    const client = new Client(
        {
            name: 'MCP GitHub Client',
            version: '1.0.0',
        },
        {
            capabilities: {},
        },
    );

    const domain = 'https://your-vercel-deployment.vercel.app';
    const transport = new HttpClientTransport({
        sseEndpoint: `${domain}/mcp/github-pm/sse`,
        postEndpoint: `${domain}/mcp/github-pm/messages`,
        // Add reconnection configuration for serverless environment
        reconnect: {
            enabled: true,
            maxAttempts: 10,
            initialDelay: 1000,
            maxDelay: 30000,
        },
    });

    await client.connect(transport);
    return client;
}

// Example usage
async function createGitHubIssue() {
    const client = await connectToMcp();
    const result = await client.executeTool('create_issue', {
        owner: 'username',
        repo: 'repo-name',
        title: 'New issue created via MCP',
        body: 'This issue was created using the GitHub Project Manager MCP deployed on Vercel.',
    });

    console.log(result);
}
```

## Considerations for Serverless

- The maximum execution time for a Vercel serverless function is 60 seconds (on the Pro plan).
- Clients should implement reconnection logic for SSE connections.
- Keep-alive messages are sent every 30 seconds to prevent connection timeouts.
- The function is configured with 1024MB of memory.

## Troubleshooting

- If you encounter connection issues, check that your GitHub token has the necessary permissions.
- For persistent connection issues, consider adjusting the reconnection settings in your client.
- Vercel logs can be viewed through the Vercel dashboard or using `vercel logs`.

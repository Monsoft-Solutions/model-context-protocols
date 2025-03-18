# Deploying Multiple MCP SSE Servers with Vercel Serverless

This document provides a comprehensive guide on how to deploy and manage multiple Model Context Protocol (MCP) servers using Vercel's serverless infrastructure.

[TOC]

## Introduction

Vercel offers a powerful serverless platform ideal for deploying MCP SSE servers at scale. This architecture eliminates the need to manage individual ports or servers for your MCPs, while providing the following benefits:

- Global edge network deployment
- Auto-scaling based on demand
- Zero server maintenance
- Built-in CI/CD integration
- Simplified deployment process
- Cost-effectiveness (pay-per-use)

## Architecture Overview

### Vercel Serverless Architecture for MCPs

When using Vercel for MCP deployment, each MCP server is implemented as a serverless function that can be accessed through a specific route pattern:

```
                  ┌─────────────────────┐
                  │                     │
                  │  Vercel Edge Network│
                  │                     │
┌──────────────┐  │  ┌─────────────────┴─┐
│              │  │  │                    │
│   Client     │─────┤  API Routes        │
│   Requests   │  │  │  (Middleware)      │
│              │  │  │                    │
└──────────────┘  │  └─┬─────────────────┘
                  │    │
                  │    ▼
                  │  ┌──────────────────┐
                  │  │                  │
                  │  │ Serverless       │
                  │  │ Functions        │
                  │  │                  │
                  │  └───┬──────┬───────┘
                  │      │      │
                  └──────┼──────┼────────┘
                         │      │
                         ▼      ▼
                    ┌─────┐  ┌─────┐
                    │ MCP │  │ MCP │
                    │  A  │  │  B  │
                    └─────┘  └─────┘
```

### Key Components

1. **API Routes**: Vercel's API routes handle the routing of requests to the appropriate MCP serverless function.
2. **Middleware**: Handles authentication, logging, and request preprocessing.
3. **Serverless Functions**: Each MCP is implemented as a separate serverless function.
4. **Edge Config**: Store configuration for your MCPs in Vercel's Edge Config.
5. **Edge Network**: Vercel's global CDN ensures low-latency access worldwide.

## Implementation Guide

### Project Structure

A typical Vercel project for multiple MCPs would be structured as follows:

```
project-root/
├── api/
│   ├── mcp/
│   │   ├── github-pm.js       # GitHub Project Manager MCP
│   │   ├── eraser.js          # Eraser Diagram MCP
│   │   └── code-architect.js  # Code Architect MCP
│   └── _middleware.js         # Common middleware for all MCPs
├── lib/
│   ├── mcp/
│   │   ├── github-pm/         # GitHub PM MCP implementation
│   │   ├── eraser/            # Eraser MCP implementation
│   │   └── code-architect/    # Code Architect MCP implementation
│   └── middleware/            # Middleware utilities
├── utils/
│   ├── registry.js            # MCP registry utilities
│   └── sse.js                 # SSE helper functions
├── vercel.json                # Vercel configuration
└── package.json
```

### Vercel Configuration

Create a `vercel.json` file to configure your deployments:

```json
{
    "version": 2,
    "functions": {
        "api/mcp/*.js": {
            "memory": 1024,
            "maxDuration": 60
        }
    },
    "routes": [
        {
            "src": "/mcp/github-pm/(.*)",
            "dest": "/api/mcp/github-pm.js"
        },
        {
            "src": "/mcp/eraser/(.*)",
            "dest": "/api/mcp/eraser.js"
        },
        {
            "src": "/mcp/code-architect/(.*)",
            "dest": "/api/mcp/code-architect.js"
        },
        {
            "src": "/mcp/discovery",
            "dest": "/api/discovery.js"
        }
    ],
    "env": {
        "GITHUB_PERSONAL_TOKEN": "@github_personal_token",
        "ERASER_API_TOKEN": "@eraser_api_token"
    }
}
```

### SSE Implementation with Vercel Serverless

Implementing SSE with Vercel requires adapting the traditional SSE approach to work within serverless constraints:

#### 1. Handling Connection Timeouts

Vercel serverless functions have execution time limits (typically 10-60 seconds). For long-lived SSE connections, consider:

- Using connection reconnection strategies on the client
- Implementing a stateless SSE approach

#### 2. Stateless SSE Approach

```javascript
// Example structure (not actual implementation)
export default async function handler(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Create a temporary transport for this request
    const transport = new SSEServerTransport('/mcp/github-pm/messages', res);

    // Get or create MCP server instance
    const server = getOrCreateMcpServer();

    // Connect and handle the current exchange
    await server.connect(transport);

    // Note: The connection will naturally time out when the
    // serverless function reaches its execution limit
}
```

#### 3. Client-Side Reconnection

Clients must implement reconnection logic:

```javascript
function createEventSource(url) {
    const source = new EventSource(url);

    source.onopen = () => console.log('Connection opened');
    source.onerror = (error) => {
        console.error('EventSource error:', error);
        source.close();
        // Reconnect after delay
        setTimeout(() => createEventSource(url), 1000);
    };

    return source;
}
```

### MCP Implementation for Vercel Serverless

Each MCP is implemented as a separate API route handler:

#### Example API Route Structure

```javascript
// api/mcp/github-pm.js - Structure guide, not actual code
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createServerlessTransport } from '../../utils/sse.js';

// Initialize service dependencies
const initServices = (token) => {
    // Initialize and return MCP services
};

export default async function handler(req, res) {
    // Handle different HTTP methods
    if (req.method === 'GET' && req.url.endsWith('/sse')) {
        // SSE endpoint
        setupSSEConnection(req, res);
    } else if (req.method === 'POST' && req.url.endsWith('/messages')) {
        // Message handling endpoint
        handleSSEMessage(req, res);
    } else {
        // Other API endpoints for this MCP
        handleApiRequest(req, res);
    }
}

async function setupSSEConnection(req, res) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const token = process.env.GITHUB_PERSONAL_TOKEN;
    const services = initServices(token);

    // Create server and transport
    const server = new McpServer({
        name: 'MCP GitHub Project Manager',
        version: '1.0.0',
    });

    // Register tools
    registerGitHubTools(server, services);

    // Create transport and connect
    const transport = createServerlessTransport(res);
    await server.connect(transport);
}
```

## Dynamic MCP Registration with Vercel

### Using Edge Config for MCP Registry

Vercel provides Edge Config for storing configuration that can be accessed from the edge network:

```javascript
// utils/registry.js - Structure guide, not actual code
import { createClient } from '@vercel/edge-config';

const edgeConfig = createClient(process.env.EDGE_CONFIG);

export async function registerMcp(mcpInfo) {
    const mcps = (await edgeConfig.get('mcps')) || [];
    mcps.push({
        ...mcpInfo,
        registeredAt: new Date().toISOString(),
    });
    await edgeConfig.set('mcps', mcps);
    return mcpInfo;
}

export async function getMcps() {
    return (await edgeConfig.get('mcps')) || [];
}
```

### Discovery API

Create a discovery endpoint to list available MCPs:

```javascript
// api/discovery.js - Structure guide, not actual code
import { getMcps } from '../utils/registry.js';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const mcps = await getMcps();
        res.status(200).json({ mcps });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
```

## Sharing State Between Invocations

To maintain state between serverless function invocations, consider these options:

### 1. External Database

Use a database like MongoDB, Redis, or Vercel's KV store for persisting state:

```javascript
// Example of using KV store (structure guide, not actual code)
import { kv } from '@vercel/kv';

async function getSessionState(sessionId) {
    return await kv.get(`session:${sessionId}`);
}

async function setSessionState(sessionId, state) {
    await kv.set(`session:${sessionId}`, state);
}
```

### 2. Client-Side State Management

Pass necessary state in client requests to maintain context:

```javascript
// Client example - structure guide, not actual code
async function sendMessage(message, sessionContext) {
    const response = await fetch('/mcp/github-pm/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            context: sessionContext, // Send context with each request
        }),
    });

    const data = await response.json();
    // Update session context
    return { data, context: data.newContext };
}
```

## Authentication and Authorization

Secure your MCPs using Vercel's built-in authentication options:

### 1. API Route Authentication

```javascript
// middleware.js - Structure guide, not actual code
import { NextResponse } from 'next/server';

export function middleware(request) {
    // Check for authentication token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Validate token
    const token = authHeader.split(' ')[1];
    if (!isValidToken(token)) {
        return new NextResponse(JSON.stringify({ error: 'Invalid token' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/mcp/:path*',
};
```

### 2. Third-Party Auth Providers

Integrate with providers like Auth0, Clerk, or NextAuth.js for more comprehensive authentication.

## Monitoring and Logging

Leverage Vercel's built-in monitoring tools:

1. **Vercel Analytics** for tracking endpoint usage
2. **Vercel Logs** for real-time log access
3. **Integration with third-party observability tools** like Datadog or New Relic

### Example Custom Logging Middleware

```javascript
// logging middleware - Structure guide, not actual code
export function loggerMiddleware(req, res, next) {
    const start = Date.now();

    // Add response interceptor to capture response data
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;

        // Log request details
        console.log({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
        });

        return originalEnd.apply(this, args);
    };

    next();
}
```

## Scaling Considerations

### 1. Concurrent Connections

Vercel has limits on concurrent connections. Plan accordingly by:

- Implementing proper connection backoff strategies
- Using client-side connection pooling
- Adding retry logic with exponential backoff

### 2. Cold Starts

Mitigate cold start latency by:

- Keeping functions warm with scheduled pings
- Optimizing function size and dependencies
- Using edge functions for time-sensitive operations

### 3. Function Size

Optimize your deployment package:

- Use tree-shaking to eliminate unused code
- Externalize large dependencies
- Implement code splitting for different MCP functionalities

## Client Configuration

Clients need to be configured to work with the Vercel-deployed MCPs:

```javascript
// Client example - Structure guide, not actual code
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { HttpClientTransport } from '@modelcontextprotocol/sdk/client/http.js';

async function connectToVercelMcp(mcpPath) {
    const client = new Client(
        {
            name: 'MCP Client',
            version: '1.0.0',
        },
        {
            capabilities: {},
        },
    );

    const domain = 'https://your-vercel-deployment.vercel.app';
    const transport = new HttpClientTransport({
        sseEndpoint: `${domain}${mcpPath}/sse`,
        postEndpoint: `${domain}${mcpPath}/messages`,
        // Add reconnection configuration
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

// Usage example
async function useMcps() {
    const githubMcp = await connectToVercelMcp('/mcp/github-pm');
    const result = await githubMcp.executeTool('create_issue', {
        // Tool parameters
    });

    console.log(result);
}
```

## Environment Secrets Management

Secure your tokens and secrets using Vercel's environment variable system:

1. Add secrets via the Vercel dashboard or CLI:

    ```bash
    vercel secrets add github-token "your-token-here"
    ```

2. Reference secrets in your `vercel.json` file:
    ```json
    "env": {
      "GITHUB_PERSONAL_TOKEN": "@github-token"
    }
    ```

## Deployment Workflow

### 1. Initial Setup

```bash
# Initialize your project
npm init -y
npm install @modelcontextprotocol/sdk express

# Install Vercel CLI
npm install -g vercel

# Link project to Vercel
vercel
```

### 2. Development Workflow

1. Develop and test locally:

    ```bash
    vercel dev
    ```

2. Preview deployment:

    ```bash
    vercel
    ```

3. Production deployment:
    ```bash
    vercel --prod
    ```

## Troubleshooting

### Common Issues and Solutions

1. **Connection Timeouts**

    - Problem: SSE connections timing out
    - Solution: Implement client-side reconnection and stateless server design

2. **Function Execution Limits**

    - Problem: Vercel functions limited to 10-60 seconds execution time
    - Solution: Design MCPs to complete operations within time limits

3. **Memory Limitations**

    - Problem: Functions exceeding memory limits
    - Solution: Optimize code and use external storage for large data

4. **Cold Start Latency**
    - Problem: Initial request slowness
    - Solution: Implement warming strategies and optimize package size

## Best Practices

1. **Organize by Feature**: Structure your code by MCP feature, not technical layers

2. **Lightweight Dependencies**: Minimize dependencies to reduce cold start times

3. **Edge Config for Registry**: Use Vercel's Edge Config for MCP registry information

4. **Stateless Design**: Design your MCPs to be stateless and maintain state externally

5. **Graceful Degradation**: Implement fallback mechanisms for when services are unavailable

6. **Comprehensive Logging**: Log all critical operations for easier debugging

7. **Local Development**: Test thoroughly with `vercel dev` before deploying

8. **CI/CD Integration**: Set up GitHub actions for automated testing before deployment

## Conclusion

Deploying multiple MCP SSE servers using Vercel's serverless platform offers a scalable, maintenance-free solution that automatically handles many infrastructure concerns. By following the architecture and implementation patterns described in this guide, you can create a robust and efficient MCP deployment that scales with your needs.

Vercel's serverless approach is particularly well-suited for MCPs with intermittent usage patterns, as you'll only pay for actual usage rather than maintaining constantly running servers. This makes it an excellent choice for growing MCP ecosystems.

The path-based routing and global edge network provide low-latency access worldwide, while the built-in CI/CD and monitoring tools simplify the operational aspects of managing multiple MCPs.

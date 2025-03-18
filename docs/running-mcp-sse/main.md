# Running Multiple MCP SSE Servers

This documentation explains how to efficiently run multiple Model Context Protocol (MCP) servers using Server-Sent Events (SSE) behind a single domain.

[TOC]

## Introduction

When working with multiple MCP servers, each providing different functionalities, managing them individually becomes challenging as your ecosystem grows. This guide provides solutions for:

1. Running multiple MCP SSE servers behind a single domain
2. Dynamic registration and discovery of MCP servers
3. Efficient routing to the appropriate MCP service
4. Scaling your MCP infrastructure

## Architecture Overview

### Current Implementation Challenges

In the current implementation (as seen in `packages/mcp-github-project-manager/src/index.ts`), each MCP server:

- Runs on its own port (e.g., `PORT=3010`)
- Uses a dedicated endpoint for SSE connections (`/sse`)
- Handles its own message processing (`/messages`)

This approach becomes problematic when:

- You have many MCPs, requiring management of multiple ports
- You need to expose these services to the internet
- You want to add new MCPs dynamically without reconfiguring your entire setup

### Proposed Architecture

The recommended architecture uses an API Gateway pattern with path-based routing:

```
                                 ┌──────────────────┐
                                 │                  │
                                 │  MCP Server #1   │
                                 │  (GitHub PM)     │
┌──────────────┐    ┌─────────┐  │                  │
│              │    │         │──┼──────────────────┤
│   Client     │────┤  API    │  │                  │
│   Requests   │    │ Gateway │  │  MCP Server #2   │
│              │    │         │  │  (Eraser)        │
└──────────────┘    └─────────┘  │                  │
                         │       ├──────────────────┤
                         │       │                  │
                         └───────┤  MCP Server #3   │
                                 │  (Code Architect)│
                                 │                  │
                                 └──────────────────┘
```

## Implementation Options

### 1. Reverse Proxy with Nginx

Nginx can be configured to route requests based on URL paths to different MCP servers.

#### Sample Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-mcp-domain.com;

    # GitHub Project Manager MCP
    location /mcp/github-pm/ {
        proxy_pass http://localhost:3010/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # SSE specific config
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }

    # Eraser Diagram MCP
    location /mcp/eraser/ {
        proxy_pass http://localhost:3011/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # SSE specific config
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
    }

    # Add more MCPs as needed
    location /mcp/code-architect/ {
        proxy_pass http://localhost:3012/;
        # Similar configuration...
    }
}
```

### 2. API Gateway with Express.js

Create a centralized API Gateway using Express.js that routes requests to different MCP servers.

#### Example Implementation

```javascript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration for MCP servers
const mcpServers = [
    {
        path: '/mcp/github-pm',
        target: 'http://localhost:3010',
        name: 'GitHub Project Manager',
    },
    {
        path: '/mcp/eraser',
        target: 'http://localhost:3011',
        name: 'Eraser Diagram',
    },
    {
        path: '/mcp/code-architect',
        target: 'http://localhost:3012',
        name: 'Code Architect',
    },
];

// Register each MCP server
mcpServers.forEach((server) => {
    app.use(
        server.path,
        createProxyMiddleware({
            target: server.target,
            pathRewrite: {
                [`^${server.path}`]: '/',
            },
            changeOrigin: true,
            ws: true, // Support for WebSockets if needed
            onProxyRes: (proxyRes, req, res) => {
                // Handle SSE connections properly
                if (req.path === '/sse') {
                    proxyRes.headers['Cache-Control'] = 'no-cache';
                    proxyRes.headers['Connection'] = 'keep-alive';
                }
            },
        }),
    );

    console.log(`Registered MCP server: ${server.name} at path ${server.path}`);
});

// API endpoint for discovering available MCP servers
app.get('/mcp/discovery', (req, res) => {
    res.json({
        mcpServers: mcpServers.map((server) => ({
            name: server.name,
            path: server.path,
        })),
    });
});

app.listen(PORT, () => {
    console.log(`MCP API Gateway running on port ${PORT}`);
});
```

### 3. Containerized Approach with Docker and Docker Compose

Use Docker to containerize each MCP server and orchestrate them with Docker Compose.

#### Example Docker Compose Configuration

```yaml
version: '3'

services:
    api-gateway:
        image: nginx:latest
        ports:
            - '80:80'
        volumes:
            - ./nginx.conf:/etc/nginx/conf.d/default.conf
        depends_on:
            - github-pm
            - eraser-diagram
            - code-architect

    github-pm:
        build:
            context: ./packages/mcp-github-project-manager
        environment:
            - GITHUB_PERSONAL_TOKEN=${GITHUB_PERSONAL_TOKEN}
            - PORT=3010
            - RUN_SSE=1
        ports:
            - '3010:3010'

    eraser-diagram:
        build:
            context: ./packages/mcp-eraser-diagram
        environment:
            - ERASER_API_TOKEN=${ERASER_API_TOKEN}
            - PORT=3011
        ports:
            - '3011:3011'

    code-architect:
        build:
            context: ./packages/mcp-code-architect
        environment:
            - PORT=3012
        ports:
            - '3012:3012'
```

## Modifying Existing MCPs for Path-Based Routing

To support the gateway approach, you'll need to modify how your MCPs handle paths. Here's an example of how to update your MCP SSE implementation:

```typescript
import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export async function startGitHubProjectManagerServerSSE(token: string, port: number, basePath: string = '/') {
    // Create services and McpServer as before
    const server = new McpServer({
        name: 'MCP GitHub Project Manager',
        version: '1.0.0',
    });

    const app = express();

    // Register tools as before
    // ...

    let transport: SSEServerTransport | null = null;

    // Update paths to include the base path
    app.get(`${basePath}sse`, (_req: express.Request, res: express.Response) => {
        transport = new SSEServerTransport(`${basePath}messages`, res);
        server.connect(transport);
    });

    app.post(`${basePath}messages`, (req: express.Request, res: express.Response) => {
        if (transport) {
            transport.handlePostMessage(req, res);
        }
    });

    app.listen(port, () => {
        console.log(`MCP GitHub Project Manager server started on port ${port} with base path ${basePath}`);
    });

    return server;
}
```

## Dynamic MCP Registration System

For a more scalable approach, implement a dynamic registration system:

### 1. Registry Service

Create a central registry where MCPs can register themselves:

```typescript
// registry-service.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3100;
const registeredMcps = [];

// Register a new MCP
app.post('/register', (req, res) => {
    const { name, version, basePath, host, port } = req.body;

    const mcpInfo = {
        id: Date.now().toString(),
        name,
        version,
        basePath,
        endpoint: `${host}:${port}`,
        registeredAt: new Date().toISOString(),
    };

    registeredMcps.push(mcpInfo);
    console.log(`Registered new MCP: ${name} v${version} at ${host}:${port}${basePath}`);

    res.status(201).json(mcpInfo);
});

// Get all registered MCPs
app.get('/mcps', (req, res) => {
    res.json(registeredMcps);
});

app.listen(PORT, () => {
    console.log(`MCP Registry Service running on port ${PORT}`);
});
```

### 2. Dynamic Gateway Configuration

Update your API Gateway to fetch MCP configurations from the registry:

```typescript
// dynamic-gateway.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:3100';

// Function to set up proxy for an MCP
function setupMcpProxy(mcpInfo) {
    const { basePath, endpoint, name } = mcpInfo;

    app.use(
        basePath,
        createProxyMiddleware({
            target: `http://${endpoint}`,
            pathRewrite: {
                [`^${basePath}`]: '/',
            },
            changeOrigin: true,
            ws: true,
            onProxyRes: (proxyRes, req, res) => {
                if (req.path === '/sse') {
                    proxyRes.headers['Cache-Control'] = 'no-cache';
                    proxyRes.headers['Connection'] = 'keep-alive';
                }
            },
        }),
    );

    console.log(`Added proxy for MCP: ${name} at path ${basePath}`);
}

// Initial load of MCPs from registry
async function loadMcpsFromRegistry() {
    try {
        const response = await axios.get(`${REGISTRY_URL}/mcps`);
        const mcps = response.data;

        mcps.forEach((mcp) => setupMcpProxy(mcp));

        console.log(`Loaded ${mcps.length} MCPs from registry`);
    } catch (error) {
        console.error('Failed to load MCPs from registry:', error.message);
    }
}

// Load MCPs when starting up
loadMcpsFromRegistry();

// Endpoint to trigger refresh of MCP configurations
app.post('/refresh', async (req, res) => {
    await loadMcpsFromRegistry();
    res.json({ success: true, message: 'MCP configurations refreshed' });
});

app.listen(PORT, () => {
    console.log(`Dynamic MCP Gateway running on port ${PORT}`);
});
```

## Cloud Deployment Options

### 1. Kubernetes-Based Deployment

Deploy your MCP servers as a Kubernetes cluster with an Ingress controller:

```yaml
# Example Kubernetes Ingress configuration
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
    name: mcp-ingress
    annotations:
        nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
    rules:
        - host: mcp.yourdomain.com
          http:
              paths:
                  - path: /mcp/github-pm(/|$)(.*)
                    pathType: Prefix
                    backend:
                        service:
                            name: github-pm-service
                            port:
                                number: 80
                  - path: /mcp/eraser(/|$)(.*)
                    pathType: Prefix
                    backend:
                        service:
                            name: eraser-diagram-service
                            port:
                                number: 80
                  - path: /mcp/code-architect(/|$)(.*)
                    pathType: Prefix
                    backend:
                        service:
                            name: code-architect-service
                            port:
                                number: 80
```

### 2. Serverless Deployment with AWS Lambda + API Gateway

For a serverless approach, deploy your MCPs as Lambda functions and use AWS API Gateway:

```
API Gateway
    /mcp/github-pm/* -> Lambda A
    /mcp/eraser/* -> Lambda B
    /mcp/code-architect/* -> Lambda C
```

## Client Connection Updates

The client code needs to be updated to connect to the MCP servers through the gateway:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { HttpClientTransport } from '@modelcontextprotocol/sdk/client/http.js';

// Connect to an MCP through the gateway
async function connectToMcp(mcpPath) {
    const client = new Client({ name: 'YourClientName', version: '1.0.0' }, { capabilities: {} });

    const gateway = 'https://your-mcp-domain.com';
    const transport = new HttpClientTransport({
        sseEndpoint: `${gateway}${mcpPath}/sse`,
        postEndpoint: `${gateway}${mcpPath}/messages`,
    });

    await client.connect(transport);
    return client;
}

// Example usage
async function useMcpServices() {
    // Connect to GitHub Project Manager MCP
    const githubClient = await connectToMcp('/mcp/github-pm');
    const issueResult = await githubClient.executeTool('create_issue', {
        owner: 'username',
        repo: 'repo-name',
        title: 'New issue',
        body: 'Issue description',
    });

    // Connect to Eraser Diagram MCP
    const eraserClient = await connectToMcp('/mcp/eraser');
    const diagramResult = await eraserClient.executeTool('generate_diagram', {
        text: 'Create an ERD for a user management system',
    });
}
```

## Best Practices and Recommendations

1. **Use Base Path Configuration**: Always design your MCP servers to accept a configurable base path parameter.

2. **Health Checks**: Implement health check endpoints on each MCP for monitoring.

3. **Authentication and Authorization**: Implement a shared authentication system for securing your MCPs.

4. **Rate Limiting**: Apply rate limits at the gateway level to prevent abuse.

5. **Logging and Monitoring**: Implement centralized logging across all MCP services.

6. **Auto-scaling**: Configure your infrastructure to scale MCPs based on demand.

7. **Versioning**: Include version information in your API paths (e.g., `/mcp/v1/github-pm/`).

8. **Documentation**: Maintain a central documentation site for all available MCPs.

## Conclusion

By implementing a gateway pattern with path-based routing, you can efficiently run multiple MCP SSE servers behind a single domain. This approach provides flexibility, scalability, and ease of management as your MCP ecosystem grows.

The dynamic registration system further enhances this architecture by allowing new MCPs to be added without reconfiguring the entire system, making it well-suited for environments with a growing number of specialized MCPs.

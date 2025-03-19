# API Reference

[TOC]

This document provides a comprehensive reference for the MCP Online Platform API, including endpoint specifications, request/response formats, and usage examples.

## API Overview

The MCP Online Platform exposes a RESTful API for interacting with MCP services. All API endpoints are accessible via HTTPS and require authentication via JWT tokens or API keys.

### Base URL

```
https://api.mcpplatform.example.com/v1
```

### Authentication

All API requests must include authentication using one of the following methods:

**JWT Authentication (for web applications)**:

```
Authorization: Bearer <jwt_token>
```

**API Key Authentication (for programmatic access)**:

```
Authorization: ApiKey <api_key>
```

### Response Format

All API responses are returned in JSON format and include the following structure:

```json
{
    "success": true,
    "data": {
        /* Response data */
    },
    "meta": {
        /* Pagination information, etc. */
    }
}
```

For error responses:

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable error message",
        "details": {
            /* Additional error details */
        }
    }
}
```

## Authentication API

### Register User

Creates a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:

```json
{
    "email": "user@example.com",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe",
    "organizationName": "Example Org" // Optional
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user_123456",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe"
        }
    },
    "meta": {
        "message": "Verification email sent"
    }
}
```

### Login

Authenticates a user and returns a JWT token.

**Endpoint**: `POST /auth/login`

**Request Body**:

```json
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": "user_123456",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "developer"
        }
    },
    "meta": {
        "tokenExpires": 86400 // seconds
    }
}
```

### Refresh Token

Obtains a new JWT token using a refresh token.

**Endpoint**: `POST /auth/refresh`

**Request Body**:

```json
{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "meta": {
        "tokenExpires": 86400 // seconds
    }
}
```

### Logout

Invalidates the current token.

**Endpoint**: `POST /auth/logout`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {},
    "meta": {
        "message": "Successfully logged out"
    }
}
```

## MCP Services API

### List Available MCP Services

Retrieves all MCP services available to the user.

**Endpoint**: `GET /mcp/services`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `filter`: Filter by name or description

**Response**:

```json
{
    "success": true,
    "data": {
        "services": [
            {
                "id": "svc_123456",
                "name": "GitHub MCP",
                "description": "Provides access to GitHub repositories",
                "isConfigured": true,
                "version": "1.2.0"
            },
            {
                "id": "svc_789012",
                "name": "File System MCP",
                "description": "Access to file system operations",
                "isConfigured": false,
                "version": "1.0.0"
            }
        ]
    },
    "meta": {
        "pagination": {
            "total": 10,
            "page": 1,
            "limit": 20,
            "pages": 1
        }
    }
}
```

### Get MCP Service Details

Retrieves detailed information about a specific MCP service.

**Endpoint**: `GET /mcp/services/{serviceId}`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {
        "service": {
            "id": "svc_123456",
            "name": "GitHub MCP",
            "description": "Provides access to GitHub repositories",
            "isConfigured": true,
            "version": "1.2.0",
            "configSchema": {
                "type": "object",
                "properties": {
                    "githubToken": {
                        "type": "string",
                        "description": "GitHub personal access token"
                    },
                    "repositories": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "List of repositories to access"
                    }
                },
                "required": ["githubToken"]
            },
            "capabilities": ["fileAccess", "codeSearch", "issueManagement"]
        }
    },
    "meta": {}
}
```

### Configure MCP Service

Sets up or updates the configuration for an MCP service.

**Endpoint**: `POST /mcp/services/{serviceId}/configure`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Request Body**:

```json
{
    "config": {
        "githubToken": "ghp_1234567890abcdefghijklmnopqrstuvwxyz",
        "repositories": ["user/repo1", "user/repo2"]
    }
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "service": {
            "id": "svc_123456",
            "name": "GitHub MCP",
            "isConfigured": true,
            "status": "active"
        }
    },
    "meta": {
        "message": "Service configured successfully"
    }
}
```

## MCP Execution API

### Execute MCP Tool

Executes a tool provided by an MCP service.

**Endpoint**: `POST /mcp/execute/tool`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Request Body**:

```json
{
    "serviceId": "svc_123456",
    "toolName": "search_code",
    "parameters": {
        "query": "function calculateTotal",
        "repositories": ["user/repo1"]
    }
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "result": {
            "matches": [
                {
                    "file": "src/utils/calculator.js",
                    "line": 15,
                    "content": "function calculateTotal(items) {",
                    "repository": "user/repo1"
                },
                {
                    "file": "src/components/Cart.js",
                    "line": 42,
                    "content": "const calculateTotal = (items) => {",
                    "repository": "user/repo1"
                }
            ]
        },
        "executionTime": 0.235 // seconds
    },
    "meta": {
        "requestId": "req_abcdef123456"
    }
}
```

### Fetch MCP Resource

Retrieves a resource from an MCP service.

**Endpoint**: `POST /mcp/execute/resource`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Request Body**:

```json
{
    "serviceId": "svc_123456",
    "resourceName": "read_file",
    "parameters": {
        "path": "src/utils/calculator.js",
        "repository": "user/repo1"
    }
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "result": {
            "content": "// File content here\nfunction calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n",
            "mimeType": "text/javascript",
            "size": 125
        },
        "executionTime": 0.178 // seconds
    },
    "meta": {
        "requestId": "req_ghijkl789012"
    }
}
```

## User Management API

### Get User Profile

Retrieves the current user's profile information.

**Endpoint**: `GET /users/me`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "user_123456",
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe",
            "role": "developer",
            "organization": {
                "id": "org_789012",
                "name": "Example Org"
            },
            "createdAt": "2023-06-15T10:00:00Z",
            "lastLoginAt": "2023-07-01T14:30:00Z"
        }
    },
    "meta": {}
}
```

### List API Keys

Retrieves all API keys for the current user.

**Endpoint**: `GET /users/me/api-keys`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {
        "apiKeys": [
            {
                "id": "key_123456",
                "name": "Development API Key",
                "lastUsed": "2023-06-28T09:15:30Z",
                "createdAt": "2023-06-15T10:30:00Z",
                "expiresAt": "2024-06-15T10:30:00Z",
                "scopes": ["mcp:read", "mcp:write"]
            },
            {
                "id": "key_789012",
                "name": "CI/CD Integration",
                "lastUsed": "2023-06-30T16:45:22Z",
                "createdAt": "2023-06-20T14:00:00Z",
                "expiresAt": "2024-06-20T14:00:00Z",
                "scopes": ["mcp:read"]
            }
        ]
    },
    "meta": {}
}
```

### Create API Key

Creates a new API key for the current user.

**Endpoint**: `POST /users/me/api-keys`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Request Body**:

```json
{
    "name": "Production API Key",
    "expiresIn": 31536000, // 1 year in seconds
    "scopes": ["mcp:read"]
}
```

**Response**:

```json
{
    "success": true,
    "data": {
        "apiKey": {
            "id": "key_abcdef",
            "name": "Production API Key",
            "key": "mcp_sk_12345678901234567890", // Only returned once
            "createdAt": "2023-07-01T15:30:00Z",
            "expiresAt": "2024-07-01T15:30:00Z",
            "scopes": ["mcp:read"]
        }
    },
    "meta": {
        "message": "Store this API key securely; it won't be shown again."
    }
}
```

## Logging API

### List Request Logs

Retrieves logs of MCP requests made by the user.

**Endpoint**: `GET /logs/requests`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `serviceId`: Filter by service ID
- `status`: Filter by status (success, error)
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)

**Response**:

```json
{
    "success": true,
    "data": {
        "logs": [
            {
                "id": "log_123456",
                "serviceId": "svc_123456",
                "serviceName": "GitHub MCP",
                "operation": "search_code",
                "status": "success",
                "statusCode": 200,
                "durationMs": 235,
                "createdAt": "2023-07-01T14:35:22Z",
                "ipAddress": "192.168.1.1",
                "userAgent": "Mozilla/5.0 ..."
            },
            {
                "id": "log_789012",
                "serviceId": "svc_123456",
                "serviceName": "GitHub MCP",
                "operation": "read_file",
                "status": "success",
                "statusCode": 200,
                "durationMs": 178,
                "createdAt": "2023-07-01T14:36:01Z",
                "ipAddress": "192.168.1.1",
                "userAgent": "Mozilla/5.0 ..."
            }
        ]
    },
    "meta": {
        "pagination": {
            "total": 156,
            "page": 1,
            "limit": 20,
            "pages": 8
        }
    }
}
```

### Get Request Log Details

Retrieves detailed information about a specific request log.

**Endpoint**: `GET /logs/requests/{logId}`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {
        "log": {
            "id": "log_123456",
            "serviceId": "svc_123456",
            "serviceName": "GitHub MCP",
            "operation": "search_code",
            "status": "success",
            "statusCode": 200,
            "durationMs": 235,
            "createdAt": "2023-07-01T14:35:22Z",
            "ipAddress": "192.168.1.1",
            "userAgent": "Mozilla/5.0 ...",
            "request": {
                "serviceId": "svc_123456",
                "toolName": "search_code",
                "parameters": {
                    "query": "function calculateTotal",
                    "repositories": ["user/repo1"]
                }
            },
            "response": {
                "result": {
                    "matches": [
                        {
                            "file": "src/utils/calculator.js",
                            "line": 15,
                            "content": "function calculateTotal(items) {",
                            "repository": "user/repo1"
                        },
                        {
                            "file": "src/components/Cart.js",
                            "line": 42,
                            "content": "const calculateTotal = (items) => {",
                            "repository": "user/repo1"
                        }
                    ]
                },
                "executionTime": 0.235
            }
        }
    },
    "meta": {}
}
```

## Organization API

### Get Organization Details

Retrieves details about the user's organization.

**Endpoint**: `GET /organizations/me`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {
        "organization": {
            "id": "org_789012",
            "name": "Example Org",
            "plan": {
                "id": "plan_standard",
                "name": "Standard",
                "features": ["5 users", "10 MCP services", "1000 requests/day"]
            },
            "createdAt": "2023-06-15T10:00:00Z",
            "usersCount": 3,
            "servicesCount": 2
        }
    },
    "meta": {}
}
```

### List Organization Users

Retrieves all users in the organization (admin only).

**Endpoint**: `GET /organizations/me/users`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Response**:

```json
{
    "success": true,
    "data": {
        "users": [
            {
                "id": "user_123456",
                "email": "admin@example.com",
                "firstName": "John",
                "lastName": "Doe",
                "role": "admin",
                "createdAt": "2023-06-15T10:00:00Z",
                "lastLoginAt": "2023-07-01T14:30:00Z"
            },
            {
                "id": "user_789012",
                "email": "developer@example.com",
                "firstName": "Jane",
                "lastName": "Smith",
                "role": "developer",
                "createdAt": "2023-06-16T09:00:00Z",
                "lastLoginAt": "2023-06-30T11:45:00Z"
            }
        ]
    },
    "meta": {
        "pagination": {
            "total": 3,
            "page": 1,
            "limit": 20,
            "pages": 1
        }
    }
}
```

## Error Codes

| Code                       | Description                              | HTTP Status |
| -------------------------- | ---------------------------------------- | ----------- |
| `AUTH_INVALID_CREDENTIALS` | Invalid email or password                | 401         |
| `AUTH_TOKEN_EXPIRED`       | JWT token has expired                    | 401         |
| `AUTH_TOKEN_INVALID`       | JWT token is invalid                     | 401         |
| `AUTH_INSUFFICIENT_SCOPE`  | Token does not have required permissions | 403         |
| `RESOURCE_NOT_FOUND`       | Requested resource does not exist        | 404         |
| `VALIDATION_ERROR`         | Request validation failed                | 400         |
| `MCP_SERVICE_ERROR`        | Error in MCP service execution           | 500         |
| `MCP_SERVICE_UNCONFIGURED` | MCP service requires configuration       | 400         |
| `RATE_LIMIT_EXCEEDED`      | API rate limit exceeded                  | 429         |
| `INTERNAL_SERVER_ERROR`    | Unexpected server error                  | 500         |

## Pagination

For endpoints that return lists of items, pagination is supported using the following query parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page (default: 20, max: 100)

Pagination information is returned in the `meta.pagination` object:

```json
"meta": {
  "pagination": {
    "total": 156,    // Total number of items
    "page": 1,       // Current page
    "limit": 20,     // Items per page
    "pages": 8       // Total number of pages
  }
}
```

## Rate Limiting

API requests are subject to rate limiting to ensure fair usage and system stability. Rate limits are based on the user's subscription plan and are applied per API key or user.

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1625160000
```

When a rate limit is exceeded, the API returns a `429 Too Many Requests` response with a `RATE_LIMIT_EXCEEDED` error code.

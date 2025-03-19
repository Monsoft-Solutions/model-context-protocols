# Data Models

[TOC]

This document outlines the database schema and entity relationships for the MCP Online Platform. The platform uses Supabase (PostgreSQL) for data storage and is designed to support multi-tenancy, secure credential storage, and comprehensive logging.

## Database Schema Overview

```
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│     users         │       │   organizations   │       │    api_keys       │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id                │       │ id                │       │ id                │
│ email             │╠══════╣ name              │       │ key_hash          │
│ encrypted_password│       │ plan_id           │╠══════╣ user_id           │
│ organization_id   │       │ created_at        │       │ created_at        │
│ created_at        │       │ updated_at        │       │ expires_at        │
│ updated_at        │       │ settings          │       │ scopes            │
└───────────────────┘       └───────────────────┘       └───────────────────┘
        ║                             ║                          ║
        ║                             ║                          ║
        ▼                             ▼                          ▼
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│  user_tokens      │       │    mcp_services   │       │ request_logs      │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id                │       │ id                │       │ id                │
│ user_id           │       │ name              │       │ user_id           │
│ service_name      │       │ description       │       │ mcp_service_id    │
│ encrypted_token   │       │ organization_id   │       │ request_body      │
│ created_at        │       │ config            │       │ response_body     │
│ updated_at        │       │ created_at        │       │ status_code       │
│ last_used_at      │       │ updated_at        │       │ duration_ms       │
└───────────────────┘       └───────────────────┘       │ created_at        │
                                      ║                  │ ip_address        │
                                      ║                  │ user_agent        │
                                      ▼                  └───────────────────┘
                            ┌───────────────────┐
                            │ service_usage     │
                            ├───────────────────┤
                            │ id                │
                            │ mcp_service_id    │
                            │ organization_id   │
                            │ request_count     │
                            │ year              │
                            │ month             │
                            │ day               │
                            └───────────────────┘
```

## Entity Descriptions

### users

Stores user account information and authentication details.

| Field              | Type      | Description                          |
| ------------------ | --------- | ------------------------------------ |
| id                 | UUID      | Primary key                          |
| email              | TEXT      | User's email address (unique)        |
| encrypted_password | TEXT      | Hashed password                      |
| organization_id    | UUID      | Foreign key to organizations         |
| created_at         | TIMESTAMP | Account creation timestamp           |
| updated_at         | TIMESTAMP | Account last update timestamp        |
| role               | TEXT      | User role (admin, developer, viewer) |
| settings           | JSONB     | User-specific settings               |
| is_active          | BOOLEAN   | Account status flag                  |

### organizations

Represents companies or teams using the platform.

| Field         | Type      | Description                        |
| ------------- | --------- | ---------------------------------- |
| id            | UUID      | Primary key                        |
| name          | TEXT      | Organization name                  |
| plan_id       | TEXT      | Subscription plan identifier       |
| created_at    | TIMESTAMP | Organization creation timestamp    |
| updated_at    | TIMESTAMP | Organization last update timestamp |
| settings      | JSONB     | Organization-wide settings         |
| contact_email | TEXT      | Primary contact email              |
| billing_info  | JSONB     | Billing information                |

### api_keys

Stores API keys for authenticating API requests.

| Field        | Type      | Description                    |
| ------------ | --------- | ------------------------------ |
| id           | UUID      | Primary key                    |
| key_hash     | TEXT      | Hashed API key                 |
| user_id      | UUID      | Foreign key to users           |
| created_at   | TIMESTAMP | Key creation timestamp         |
| expires_at   | TIMESTAMP | Key expiration timestamp       |
| scopes       | TEXT[]    | Array of permission scopes     |
| name         | TEXT      | User-friendly name for the key |
| last_used_at | TIMESTAMP | Last usage timestamp           |

### user_tokens

Securely stores user-specific service tokens (e.g., GitHub tokens).

| Field           | Type      | Description                  |
| --------------- | --------- | ---------------------------- |
| id              | UUID      | Primary key                  |
| user_id         | UUID      | Foreign key to users         |
| service_name    | TEXT      | Name of the external service |
| encrypted_token | TEXT      | Encrypted access token       |
| created_at      | TIMESTAMP | Token creation timestamp     |
| updated_at      | TIMESTAMP | Token last update timestamp  |
| last_used_at    | TIMESTAMP | Last usage timestamp         |
| metadata        | JSONB     | Additional token metadata    |

### mcp_services

Defines the available MCP services in the platform.

| Field           | Type      | Description                                   |
| --------------- | --------- | --------------------------------------------- |
| id              | UUID      | Primary key                                   |
| name            | TEXT      | Service name                                  |
| description     | TEXT      | Service description                           |
| organization_id | UUID      | Owner organization (null for system services) |
| config          | JSONB     | Service configuration                         |
| created_at      | TIMESTAMP | Service creation timestamp                    |
| updated_at      | TIMESTAMP | Service last update timestamp                 |
| is_public       | BOOLEAN   | Whether the service is publicly available     |
| version         | TEXT      | Service version identifier                    |

### request_logs

Comprehensive logging of all MCP requests and responses.

| Field          | Type      | Description                                |
| -------------- | --------- | ------------------------------------------ |
| id             | UUID      | Primary key                                |
| user_id        | UUID      | Foreign key to users                       |
| mcp_service_id | UUID      | Foreign key to mcp_services                |
| request_body   | JSONB     | Request payload (sensitive data redacted)  |
| response_body  | JSONB     | Response payload (sensitive data redacted) |
| status_code    | INTEGER   | Response status code                       |
| duration_ms    | INTEGER   | Request processing time in milliseconds    |
| created_at     | TIMESTAMP | Request timestamp                          |
| ip_address     | TEXT      | Client IP address                          |
| user_agent     | TEXT      | Client user agent                          |
| error_message  | TEXT      | Error message (if applicable)              |

### service_usage

Aggregated usage metrics for billing and analytics.

| Field               | Type    | Description                                |
| ------------------- | ------- | ------------------------------------------ |
| id                  | UUID    | Primary key                                |
| mcp_service_id      | UUID    | Foreign key to mcp_services                |
| organization_id     | UUID    | Foreign key to organizations               |
| request_count       | INTEGER | Number of requests                         |
| year                | INTEGER | Year of usage                              |
| month               | INTEGER | Month of usage                             |
| day                 | INTEGER | Day of usage (null for monthly aggregates) |
| total_duration_ms   | INTEGER | Total processing time in milliseconds      |
| successful_requests | INTEGER | Count of successful requests               |
| failed_requests     | INTEGER | Count of failed requests                   |

## Entity Relationships

- **User to Organization**: Many-to-one relationship. Each user belongs to a single organization.
- **User to API Keys**: One-to-many relationship. A user can have multiple API keys.
- **User to User Tokens**: One-to-many relationship. A user can have multiple service tokens.
- **Organization to MCP Services**: One-to-many relationship. An organization can create multiple MCP services.
- **MCP Service to Request Logs**: One-to-many relationship. Each MCP service can have multiple request logs.
- **MCP Service to Service Usage**: One-to-many relationship. Usage metrics are tracked per service.

## Security Considerations

- **Token Encryption**: All service tokens are encrypted using AES-256 encryption before storage.
- **Password Hashing**: User passwords are hashed using bcrypt with appropriate work factors.
- **API Key Hashing**: API keys are stored as hashes, not in plaintext.
- **Data Redaction**: Sensitive data is redacted in request and response logs.
- **Row-Level Security**: Supabase RLS policies ensure users can only access their own data.
- **Audit Logs**: All changes to sensitive data are recorded in audit logs.

## Migration Strategy

1. **Initial Schema**: Deploy base tables for core functionality.
2. **Data Migration**: Migrate existing MCP configurations to the new database.
3. **Schema Evolution**: Implement version control for database schema changes.
4. **Backward Compatibility**: Maintain compatibility with existing MCP clients during transition.

## Performance Optimization

- **Indexes**: Strategic indexes on frequently queried fields:
    - `users(email)`
    - `user_tokens(user_id, service_name)`
    - `request_logs(user_id, created_at)`
    - `request_logs(mcp_service_id, created_at)`
    - `service_usage(organization_id, year, month)`
- **Partitioning**: Request logs table is partitioned by month for better query performance.
- **Materialized Views**: For complex analytics queries that are run frequently.
- **Caching Strategy**: Implement application-level caching for frequently accessed data.

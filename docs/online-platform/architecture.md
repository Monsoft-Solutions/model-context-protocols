# Architecture Overview

[TOC]

## System Architecture

The MCP Online Platform follows a layered architecture with clear separation of concerns to ensure scalability, maintainability, and security. The system is designed as a cloud-native application with the following key components:

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│   Client Apps     │     │   API Gateway     │     │   MCP Router      │
│                   │     │                   │     │                   │
└─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
          │                         │                         │
          │    JWT Auth             │                         │
          ▼                         ▼                         ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│                   │     │                   │     │                   │
│  Auth Service     │     │  MCP Services     │     │  Logging Service  │
│                   │     │                   │     │                   │
└─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘
          │                         │                         │
          │                         │                         │
          ▼                         ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         Supabase Database                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Client Applications**

    - VernisAI (primary client)
    - Future third-party applications
    - Admin dashboard

2. **API Gateway**

    - Authentication and authorization
    - Request routing
    - Rate limiting
    - Initial request validation

3. **MCP Router**

    - Routes requests to appropriate MCP service instances
    - Handles service discovery
    - Load balancing

4. **MCP Services**

    - Individual MCP implementations
    - Stateless design for horizontal scaling
    - Built with the MCP TypeScript SDK

5. **Auth Service**

    - User registration and login
    - JWT token issuance and validation
    - User profile management

6. **Logging Service**

    - Request/response logging
    - Audit trail
    - Performance metrics
    - Error tracking

7. **Supabase Database**
    - User credentials and profiles
    - MCP configuration data
    - Service-specific tokens and settings
    - Logging and metrics data

## Data Flow

### Authentication Flow

1. User registers or logs in through the Auth Service
2. Auth Service issues a JWT token with appropriate claims
3. Client includes JWT in subsequent API requests
4. API Gateway validates the JWT on each request
5. User-specific data is retrieved from Supabase based on the authenticated user ID

### MCP Request Flow

1. Client sends request to API Gateway with JWT
2. API Gateway validates the token and forwards to MCP Router
3. MCP Router identifies the appropriate MCP service
4. MCP Service retrieves user-specific tokens/configuration from Supabase
5. MCP Service processes the request and returns the response
6. Logging Service records the request/response details
7. Response is returned to the client

## Scalability Considerations

The architecture is designed with horizontal scalability in mind:

- **Stateless Services**: All components are designed to be stateless, allowing for horizontal scaling
- **Service Isolation**: MCP services are isolated, allowing independent scaling based on demand
- **Database Scaling**: Supabase provides built-in scalability for the database layer
- **Caching**: Implementation of response and token caching to reduce database load
- **Load Balancing**: MCP Router provides load balancing across MCP service instances

## Security Architecture

Security is implemented through multiple layers:

- **Authentication**: JWT-based authentication for all API requests
- **Authorization**: Role-based access control for different API endpoints
- **Data Encryption**: Encryption of sensitive data in the database
- **Token Management**: Secure storage and retrieval of service-specific tokens
- **Network Security**: Implementation of proper network segmentation and firewalls
- **Audit Logging**: Comprehensive logging of all security-related events

## Technology Stack

- **Backend**: Node.js with TypeScript
- **API Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with Supabase Auth
- **MCP Implementation**: MCP TypeScript SDK
- **Deployment**: Docker containers with Kubernetes orchestration
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring**: Prometheus and Grafana

## Future Extensions

The architecture is designed to support future enhancements:

- **Marketplace**: A marketplace for third-party MCP providers
- **Billing System**: Usage-based billing for MCP services
- **Advanced Analytics**: Detailed analytics on MCP usage patterns
- **Custom MCP Builder**: GUI for building custom MCPs without coding
- **Multi-Region Deployment**: Geographical distribution for lower latency

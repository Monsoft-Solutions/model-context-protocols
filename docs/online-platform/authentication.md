# Authentication Flow

[TOC]

This document outlines the authentication and authorization mechanisms used in the MCP Online Platform to secure user data and API endpoints.

## Authentication Overview

The platform implements a robust JWT (JSON Web Token) based authentication system leveraging Supabase Auth for user management and secure token handling. This approach provides stateless authentication with strong security guarantees while maintaining good performance.

```
┌───────────────┐                 ┌─────────────────┐                ┌─────────────────┐
│               │                 │                 │                │                 │
│     Client    │◀───Register─────│  Auth Service   │───Creates──────▶   User Record   │
│               │                 │                 │                │                 │
└───────┬───────┘                 └────────┬────────┘                └─────────────────┘
        │                                  │
        │                                  │
        │                                  │
        │                                  │
┌───────▼───────┐                 ┌────────▼────────┐
│               │                 │                 │
│  Login        │───Credentials───▶                 │
│               │                 │  Validate &     │
│               │◀───JWT Token────│  Issue Token    │
│               │                 │                 │
└───────┬───────┘                 └─────────────────┘
        │
        │
        │
┌───────▼───────┐                 ┌─────────────────┐                ┌─────────────────┐
│               │                 │                 │                │                 │
│  API Request  │────JWT Token────▶  Validate       │───Retrieve─────▶  User Data &    │
│  with JWT     │                 │  Token          │                │  Permissions    │
│               │                 │                 │                │                 │
└───────┬───────┘                 └────────┬────────┘                └─────────────────┘
        │                                  │
        │                                  │
        │                                  │
┌───────▼───────┐                 ┌────────▼────────┐
│               │                 │                 │
│  Process      │◀────Success─────│  Authorized     │
│  Request      │                 │  Request        │
│               │                 │                 │
└───────────────┘                 └─────────────────┘
```

## Registration Process

1. **User Registration**:

    - User provides email, password, and optional organization details
    - Server validates the input data
    - If validation passes, a new user record is created in the database
    - For organization administrators, a new organization record is also created
    - A confirmation email is sent to verify the user's email address

2. **Email Verification**:

    - User clicks the verification link in the email
    - The link contains a secure token that verifies the user's identity
    - Upon successful verification, the user's account is marked as verified

3. **Organization Setup** (for administrators):
    - After verification, administrators are prompted to complete organization setup
    - This includes providing organization details and setting up initial configuration

## Authentication Methods

The platform supports multiple authentication methods:

### 1. JWT-based Authentication

Used for web application and API access, this is the primary authentication method.

1. **Login Process**:

    - User provides email and password
    - Server validates credentials against the stored hash
    - If valid, a JWT token is generated with appropriate claims
    - Token is returned to the client for use in subsequent requests

2. **JWT Structure**:

    - **Header**: Contains the token type and signing algorithm
    - **Payload**: Contains claims about the user
        - `sub`: User ID
        - `email`: User email
        - `org`: Organization ID
        - `role`: User role (admin, developer, viewer)
        - `exp`: Expiration timestamp
        - `iat`: Issued at timestamp
    - **Signature**: Ensures token integrity

3. **Token Validation**:
    - Each API request includes the JWT in the Authorization header
    - Server validates the token signature and expiration
    - If valid, the request is processed using the claims in the token

### 2. API Key Authentication

For programmatic access to the API, especially for integrations and automated tools.

1. **API Key Generation**:

    - User generates an API key from the dashboard
    - Key is associated with specific scopes (permissions)
    - Only the hashed key is stored in the database
    - The full key is shown to the user only once

2. **API Key Usage**:
    - Client includes the API key in the Authorization header
    - Server validates the key against the stored hash
    - If valid, the request is processed using the associated user's permissions

## Authorization

Authorization is implemented through a role-based access control (RBAC) system:

### User Roles

1. **Organization Admin**:

    - Full access to all organization resources
    - Can manage users, API keys, and organization settings
    - Can create and manage MCP services

2. **Developer**:

    - Can use MCP services
    - Can manage personal API keys
    - Can view usage statistics and logs for relevant services

3. **Viewer**:
    - Read-only access to resources
    - Can use MCP services but cannot modify configuration

### Permission Scopes

API keys and JWT tokens include specific permission scopes that control access:

- `mcp:read`: Access to use MCP services
- `mcp:write`: Ability to create or modify MCP configurations
- `logs:read`: Access to read logs for relevant services
- `admin:users`: Ability to manage users (admin only)
- `admin:organization`: Ability to manage organization settings (admin only)

## Supabase Integration

The platform leverages Supabase Auth for user management:

1. **User Management**:

    - User registration and verification
    - Password reset flows
    - Social authentication (optional)

2. **Row-Level Security (RLS)**:
    - Database access controlled through RLS policies
    - Ensures users can only access their own data or organization data
    - Example policy:
        ```sql
        CREATE POLICY "Users can only access their own tokens"
        ON user_tokens
        FOR ALL
        USING (auth.uid() = user_id);
        ```

## Token Management

### JWT Token Lifecycle

1. **Token Issuance**:

    - Tokens are issued upon successful login
    - Default token expiration is 24 hours
    - Refresh tokens allow extending the session without re-authentication

2. **Token Refresh**:

    - Client can use a refresh token to obtain a new JWT
    - Refresh tokens have a longer lifetime (30 days)
    - Refresh token rotation is implemented for security

3. **Token Revocation**:
    - Admins can revoke all tokens for a user
    - User can log out, invalidating their current tokens
    - Password changes invalidate all existing tokens

### Service Token Security

For service-specific tokens (e.g., GitHub tokens):

1. **Encryption**:

    - Tokens are encrypted using AES-256 before storage
    - Encryption key is stored securely and rotated periodically
    - Decryption occurs only when the token is needed for a request

2. **Access Control**:
    - Access to service tokens is strictly controlled
    - Service tokens are only accessible within the context of an authenticated request
    - Audit logs record all token access events

## Security Considerations

1. **Token Security**:

    - JWTs use strong signatures (RS256)
    - Short expiration times reduce risk from token theft
    - All token operations use HTTPS

2. **Password Security**:

    - Passwords are hashed using bcrypt with appropriate work factors
    - Password strength requirements are enforced
    - Account lockout after repeated failed attempts

3. **API Key Security**:

    - API keys use secure random generation
    - Keys are stored as hashes, not plaintext
    - Keys can be scoped to specific operations
    - Key rotation is encouraged

4. **Additional Security Measures**:
    - Rate limiting on authentication endpoints
    - CORS configuration to prevent unauthorized cross-origin requests
    - Security headers (CSP, HSTS, etc.)
    - Regular security audits and penetration testing

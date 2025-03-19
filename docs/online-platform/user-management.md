# User Management

[TOC]

This document describes the user management system of the MCP Online Platform, which handles user registration, authentication, authorization, organization management, and user-specific configurations.

## User Model Overview

The platform implements a multi-tenant user model with organizations as the top-level entity. Users belong to organizations and access MCP services within the organization context.

```
┌───────────────┐
│               │
│  Organization │
│               │
└───────┬───────┘
        │
        │ has many
        ▼
┌───────────────┐      ┌───────────────┐
│               │      │               │
│     User      │──────│    Role       │
│               │      │               │
└───────┬───────┘      └───────────────┘
        │
        │ owns
        ▼
┌───────────────┐      ┌───────────────┐
│               │      │               │
│  User Tokens  │──────│  MCP Service  │
│               │      │               │
└───────────────┘      └───────────────┘
```

## User Registration and Onboarding

### Registration Process

1. **User Registration**:

    - Users register with email, password, and organization details (if creating a new organization)
    - Email verification is required to activate an account
    - Invited users are pre-associated with an organization

2. **Organization Creation**:

    - Initial user becomes the organization admin
    - Organization name, contact information, and plan selection
    - Domain verification (optional for enterprise plans)

3. **Initial Configuration**:
    - Setup wizard guides new users through essential configurations
    - MCP service setup (GitHub tokens, etc.)
    - User role assignment for additional users

### User Invitation

Organization administrators can invite new users to their organization:

1. **Invitation Process**:

    - Admin enters email and selects role
    - System sends invitation email with temporary access link
    - User completes registration with preset organization

2. **Bulk Invitations**:
    - CSV upload for multiple invitations
    - Template-based email customization
    - Status tracking for invitations

### User Activation and Deactivation

1. **Activation**:

    - Email verification required for new accounts
    - Admin approval option for sensitive environments
    - Welcome email with getting started resources

2. **Deactivation**:

    - Admin can deactivate users without deletion
    - Automatic deactivation after extended inactivity
    - Deactivated users cannot log in, but data is preserved

3. **Deletion**:
    - GDPR-compliant account deletion
    - Option to transfer ownership of created resources
    - Data retention policies applied

## User Roles and Permissions

The platform implements role-based access control (RBAC) with predefined roles and granular permissions.

### Standard Roles

1. **Organization Admin**:

    - Full control over organization settings
    - User management (invite, modify roles, deactivate)
    - Access to all MCP services and settings
    - Billing and subscription management
    - Usage monitoring and reporting

2. **Developer**:

    - Configure and use MCP services
    - Create and manage personal API keys
    - View team usage analytics
    - Cannot modify organization settings or manage users

3. **Viewer**:
    - Read-only access to MCP services
    - View personal usage history
    - Cannot modify configurations or create API keys

### Custom Roles (Enterprise Plan)

Enterprise plans support custom roles with fine-grained permissions:

1. **Role Creation**:

    - Admins can create custom roles with specific permissions
    - Role templates for common use cases
    - Inheritance from standard roles

2. **Permission Categories**:
    - User Management
    - MCP Services
    - API Access
    - Analytics and Reporting
    - Organization Settings
    - Billing and Subscriptions

### Permission Management

1. **Permission Matrix**:

    - UI for managing role permissions
    - Bulk permission updates
    - Permission conflict resolution

2. **Access Control Lists**:
    - Resource-specific permissions
    - User-specific exceptions to role permissions
    - Temporary permission elevation

## Organization Management

Organizations are the top-level entity for multi-tenancy in the platform.

### Organization Structure

1. **Single Organization Model**:

    - Users belong to a single organization
    - Resources are scoped to an organization
    - Billing and subscriptions at organization level

2. **Organization Settings**:
    - Name, logo, contact information
    - Default user role for new members
    - Security settings and policies
    - API and integration settings

### Team Management

1. **Teams (Enterprise Plan)**:

    - Subgroups within organizations
    - Team-specific MCP configurations
    - Resource allocation by team
    - Team-level usage reporting

2. **Team Hierarchy**:
    - Nested teams with inheritance
    - Team administrators
    - Permission propagation

### Organization Subscription Management

1. **Subscription Plans**:

    - Free tier (limited capabilities)
    - Professional tier (full capabilities, limited users)
    - Enterprise tier (custom roles, SSO, advanced security)

2. **Billing Management**:
    - Subscription upgrades and downgrades
    - Payment method management
    - Invoice history
    - Usage-based billing components

## User Profile Management

Users can manage their personal profile information and preferences.

### Profile Information

1. **Basic Information**:

    - Name, email, profile picture
    - Contact information
    - Timezone and language preferences

2. **Security Settings**:

    - Password management
    - Multi-factor authentication setup
    - Session management
    - Personal API key management

3. **Notification Preferences**:
    - Email notification settings
    - Alert configurations
    - Weekly digest options

### User-Specific Configurations

1. **Personal Tokens**:

    - Service-specific tokens (GitHub, etc.)
    - Token encryption and security
    - Usage tracking
    - Automatic rotation options

2. **API Keys**:

    - Personal API key generation
    - Scope-limited keys
    - Usage monitoring
    - Expiration settings

3. **Preferences**:
    - Default MCP service settings
    - UI preferences
    - Keyboard shortcuts
    - Dashboard configuration

## Single Sign-On (SSO) Integration

Enterprise plans support SSO integration with identity providers.

### Supported Providers

1. **Standard Protocols**:

    - SAML 2.0
    - OpenID Connect
    - OAuth 2.0

2. **Popular Providers**:
    - Okta
    - Auth0
    - Azure Active Directory
    - Google Workspace
    - OneLogin

### SSO Configuration

1. **Setup Process**:

    - Identity provider configuration
    - Certificate exchange
    - Attribute mapping
    - Testing and validation

2. **Advanced Features**:
    - Just-in-time provisioning
    - Role mapping from identity provider
    - Automatic deactivation when removed from SSO
    - Session management

### SSO Security

1. **Session Management**:

    - Configurable session duration
    - Forced re-authentication for sensitive operations
    - Concurrent session limitations

2. **Access Controls**:
    - IP-based restrictions
    - Device trust evaluation
    - Risk-based authentication
    - Step-up authentication for sensitive operations

## User Experience Considerations

### Onboarding Experience

1. **Guided Setup**:

    - Step-by-step onboarding wizard
    - Interactive tutorials
    - Sample configurations
    - Documentation integration

2. **Contextual Help**:
    - Feature tooltips
    - "What's new" highlights
    - Context-sensitive guidance
    - In-app support chat

### User Interface Personalization

1. **Dashboard Customization**:

    - Configurable widgets
    - Favorite services
    - Recent activity display
    - Custom views and filters

2. **Accessibility**:
    - WCAG 2.1 AA compliance
    - Keyboard navigation
    - Screen reader support
    - High contrast mode
    - Font size adjustments

## Administrative Tools

### User Management Interface

1. **User Directory**:

    - Searchable user list
    - Filtering by role, status, team
    - Bulk operations
    - Export capabilities

2. **User Details View**:

    - Profile information
    - Role and permission management
    - Activity history
    - Resource usage

3. **Audit Trail**:
    - Administrative actions logging
    - User activity tracking
    - Security event monitoring
    - Compliance reporting

### Analytics and Reporting

1. **User Activity Reports**:

    - Login history
    - Service usage by user
    - API key usage tracking
    - Inactive user identification

2. **Organization-wide Reports**:
    - Active users over time
    - Resource utilization
    - Subscription utilization
    - Cost allocation

## API for User Management

The platform provides APIs for programmatic user management.

### User Management API

1. **CRUD Operations**:

    - Create, read, update, delete users
    - Role assignment
    - Organization management
    - Team management

2. **Bulk Operations**:
    - Batch user creation
    - Bulk role updates
    - Mass deactivation/reactivation

### Integration Capabilities

1. **Webhooks**:

    - User lifecycle events
    - Role changes
    - Login activities
    - Security events

2. **Provisioning Integrations**:
    - SCIM 2.0 support
    - Directory synchronization
    - Custom provisioning workflows

## Security Considerations

### Privacy and Data Protection

1. **Personal Data Handling**:

    - GDPR compliance
    - Data minimization
    - Purpose limitation
    - Consent management

2. **Data Retention**:
    - Configurable retention policies
    - Automatic data pruning
    - Data export capabilities
    - Right to be forgotten implementation

### Account Security

1. **Password Policies**:

    - Minimum complexity requirements
    - Password rotation policies
    - Breached password detection
    - Password manager compatibility

2. **Authentication Security**:

    - Multi-factor authentication enforcement
    - Suspicious login detection
    - Account lockout after failed attempts
    - Session timeout policies

3. **Token Security**:
    - Secure storage of user tokens
    - Encryption of sensitive credentials
    - Token usage monitoring
    - Automatic revocation on suspicious activity

## Implementation Details

### Database Schema

Key tables related to user management:

```sql
-- Users table
CREATE TABLE mcp_platform.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  first_name TEXT,
  last_name TEXT,
  organization_id UUID REFERENCES mcp_platform.organizations(id),
  role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'
);

-- Organizations table
CREATE TABLE mcp_platform.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'
);

-- User tokens table
CREATE TABLE mcp_platform.user_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES mcp_platform.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);
```

### User Service Implementation

Core user management functionality is implemented in the Auth Service:

```typescript
// Example user service class structure
class UserService {
    // User CRUD operations
    async createUser(userData: CreateUserDto): Promise<User> {
        /* ... */
    }
    async getUserById(userId: string): Promise<User> {
        /* ... */
    }
    async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
        /* ... */
    }
    async deactivateUser(userId: string): Promise<void> {
        /* ... */
    }
    async deleteUser(userId: string): Promise<void> {
        /* ... */
    }

    // Organization operations
    async createOrganization(orgData: CreateOrganizationDto): Promise<Organization> {
        /* ... */
    }
    async getOrganizationById(orgId: string): Promise<Organization> {
        /* ... */
    }
    async getOrganizationUsers(orgId: string): Promise<User[]> {
        /* ... */
    }

    // Role and permission operations
    async assignRole(userId: string, role: string): Promise<void> {
        /* ... */
    }
    async hasPermission(userId: string, permission: string): Promise<boolean> {
        /* ... */
    }

    // Token management
    async storeUserToken(userId: string, service: string, token: string): Promise<void> {
        /* ... */
    }
    async getUserToken(userId: string, service: string): Promise<string> {
        /* ... */
    }
}
```

## Best Practices

### User Management Guidelines

1. **Principle of Least Privilege**:

    - Assign minimum necessary permissions
    - Regularly review and adjust privileges
    - Time-bound elevated access

2. **Regular Access Reviews**:

    - Quarterly access reviews
    - Automated inactive user detection
    - Role appropriateness evaluation

3. **Security Awareness**:
    - User security training
    - Phishing prevention
    - Social engineering awareness
    - Token security best practices

### Administrator Guidelines

1. **Organization Setup**:

    - Start with limited admin users
    - Define clear role boundaries
    - Document custom role definitions
    - Establish security policies early

2. **User Lifecycle Management**:

    - Standardize onboarding procedures
    - Define offboarding checklists
    - Regular permission audits
    - Automate routine management tasks

3. **Monitoring and Maintenance**:
    - Review login and activity logs
    - Monitor failed authentication attempts
    - Check for unused accounts
    - Verify token usage patterns

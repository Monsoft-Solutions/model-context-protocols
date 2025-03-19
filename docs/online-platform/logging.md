# Logging System

[TOC]

This document outlines the comprehensive logging system implemented in the MCP Online Platform. Logging is a critical component that enables monitoring, debugging, security auditing, and usage analytics.

## Logging Architecture

The platform implements a multi-layered logging architecture to capture detailed information about all operations while maintaining performance and security.

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│   API Gateway  │────▶│  MCP Services  │────▶│  MCP Execution │
│                │     │                │     │                │
└───────┬────────┘     └───────┬────────┘     └───────┬────────┘
        │                      │                      │
        │                      │                      │
        ▼                      ▼                      ▼
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                      Logging Service                           │
│                                                                │
└───────┬────────────────────────┬────────────────────────┬─────┘
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│              │        │              │        │              │
│ Request Logs │        │ Audit Logs   │        │ Error Logs   │
│              │        │              │        │              │
└──────┬───────┘        └──────┬───────┘        └──────┬───────┘
       │                       │                       │
       │                       │                       │
       ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                      Supabase Database                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
       │                       │                       │
       │                       │                       │
       ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                 Analytics & Reporting Engine                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Log Types

The platform maintains several types of logs for different purposes:

### 1. Request Logs

Detailed records of each MCP request and response, stored in the `request_logs` table.

**Key information captured**:

- User ID and organization ID
- MCP service ID and operation name
- Request parameters (with sensitive data redacted)
- Response data (with sensitive data redacted)
- HTTP status code
- Request duration in milliseconds
- IP address and user agent
- Timestamp
- Request ID (for correlation)

### 2. Audit Logs

Records of security-related and administrative actions, stored in the `audit_logs` table.

**Key information captured**:

- User ID and organization ID
- Action type (login, logout, token generation, etc.)
- Resource affected (user, service, etc.)
- Resource ID
- Changes made (before/after for updates)
- IP address
- Timestamp
- Success/failure status

### 3. Error Logs

Detailed information about system errors and exceptions, stored in the `error_logs` table.

**Key information captured**:

- Error code and message
- Stack trace (for server-side errors)
- Component where the error occurred
- User ID (if applicable)
- Request ID (for correlation with request logs)
- Timestamp
- Severity level

### 4. Usage Metrics

Aggregated usage statistics for billing and analytics, stored in the `service_usage` table.

**Key information captured**:

- Organization ID
- MCP service ID
- Request count
- Error count
- Total duration
- Time period (hourly, daily, monthly)

## Log Collection Process

The platform collects logs at multiple points in the request/response cycle:

1. **API Gateway Logging**:

    - Captures initial request metadata (headers, path, method)
    - Records authentication results
    - Measures total request processing time
    - Assigns a unique request ID for correlation

2. **MCP Service Logging**:

    - Records service-specific operations
    - Tracks configuration access
    - Measures service processing time

3. **MCP Execution Logging**:

    - Records tool and resource execution details
    - Captures parameter values (with sensitive data redacted)
    - Tracks execution status and results
    - Measures execution time

4. **Error Logging**:
    - Captures exceptions and errors at all levels
    - Records contextual information for debugging
    - Maintains severity levels for filtering

## Log Storage and Retention

Logs are stored in the Supabase PostgreSQL database with the following considerations:

1. **Data Partitioning**:

    - Request logs are partitioned by month for better query performance
    - Automatic partition rotation based on retention policy

2. **Retention Policies**:

    - Request logs: 90 days (detailed), 1 year (summarized)
    - Audit logs: 1 year
    - Error logs: 90 days
    - Usage metrics: 3 years

3. **Storage Optimization**:
    - Compression for older logs
    - JSON compression for request/response data
    - Automatic archiving of expired logs to cold storage

## Data Redaction and Privacy

To maintain security and compliance with privacy regulations:

1. **Automatic Redaction**:

    - Tokens and passwords are never logged
    - Personal identifiable information (PII) is redacted
    - Sensitive content in request/response is redacted based on patterns

2. **Redaction Patterns**:

    - Tokens: `"token": "********"`
    - API keys: `"api_key": "mcp_sk_****"`
    - Emails in content: `"email@example.com" → "e***@e***.com"`

3. **Compliance Controls**:
    - GDPR compliance built into logging system
    - Data can be removed for specific users on request
    - Logs classified according to sensitivity level

## Log Access and Visualization

### User-Accessible Logs

Users can access their own logs through the platform dashboard:

1. **Request History**:

    - View recent MCP requests
    - Filter by service, status, date range
    - View request/response details
    - Export logs in CSV or JSON format

2. **Usage Analytics**:
    - View usage trends over time
    - Service usage breakdown
    - Error rates and performance metrics
    - Cost estimation based on usage

### Administrative Access

Platform administrators have additional access:

1. **Organization-Wide Logs**:

    - View logs across all users in their organization
    - Monitor overall usage patterns
    - Identify performance issues

2. **System Monitoring**:
    - View platform health metrics
    - Monitor error rates
    - Track performance trends
    - Set up alerts for unusual activity

### Log Visualization

The platform provides several visualization tools:

1. **Dashboard Widgets**:

    - Request volume over time
    - Error rate charts
    - Service usage breakdown
    - Performance metrics

2. **Detailed Views**:
    - Request timeline view
    - Service performance comparisons
    - User activity timelines
    - Geographical request distribution

## Security Monitoring

The logging system enables effective security monitoring:

1. **Threat Detection**:

    - Unusual access patterns
    - Excessive error rates
    - Potential token theft
    - Abnormal usage patterns

2. **Alerts**:

    - Real-time notification for security events
    - Threshold-based alerts for unusual activity
    - Periodic security reports

3. **Audit Capabilities**:
    - Full user action history
    - Token usage tracking
    - Administrative action review
    - Compliance reporting

## Performance Monitoring

The logging system enables monitoring of platform performance:

1. **Service Metrics**:

    - Response time trends
    - Error rates by service
    - Resource utilization
    - Request volume handling

2. **Bottleneck Identification**:

    - Slowest operations
    - Most resource-intensive requests
    - Error hotspots
    - Connection issues

3. **Capacity Planning**:
    - Usage trend analysis
    - Peak usage patterns
    - Growth forecasting
    - Resource allocation planning

## Implementation Details

### Logging Middleware

The platform uses middleware to capture logs consistently:

```typescript
// Example logging middleware
export const requestLogger = async (req, res, next) => {
    const startTime = performance.now();
    const requestId = uuid();

    // Attach request ID for correlation
    req.requestId = requestId;

    // Clone request data for logging (exclude sensitive fields)
    const requestData = {
        method: req.method,
        path: req.path,
        query: redactSensitiveData(req.query),
        body: redactSensitiveData(req.body),
        headers: redactSensitiveHeaders(req.headers),
    };

    // Capture original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody = null;

    // Override response methods to capture response data
    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(res, arguments);
    };

    res.json = function (body) {
        responseBody = body;
        return originalJson.apply(res, arguments);
    };

    // Process the request
    try {
        await next();
    } catch (error) {
        // Log error
        await logError({
            requestId,
            error,
            userId: req.user?.id,
            path: req.path,
        });
        throw error;
    } finally {
        const duration = performance.now() - startTime;

        // Log request/response
        await logRequest({
            requestId,
            userId: req.user?.id,
            organizationId: req.user?.organizationId,
            serviceId: req.params.serviceId,
            method: req.method,
            path: req.path,
            requestData,
            responseData: redactSensitiveData(responseBody),
            statusCode: res.statusCode,
            duration,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
    }
};
```

### Structured Logging Format

All logs follow a consistent JSON structure for easy parsing and analysis:

```json
{
    "timestamp": "2023-07-01T14:35:22.123Z",
    "level": "info",
    "requestId": "req_abcdef123456",
    "userId": "user_123456",
    "organizationId": "org_789012",
    "serviceId": "svc_123456",
    "operation": "search_code",
    "duration": 235,
    "statusCode": 200,
    "message": "MCP tool execution completed",
    "context": {
        "request": {
            "method": "POST",
            "path": "/mcp/execute/tool",
            "parameters": {
                "query": "function calculateTotal",
                "repositories": ["user/repo1"]
            }
        },
        "response": {
            "result": {
                "matchCount": 2
            }
        }
    }
}
```

## Best Practices for Developers

When extending the platform or developing new MCP services:

1. **Use the Logging Service**:

    - Always use the provided logging service rather than direct console logging
    - Follow the established logging patterns

2. **Log Levels**:

    - Use appropriate log levels (debug, info, warn, error)
    - Reserve error level for actual errors, not expected conditions

3. **Context**:

    - Include relevant context with all logs
    - Always include correlation IDs

4. **Sensitive Data**:

    - Never log sensitive data directly
    - Use the provided redaction utilities

5. **Performance**:
    - Be mindful of excessive logging in high-volume operations
    - Use sampling for very high-volume debug logging
    - Avoid logging large objects; summarize when possible

## Troubleshooting with Logs

The logging system facilitates effective troubleshooting:

1. **Request Tracing**:

    - Use the request ID to follow a request through all system components
    - View the complete timeline of operations

2. **Error Analysis**:

    - View stack traces and error contexts
    - See related requests that may have contributed to the error
    - Identify patterns across multiple errors

3. **Performance Issues**:

    - Identify slow operations
    - Check for resource constraints
    - Look for patterns in timing data

4. **User-Reported Issues**:
    - Find user's sessions by their ID
    - Examine all requests in the relevant timeframe
    - Check for errors or unusual behavior

## Future Enhancements

Planned improvements to the logging system:

1. **Machine Learning Integration**:

    - Anomaly detection in usage patterns
    - Predictive error analysis
    - Automatic performance optimization suggestions

2. **Extended Analytics**:

    - Advanced usage pattern recognition
    - User behavior analysis
    - Service reliability scoring

3. **Real-time Monitoring**:
    - Live dashboards for system status
    - Real-time alerting improvements
    - Proactive issue detection

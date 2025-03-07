I want to implement an MCP server that acts as a project manager. It should handle operations related to issues and projects

The interaction with GitHub will be done through the API.

IMplement the logic on independent files. Also, implement the logic to handle errors. And implement the types using `type` instead of interface.

## Implementation Plan

### Core Features

1. **GitHub Issue Management**

    - Create issues
    - Update issues
    - List issues
    - Get issue details
    - Add comments to issues
    - Close issues

2. **GitHub Project Management**
    - Create projects
    - Add issues to projects
    - Update project items
    - List project items
    - Move items between project columns/statuses

#### 5. Error Handling Strategy

- Create custom error types for different error scenarios
- Implement centralized error handling
- Provide meaningful error messages to clients

### Dependencies

- `@modelcontextprotocol/sdk`: For MCP server implementation
- `@octokit/rest`: For GitHub API interactions
- `zod`: For schema validation
- `typescript`: For type safety

### Extension Points

- Design the services to be easily extensible
- Use dependency injection for services
- Create clear interfaces for each service
- Document extension points in the README

### Documentation

- Provide clear documentation for each tool
- Include examples of how to use each tool
- Document error handling and troubleshooting

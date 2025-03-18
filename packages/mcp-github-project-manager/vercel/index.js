/**
 * Vercel deployment entry point for GitHub Project Manager MCP
 *
 * This file serves as the entry point for the Vercel deployment.
 * It redirects to the API route handler in api/github-mcp.js.
 */

// Export the API handler
export { default } from './api/github-mcp.js';

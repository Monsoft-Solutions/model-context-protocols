/**
 * Base error class for GitHub Project Manager
 */
export class GitHubProjectManagerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GitHubProjectManagerError';
    }
}

/**
 * Error thrown when GitHub token is missing
 */
export class MissingGitHubTokenError extends Error {
    constructor() {
        super(
            'GitHub personal access token is required. Please provide it using the --GITHUB_PERSONAL_TOKEN command line argument.',
        );
        this.name = 'MissingGitHubTokenError';
    }
}

/**
 * Error for authentication issues
 */
export class AuthenticationError extends GitHubProjectManagerError {
    constructor(message = 'Authentication failed. Please check your GitHub token.') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

/**
 * Error for resource not found
 */
export class ResourceNotFoundError extends GitHubProjectManagerError {
    constructor(resource: string) {
        super(`Resource not found: ${resource}`);
        this.name = 'ResourceNotFoundError';
    }
}

/**
 * Error for validation issues
 */
export class ValidationError extends GitHubProjectManagerError {
    constructor(message: string) {
        super(`Validation error: ${message}`);
        this.name = 'ValidationError';
    }
}

/**
 * Error for rate limiting
 */
export class RateLimitError extends GitHubProjectManagerError {
    constructor(resetTime?: Date) {
        const message = resetTime
            ? `GitHub API rate limit exceeded. Reset at ${resetTime.toISOString()}`
            : 'GitHub API rate limit exceeded.';
        super(message);
        this.name = 'RateLimitError';
    }
}

/**
 * Error for network issues
 */
export class NetworkError extends GitHubProjectManagerError {
    constructor(message = 'Network error occurred while communicating with GitHub API.') {
        super(message);
        this.name = 'NetworkError';
    }
}

// Define a looser error type for GitHub API errors
// This type is used for `handleGitHubError` and allows for flexibility in error handling
export interface GitHubError extends Error {
    status?: number;
    response?: { headers?: Record<string, string> };
    code?: string;
}

/**
 * Error handler function to convert GitHub API errors to our custom errors
 */
export function handleGitHubError(error: GitHubError): GitHubProjectManagerError {
    // Check if it's an Octokit error with status
    if (error.status) {
        switch (error.status) {
            case 401:
            case 403:
                return new AuthenticationError(error.message);
            case 404:
                return new ResourceNotFoundError(error.message);
            case 422:
                return new ValidationError(error.message);
            case 429:
                return new RateLimitError(
                    error.response?.headers?.['x-ratelimit-reset']
                        ? new Date(parseInt(error.response.headers['x-ratelimit-reset']) * 1000)
                        : undefined,
                );
            default:
                return new GitHubProjectManagerError(`GitHub API error: ${error.message}`);
        }
    }

    // Network errors
    if (error.name === 'NetworkError' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        return new NetworkError(error.message);
    }

    // Default case
    return new GitHubProjectManagerError(error.message || 'Unknown error occurred');
}

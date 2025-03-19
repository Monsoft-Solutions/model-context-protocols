/**
 * Base error class for documentation generation errors
 */
export class DocumentationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DocumentationError';
    }
}

/**
 * Error thrown when invalid parameters are provided
 */
export class InvalidParametersError extends DocumentationError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidParametersError';
    }
}

/**
 * Error thrown when document generation fails
 */
export class GenerationFailedError extends DocumentationError {
    constructor(message: string) {
        super(message);
        this.name = 'GenerationFailedError';
    }
}

/**
 * Error thrown when the AI service returns an error
 */
export class AIServiceError extends DocumentationError {
    constructor(message: string) {
        super(message);
        this.name = 'AIServiceError';
    }
}

/**
 * Error thrown when environment validation fails
 */
export class EnvironmentValidationError extends DocumentationError {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentValidationError';
    }
}

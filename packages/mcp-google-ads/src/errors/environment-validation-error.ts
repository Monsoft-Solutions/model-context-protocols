/**
 * Error thrown when environment variables validation fails
 */
export class EnvironmentValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentValidationError';
        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

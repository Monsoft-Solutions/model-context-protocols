/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly detail?: string,
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

/**
 * Types of documentation that can be generated
 */
export type DocumentType = 'technical' | 'database' | 'uiux' | 'audience' | 'accessibility' | 'api' | 'all';

/**
 * Parameters for document generation
 */
export type DocumentGenerationParams = {
    /**
     * Type of document to generate
     */
    documentType: DocumentType;

    /**
     * Name of the project
     */
    projectName: string;

    /**
     * Description of what the project should accomplish
     */
    description: string;

    /**
     * Additional context or requirements
     */
    additionalContext?: string;

    /**
     * Intended audience for the documentation
     */
    targetAudience?: string;

    /**
     * Specific implementation details or constraints
     */
    implementationDetails?: string;

    /**
     * Systems or services to integrate with
     */
    integrationPoints?: string;
};

/**
 * Generated document content
 */
export type GeneratedDocument = {
    /**
     * Document title
     */
    title: string;

    /**
     * Document type
     */
    type: DocumentType;

    /**
     * Content of the document in markdown format
     */
    content: string;

    /**
     * Suggested filename for the document
     */
    suggestedFilename: string;
};

/**
 * Result of document generation
 */
export type DocumentGenerationResult = {
    /**
     * Array of generated documents
     */
    documents: GeneratedDocument[];

    /**
     * Time taken to generate the documents in milliseconds
     */
    generationTime: number;

    /**
     * Whether the generation was successful
     */
    success: boolean;

    /**
     * Error message if the generation failed
     */
    error?: string;
};

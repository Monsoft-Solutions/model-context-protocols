import { DocumentGenerationParams, DocumentType } from '../types/documentation-types.js';

/**
 * Interface for a prompt template
 */
export interface PromptTemplate {
    /**
     * The system prompt to use for the AI model
     */
    systemPrompt: string;

    /**
     * Generates a prompt for the AI based on document generation parameters
     * @param params Document generation parameters
     * @returns The generated prompt
     */
    generatePrompt(params: DocumentGenerationParams): string;
}

/**
 * Common base class for all prompt templates
 */
export abstract class BasePromptTemplate implements PromptTemplate {
    /**
     * The system prompt to use for the AI model
     */
    public readonly systemPrompt: string =
        'You are a professional Technical Writer with expertise in documenting software systems. Your task is to create detailed and structured documentation as requested. Focus on clarity, completeness, and organization. Format your response in Markdown.';

    /**
     * Abstract method to generate a specific prompt based on parameters
     * @param params Document generation parameters
     */
    abstract generatePrompt(params: DocumentGenerationParams): string;

    /**
     * Creates a base info section from the parameters
     * @param params Document generation parameters
     * @returns A string with the base information
     */
    protected getBaseInfo(params: DocumentGenerationParams): string {
        return `
Project Name: ${params.projectName}
Description: ${params.description}
${params.additionalContext ? `Additional Context: ${params.additionalContext}` : ''}
${params.targetAudience ? `Target Audience: ${params.targetAudience}` : ''}
${params.implementationDetails ? `Implementation Details: ${params.implementationDetails}` : ''}
${params.integrationPoints ? `Integration Points: ${params.integrationPoints}` : ''}
`;
    }
}

/**
 * Technical specification prompt template
 */
export class TechnicalPromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create a comprehensive Technical Specification document for the following project: ${this.getBaseInfo(params)}
        
Include the following sections:
1. Overview and Purpose
2. Features and Functionality
3. Technical Requirements
4. Dependencies and Prerequisites
5. Architecture and Design
6. Components and Services
7. Data Flow
8. APIs and Interfaces
9. Security Considerations
10. Performance Requirements
11. Scalability and Reliability
12. Potential Risks and Mitigations
13. Future Enhancements

Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * Database specification prompt template
 */
export class DatabasePromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create a comprehensive Database Specification document for the following project: ${this.getBaseInfo(params)}
        
Include the following sections:
1. Database Overview
2. Database Selection and Justification
3. Data Models and Schemas
4. Tables and Collections
5. Fields and Data Types
6. Relationships and Foreign Keys
7. Indexes and Performance Optimizations
8. Sample Queries
9. Migration Strategy
10. Backup and Recovery
11. Security and Access Control
12. Database Scaling Approach

Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * UI/UX specification prompt template
 */
export class UIUXPromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create a comprehensive UI/UX Specification document for the following project: ${this.getBaseInfo(params)}
        
Include the following sections:
1. Overview of User Interface
2. User Personas
3. User Journeys and Workflows
4. Information Architecture
5. Wireframes and Layout Descriptions
6. UI Components and Elements
7. Interaction Patterns
8. Visual Design Guidelines
9. Responsive Design Approach
10. Animation and Transitions
11. Error States and Messaging
12. Accessibility Considerations
13. Usability Testing Approach

Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * Audience definition prompt template
 */
export class AudiencePromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create a comprehensive Audience Definition document for the following project: ${this.getBaseInfo(params)}
        
Include the following sections:
1. Primary User Personas (at least 3)
   - Demographics
   - Goals and Motivations
   - Pain Points and Challenges
   - Technical Proficiency
   - Usage Context
   - Success Metrics
2. Secondary User Personas
3. Stakeholder Personas
4. User Needs Analysis
5. User Research Findings (hypothetical or based on provided information)
6. Market Analysis
7. Competitor Analysis
8. User Segmentation Strategy
9. Key User Scenarios

Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * Accessibility specification prompt template
 */
export class AccessibilityPromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create a comprehensive Accessibility Specification document for the following project: ${this.getBaseInfo(params)}
        
Include the following sections:
1. Accessibility Overview and Goals
2. Accessibility Standards Compliance (WCAG 2.1, ADA, Section 508)
3. Target Accessibility Level (A, AA, AAA)
4. Accessibility for Different Disabilities
   - Visual Impairments
   - Hearing Impairments
   - Motor Impairments
   - Cognitive Impairments
5. Keyboard Navigation Requirements
6. Screen Reader Compatibility
7. Color and Contrast Requirements
8. Text and Typography Guidelines
9. Form and Input Accessibility
10. Multimedia Accessibility
11. Testing Methodology
12. Assistive Technology Support
13. Documentation and Training

Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * API documentation prompt template
 */
export class APIPromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create a comprehensive API Documentation for the following project: ${this.getBaseInfo(params)}
        
Include the following sections:
1. API Overview
2. Authentication and Authorization
3. Base URL and Environments
4. Rate Limiting and Quotas
5. Request and Response Formats
6. Error Handling and Status Codes
7. Detailed Endpoint Documentation
   - For each endpoint:
     - URL and Method
     - Description
     - Required Permissions
     - Request Parameters
     - Request Body (with examples)
     - Response (with examples)
     - Error Responses
8. Pagination and Filtering
9. Versioning Strategy
10. Webhooks (if applicable)
11. SDK and Client Libraries
12. Testing and Sandbox Environment
13. API Changelog

Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * Generic documentation prompt template
 */
export class GenericPromptTemplate extends BasePromptTemplate {
    generatePrompt(params: DocumentGenerationParams): string {
        return `Please create comprehensive documentation for the following project: ${this.getBaseInfo(params)}
        
Format your response in Markdown with proper headers, lists, tables, and code blocks where appropriate.`;
    }
}

/**
 * Factory class for creating prompt templates
 */
export class PromptTemplateFactory {
    /**
     * Get the appropriate prompt template for a document type
     * @param documentType Type of document to generate
     * @returns A prompt template instance
     */
    static getTemplateForType(documentType: DocumentType): PromptTemplate {
        switch (documentType) {
            case 'technical':
                return new TechnicalPromptTemplate();
            case 'database':
                return new DatabasePromptTemplate();
            case 'uiux':
                return new UIUXPromptTemplate();
            case 'audience':
                return new AudiencePromptTemplate();
            case 'accessibility':
                return new AccessibilityPromptTemplate();
            case 'api':
                return new APIPromptTemplate();
            default:
                return new GenericPromptTemplate();
        }
    }
}

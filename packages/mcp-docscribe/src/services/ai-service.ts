import { AIServiceError, GenerationFailedError } from '../errors/documentation-error.js';
import {
    DocumentGenerationParams,
    DocumentGenerationResult,
    DocumentType,
    GeneratedDocument,
} from '../types/documentation-types.js';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { PromptTemplateFactory } from '../templates/prompt-templates.js';

/**
 * Service for generating documentation using AI providers via Vercel AI SDK
 *
 * This service implements document generation using the Vercel AI SDK to abstract
 * communication with different AI providers (Anthropic and OpenAI). It supports
 * both Claude (3.5 Sonnet, 3 Opus) and GPT (GPT-4o, GPT-4 Turbo) models.
 *
 * The Vercel AI SDK provides a unified interface for interacting with these models,
 * making it easy to switch between providers without changing the implementation logic.
 */
export class AIService {
    private apiToken: string;
    private provider: 'anthropic' | 'openai';

    /**
     * Creates an instance of AIService
     * @param apiToken - API token for the AI service (Anthropic or OpenAI)
     * @param provider - AI provider to use ('anthropic' or 'openai')
     */
    constructor(apiToken: string, provider: 'anthropic' | 'openai' = 'anthropic') {
        this.apiToken = apiToken;
        this.provider = provider;
    }

    /**
     * Generates documentation based on the provided parameters
     *
     * This method orchestrates the document generation process by:
     * 1. Determining which document types to generate based on the input
     * 2. Creating appropriate prompts for each document type
     * 3. Calling the AI provider to generate the content
     * 4. Packaging the generated content with metadata
     *
     * @param params - Parameters for document generation
     * @returns Promise resolving to the generation result
     * @throws {AIServiceError} When the AI service returns an error
     * @throws {GenerationFailedError} When document generation fails
     */
    public async generateDocumentation(params: DocumentGenerationParams): Promise<DocumentGenerationResult> {
        const startTime = Date.now();

        try {
            // Get the document types to generate
            const documentTypes = this.getDocumentTypesToGenerate(params.documentType);
            const documents: GeneratedDocument[] = [];

            // Generate each document type
            for (const docType of documentTypes) {
                // Get the appropriate prompt template for this document type
                const promptTemplate = PromptTemplateFactory.getTemplateForType(docType);
                // Generate the prompt from the template
                const prompt = promptTemplate.generatePrompt(params);
                // Get the system prompt from the template
                const systemPrompt = promptTemplate.systemPrompt;

                // Generate content using the AI provider
                const generatedContent = await this.generateWithAI(prompt, systemPrompt);

                if (!generatedContent) {
                    throw new GenerationFailedError(`Failed to generate ${docType} documentation`);
                }

                const suggestedFilename = this.getSuggestedFilename(docType, params.projectName);

                documents.push({
                    title: this.getDocumentTitle(docType, params.projectName),
                    type: docType,
                    content: generatedContent,
                    suggestedFilename,
                });
            }

            const endTime = Date.now();

            return {
                documents,
                generationTime: endTime - startTime,
                success: true,
            };
        } catch (error) {
            const endTime = Date.now();

            if (error instanceof AIServiceError || error instanceof GenerationFailedError) {
                return {
                    documents: [],
                    generationTime: endTime - startTime,
                    success: false,
                    error: error.message,
                };
            }

            // Handle unexpected errors
            if (error instanceof Error) {
                return {
                    documents: [],
                    generationTime: endTime - startTime,
                    success: false,
                    error: `Unexpected error: ${error.message}`,
                };
            }

            return {
                documents: [],
                generationTime: endTime - startTime,
                success: false,
                error: 'Unknown error occurred',
            };
        }
    }

    /**
     * Generate content using the selected AI provider via Vercel AI SDK
     *
     * This method acts as a router to direct the request to the appropriate
     * provider-specific implementation.
     *
     * @param prompt - Prompt for the AI
     * @param systemPrompt - System prompt to use
     * @returns Promise resolving to the generated content
     * @throws {AIServiceError} When the AI service returns an error
     */
    private async generateWithAI(prompt: string, systemPrompt: string): Promise<string> {
        try {
            if (this.provider === 'anthropic') {
                return await this.generateWithAnthropic(prompt, systemPrompt);
            } else {
                return await this.generateWithOpenAI(prompt, systemPrompt);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new AIServiceError(`AI service error: ${error.message}`);
            }
            throw new AIServiceError('Unknown AI service error');
        }
    }

    /**
     * Generate content using Anthropic Claude via AI SDK
     *
     * Uses the Vercel AI SDK's generateText function with the anthropic provider.
     * This implementation includes Claude's reasoning capabilities for improved
     * document generation quality.
     *
     * @param prompt - Prompt for Claude
     * @param systemPrompt - System prompt to use
     * @returns Promise resolving to the generated content
     * @throws {AIServiceError} When there's an error with the Anthropic API
     */
    private async generateWithAnthropic(prompt: string, systemPrompt: string): Promise<string> {
        try {
            // Configure environment for Anthropic
            process.env.ANTHROPIC_API_KEY = this.apiToken;

            // Different model options available for Claude
            // Use Claude 3.5 Sonnet for a good balance of quality and cost
            // or Claude 3 Opus for best quality
            const modelOptions = {
                'claude-3-7-sonnet': 'claude-3-7-sonnet-latest',
                'claude-3-5-haiku': 'claude-3-5-haiku-latest',
            };

            const selectedModel = modelOptions['claude-3-7-sonnet']; // Default to Claude 3.7 Sonnet

            // Use AI SDK to generate content
            const { text } = await generateText({
                model: anthropic(selectedModel),
                prompt,
                temperature: 0.7,
                maxTokens: 4000,
                system: systemPrompt,
                providerOptions: {
                    anthropic: {
                        // Enable thinking/reasoning capabilities for Claude
                        // This helps produce more thoughtful and comprehensive documentation
                        thinking: { type: 'enabled', budgetTokens: 32000 },
                    },
                },
            });

            return text;
        } catch (error) {
            throw new AIServiceError(
                `Error with Anthropic API: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Generate content using OpenAI models via AI SDK
     *
     * Uses the Vercel AI SDK's generateText function with the openai provider.
     * This implementation supports GPT-4o and GPT-4 Turbo models.
     *
     * @param prompt - Prompt for OpenAI
     * @param systemPrompt - System prompt to use
     * @returns Promise resolving to the generated content
     * @throws {AIServiceError} When there's an error with the OpenAI API
     */
    private async generateWithOpenAI(prompt: string, systemPrompt: string): Promise<string> {
        try {
            // Configure environment for OpenAI
            process.env.OPENAI_API_KEY = this.apiToken;

            // Different model options available for OpenAI
            const modelOptions = {
                'gpt-4o': 'gpt-4o',
                'o3-mini': 'o3-mini',
            };

            const selectedModel = modelOptions['o3-mini']; // Default to GPT-4o

            // Use AI SDK to generate content
            const { text } = await generateText({
                model: openai(selectedModel),
                prompt,
                temperature: 0.7,
                maxTokens: 4000,
                system: systemPrompt,
            });

            return text;
        } catch (error) {
            throw new AIServiceError(
                `Error with OpenAI API: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Gets the document types to generate based on the requested type
     * @param documentType - Requested document type
     * @returns Array of document types to generate
     */
    private getDocumentTypesToGenerate(documentType: DocumentType): DocumentType[] {
        if (documentType === 'all') {
            return ['technical', 'database', 'uiux', 'audience', 'accessibility', 'api'];
        }
        return [documentType];
    }

    /**
     * Gets the title for a document
     * @param documentType - Type of document
     * @param projectName - Name of the project
     * @returns Document title
     */
    private getDocumentTitle(documentType: DocumentType, projectName: string): string {
        switch (documentType) {
            case 'technical':
                return `${projectName} - Technical Specification`;
            case 'database':
                return `${projectName} - Database Specification`;
            case 'uiux':
                return `${projectName} - UI/UX Specification`;
            case 'audience':
                return `${projectName} - Audience Definition`;
            case 'accessibility':
                return `${projectName} - Accessibility Specification`;
            case 'api':
                return `${projectName} - API Documentation`;
            default:
                return `${projectName} - Documentation`;
        }
    }

    /**
     * Gets a suggested filename for a document
     * @param documentType - Type of document
     * @param projectName - Name of the project
     * @returns Suggested filename
     */
    private getSuggestedFilename(documentType: DocumentType, projectName: string): string {
        const sanitizedProjectName = projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        switch (documentType) {
            case 'technical':
                return `${sanitizedProjectName}-technical-spec.md`;
            case 'database':
                return `${sanitizedProjectName}-database-spec.md`;
            case 'uiux':
                return `${sanitizedProjectName}-uiux-spec.md`;
            case 'audience':
                return `${sanitizedProjectName}-audience.md`;
            case 'accessibility':
                return `${sanitizedProjectName}-accessibility.md`;
            case 'api':
                return `${sanitizedProjectName}-api-docs.md`;
            default:
                return `${sanitizedProjectName}-docs.md`;
        }
    }
}

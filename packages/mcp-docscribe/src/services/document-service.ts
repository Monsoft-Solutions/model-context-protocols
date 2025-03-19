import fs from 'fs/promises';
import path from 'path';
import { AIService } from './ai-service.js';
import { DocumentGenerationParams, DocumentGenerationResult } from '../types/documentation-types.js';
import { GenerationFailedError } from '../errors/documentation-error.js';

/**
 * Service for generating and managing documentation
 */
export class DocumentService {
    private aiService: AIService;
    private outputDir: string;

    /**
     * Creates an instance of DocumentService
     * @param apiToken - API token for the AI service
     * @param provider - AI provider to use
     * @param outputDir - Directory to write documentation to
     */
    constructor(apiToken: string, provider: 'anthropic' | 'openai' = 'anthropic', outputDir = './docs') {
        this.aiService = new AIService(apiToken, provider);
        this.outputDir = outputDir;
    }

    /**
     * Generates documentation based on the provided parameters
     * @param params - Parameters for document generation
     * @returns Promise resolving to the generation result
     */
    public async generateDocumentation(params: DocumentGenerationParams): Promise<DocumentGenerationResult> {
        return this.aiService.generateDocumentation(params);
    }

    /**
     * Generates and writes documentation to files
     * @param params - Parameters for document generation
     * @param outputDir - Directory to write documentation to (overrides constructor value)
     * @returns Promise resolving to the generation result with file paths
     * @throws {GenerationFailedError} When document generation fails
     */
    public async generateAndWriteDocumentation(
        params: DocumentGenerationParams,
        outputDir?: string,
    ): Promise<DocumentGenerationResult & { filePaths: string[] }> {
        const result = await this.generateDocumentation(params);

        if (!result.success) {
            throw new GenerationFailedError(result.error || 'Document generation failed');
        }

        const targetDir = outputDir || this.outputDir;
        const projectDir = path.join(
            targetDir,
            params.projectName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, ''),
        );

        // Create output directories
        await this.ensureDirectoryExists(targetDir);
        await this.ensureDirectoryExists(projectDir);

        // Write each document to a file
        const filePaths: string[] = [];

        for (const doc of result.documents) {
            const filePath = path.join(projectDir, doc.suggestedFilename);
            await fs.writeFile(filePath, doc.content, 'utf-8');
            filePaths.push(filePath);
        }

        return {
            ...result,
            filePaths,
        };
    }

    /**
     * Ensures a directory exists, creating it if necessary
     * @param dir - Directory path
     */
    private async ensureDirectoryExists(dir: string): Promise<void> {
        try {
            await fs.access(dir);
        } catch (error) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
}

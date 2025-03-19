import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DocumentService } from '../services/document-service.js';
import { DocumentType } from '../types/documentation-types.js';
import { startDocScribeServer } from '../server/mcp-server.js';
import { loadEnv } from './env.js';

/**
 * Runs the CLI command parser
 */
export async function runCli(): Promise<void> {
    const env = loadEnv();

    await yargs(hideBin(process.argv))
        .command(
            'generate',
            'Generate documentation',
            (yargs) => {
                return yargs
                    .option('documentType', {
                        alias: 't',
                        describe: 'Type of document to generate',
                        choices: ['technical', 'database', 'uiux', 'audience', 'accessibility', 'api', 'all'],
                        demandOption: true,
                    })
                    .option('projectName', {
                        alias: 'n',
                        describe: 'Name of the project',
                        type: 'string',
                        demandOption: true,
                    })
                    .option('description', {
                        alias: 'd',
                        describe: 'Description of what the project should accomplish',
                        type: 'string',
                        demandOption: true,
                    })
                    .option('additionalContext', {
                        alias: 'c',
                        describe: 'Additional context or requirements',
                        type: 'string',
                    })
                    .option('targetAudience', {
                        alias: 'a',
                        describe: 'Intended audience for the documentation',
                        type: 'string',
                    })
                    .option('implementationDetails', {
                        alias: 'i',
                        describe: 'Specific implementation details or constraints',
                        type: 'string',
                    })
                    .option('integrationPoints', {
                        alias: 'p',
                        describe: 'Systems or services to integrate with',
                        type: 'string',
                    })
                    .option('outputDir', {
                        alias: 'o',
                        describe: 'Directory to output documentation to',
                        type: 'string',
                        default: './docs',
                    });
            },
            async (argv) => {
                const documentService = new DocumentService(env.API_TOKEN, env.AI_PROVIDER, argv.outputDir);

                console.log(`Generating ${argv.documentType} documentation for ${argv.projectName}...`);

                try {
                    const result = await documentService.generateAndWriteDocumentation({
                        documentType: argv.documentType as DocumentType,
                        projectName: argv.projectName,
                        description: argv.description,
                        additionalContext: argv.additionalContext,
                        targetAudience: argv.targetAudience,
                        implementationDetails: argv.implementationDetails,
                        integrationPoints: argv.integrationPoints,
                    });

                    console.log(`✅ Documentation generation successful!`);
                    console.log(
                        `Generated ${result.documents.length} document(s) in ${result.generationTime / 1000} seconds.`,
                    );
                    console.log('Files:');
                    for (const filePath of result.filePaths) {
                        console.log(`- ${filePath}`);
                    }
                } catch (error) {
                    console.error('❌ Documentation generation failed:');
                    if (error instanceof Error) {
                        console.error(error.message);
                    } else {
                        console.error(error);
                    }
                    process.exit(1);
                }
            },
        )
        .command(
            'server',
            'Start MCP server',
            (yargs) => {
                return yargs
                    .option('run-sse', {
                        alias: 's',
                        describe: 'Run with SSE transport instead of stdio',
                        type: 'boolean',
                        default: false,
                    })
                    .option('port', {
                        alias: 'p',
                        describe: 'Port for HTTP server (when using SSE)',
                        type: 'number',
                        default: 3000,
                    });
            },
            async (argv) => {
                try {
                    console.log(`Starting DocScribe MCP server...`);
                    await startDocScribeServer({
                        token: env.API_TOKEN,
                        aiProvider: env.AI_PROVIDER,
                        runSse: argv.runSse,
                        port: argv.port,
                    });
                } catch (error) {
                    console.error('❌ Server start failed:');
                    if (error instanceof Error) {
                        console.error(error.message);
                    } else {
                        console.error(error);
                    }
                    process.exit(1);
                }
            },
        )
        .demandCommand(1, 'Please specify a command: generate or server')
        .help()
        .parseAsync();
}

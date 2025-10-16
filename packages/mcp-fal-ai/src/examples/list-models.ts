import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';

async function main(): Promise<void> {
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
        console.error('FAL_API_KEY is required');
        process.exit(1);
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const serverScriptPath = path.resolve(__dirname, '../index.js');

    const client = new Client({ name: 'mcp-fal-ai-list-models', version: '1.0.0' }, { capabilities: {} });
    const transport = new StdioClientTransport({
        command: 'node',
        args: [serverScriptPath],
        env: { ...process.env, FAL_API_KEY: apiKey },
    });
    await client.connect(transport);

    console.log('🔍 Listing available models from fal.ai...\n');

    try {
        // Example 1: List first 10 models
        console.log('📋 First 10 models:');
        console.log('='.repeat(50));
        const firstPage = await client.callTool({
            name: 'fal-list-models',
            arguments: {
                limit: 10,
                page: 1,
            },
        });

        console.log('First page:', firstPage.content);

        // Example 2: Search for image generation models
        console.log('\n🎨 Image generation models:');
        console.log('='.repeat(50));
        const imageModels = await client.callTool({
            name: 'fal-search-models',
            arguments: {
                keyword: 'image generation',
                limit: 5,
            },
        });
        console.log('Image models:', JSON.stringify(imageModels.content, null, 2));

        // Example 3: Search for text models
        console.log('\n📝 Text/Language models:');
        console.log('='.repeat(50));
        const textModels = await client.callTool({
            name: 'fal-search-models',
            arguments: {
                keyword: 'text',
                limit: 5,
            },
        });

        const textModelsText = ((textModels as any).content?.[0] as any)?.text as string | undefined;
        const textModelsList = textModelsText ? JSON.parse(textModelsText) : [];

        if (Array.isArray(textModelsList)) {
            textModelsList.forEach((model: any, index: number) => {
                console.log(`${index + 1}. ${model.title || model.modelId}`);
                console.log(`   ID: ${model.modelId}`);
                console.log(`   Category: ${model.category}`);
                console.log(`   Description: ${model.shortDescription}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('Error listing models:', error);
    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});

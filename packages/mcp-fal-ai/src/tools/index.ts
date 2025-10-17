import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FalClient } from '../services/fal-client.js';
import { FalModel } from '../types/model.js';

export function registerTools(server: McpServer, token: string): void {
    const client = new FalClient({ apiKey: token });

    const toText = (value: unknown): string => {
        if (typeof value === 'string') return value;
        try {
            const json = JSON.stringify(value ?? null, null, 2);
            return typeof json === 'string' ? json : String(json);
        } catch {
            return String(value);
        }
    };

    server.tool(
        'fal-list-models',
        'List all available models from fal.ai with optional pagination parameters. Avoid  listing all models at once as it may be too many models to process.. Use the limit and page parameters to paginate the results.',
        {
            limit: z.number().optional(),
            page: z.number().optional(),
        },

        async ({ limit, page }) => {
            const result = (await client.listModels({ limit, page })) as
                | { models?: FalModel[]; data?: FalModel[] }
                | FalModel[]
                | unknown;
            const list = Array.isArray(result) ? result : ((result as any)?.models ?? (result as any)?.data ?? result);
            return { content: [{ type: 'text', text: toText(list) }] };
        },
    );

    server.tool(
        'fal-search-models',
        'Search for models by keywords with optional category and limit filtering. The keywords are used to search for models that match the keywords.',
        {
            keyword: z.string(),
            limit: z.number().optional(),
            category: z.string().optional(),
        },
        async ({ keyword, limit, category }) => {
            const result = (await client.searchModels({ keyword, limit, category })) as
                | { models?: FalModel[] }
                | FalModel[]
                | unknown;
            const list = Array.isArray(result) ? result : ((result as any)?.models ?? result);
            return { content: [{ type: 'text', text: toText(list) }] };
        },
    );

    server.tool(
        'fal-get-model-schema',
        'Get the schema for a model. The model schema is used to understand the input and output of the model. use the modelId to get the schema of the model.',
        {
            modelId: z.string(),
        },
        async (args) => {
            const modelId = (args as any)?.modelId ?? (args as any)?.arguments?.modelId;
            const schema = await client.getModelSchema(modelId as any);
            return { content: [{ type: 'text', text: toText(schema) }] };
        },
    );

    server.tool(
        'fal-run-sync',
        'Run a model synchronously and automatically download any image URLs in the response. The model is run synchronously using the fal.run endpoint. Returns the model output with embedded base64 image data for any image URLs found.',
        {
            modelId: z.string(),
            input: z.unknown(),
        },
        async ({ modelId, input }) => {
            const output = await client.runSync(modelId, input);
            return { content: [{ type: 'text', text: toText(output) }] };
        },
    );

    server.tool(
        'fal-enqueue',
        'Enqueue a model. The model is enqueued using the fal.run endpoint. You need to check the status of the model using the fal-get-status tool, then get the result using the fal-get-result tool.',
        {
            modelId: z.string(),
            input: z.unknown(),
        },
        async (args) => {
            const modelId = (args as any)?.modelId ?? (args as any)?.arguments?.modelId;
            const input = (args as any)?.input ?? (args as any)?.arguments?.input;
            const output = await client.enqueue(modelId as any, input);
            return { content: [{ type: 'text', text: toText(output) }] };
        },
    );

    server.tool(
        'fal-get-status',
        'Get the status of a model. The status is returned using the fal.run endpoint. You need to check the status of the model using the fal-get-status tool, then get the result using the fal-get-result tool.',
        { requestId: z.string(), modelId: z.string() },
        async ({ requestId, modelId }) => {
            const output = await client.getStatus(requestId, modelId);
            return { content: [{ type: 'text', text: toText(output) }] };
        },
    );

    server.tool(
        'fal-get-result',
        'Get the result of a model execution and automatically download any image URLs in the response. Returns the model output with embedded base64 image data for any image URLs found. You need to check the status of the model using the fal-get-status tool first.',
        { requestId: z.string(), modelId: z.string() },
        async ({ requestId, modelId }) => {
            const output = await client.getResult(requestId, modelId);
            return { content: [{ type: 'text', text: toText(output) }] };
        },
    );

    server.tool(
        'fal-cancel',
        'Cancel a the given request',
        { requestId: z.string(), modelId: z.string() },
        async ({ requestId, modelId }) => {
            const output = await client.cancel(requestId, modelId);
            return { content: [{ type: 'text', text: toText(output) }] };
        },
    );
}

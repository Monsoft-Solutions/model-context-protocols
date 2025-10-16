import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FalClient } from '../services/fal-client.js';
import { nextBackoff, sleep } from '../utils/polling.js';

export function registerTools(server: McpServer, token: string): void {
    const client = new FalClient({ apiKey: token });

    server.tool('fal-list-models', {}, async () => {
        const models = await client.listModels();
        return { content: [{ type: 'text', text: JSON.stringify(models, null, 2) }] };
    });

    server.tool(
        'fal-search-models',
        { query: z.string(), limit: z.number().optional(), category: z.string().optional() },
        async ({ query, limit, category }) => {
            const result = await client.searchModels({ query, limit, category });
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        },
    );

    server.tool('fal-get-model-schema', { modelId: z.string() }, async ({ modelId }) => {
        const schema = await client.getModelSchema(modelId);
        return { content: [{ type: 'text', text: JSON.stringify(schema, null, 2) }] };
    });

    server.tool('fal-run-sync', { modelId: z.string(), input: z.unknown() }, async ({ modelId, input }) => {
        const output = await client.runSync(modelId, input);
        return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
    });

    server.tool('fal-enqueue', { modelId: z.string(), input: z.unknown() }, async ({ modelId, input }) => {
        const output = await client.enqueue(modelId, input);
        return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
    });

    server.tool('fal-get-status', { requestId: z.string() }, async ({ requestId }) => {
        const output = await client.getStatus(requestId);
        return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
    });

    server.tool('fal-get-result', { requestId: z.string() }, async ({ requestId }) => {
        const output = await client.getResult(requestId);
        return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
    });

    server.tool('fal-cancel', { requestId: z.string() }, async ({ requestId }) => {
        const output = await client.cancel(requestId);
        return { content: [{ type: 'text', text: JSON.stringify(output, null, 2) }] };
    });

    server.tool(
        'fal-enqueue-and-wait',
        {
            modelId: z.string(),
            input: z.unknown(),
            timeoutMs: z.number().int().positive().optional().default(120_000),
            initialBackoffMs: z.number().int().positive().optional().default(1000),
        },
        async ({ modelId, input, timeoutMs, initialBackoffMs }) => {
            const enq = (await client.enqueue(modelId, input)) as { request_id?: string } | unknown;
            const requestId = (enq as any)?.request_id;
            if (!requestId || typeof requestId !== 'string') {
                return { content: [{ type: 'text', text: JSON.stringify(enq, null, 2) }] };
            }

            const start = Date.now();
            let backoff = initialBackoffMs;

            // Minimal progress log emitted via tool text
            const logs: string[] = [`queued: ${requestId}`];

            while (Date.now() - start < timeoutMs) {
                const status = (await client.getStatus(requestId)) as { status?: string; progress?: number } | unknown;
                const s = (status as any)?.status as string | undefined;
                const p = (status as any)?.progress as number | undefined;
                if (s) logs.push(`status=${s}${typeof p === 'number' ? ` progress=${p}%` : ''}`);

                if (s === 'completed' || s === 'failed' || s === 'canceled') {
                    const result = await client.getResult(requestId);
                    logs.push(`terminal=${s}`);
                    return {
                        content: [
                            { type: 'text', text: logs.join('\n') },
                            { type: 'text', text: JSON.stringify(result, null, 2) },
                        ],
                    };
                }

                await sleep(backoff);
                backoff = nextBackoff(backoff, { maxMs: 8000, factor: 1.8, jitterRatio: 0.2 });
            }

            return {
                content: [
                    { type: 'text', text: logs.join('\n') },
                    { type: 'text', text: JSON.stringify({ error: 'timeout', requestId }, null, 2) },
                ],
            };
        },
    );
}

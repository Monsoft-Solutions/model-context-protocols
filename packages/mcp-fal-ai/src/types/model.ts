import { z } from 'zod';

export const FalModelSchema = z.object({
    id: z.string(),
    modelId: z.string(),
    isFavorited: z.boolean(),
    title: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    shortDescription: z.string(),
    thumbnailUrl: z.string(),
    modelUrl: z.string(),
    githubUrl: z.string(),
    licenseType: z.string(),
    date: z.string(),
    group: z.object({
        key: z.string(),
        label: z.string(),
    }),
    machineType: z.string().nullable(),
    examples: z.array(z.string()),
    highlighted: z.boolean(),
    authSkippable: z.boolean(),
    unlisted: z.boolean(),
    deprecated: z.boolean(),
    resultComparison: z.boolean(),
    hidePricing: z.boolean(),
    private: z.boolean(),
    removed: z.boolean(),
    adminOnly: z.boolean(),
    kind: z.string(),
    trainingEndpoints: z.array(z.unknown()),
});

export type FalModel = z.infer<typeof FalModelSchema>;

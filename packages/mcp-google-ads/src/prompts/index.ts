import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { type Env } from '../config/env.js';

/**
 * Register all prompts with the MCP server
 * @param server MCP server instance
 * @param env Environment configuration
 */
export function registerPrompts(server: McpServer, env: Env): void {
    // Prompt for keyword research strategy
    server.prompt(
        'keyword-research-strategy',
        {
            businessType: z.string().describe('Type of business (e.g., e-commerce, SaaS, local service)'),
            targetAudience: z.string().describe('Target audience description'),
            competitors: z.string().optional().describe('Comma-separated list of competitor websites'),
        },
        (args, extra) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Please create a comprehensive keyword research strategy for the following business:

Business Type: ${args.businessType}
Target Audience: ${args.targetAudience}
${args.competitors ? `Competitors: ${args.competitors}` : ''}

Please provide:
1. Recommended seed keywords to start with
2. URL suggestions for keyword extraction
3. Geographic targeting recommendations
4. Language considerations
5. Competition level strategy (should we focus on low, medium, or high competition keywords?)
6. Estimated budget considerations based on typical CPCs
7. Keyword grouping suggestions for ad campaigns`,
                    },
                },
            ],
        }),
    );

    // Prompt for analyzing keyword metrics
    server.prompt(
        'analyze-keyword-metrics',
        {
            keywords: z.string().describe('Newline-separated list of keywords with their metrics'),
            businessGoals: z.string().describe('Business goals (e.g., brand awareness, conversions, traffic)'),
        },
        (args, extra) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Please analyze the following keyword metrics and provide recommendations:

Keywords Data:
${args.keywords}

Business Goals: ${args.businessGoals}

Please provide:
1. Which keywords best align with the business goals?
2. Recommended bid strategies for each keyword group
3. Keywords to prioritize based on ROI potential
4. Keywords to avoid or use as negative keywords
5. Seasonal considerations based on search trends
6. Ad group structure recommendations
7. Landing page optimization suggestions for top keywords`,
                    },
                },
            ],
        }),
    );

    // Prompt for content optimization
    server.prompt(
        'seo-content-optimization',
        {
            targetKeyword: z.string().describe('Primary keyword to optimize for'),
            currentContent: z.string().optional().describe('Current page content or URL'),
            searchIntent: z
                .string()
                .describe('Search intent type: informational, transactional, navigational, or commercial'),
        },
        (args, extra) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Please provide SEO content optimization recommendations for:

Target Keyword: ${args.targetKeyword}
Search Intent: ${args.searchIntent}
${args.currentContent ? `Current Content: ${args.currentContent}` : 'Creating new content'}

Please provide:
1. Title tag and meta description recommendations
2. H1-H6 heading structure suggestions
3. Related keywords and LSI terms to include
4. Content length recommendations
5. Internal linking opportunities
6. Schema markup suggestions
7. Featured snippet optimization tips
8. Content gaps to address based on search intent`,
                    },
                },
            ],
        }),
    );

    // Prompt for PPC campaign structure
    server.prompt(
        'ppc-campaign-structure',
        {
            keywordGroups: z.string().describe('Newline-separated groups of related keywords'),
            monthlyBudget: z.string().describe('Monthly advertising budget in USD'),
            conversionValue: z.string().optional().describe('Average conversion value in USD'),
        },
        (args, extra) => ({
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Please design a PPC campaign structure based on:

Keyword Groups:
${args.keywordGroups}

Monthly Budget: $${args.monthlyBudget}
${args.conversionValue ? `Average Conversion Value: $${args.conversionValue}` : ''}

Please provide:
1. Recommended campaign structure
2. Ad group organization
3. Budget allocation across ad groups
4. Bidding strategy recommendations
5. Ad copy suggestions for each ad group
6. Landing page requirements
7. Expected performance metrics
8. Testing and optimization roadmap`,
                    },
                },
            ],
        }),
    );
}

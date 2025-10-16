import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { GoogleAdsClient } from '../services/google-ads-client.js';
import { type Env } from '../config/env.js';
import { GoogleAdsApiError } from '../errors/google-ads-api-error.js';

/**
 * Keyword research tool for generating keyword ideas and metrics
 */
export class KeywordResearchTool {
    /**
     * Register the keyword research tool with the MCP server
     */
    static register(server: McpServer, googleAdsClient: GoogleAdsClient): void {
        // Tool for generating keyword ideas
        server.tool(
            'generate-keyword-ideas',
            {
                keywords: z.array(z.string()).optional().describe('Seed keywords to generate ideas from'),
                urls: z.array(z.string()).optional().describe('URLs to extract keyword ideas from'),
                languageCode: z.string().optional().describe('Language code (e.g., "en" for English)'),
                locationCodes: z
                    .array(z.string())
                    .optional()
                    .describe('Geographic location codes (e.g., ["1009"] for USA)'),
                includeAdultKeywords: z.boolean().optional().describe('Whether to include adult keywords'),
                pageSize: z
                    .number()
                    .int()
                    .positive()
                    .max(100)
                    .optional()
                    .describe('Number of results to return (max 100)'),
            },
            async (args) => {
                try {
                    // Validate that at least one seed source is provided
                    if ((!args.keywords || args.keywords.length === 0) && (!args.urls || args.urls.length === 0)) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: 'Error: Please provide at least one keyword or URL to generate ideas from.',
                                },
                            ],
                        };
                    }

                    const results = await googleAdsClient.generateKeywordIdeas({
                        keywords: args.keywords,
                        urls: args.urls,
                        languageCode: args.languageCode,
                        locationCodes: args.locationCodes,
                        includeAdultKeywords: args.includeAdultKeywords,
                        pageSize: args.pageSize,
                    });

                    // Format results as a table
                    const formattedResults = results
                        .map(
                            (kw) =>
                                `• ${kw.keyword}\n` +
                                `  - Avg Monthly Searches: ${kw.avgMonthlySearches.toLocaleString()}\n` +
                                `  - Competition: ${kw.competition}\n` +
                                `  - Top Page Bid: ${kw.currency || 'USD'} ${
                                    kw.topOfPageBidLowRange && kw.topOfPageBidHighRange
                                        ? `${(kw.topOfPageBidLowRange / 1000000).toFixed(2)} - ${(kw.topOfPageBidHighRange / 1000000).toFixed(2)}`
                                        : 'N/A'
                                }`,
                        )
                        .join('\n\n');

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Generated ${results.length} keyword ideas:\n\n${formattedResults}`,
                            },
                        ],
                    };
                } catch (error) {
                    const errorMessage =
                        error instanceof GoogleAdsApiError ? error.message : 'An unexpected error occurred';

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${errorMessage}`,
                            },
                        ],
                    };
                }
            },
        );

        // Tool for getting historical metrics for specific keywords
        server.tool(
            'get-keyword-metrics',
            {
                keywords: z.array(z.string()).min(1).max(100).describe('Keywords to get metrics for (max 100)'),
                languageCode: z.string().optional().describe('Language code (e.g., "en" for English)'),
                locationCodes: z
                    .array(z.string())
                    .optional()
                    .describe('Geographic location codes (e.g., ["1009"] for USA)'),
            },
            async (args) => {
                try {
                    const results = await googleAdsClient.getKeywordHistoricalMetrics(
                        args.keywords,
                        args.languageCode,
                        args.locationCodes,
                    );

                    // Format results as a detailed report
                    const formattedResults = results
                        .map((kw) => {
                            let report = `📊 ${kw.keyword}\n`;
                            report += `   Average Monthly Searches: ${kw.avgMonthlySearches.toLocaleString()}\n`;
                            report += `   Competition: ${kw.competition}`;

                            if (kw.competitionIndex !== undefined) {
                                report += ` (Index: ${kw.competitionIndex}/100)`;
                            }
                            report += '\n';

                            if (kw.topOfPageBidLowRange && kw.topOfPageBidHighRange) {
                                report += `   CPC Range: ${kw.currency || 'USD'} ${(
                                    kw.topOfPageBidLowRange / 1000000
                                ).toFixed(2)} - ${(kw.topOfPageBidHighRange / 1000000).toFixed(2)}\n`;
                            }

                            if (kw.monthlySearchVolumes && kw.monthlySearchVolumes.length > 0) {
                                report += '   Monthly Trend (last 3 months):\n';
                                const recentMonths = kw.monthlySearchVolumes.slice(-3);
                                recentMonths.forEach((mv) => {
                                    const monthName = new Date(mv.year, mv.month - 1).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                    });
                                    report += `     ${monthName}: ${mv.monthlySearches.toLocaleString()}\n`;
                                });
                            }

                            return report;
                        })
                        .join('\n');

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Keyword Metrics Report\n${'='.repeat(50)}\n\n${formattedResults}`,
                            },
                        ],
                    };
                } catch (error) {
                    const errorMessage =
                        error instanceof GoogleAdsApiError ? error.message : 'An unexpected error occurred';

                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${errorMessage}`,
                            },
                        ],
                    };
                }
            },
        );
    }
}

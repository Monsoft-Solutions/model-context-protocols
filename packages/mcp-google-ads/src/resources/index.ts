import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type Env } from '../config/env.js';

/**
 * Register all resources with the MCP server
 * @param server MCP server instance
 * @param env Environment configuration
 */
export function registerResources(server: McpServer, env: Env): void {
    // Resource for location codes reference
    server.resource('location-codes', 'google-ads://location-codes', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `Google Ads Location Codes Reference

Common location codes for targeting:
- 1009: United States
- 2826: United Kingdom
- 2124: Canada
- 2036: Australia
- 2276: Germany
- 2250: France
- 2380: Italy
- 2724: Spain
- 2528: Netherlands
- 2076: Brazil
- 2356: India
- 2392: Japan
- 2156: China
- 2410: South Korea
- 2484: Mexico

For a complete list of location codes, visit:
https://developers.google.com/google-ads/api/data/geotargets

Current configuration:
- API Version: ${env.API_VERSION}
- Max Keywords per Request: ${env.MAX_KEYWORDS_PER_REQUEST}
- Rate Limit Delay: ${env.RATE_LIMIT_DELAY_MS}ms`,
            },
        ],
    }));

    // Resource for language codes reference
    server.resource('language-codes', 'google-ads://language-codes', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `Google Ads Language Codes Reference

Common language codes:
- en: English
- es: Spanish
- fr: French
- de: German
- it: Italian
- pt: Portuguese
- nl: Dutch
- ja: Japanese
- ko: Korean
- zh: Chinese
- ru: Russian
- ar: Arabic
- hi: Hindi
- tr: Turkish
- pl: Polish

Format: Use ISO 639-1 two-letter codes
Example: "en" for English, "es" for Spanish

For targeting multiple languages, make separate API calls with different language codes.`,
            },
        ],
    }));

    // Resource for keyword match types
    server.resource('keyword-match-types', 'google-ads://keyword-match-types', async (uri) => ({
        contents: [
            {
                uri: uri.href,
                text: `Google Ads Keyword Match Types

1. Broad Match (default)
   - Shows ads for searches related to your keyword
   - May include synonyms, related searches, and variations
   - Example: "lawn mowing service" could match "grass cutting service"

2. Phrase Match
   - Shows ads for searches that include the meaning of your keyword
   - More targeted than broad match
   - Example: "lawn mowing service" could match "affordable lawn mowing service"

3. Exact Match
   - Shows ads for searches with the same meaning or intent
   - Most precise targeting
   - Example: [lawn mowing service] matches "lawn mowing service" or close variants

4. Negative Keywords
   - Prevents ads from showing for specific searches
   - Use to exclude irrelevant traffic
   - Example: -free excludes searches containing "free"

Note: The keyword planner API returns broad match ideas by default.`,
            },
        ],
    }));

    // Dynamic resource for keyword competition levels
    server.resource(
        'competition-levels',
        new ResourceTemplate('google-ads://competition/{level}', { list: undefined }),
        async (uri, { level }) => {
            const competitionInfo: Record<string, string> = {
                low: `Low Competition Keywords:
- Typically less competitive, lower CPC
- Good for niche markets or long-tail keywords
- Competition index: 0-33
- Easier to rank but may have lower search volume
- Ideal for budget-conscious campaigns`,

                medium: `Medium Competition Keywords:
- Balanced competition and search volume
- Competition index: 34-66
- Moderate CPC rates
- Good mix of traffic potential and achievability
- Suitable for most campaigns`,

                high: `High Competition Keywords:
- Very competitive, higher CPC
- Competition index: 67-100
- Usually high search volume
- Dominated by established advertisers
- Requires larger budgets and optimized campaigns`,
            };

            const levelStr = Array.isArray(level) ? level[0] : level;
            const info =
                competitionInfo[levelStr?.toLowerCase() || ''] ||
                'Invalid competition level. Use: low, medium, or high';

            return {
                contents: [
                    {
                        uri: uri.href,
                        text: info,
                    },
                ],
            };
        },
    );
}

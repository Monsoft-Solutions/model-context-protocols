# Tools API Reference

The Google Ads MCP Server provides tools for keyword research and analysis. These tools allow you to generate keyword ideas and retrieve detailed metrics.

## Available Tools

### `generate-keyword-ideas`

Generate keyword ideas based on seed keywords or URLs.

#### Parameters

| Parameter              | Type     | Required | Description                                           |
| ---------------------- | -------- | -------- | ----------------------------------------------------- |
| `keywords`             | string[] | No\*     | Array of seed keywords to generate ideas from         |
| `urls`                 | string[] | No\*     | Array of URLs to extract keyword ideas from           |
| `languageCode`         | string   | No       | Language code (e.g., "en" for English). Default: "en" |
| `locationCodes`        | string[] | No       | Geographic location codes. Default: ["1009"] (USA)    |
| `includeAdultKeywords` | boolean  | No       | Whether to include adult keywords. Default: false     |
| `pageSize`             | number   | No       | Number of results to return (max 100). Default: 100   |

\*At least one of `keywords` or `urls` must be provided.

#### Example Request

```javascript
{
  "tool": "generate-keyword-ideas",
  "arguments": {
    "keywords": ["running shoes", "athletic footwear"],
    "urls": ["https://example.com/running-gear"],
    "languageCode": "en",
    "locationCodes": ["1009"],
    "includeAdultKeywords": false,
    "pageSize": 50
  }
}
```

#### Example Response

```
Generated 50 keyword ideas:

• best running shoes
  - Avg Monthly Searches: 246,000
  - Competition: HIGH
  - Top Page Bid: USD 1.25 - 3.45

• running shoes for women
  - Avg Monthly Searches: 165,000
  - Competition: HIGH
  - Top Page Bid: USD 0.95 - 2.85

• trail running shoes
  - Avg Monthly Searches: 74,000
  - Competition: MEDIUM
  - Top Page Bid: USD 0.75 - 2.15
```

#### Use Cases

- **Content Planning**: Generate topic ideas for blog posts and landing pages
- **PPC Campaign Development**: Find new keywords for ad groups
- **SEO Research**: Discover long-tail keywords with lower competition
- **Market Research**: Understand what users are searching for

---

### `get-keyword-metrics`

Retrieve detailed historical metrics for specific keywords.

#### Parameters

| Parameter       | Type     | Required | Description                                           |
| --------------- | -------- | -------- | ----------------------------------------------------- |
| `keywords`      | string[] | Yes      | Array of keywords to get metrics for (max 100)        |
| `languageCode`  | string   | No       | Language code (e.g., "en" for English). Default: "en" |
| `locationCodes` | string[] | No       | Geographic location codes. Default: ["1009"] (USA)    |

#### Example Request

```javascript
{
  "tool": "get-keyword-metrics",
  "arguments": {
    "keywords": [
      "running shoes",
      "best marathon shoes",
      "cushioned running shoes"
    ],
    "languageCode": "en",
    "locationCodes": ["1009", "2826"] // USA and UK
  }
}
```

#### Example Response

```
Keyword Metrics Report
==================================================

📊 running shoes
   Average Monthly Searches: 673,000
   Competition: HIGH (Index: 89/100)
   CPC Range: USD 0.95 - 3.25
   Monthly Trend (last 3 months):
     Sep 2024: 745,000
     Oct 2024: 689,000
     Nov 2024: 612,000

📊 best marathon shoes
   Average Monthly Searches: 22,200
   Competition: MEDIUM (Index: 65/100)
   CPC Range: USD 0.65 - 2.15
   Monthly Trend (last 3 months):
     Sep 2024: 19,500
     Oct 2024: 24,800
     Nov 2024: 22,300

📊 cushioned running shoes
   Average Monthly Searches: 14,800
   Competition: MEDIUM (Index: 58/100)
   CPC Range: USD 0.55 - 1.95
   Monthly Trend (last 3 months):
     Sep 2024: 13,200
     Oct 2024: 15,900
     Nov 2024: 15,300
```

#### Use Cases

- **Keyword Prioritization**: Compare search volumes to focus on high-impact keywords
- **Budget Planning**: Use CPC estimates to calculate advertising budgets
- **Seasonal Analysis**: Identify trends and plan content calendars
- **Competition Analysis**: Find keywords with favorable competition levels

## Error Handling

All tools return user-friendly error messages when issues occur:

### Common Errors

1. **Missing Required Parameters**

```
Error: Please provide at least one keyword or URL to generate ideas from.
```

2. **API Rate Limits**

```
Error: Failed to generate keyword ideas: API rate limit exceeded. Please try again later.
```

3. **Invalid Credentials**

```
Error: Failed to authenticate with Google Ads API. Please check your credentials.
```

4. **Invalid Parameters**

```
Error: Invalid language code. Please use ISO 639-1 format (e.g., "en" for English).
```

## Best Practices

### 1. Batch Operations

When getting metrics for multiple keywords, batch them efficiently:

- Maximum 100 keywords per request
- Group related keywords together
- Consider rate limits (default: 1 second delay between requests)

### 2. Language and Location Targeting

- Always specify `languageCode` for non-English markets
- Use multiple `locationCodes` for broader geographic analysis
- See the [location-codes resource](resources.md#location-codes) for available codes

### 3. Keyword Idea Generation

- Combine both keywords and URLs for comprehensive results
- Start with broad terms, then refine based on results
- Use competitor URLs to discover their targeted keywords

### 4. Metrics Analysis

- Compare competition index with search volume for opportunities
- Monitor seasonal trends for campaign timing
- Use CPC estimates to prioritize by potential ROI

## Rate Limiting

The server implements automatic rate limiting to comply with Google Ads API quotas:

- Default delay: 1000ms between API calls
- Configurable via `--rate-limit-delay` parameter
- Automatic retry with exponential backoff on rate limit errors

## Related Resources

- [Location Codes Reference](resources.md#location-codes)
- [Language Codes Reference](resources.md#language-codes)
- [Competition Levels Guide](resources.md#competition-levels)
- [Keyword Research Guide](../guides/keyword-research.md)

# Google Ads MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Google Ads API for keyword research, campaign planning, and SEO optimization.

## Features

- 🔍 **Keyword Research**: Generate keyword ideas from seed keywords or URLs
- 📊 **Metrics Analysis**: Get search volume, competition data, and CPC estimates
- 🌍 **Geographic Targeting**: Support for location-based keyword research
- 🗣️ **Multi-language Support**: Research keywords in multiple languages
- 💰 **Budget Planning**: CPC estimates and competition analysis
- 🎯 **Smart Prompts**: Pre-built prompts for campaign strategy and SEO
- 📈 **Historical Data**: Access to 12-month search trend data

## Installation

```bash
npm install -g @monsoft/mcp-google-ads
```

Or install from source:

```bash
git clone https://github.com/Monsoft-Solutions/model-context-protocols.git
cd model-context-protocols/packages/mcp-google-ads
npm install
npm run build
npm link
```

## Prerequisites

1. **Google Ads API Access**

    - Google Cloud project with Ads API enabled
    - OAuth 2.0 credentials (Client ID and Secret)
    - Developer token from Google Ads
    - Refresh token for authentication
    - Customer ID for the Google Ads account

2. **System Requirements**
    - Node.js 18 or higher
    - npm or yarn package manager

## Quick Start

### 1. Set up credentials

```bash
export GOOGLE_ADS_CLIENT_ID="your-client-id"
export GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
export GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
export GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token"
export GOOGLE_ADS_CUSTOMER_ID="1234567890"
```

### 2. Run the server

```bash
# Standard mode (stdio)
mcp-google-ads

# Or with command line arguments
mcp-google-ads \
  --client-id=YOUR_CLIENT_ID \
  --client-secret=YOUR_SECRET \
  --developer-token=YOUR_TOKEN \
  --refresh-token=YOUR_REFRESH_TOKEN \
  --customer-id=YOUR_CUSTOMER_ID
```

### 3. Configure your MCP client

For Claude Desktop, add to your configuration:

```json
{
    "mcpServers": {
        "google-ads": {
            "command": "mcp-google-ads",
            "args": [
                "--client-id",
                "YOUR_CLIENT_ID",
                "--client-secret",
                "YOUR_CLIENT_SECRET",
                "--developer-token",
                "YOUR_DEVELOPER_TOKEN",
                "--refresh-token",
                "YOUR_REFRESH_TOKEN",
                "--customer-id",
                "YOUR_CUSTOMER_ID"
            ]
        }
    }
}
```

## Available Tools

### `generate-keyword-ideas`

Generate keyword ideas based on seed keywords or URLs.

```javascript
{
  "tool": "generate-keyword-ideas",
  "arguments": {
    "keywords": ["running shoes", "athletic footwear"],
    "languageCode": "en",
    "locationCodes": ["1009"], // USA
    "pageSize": 50
  }
}
```

### `get-keyword-metrics`

Get detailed metrics for specific keywords.

```javascript
{
  "tool": "get-keyword-metrics",
  "arguments": {
    "keywords": ["best running shoes", "marathon shoes"],
    "languageCode": "en",
    "locationCodes": ["1009"]
  }
}
```

## Available Resources

- `google-ads://location-codes` - Geographic location codes reference
- `google-ads://language-codes` - Language codes reference
- `google-ads://keyword-match-types` - Keyword match types guide
- `google-ads://competition/{level}` - Competition level information

## Available Prompts

- `keyword-research-strategy` - Create comprehensive keyword research strategies
- `analyze-keyword-metrics` - Analyze keyword metrics and provide recommendations
- `seo-content-optimization` - SEO content optimization recommendations
- `ppc-campaign-structure` - Design PPC campaign structures

## Configuration Options

| Option                | Description                 | Default  |
| --------------------- | --------------------------- | -------- |
| `--client-id`         | Google Ads Client ID        | Required |
| `--client-secret`     | Google Ads Client Secret    | Required |
| `--developer-token`   | Google Ads Developer Token  | Required |
| `--refresh-token`     | Google Ads Refresh Token    | Required |
| `--customer-id`       | Google Ads Customer ID      | Required |
| `--login-customer-id` | Manager account customer ID | Optional |
| `--api-version`       | Google Ads API version      | v20      |
| `--max-keywords`      | Max keywords per request    | 100      |
| `--rate-limit-delay`  | API rate limit delay (ms)   | 1000     |
| `--run-sse`           | Run with SSE transport      | false    |
| `--port`              | Port for SSE mode           | 3000     |

## Development

### Building from source

```bash
npm install
npm run build
npm run validate
```

### Running in development

```bash
npm run watch
```

### Testing

```bash
npm test
```

## Documentation

Full documentation is available in the `docs/` directory:

- [Installation Guide](docs/getting-started/installation.md)
- [Authentication Setup](docs/getting-started/authentication.md)
- [API Reference](docs/api/tools.md)
- [Examples](docs/examples/basic-usage.md)

To build the documentation site:

```bash
pip install mkdocs mkdocs-material
mkdocs serve
```

## Security Considerations

- Never commit credentials to version control
- Use environment variables or secure credential stores
- Regularly rotate refresh tokens
- Monitor API usage for anomalies
- Use read-only access when possible

## Troubleshooting

### Common Issues

1. **Authentication Errors**

    - Verify all credentials are correct
    - Ensure refresh token is valid
    - Check developer token approval status

2. **API Errors**

    - Check rate limits and quotas
    - Verify customer ID format (no hyphens)
    - Ensure account has Google Ads enabled

3. **Connection Issues**
    - Check network connectivity
    - Verify API endpoints are accessible
    - Review firewall settings

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: [Report bugs](https://github.com/Monsoft-Solutions/model-context-protocols/issues)
- Documentation: [View docs](https://github.com/Monsoft-Solutions/model-context-protocols)

---

Built with ❤️ by [Monsoft Solutions](https://monsoftsolutions.com)

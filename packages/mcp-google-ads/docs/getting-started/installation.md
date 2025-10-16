# Installation Guide

This guide will walk you through installing and setting up the Google Ads MCP Server.

## Prerequisites

Before installing the Google Ads MCP Server, ensure you have:

- **Node.js 18 or higher** installed
- **npm** or **yarn** package manager
- **Google Ads API access** (see [Authentication Setup](authentication.md))
- A **Google Ads account** with a valid customer ID

## Installation Methods

### Method 1: Install from npm (Recommended)

```bash
npm install -g @monsoft/mcp-google-ads
```

Or with yarn:

```bash
yarn global add @monsoft/mcp-google-ads
```

### Method 2: Install from Source

1. Clone the repository:

```bash
git clone https://github.com/Monsoft-Solutions/model-context-protocols.git
cd model-context-protocols/packages/mcp-google-ads
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Link globally (optional):

```bash
npm link
```

## Verify Installation

After installation, verify the server is properly installed:

```bash
mcp-google-ads --help
```

You should see the help output with available options:

```
Options:
  -c, --client-id         Google Ads Client ID                    [string]
  -s, --client-secret     Google Ads Client Secret                [string]
  -d, --developer-token   Google Ads Developer Token              [string]
  -r, --refresh-token     Google Ads Refresh Token                [string]
  -i, --customer-id       Google Ads Customer ID                  [string]
  -l, --login-customer-id Google Ads Login Customer ID (optional) [string]
  -v, --api-version       Google Ads API Version                  [string]
  -k, --max-keywords      Maximum keywords per request            [number]
  --run-sse               Run server with SSE transport           [boolean]
  -p, --port              Port for HTTP server (SSE mode)         [number]
  --help                  Show help                               [boolean]
```

## MCP Client Configuration

### For Claude Desktop

Add the following to your Claude Desktop configuration:

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

### For Other MCP Clients

The server can be started in different modes:

1. **Stdio mode** (default):

```bash
mcp-google-ads --client-id=YOUR_CLIENT_ID --client-secret=YOUR_SECRET ...
```

2. **SSE mode** for HTTP-based clients:

```bash
mcp-google-ads --run-sse --port=3000 --client-id=YOUR_CLIENT_ID ...
```

## Environment Variables

Instead of passing credentials via command line, you can use environment variables:

```bash
export GOOGLE_ADS_CLIENT_ID="your-client-id"
export GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
export GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
export GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token"
export GOOGLE_ADS_CUSTOMER_ID="123-456-7890"

# Then run the server
mcp-google-ads
```

## Docker Installation (Optional)

If you prefer using Docker:

```dockerfile
FROM node:18-alpine
RUN npm install -g @monsoft/mcp-google-ads
CMD ["mcp-google-ads"]
```

Build and run:

```bash
docker build -t mcp-google-ads .
docker run -e GOOGLE_ADS_CLIENT_ID=xxx ... mcp-google-ads
```

## Next Steps

- Continue to [Authentication Setup](authentication.md) to configure Google Ads API access
- Review [Configuration Options](configuration.md) for advanced settings
- Follow the [Quick Start Guide](quick-start.md) to make your first API calls

## Troubleshooting

### Installation Issues

If you encounter permission errors during global installation:

```bash
sudo npm install -g @monsoft/mcp-google-ads
```

Or use a Node version manager like nvm to avoid permission issues.

### Build Errors

If building from source fails:

1. Ensure you have TypeScript installed: `npm install -g typescript`
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm install`

For more help, see the [Troubleshooting Guide](../troubleshooting.md).

# Authentication Setup

This guide walks you through setting up authentication for the Google Ads API. You'll need to obtain several credentials to use the Google Ads MCP Server.

## Overview

The Google Ads API uses OAuth 2.0 for authentication. You'll need:

1. **Google Cloud Project** with Ads API enabled
2. **OAuth 2.0 Credentials** (Client ID and Secret)
3. **Developer Token** from Google Ads
4. **Refresh Token** for your account
5. **Customer ID** for the Google Ads account

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Note your project ID for later use

## Step 2: Enable Google Ads API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google Ads API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
    - Choose "External" user type (or "Internal" for Google Workspace)
    - Fill in the required fields
    - Add your email to test users
4. For Application type, choose "Desktop app"
5. Name it (e.g., "Google Ads MCP Server")
6. Click "Create"
7. **Save the Client ID and Client Secret**

## Step 4: Get a Developer Token

1. Sign in to your [Google Ads account](https://ads.google.com)
2. Click the tools icon (🔧) > "Setup" > "API Center"
3. If you don't have a token, click "Apply for access"
4. Fill out the application form
5. **Note**: Test accounts get immediate access with a test token
6. **Save your Developer Token**

!!! note "Developer Token Levels" - **Test Account**: Immediate access, can only access test accounts - **Basic Access**: Limited quota, suitable for small applications - **Standard Access**: Higher quota for production use

## Step 5: Generate a Refresh Token

You'll need to generate a refresh token that allows the server to access your Google Ads account.

### Option 1: Using the OAuth Playground (Recommended)

1. Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) and check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In the left panel, find and select:
    - `https://www.googleapis.com/auth/adwords`
5. Click "Authorize APIs"
6. Sign in and grant permissions
7. Click "Exchange authorization code for tokens"
8. **Save the Refresh Token**

### Option 2: Using the Command Line Tool

```bash
# Install the Google Ads API client library
pip install google-ads

# Run the authentication helper
python -m google.ads.googleads.oauth2 \
  --client_id=YOUR_CLIENT_ID \
  --client_secret=YOUR_CLIENT_SECRET \
  --scopes=https://www.googleapis.com/auth/adwords
```

Follow the prompts to authorize and get your refresh token.

## Step 6: Find Your Customer ID

1. Sign in to [Google Ads](https://ads.google.com)
2. Look at the top-right corner of the page
3. Your Customer ID is displayed (format: 123-456-7890)
4. **Remove the hyphens** when using it (e.g., 1234567890)

!!! tip "Manager Accounts"
If you're using a manager account, you'll also need the `login-customer-id` which is the customer ID of your manager account.

## Step 7: Test Your Credentials

Create a test configuration file to verify your credentials:

```bash
# Create a test environment file
cat > test-env.sh << EOF
export GOOGLE_ADS_CLIENT_ID="your-client-id"
export GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
export GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
export GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token"
export GOOGLE_ADS_CUSTOMER_ID="1234567890"
EOF

# Load the environment
source test-env.sh

# Test the server
mcp-google-ads
```

If successful, you should see:

```
Environment configuration loaded successfully
Customer ID: 1234567890
API Version: v20
Starting server with stdio transport
Google Ads MCP server started with stdio transport
```

## Security Best Practices

### 1. Never Commit Credentials

Never commit credentials to version control. Use:

- Environment variables
- Secret management tools
- Configuration files (added to .gitignore)

### 2. Use Least Privilege

Only grant the minimum necessary permissions:

- Use read-only access when possible
- Limit access to specific accounts
- Regularly review and revoke unused tokens

### 3. Rotate Credentials

Periodically refresh your credentials:

- Generate new refresh tokens
- Update client secrets
- Monitor API usage for anomalies

### 4. Secure Storage

For production use:

- Use environment variable management tools
- Consider using Google Secret Manager
- Encrypt credentials at rest

## Troubleshooting Authentication

### "Invalid Client" Error

- Verify Client ID and Secret are correct
- Ensure OAuth consent screen is configured
- Check that the redirect URI matches

### "Invalid Grant" Error

- Refresh token may be expired
- Generate a new refresh token
- Ensure the token matches the client credentials

### "Developer Token Not Approved"

- Check developer token status in API Center
- For production use, apply for Basic or Standard access
- Use a test account for development

### "Customer Not Found"

- Verify the customer ID format (no hyphens)
- Ensure the account has Google Ads enabled
- Check manager account permissions

## Next Steps

Now that authentication is set up:

- Review [Configuration Options](configuration.md) for additional settings
- Follow the [Quick Start Guide](quick-start.md) to make your first API calls
- Explore [API Tools](../api/tools.md) for available operations

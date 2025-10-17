# Quick Start Guide

## Setup

1. **Get your Vercel Blob token**:

    - Go to [Vercel Dashboard](https://vercel.com/dashboard)
    - Navigate to Storage → Blob
    - Create a new store or select existing one
    - Copy the `BLOB_READ_WRITE_TOKEN`

2. **Install the package**:

    ```bash
    npm install @monsoft/mcp-vercel-blob
    ```

3. **Configure Claude Desktop**:

    Edit your config file at:

    - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
    - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

    Add:

    ```json
    {
        "mcpServers": {
            "vercel-blob": {
                "command": "npx",
                "args": ["-y", "@monsoft/mcp-vercel-blob", "--token", "YOUR_TOKEN_HERE"]
            }
        }
    }
    ```

4. **Restart Claude Desktop**

## Example Usage with Claude

### Upload a File from Your Computer

```
Upload the file at /Users/john/Pictures/vacation.jpg to Vercel Blob at "photos/vacation.jpg"
```

Claude will use the `vercel-blob-put-file` tool to automatically read and upload the file.

### Upload an Image (from base64 or text)

```
Please upload this image to Vercel Blob storage at path "avatars/profile.jpg"
[Provide base64 image data or URL]
```

Claude will use the `vercel-blob-put` tool to upload the image.

### List Your Blobs

```
Show me all blobs in the "avatars/" folder
```

Claude will use the `vercel-blob-list` tool with the prefix filter.

### Get Blob Information

```
Get information about this blob: https://blob.vercel-storage.com/image.jpg
```

Claude will use the `vercel-blob-head` tool.

### Delete a Blob

```
Delete this blob: https://blob.vercel-storage.com/old-image.jpg
```

Claude will use the `vercel-blob-delete` tool.

## Integration with fal-ai MCP

When using both fal-ai and vercel-blob MCPs together:

```
1. Generate an image using FLUX model
2. Upload the generated image file to Vercel Blob at "generated/flux-image.jpg"
```

Claude will:

1. Use fal-ai MCP to generate and download the image
2. Use vercel-blob MCP's `vercel-blob-put-file` tool to automatically read the downloaded file and upload it
3. Provide you with the permanent blob URL

The workflow is seamless - you don't need to manually handle base64 encoding or file reading!

## Command Line Usage

### Run directly:

```bash
npx @monsoft/mcp-vercel-blob --token=YOUR_TOKEN
```

### With SSE (for HTTP access):

```bash
npx @monsoft/mcp-vercel-blob --token=YOUR_TOKEN --run-sse --port=3002
```

### Using environment variables:

```bash
export BLOB_READ_WRITE_TOKEN=your_token
npx @monsoft/mcp-vercel-blob
```

## Troubleshooting

### "Environment validation failed"

- Ensure your token is set correctly
- Check that the token starts with `vercel_blob_rw_`

### "Failed to upload blob"

- Verify your token has write permissions
- Check that your Vercel Blob store is active
- Ensure the pathname is valid

### "Module not found"

- Run `npm install` in the package directory
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies

## Tips

1. **Use addRandomSuffix**: Prevent conflicts by adding random suffixes to filenames
2. **Set appropriate cache**: Use `cacheControlMaxAge` for better performance
3. **Organize with folders**: Use paths like `images/2024/photo.jpg` for better organization
4. **List with pagination**: Use `cursor` parameter for large blob collections

## Next Steps

- Read the [full README](./README.md) for detailed API documentation
- Check out the [Vercel Blob documentation](https://vercel.com/docs/storage/vercel-blob)
- Explore integration with other MCP servers like fal-ai

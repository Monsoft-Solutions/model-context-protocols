# Vercel Blob MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage. This server enables AI assistants and other MCP clients to upload, manage, and interact with blob storage directly.

## Features

- **Upload blobs** - Store files and data in Vercel Blob storage
- **Delete blobs** - Remove one or multiple blobs
- **List blobs** - Browse and filter stored blobs with pagination
- **Get metadata** - Retrieve blob information without downloading
- **Copy blobs** - Duplicate blobs to new locations

## Installation

```bash
npm install @monsoft/mcp-vercel-blob
```

## Prerequisites

You need a Vercel Blob read-write token. You can get this from your [Vercel dashboard](https://vercel.com/dashboard):

1. Go to your Vercel project
2. Navigate to **Storage** → **Blob**
3. Create a new Blob store if you don't have one
4. Copy the read-write token

## Usage

### Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
    "mcpServers": {
        "vercel-blob": {
            "command": "npx",
            "args": ["-y", "@monsoft/mcp-vercel-blob", "--token", "YOUR_VERCEL_BLOB_READ_WRITE_TOKEN"]
        }
    }
}
```

### Running with stdio (Default)

```bash
npx mcp-vercel-blob --token=YOUR_BLOB_READ_WRITE_TOKEN
```

Or set the environment variable:

```bash
export BLOB_READ_WRITE_TOKEN=your_token_here
npx mcp-vercel-blob
```

### Running with SSE (Server-Sent Events)

```bash
npx mcp-vercel-blob --token=YOUR_TOKEN --run-sse --port=3002
```

### Configuration Options

| Option      | Alias | Environment Variable    | Default | Description                             |
| ----------- | ----- | ----------------------- | ------- | --------------------------------------- |
| `--token`   | `-t`  | `BLOB_READ_WRITE_TOKEN` | -       | Vercel Blob read-write token (required) |
| `--run-sse` | `-s`  | `RUN_SSE`               | `false` | Run with SSE transport                  |
| `--port`    | `-p`  | `PORT`                  | `3002`  | HTTP server port for SSE                |

## Available Tools

### 1. vercel-blob-put-file

Upload a file to Vercel Blob storage by providing the full file path. The file will be automatically read, converted, and uploaded.

**Parameters:**

- `filePath` (string, required) - Full path to the file to upload (e.g., "/Users/name/image.jpg")
- `pathname` (string, optional) - Destination pathname in blob storage. If not provided, uses the original filename
- `addRandomSuffix` (boolean, optional, default: false) - Add random suffix to prevent conflicts
- `cacheControlMaxAge` (number, optional) - Cache duration in seconds (min: 60)

**Example:**

```json
{
    "filePath": "/Users/john/Pictures/photo.jpg",
    "pathname": "images/photo.jpg",
    "addRandomSuffix": true
}
```

**Response:**

```json
{
    "success": true,
    "message": "File uploaded successfully from /Users/john/Pictures/photo.jpg",
    "blob": {
        "url": "https://blob.vercel-storage.com/images/photo-abc123.jpg",
        "downloadUrl": "https://blob.vercel-storage.com/images/photo-abc123.jpg",
        "pathname": "images/photo-abc123.jpg",
        "contentType": "image/jpeg"
    },
    "fileInfo": {
        "originalPath": "/Users/john/Pictures/photo.jpg",
        "size": 1048576,
        "sizeFormatted": "1.00 MB",
        "detectedContentType": "image/jpeg"
    }
}
```

**Supported File Types:**

- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Documents: `.pdf`, `.txt`, `.json`, `.xml`, `.csv`
- Media: `.mp4`, `.mp3`, `.wav`
- Archives: `.zip`, `.tar`, `.gz`
- Other files are uploaded as `application/octet-stream`

### 2. vercel-blob-put

Upload a file or data to Vercel Blob storage.

**Parameters:**

- `pathname` (string, required) - Destination path for the blob (e.g., "images/photo.jpg")
- `content` (string, required) - Content to upload (text or base64-encoded data)
- `contentType` (string, optional) - MIME type (e.g., "image/jpeg", "text/plain")
- `addRandomSuffix` (boolean, optional, default: false) - Add random suffix to prevent conflicts
- `cacheControlMaxAge` (number, optional) - Cache duration in seconds (min: 60)
- `isBase64` (boolean, optional, default: false) - Whether content is base64-encoded

**Example:**

```json
{
    "pathname": "images/photo.jpg",
    "content": "/9j/4AAQSkZJRg...",
    "contentType": "image/jpeg",
    "isBase64": true,
    "addRandomSuffix": true
}
```

**Response:**

```json
{
    "success": true,
    "blob": {
        "url": "https://blob.vercel-storage.com/...",
        "downloadUrl": "https://blob.vercel-storage.com/...",
        "pathname": "images/photo-abc123.jpg",
        "contentType": "image/jpeg"
    }
}
```

### 3. vercel-blob-delete

Delete one or more blobs from storage.

**Parameters:**

- `urls` (string | string[], required) - Single URL or array of URLs to delete

**Example:**

```json
{
    "urls": ["https://blob.vercel-storage.com/image1.jpg", "https://blob.vercel-storage.com/image2.jpg"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully deleted 2 blob(s)",
  "deletedUrls": [...]
}
```

### 4. vercel-blob-list

List blobs with filtering and pagination.

**Parameters:**

- `prefix` (string, optional) - Filter by pathname prefix (e.g., "images/")
- `limit` (number, optional) - Maximum blobs to return (default: 1000)
- `cursor` (string, optional) - Pagination cursor from previous response
- `mode` (enum, optional) - "expanded" (all blobs) or "folded" (group by folders)

**Example:**

```json
{
    "prefix": "images/",
    "limit": 10,
    "mode": "expanded"
}
```

**Response:**

```json
{
  "success": true,
  "blobs": [...],
  "hasMore": false,
  "cursor": null,
  "totalReturned": 10
}
```

### 5. vercel-blob-head

Get blob metadata without downloading the content.

**Parameters:**

- `url` (string, required) - Blob URL to inspect

**Example:**

```json
{
    "url": "https://blob.vercel-storage.com/image.jpg"
}
```

**Response:**

```json
{
    "success": true,
    "metadata": {
        "url": "https://blob.vercel-storage.com/image.jpg",
        "pathname": "image.jpg",
        "size": 1048576,
        "sizeFormatted": "1.00 MB",
        "uploadedAt": "2024-01-01T00:00:00.000Z",
        "contentType": "image/jpeg",
        "contentDisposition": "inline",
        "cacheControl": "public, max-age=31536000"
    }
}
```

### 6. vercel-blob-copy

Copy a blob to a new location.

**Parameters:**

- `fromUrl` (string, required) - Source blob URL
- `toPathname` (string, required) - Destination pathname
- `addRandomSuffix` (boolean, optional, default: false) - Add random suffix

**Example:**

```json
{
    "fromUrl": "https://blob.vercel-storage.com/original.jpg",
    "toPathname": "backup/original.jpg",
    "addRandomSuffix": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Blob copied successfully",
  "blob": {
    "url": "https://blob.vercel-storage.com/backup/original-xyz789.jpg",
    "pathname": "backup/original-xyz789.jpg",
    ...
  }
}
```

## Integration with fal-ai MCP

This MCP server works perfectly with the fal-ai MCP for image generation and editing workflows:

1. Generate an image using fal-ai MCP
2. Download the image locally
3. Upload to Vercel Blob for permanent storage using the file path
4. Use the blob URL for further processing or sharing

**Example workflow with file path:**

You can now simply tell Claude:

```
1. Generate an image using FLUX model
2. Upload the generated image file to Vercel Blob at "generated/flux-image.jpg"
```

Claude will automatically:

- Use fal-ai MCP to generate and download the image
- Use `vercel-blob-put-file` to upload it by providing the local file path
- Return the permanent blob URL

**Programmatic example:**

```javascript
// 1. Generate image with fal-ai (saves to local file)
const imagePath = '/path/to/generated-image.jpg';

// 2. Upload to Vercel Blob using file path (automatic)
// The tool reads, converts to base64, and uploads
const blob = await vercelBlobClient.putFile({
    filePath: imagePath,
    pathname: 'generated/image.jpg',
    addRandomSuffix: true,
});

// 3. Use the blob URL
console.log(`Image available at: ${blob.url}`);
```

## Development

### Build

```bash
npm run build
```

### Validate

```bash
npm run validate
```

### Watch Mode

```bash
npm run watch
```

## Error Handling

All tools return a structured response with a `success` field:

**Success:**

```json
{
    "success": true,
    "...": "..."
}
```

**Error:**

```json
{
    "success": false,
    "error": "Error message here"
}
```

## Security

- Never commit your Vercel Blob token to version control
- Use environment variables or secure configuration management
- The token provides read-write access to your blob storage
- Consider using different tokens for development and production

## Links

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/Monsoft-Solutions/model-context-protocols)

## License

MIT

## Author

[Monsoft Solutions](https://monsoftsolutions.com)

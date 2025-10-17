import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { VercelBlobClient } from '../services/vercel-blob-client.js';

/**
 * Registers all Vercel Blob tools with the MCP server
 *
 * @param {McpServer} server - MCP server instance
 * @param {string} token - Vercel Blob read-write token
 */
/**
 * Get MIME type from file extension
 * @param {string} filepath - File path
 * @returns {string} MIME type
 */
function getMimeType(filepath: string): string {
    const ext = extname(filepath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.csv': 'text/csv',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.zip': 'application/zip',
        '.tar': 'application/x-tar',
        '.gz': 'application/gzip',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

export function registerTools(server: McpServer, token: string): void {
    const blobClient = new VercelBlobClient({ token });

    // Tool: Upload blob from file path
    server.tool(
        'vercel-blob-put-file',
        'Upload a file to Vercel Blob storage by providing the full file path. The file will be read, converted to base64, and uploaded automatically.',
        {
            filePath: z.string().describe('Full path to the file to upload (e.g., "/Users/name/image.jpg")'),
            pathname: z
                .string()
                .optional()
                .describe(
                    'Destination pathname in blob storage. If not provided, uses the original filename (e.g., "images/photo.jpg")',
                ),
            addRandomSuffix: z
                .boolean()
                .optional()
                .default(false)
                .describe('Whether to add a random suffix to prevent conflicts'),
            cacheControlMaxAge: z.number().optional().describe('Cache duration in seconds (minimum 60 seconds)'),
        },
        async ({ filePath, pathname, addRandomSuffix, cacheControlMaxAge }) => {
            try {
                // Read the file
                const fileBuffer = await readFile(filePath);

                // Determine pathname if not provided
                const finalPathname = pathname || filePath.split('/').pop() || 'file';

                // Detect content type
                const contentType = getMimeType(filePath);

                // Upload the file
                const blob = await blobClient.putBlob({
                    pathname: finalPathname,
                    body: fileBuffer,
                    contentType,
                    addRandomSuffix,
                    cacheControlMaxAge,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: true,
                                    message: `File uploaded successfully from ${filePath}`,
                                    blob: {
                                        url: blob.url,
                                        downloadUrl: blob.downloadUrl,
                                        pathname: blob.pathname,
                                        contentType: blob.contentType,
                                        contentDisposition: blob.contentDisposition,
                                    },
                                    fileInfo: {
                                        originalPath: filePath,
                                        size: fileBuffer.length,
                                        sizeFormatted: `${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`,
                                        detectedContentType: contentType,
                                    },
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                    filePath,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );

    // Tool: Upload blob
    server.tool(
        'vercel-blob-put',
        'Upload a file or data to Vercel Blob storage. Returns the blob URL and metadata.',
        {
            pathname: z.string().describe('The destination pathname for the blob (e.g., "images/photo.jpg")'),
            content: z.string().describe('The content to upload. Can be text or base64-encoded binary data'),
            contentType: z.string().optional().describe('MIME type of the content (e.g., "image/jpeg", "text/plain")'),
            addRandomSuffix: z
                .boolean()
                .optional()
                .default(false)
                .describe('Whether to add a random suffix to prevent conflicts'),
            cacheControlMaxAge: z.number().optional().describe('Cache duration in seconds (minimum 60 seconds)'),
            isBase64: z.boolean().optional().default(true).describe('Whether the content is base64-encoded'),
        },
        async ({ pathname, content, contentType, addRandomSuffix, cacheControlMaxAge, isBase64 }) => {
            try {
                // Convert content to Buffer if it's base64
                const body = isBase64 ? Buffer.from(content, 'base64') : content;

                const blob = await blobClient.putBlob({
                    pathname,
                    body,
                    contentType,
                    addRandomSuffix,
                    cacheControlMaxAge,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: true,
                                    blob: {
                                        url: blob.url,
                                        downloadUrl: blob.downloadUrl,
                                        pathname: blob.pathname,
                                        contentType: blob.contentType,
                                        contentDisposition: blob.contentDisposition,
                                    },
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );

    // Tool: Delete blob
    server.tool(
        'vercel-blob-delete',
        'Delete one or more blobs from Vercel Blob storage using their URLs.',
        {
            urls: z.union([z.string(), z.array(z.string())]).describe('Single URL or array of URLs to delete'),
        },
        async ({ urls }) => {
            try {
                await blobClient.deleteBlobs({ urls });

                const urlArray = Array.isArray(urls) ? urls : [urls];

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: true,
                                    message: `Successfully deleted ${urlArray.length} blob(s)`,
                                    deletedUrls: urlArray,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );

    // Tool: List blobs
    server.tool(
        'vercel-blob-list',
        'List blobs in Vercel Blob storage with optional filtering and pagination.',
        {
            prefix: z.string().optional().describe('Filter blobs by pathname prefix (e.g., "images/")'),
            limit: z.number().optional().describe('Maximum number of blobs to return (default: 1000)'),
            cursor: z.string().optional().describe('Pagination cursor from a previous list response'),
            mode: z
                .enum(['expanded', 'folded'])
                .optional()
                .describe('List mode: "expanded" shows all blobs, "folded" groups by folders'),
        },
        async ({ prefix, limit, cursor, mode }) => {
            try {
                const result = await blobClient.listBlobs({
                    prefix,
                    limit,
                    cursor,
                    mode,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: true,
                                    blobs: result.blobs,
                                    hasMore: result.hasMore,
                                    cursor: result.cursor,
                                    folders: result.folders,
                                    totalReturned: result.blobs.length,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );

    // Tool: Get blob metadata
    server.tool(
        'vercel-blob-head',
        'Get metadata for a blob without downloading its content.',
        {
            url: z.string().describe('The URL of the blob to inspect'),
        },
        async ({ url }) => {
            try {
                const metadata = await blobClient.headBlob({ url });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: true,
                                    metadata: {
                                        url: metadata.url,
                                        pathname: metadata.pathname,
                                        size: metadata.size,
                                        sizeFormatted: `${(metadata.size / 1024 / 1024).toFixed(2)} MB`,
                                        uploadedAt: metadata.uploadedAt,
                                        contentType: metadata.contentType,
                                        contentDisposition: metadata.contentDisposition,
                                        cacheControl: metadata.cacheControl,
                                    },
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );

    // Tool: Copy blob
    server.tool(
        'vercel-blob-copy',
        'Copy a blob to a new location within Vercel Blob storage.',
        {
            fromUrl: z.string().describe('Source blob URL to copy from'),
            toPathname: z.string().describe('Destination pathname for the copied blob'),
            addRandomSuffix: z
                .boolean()
                .optional()
                .default(false)
                .describe('Whether to add a random suffix to prevent conflicts'),
        },
        async ({ fromUrl, toPathname, addRandomSuffix }) => {
            try {
                const blob = await blobClient.copyBlob({
                    fromUrl,
                    toPathname,
                    addRandomSuffix,
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: true,
                                    message: 'Blob copied successfully',
                                    blob: {
                                        url: blob.url,
                                        downloadUrl: blob.downloadUrl,
                                        pathname: blob.pathname,
                                        contentType: blob.contentType,
                                        contentDisposition: blob.contentDisposition,
                                    },
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    success: false,
                                    error: error instanceof Error ? error.message : String(error),
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                    isError: true,
                };
            }
        },
    );
}

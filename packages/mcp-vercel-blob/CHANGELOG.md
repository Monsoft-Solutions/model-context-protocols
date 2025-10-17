# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2025-10-17

### Added

- `vercel-blob-put-file` tool for uploading files directly from file paths
- Automatic file reading and base64 conversion
- Automatic MIME type detection for common file types
- File size information in upload responses
- Support for images, documents, media, and archive files

### Changed

- Updated README with comprehensive documentation for the new tool
- Enhanced integration examples with fal-ai MCP
- Improved workflow examples for file uploads

## [1.0.0] - 2025-10-17

### Added

- Initial release of Vercel Blob MCP Server
- `vercel-blob-put` tool for uploading files and data
- `vercel-blob-delete` tool for removing blobs
- `vercel-blob-list` tool for browsing blobs with pagination
- `vercel-blob-head` tool for getting blob metadata
- `vercel-blob-copy` tool for duplicating blobs
- Support for both stdio and SSE transports
- Comprehensive error handling with custom error types
- Full TypeScript support with type definitions
- Integration-ready for fal-ai MCP workflows

import { put, del, list, head, copy } from '@vercel/blob';
import type {
    PutBlobParams,
    DeleteBlobParams,
    ListBlobParams,
    HeadBlobParams,
    CopyBlobParams,
    BlobMetadata,
    BlobObject,
    ListBlobResult,
} from '../types/blob.js';
import { VercelBlobError } from '../errors/vercel-blob-error.js';

/**
 * Service client for interacting with Vercel Blob storage
 */
export class VercelBlobClient {
    private readonly token: string;

    /**
     * Creates a new Vercel Blob client instance
     * @param {Object} params - Client parameters
     * @param {string} params.token - Vercel Blob read-write token
     */
    constructor(params: { token: string }) {
        this.token = params.token;
    }

    /**
     * Upload a blob to Vercel Blob storage
     *
     * @param {PutBlobParams} params - Upload parameters
     * @returns {Promise<BlobObject>} The uploaded blob information
     * @throws {VercelBlobError} When upload fails
     */
    async putBlob(params: PutBlobParams): Promise<BlobObject> {
        try {
            const blob = await put(params.pathname, params.body, {
                access: 'public',
                token: this.token,
                contentType: params.contentType,
                addRandomSuffix: params.addRandomSuffix ?? false,
                cacheControlMaxAge: params.cacheControlMaxAge,
            });

            return {
                url: blob.url,
                pathname: blob.pathname,
                contentType: blob.contentType,
                contentDisposition: blob.contentDisposition,
                downloadUrl: blob.downloadUrl,
            };
        } catch (error) {
            throw new VercelBlobError(
                `Failed to upload blob: ${error instanceof Error ? error.message : String(error)}`,
                'put',
                error,
            );
        }
    }

    /**
     * Delete one or more blobs from Vercel Blob storage
     *
     * @param {DeleteBlobParams} params - Delete parameters
     * @returns {Promise<void>}
     * @throws {VercelBlobError} When deletion fails
     */
    async deleteBlobs(params: DeleteBlobParams): Promise<void> {
        try {
            await del(params.urls, { token: this.token });
        } catch (error) {
            throw new VercelBlobError(
                `Failed to delete blob(s): ${error instanceof Error ? error.message : String(error)}`,
                'del',
                error,
            );
        }
    }

    /**
     * List blobs in Vercel Blob storage
     *
     * @param {ListBlobParams} params - List parameters
     * @returns {Promise<ListBlobResult>} List of blobs
     * @throws {VercelBlobError} When listing fails
     */
    async listBlobs(params: ListBlobParams = {}): Promise<ListBlobResult> {
        try {
            const result = await list({
                token: this.token,
                prefix: params.prefix,
                limit: params.limit,
                cursor: params.cursor,
                mode: params.mode,
            });

            return {
                blobs: result.blobs.map((blob: { url: string; pathname: string; downloadUrl: string }) => ({
                    url: blob.url,
                    pathname: blob.pathname,
                    downloadUrl: blob.downloadUrl,
                })),
                cursor: result.cursor,
                hasMore: result.hasMore,
                folders: 'folders' in result ? result.folders : undefined,
            };
        } catch (error) {
            throw new VercelBlobError(
                `Failed to list blobs: ${error instanceof Error ? error.message : String(error)}`,
                'list',
                error,
            );
        }
    }

    /**
     * Get blob metadata without downloading the blob
     *
     * @param {HeadBlobParams} params - Head parameters
     * @returns {Promise<BlobMetadata>} Blob metadata
     * @throws {VercelBlobError} When getting metadata fails
     */
    async headBlob(params: HeadBlobParams): Promise<BlobMetadata> {
        try {
            const metadata = await head(params.url, { token: this.token });

            return {
                url: metadata.url,
                size: metadata.size,
                uploadedAt: metadata.uploadedAt,
                pathname: metadata.pathname,
                contentType: metadata.contentType,
                contentDisposition: metadata.contentDisposition,
                cacheControl: metadata.cacheControl,
            };
        } catch (error) {
            throw new VercelBlobError(
                `Failed to get blob metadata: ${error instanceof Error ? error.message : String(error)}`,
                'head',
                error,
            );
        }
    }

    /**
     * Copy a blob to a new location
     *
     * @param {CopyBlobParams} params - Copy parameters
     * @returns {Promise<BlobObject>} The copied blob information
     * @throws {VercelBlobError} When copy fails
     */
    async copyBlob(params: CopyBlobParams): Promise<BlobObject> {
        try {
            const blob = await copy(params.fromUrl, params.toPathname, {
                access: 'public',
                token: this.token,
                addRandomSuffix: params.addRandomSuffix ?? false,
            });

            return {
                url: blob.url,
                pathname: blob.pathname,
                contentType: blob.contentType,
                contentDisposition: blob.contentDisposition,
                downloadUrl: blob.downloadUrl,
            };
        } catch (error) {
            throw new VercelBlobError(
                `Failed to copy blob: ${error instanceof Error ? error.message : String(error)}`,
                'copy',
                error,
            );
        }
    }
}

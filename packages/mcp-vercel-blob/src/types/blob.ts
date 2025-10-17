/**
 * Parameters for uploading a blob
 */
export type PutBlobParams = {
    pathname: string;
    body: string | Buffer;
    contentType?: string;
    addRandomSuffix?: boolean;
    cacheControlMaxAge?: number;
};

/**
 * Parameters for deleting blobs
 */
export type DeleteBlobParams = {
    urls: string | string[];
};

/**
 * Parameters for listing blobs
 */
export type ListBlobParams = {
    prefix?: string;
    limit?: number;
    cursor?: string;
    mode?: 'expanded' | 'folded';
};

/**
 * Parameters for getting blob metadata
 */
export type HeadBlobParams = {
    url: string;
};

/**
 * Parameters for copying a blob
 */
export type CopyBlobParams = {
    fromUrl: string;
    toPathname: string;
    addRandomSuffix?: boolean;
};

/**
 * Blob metadata from head operation
 */
export type BlobMetadata = {
    url: string;
    size: number;
    uploadedAt: Date;
    pathname: string;
    contentType: string;
    contentDisposition: string;
    cacheControl: string;
};

/**
 * Blob object returned from put/copy operations
 */
export type BlobObject = {
    url: string;
    pathname: string;
    contentType?: string;
    contentDisposition?: string;
    downloadUrl?: string;
};

/**
 * Response from list operation
 */
export type ListBlobResult = {
    blobs: BlobObject[];
    cursor?: string;
    hasMore: boolean;
    folders?: string[];
};

import { BaseSlackTool } from './base-slack-tool.js';
import { FileType } from '../types/file-type.js';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import path from 'node:path';

/**
 * Type for files array in the filesUploadV2 response
 */
type SlackFile = {
    id: string;
    created: number;
    timestamp: number;
    name: string;
    title: string;
    mimetype: string;
    filetype: string;
    pretty_type: string;
    user: string;
    user_team: string;
    editable: boolean;
    size: number;
    mode: string;
    is_external: boolean;
    external_type: string;
    is_public: boolean;
    public_url_shared: boolean;
    display_as_bot: boolean;
    username: string;
    url_private: string;
    url_private_download: string;
    media_display_type?: string;
    permalink: string;
    permalink_public?: string;
    has_rich_preview: boolean;
    file_access?: string;
    [key: string]: any; // Allow other properties
};

/**
 * Type for the filesUploadV2 response
 */
type FilesUploadV2Response = {
    ok: boolean;
    files: SlackFile[];
};

/**
 * Tool for Slack file operations
 */
export class FileOperationsTool extends BaseSlackTool {
    /**
     * Upload a file to Slack
     *
     * @param filePath Local file path to upload
     * @param fileName Name to use for the file in Slack
     * @param channelId Optional channel ID to share the file with
     * @param fileType Optional file type
     * @param title Optional title for the file
     * @param initialComment Optional initial comment to include with the file
     * @returns Formatted response with file details
     */
    async uploadFile(
        filePath: string,
        fileName?: string,
        channelId?: string,
        fileType?: FileType,
        title?: string,
        initialComment?: string,
    ) {
        try {
            // If no filename provided, use the basename from the filepath
            const actualFileName = fileName || path.basename(filePath);

            // Create a readable stream from the file path
            const fileStream = createReadStream(filePath);

            // Use the new filesUploadV2 method
            const result = (await this.client.filesUploadV2({
                file: fileStream,
                filename: actualFileName,
                channel_id: channelId,
                filetype: fileType,
                title: title,
                initial_comment: initialComment,
            })) as FilesUploadV2Response;

            const responseText = `File successfully uploaded${channelId ? ` and shared to channel ${channelId}` : ''}`;

            if (result.files && result.files.length > 0) {
                return this.createResponse(
                    `${responseText}\n\nFile details:\n${JSON.stringify(result.files[0], null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, 'upload file');
        }
    }

    /**
     * Upload file content to Slack
     *
     * @param content Content to upload as a file
     * @param fileName Name for the file
     * @param channelId Optional channel ID to share the file with
     * @param fileType Optional file type
     * @param title Optional title for the file
     * @param initialComment Optional initial comment to include with the file
     * @returns Formatted response with file details
     */
    async uploadFileContent(
        content: string,
        fileName: string,
        channelId?: string,
        fileType?: FileType,
        title?: string,
        initialComment?: string,
    ) {
        try {
            // Convert string content to a Buffer and then to a Readable stream
            const buffer = Buffer.from(content);
            const fileStream = Readable.from(buffer);

            // Use the new filesUploadV2 method
            const result = (await this.client.filesUploadV2({
                file: fileStream,
                filename: fileName,
                channel_id: channelId,
                filetype: fileType,
                title: title,
                initial_comment: initialComment,
            })) as FilesUploadV2Response;

            const responseText = `File content successfully uploaded${channelId ? ` and shared to channel ${channelId}` : ''}`;

            if (result.files && result.files.length > 0) {
                return this.createResponse(
                    `${responseText}\n\nFile details:\n${JSON.stringify(result.files[0], null, 2)}`,
                );
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, 'upload file content');
        }
    }

    /**
     * Get information about a file
     *
     * @param fileId The ID of the file to get information about
     * @returns Formatted response with file information
     */
    async getFileInfo(fileId: string) {
        try {
            const result = await this.client.files.info({
                file: fileId,
            });

            const responseText = `Retrieved information for file ${fileId}`;

            if (result.file) {
                return this.createResponse(`${responseText}\n\nFile details:\n${JSON.stringify(result.file, null, 2)}`);
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `get information for file ${fileId}`);
        }
    }

    /**
     * Share a file in a channel
     *
     * @param fileId The ID of the file to share
     * @param channelId The channel to share the file in
     * @returns Formatted response with share confirmation
     */
    async shareFile(fileId: string, channelId: string) {
        try {
            // Since files.share doesn't exist, we'll use the completeUploadExternal method
            // to share the file to a channel after it's been uploaded
            await this.client.files.completeUploadExternal({
                files: [{ id: fileId, title: fileId }],
                channel_id: channelId,
            });

            const responseText = `File ${fileId} successfully shared to channel ${channelId}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `share file ${fileId} to channel ${channelId}`);
        }
    }

    /**
     * Enable public URL for a file
     *
     * @param fileId The ID of the file to make public
     * @returns Formatted response with the public URL
     */
    async enablePublicURL(fileId: string) {
        try {
            const result = await this.client.files.sharedPublicURL({
                file: fileId,
            });

            const responseText = `Public URL enabled for file ${fileId}`;

            if (result.file && result.file.permalink_public) {
                return this.createResponse(`${responseText}\n\nPublic URL: ${result.file.permalink_public}`);
            }

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `enable public URL for file ${fileId}`);
        }
    }

    /**
     * Disable public URL for a file
     *
     * @param fileId The ID of the file to make private
     * @returns Formatted response with revocation confirmation
     */
    async disablePublicURL(fileId: string) {
        try {
            await this.client.files.revokePublicURL({
                file: fileId,
            });

            const responseText = `Public URL disabled for file ${fileId}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `disable public URL for file ${fileId}`);
        }
    }

    /**
     * List files visible to the user
     *
     * @param channelId Optional channel to filter files by
     * @param userId Optional user to filter files by
     * @param limit Optional limit on the number of files to return
     * @returns Formatted response with list of files
     */
    async listFiles(channelId?: string, userId?: string, limit?: number) {
        try {
            // Set reasonable defaults
            const actualLimit = limit && limit > 0 ? Math.min(limit, 100) : 10;

            const result = await this.client.files.list({
                channel: channelId,
                user: userId,
                count: actualLimit,
            });

            const files = result.files || [];

            let responseText = `Retrieved ${files.length} files`;
            if (channelId) {
                responseText += ` from channel ${channelId}`;
            }
            if (userId) {
                responseText += ` by user ${userId}`;
            }
            responseText += `\n\nFiles:\n${JSON.stringify(files, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, 'list files');
        }
    }

    /**
     * Delete a file
     *
     * @param fileId The ID of the file to delete
     * @returns Formatted response with deletion confirmation
     */
    async deleteFile(fileId: string) {
        try {
            await this.client.files.delete({
                file: fileId,
            });

            const responseText = `File ${fileId} successfully deleted`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, `delete file ${fileId}`);
        }
    }
}

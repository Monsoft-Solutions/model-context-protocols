import { BaseSlackTool } from './base-slack-tool.js';
import { SlackUser } from '../types/slack-user.js';

/**
 * Tool for Slack user operations
 */
export class UserOperationsTool extends BaseSlackTool {
    /**
     * Get list of workspace users with basic profile information
     *
     * @param cursor Pagination cursor for next page
     * @param limit Maximum users to return (default: 100, max: 200)
     * @returns Formatted response with users information
     */
    async getUsers(cursor?: string, limit?: number) {
        try {
            // Set reasonable defaults and limits
            const actualLimit = limit && limit > 0 ? Math.min(limit, 200) : 100;

            const result = await this.client.users.list({
                limit: actualLimit,
                cursor: cursor,
            });

            const users = result.members as unknown as SlackUser[];

            const formattedUsers = users.map((user) => ({
                id: user.id,
                name: user.name || user.real_name || 'Unknown',
                is_bot: user.is_bot || false,
                is_admin: user.is_admin || false,
                deleted: user.deleted || false,
                display_name: user.profile?.display_name || '',
                email: user.profile?.email || '',
                title: user.profile?.title || '',
            }));

            let responseText = `Found ${formattedUsers.length} users`;

            if (result.response_metadata?.next_cursor) {
                responseText += `\nUse cursor: ${result.response_metadata.next_cursor} to get the next page`;
            }

            responseText += `\n\n${JSON.stringify(formattedUsers, null, 2)}`;

            return this.createResponse(responseText);
        } catch (error) {
            return this.handleError(error, 'list users');
        }
    }

    /**
     * Get detailed profile information for a specific user
     *
     * @param userId The user's ID
     * @returns Formatted response with user profile information
     */
    async getUserProfile(userId: string) {
        try {
            const result = await this.client.users.info({
                user: userId,
            });

            if (!result.user) {
                return this.createResponse(`User ${userId} not found`);
            }

            const user = result.user as unknown as SlackUser;

            const userProfile = {
                id: user.id,
                name: user.name || user.real_name || 'Unknown',
                real_name: user.real_name || '',
                is_bot: user.is_bot || false,
                is_admin: user.is_admin || false,
                deleted: user.deleted || false,
                profile: {
                    display_name: user.profile?.display_name || '',
                    email: user.profile?.email || '',
                    phone: user.profile?.phone || '',
                    image: user.profile?.image_original || '',
                    status_text: user.profile?.status_text || '',
                    status_emoji: user.profile?.status_emoji || '',
                    title: user.profile?.title || '',
                },
            };

            return this.createResponse(`User Profile for ${userId}:\n\n${JSON.stringify(userProfile, null, 2)}`);
        } catch (error) {
            return this.handleError(error, `get user profile for ${userId}`);
        }
    }
}

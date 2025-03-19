import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { GmailApiError } from '../errors/gmail-api-error.js';
import { BaseGmailTool } from './base-gmail-tool.js';
import { VacationResponderSettings, ForwardingSettings } from '../types/settings-types.js';

/**
 * Gmail settings management tools implementation
 */
export class SettingsManagementTool extends BaseGmailTool {
    /**
     * Create a new SettingsManagementTool instance
     *
     * @param oauth2Client - The authenticated OAuth2 client
     */
    constructor(oauth2Client: OAuth2Client) {
        super(oauth2Client);
    }

    /**
     * Get the current vacation responder settings
     *
     * @returns The current vacation responder settings
     * @throws GmailApiError if the operation fails
     */
    async getVacationResponder() {
        try {
            const response = await this.gmail.users.settings.getVacation({
                userId: 'me',
            });

            const settings = response.data;

            return {
                content: [
                    {
                        type: 'text' as const,
                        text:
                            `Vacation Responder Status: ${settings.enableAutoReply ? 'Enabled' : 'Disabled'}\n` +
                            `Subject: ${settings.responseSubject || '(No subject)'}\n` +
                            `Message: ${settings.responseBodyPlainText || '(No message)'}\n` +
                            `Start Time: ${settings.startTime || '(Not set)'}\n` +
                            `End Time: ${settings.endTime || '(Not set)'}\n` +
                            `Restrictions: ${
                                settings.restrictToContacts
                                    ? 'Contacts Only'
                                    : settings.restrictToDomain
                                      ? 'Domain Contacts Only'
                                      : 'None (Replies to everyone)'
                            }`,
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to get vacation responder settings: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Set vacation responder settings
     *
     * @param settings - The vacation responder settings to set
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async setVacationResponder(settings: VacationResponderSettings) {
        try {
            await this.gmail.users.settings.updateVacation({
                userId: 'me',
                requestBody: settings,
            });

            return {
                content: [
                    {
                        type: 'text' as const,
                        text:
                            `Vacation responder ${settings.enableAutoReply ? 'enabled' : 'disabled'} successfully.\n` +
                            `Subject: ${settings.responseSubject || '(No subject)'}\n` +
                            `Active: ${settings.startTime ? `From ${settings.startTime}` : 'Immediately'} ` +
                            `${settings.endTime ? `until ${settings.endTime}` : 'until manually disabled'}`,
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to set vacation responder: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Get email forwarding settings
     *
     * @returns Current email forwarding settings
     * @throws GmailApiError if the operation fails
     */
    async getForwarding() {
        try {
            // Get the forwarding addresses
            const addressesResponse = await this.gmail.users.settings.forwardingAddresses.list({
                userId: 'me',
            });

            const addresses = addressesResponse.data.forwardingAddresses || [];

            // Get the auto-forwarding settings
            const forwardingResponse = await this.gmail.users.settings.getAutoForwarding({
                userId: 'me',
            });

            const forwarding = forwardingResponse.data;

            // Format disposition in human-readable form
            let dispositionText = '';
            switch (forwarding.disposition) {
                case 'leaveInInbox':
                    dispositionText = 'Keep in inbox';
                    break;
                case 'archive':
                    dispositionText = 'Archive';
                    break;
                case 'trash':
                    dispositionText = 'Move to trash';
                    break;
                case 'markRead':
                    dispositionText = 'Mark as read';
                    break;
                default:
                    dispositionText = forwarding.disposition || 'Unknown';
            }

            return {
                content: [
                    {
                        type: 'text' as const,
                        text:
                            `Email Forwarding Status: ${forwarding.enabled ? 'Enabled' : 'Disabled'}\n` +
                            `Forwarding to: ${forwarding.emailAddress || '(Not set)'}\n` +
                            `Original email treatment: ${dispositionText}\n\n` +
                            `Verified forwarding addresses (${addresses.length}):\n` +
                            addresses
                                .map(
                                    (addr) =>
                                        `- ${addr.forwardingEmail}${addr.verificationStatus === 'accepted' ? ' (Verified)' : ' (Pending verification)'}`,
                                )
                                .join('\n'),
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to get forwarding settings: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Update email forwarding settings
     *
     * @param settings - The forwarding settings to update
     * @returns Result of the operation
     * @throws GmailApiError if the operation fails
     */
    async updateForwarding(settings: ForwardingSettings) {
        try {
            // First check if the forwarding address is verified
            if (settings.forwardingEmail) {
                const addressesResponse = await this.gmail.users.settings.forwardingAddresses.list({
                    userId: 'me',
                });

                const addresses = addressesResponse.data.forwardingAddresses || [];
                const targetAddress = addresses.find((addr) => addr.forwardingEmail === settings.forwardingEmail);

                if (!targetAddress) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text:
                                    `Error: Forwarding address ${settings.forwardingEmail} is not verified. ` +
                                    `Please add and verify this address in Gmail settings first.`,
                            },
                        ],
                    };
                }

                if (targetAddress.verificationStatus !== 'accepted') {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text:
                                    `Error: Forwarding address ${settings.forwardingEmail} is pending verification. ` +
                                    `Please verify this address before setting up forwarding.`,
                            },
                        ],
                    };
                }
            }

            // If a forwarding email is specified, get the current auto-forwarding first to retain values not specified
            let currentEnabled = false;
            let currentEmailAddress = '';
            let currentDisposition = 'leaveInInbox';

            if (settings.forwardingEmail || settings.enabled !== undefined || settings.disposition) {
                const response = await this.gmail.users.settings.getAutoForwarding({
                    userId: 'me',
                });

                // Safely extract data with fallbacks for null/undefined values
                currentEnabled = response.data.enabled === true;
                currentEmailAddress = response.data.emailAddress || '';
                currentDisposition = response.data.disposition || 'leaveInInbox';
            }

            // Update forwarding settings
            await this.gmail.users.settings.updateAutoForwarding({
                userId: 'me',
                requestBody: {
                    enabled: settings.enabled !== undefined ? settings.enabled : currentEnabled,
                    emailAddress: settings.forwardingEmail || currentEmailAddress,
                    disposition: settings.disposition || currentDisposition,
                },
            });

            return {
                content: [
                    {
                        type: 'text' as const,
                        text:
                            `Email forwarding settings updated successfully.\n` +
                            `Status: ${settings.enabled !== undefined ? (settings.enabled ? 'Enabled' : 'Disabled') : 'Unchanged'}\n` +
                            `Forwarding to: ${settings.forwardingEmail || currentEmailAddress}\n` +
                            `Original email treatment: ${settings.disposition || currentDisposition}`,
                    },
                ],
            };
        } catch (error) {
            throw new GmailApiError(
                `Failed to update forwarding settings: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

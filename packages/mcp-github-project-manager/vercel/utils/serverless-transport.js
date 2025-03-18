import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

/**
 * Creates a serverless-friendly SSE transport
 * This extends the standard SSEServerTransport with features needed for serverless environments
 *
 * @param {string} messagesEndpoint - The endpoint for posting messages
 * @param {object} res - Express response object
 * @returns {SSEServerTransport} The configured SSE transport
 */
export function createServerlessTransport(messagesEndpoint, res) {
    // Create the standard SSE transport
    const transport = new SSEServerTransport(messagesEndpoint, res);

    // Add extra properties for serverless environment
    transport.getTransport = function () {
        return transport;
    };

    // Ensure the connection stays alive with periodic keep-alive messages
    const keepAliveInterval = setInterval(() => {
        try {
            // Send a comment as keep-alive to prevent connection timeout
            res.write(': keep-alive\n\n');
        } catch (e) {
            // If we can't write, the connection is probably closed
            clearInterval(keepAliveInterval);
        }
    }, 30000); // Send every 30 seconds

    // Clean up when the connection closes
    res.on('close', () => {
        clearInterval(keepAliveInterval);
    });

    return transport;
}

/**
 * Helper function to send an SSE message
 * For direct sending of messages outside the standard transport flow
 *
 * @param {object} res - Express response object
 * @param {string} event - Event name
 * @param {object|string} data - Event data
 */
export function sendSSEMessage(res, event, data) {
    const message = typeof data === 'object' ? JSON.stringify(data) : data;

    res.write(`event: ${event}\n`);
    res.write(`data: ${message}\n\n`);
}

/**
 * Create a transport factory that can be used for reconnection
 *
 * @param {Function} transportCreator - Function that creates a transport
 * @returns {Function} Factory function for creating transports
 */
export function createTransportFactory(transportCreator) {
    return function (req, res) {
        const transport = transportCreator(req, res);
        return transport;
    };
}

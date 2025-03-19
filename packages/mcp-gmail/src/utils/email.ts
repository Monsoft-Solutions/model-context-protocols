/**
 * Helper function to encode email headers containing non-ASCII characters
 * according to RFC 2047 MIME specification
 *
 * @param text - The text to encode
 * @returns The encoded text, if necessary
 */
export function encodeEmailHeader(text: string): string {
    // Only encode if the text contains non-ASCII characters
    if (/[^\x00-\x7F]/.test(text)) {
        // Use MIME Words encoding (RFC 2047)
        return '=?UTF-8?B?' + Buffer.from(text).toString('base64') + '?=';
    }
    return text;
}

/**
 * Validates an email address using a simple regex
 *
 * @param email - The email address to validate
 * @returns True if the email address is valid
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Creates a properly formatted email message string from validated arguments
 *
 * @param validatedArgs - The validated arguments from the client
 * @returns A properly formatted email message string
 * @throws Error if recipient email address is invalid
 */
export function createEmailMessage(validatedArgs: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
}): string {
    const encodedSubject = encodeEmailHeader(validatedArgs.subject);

    validatedArgs.to.forEach((email) => {
        if (!validateEmail(email)) {
            throw new Error(`Recipient email address is invalid: ${email}`);
        }
    });

    const emailParts = [
        'From: me',
        `To: ${validatedArgs.to.join(', ')}`,
        validatedArgs.cc ? `Cc: ${validatedArgs.cc.join(', ')}` : '',
        validatedArgs.bcc ? `Bcc: ${validatedArgs.bcc.join(', ')}` : '',
        `Subject: ${encodedSubject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
    ].filter(Boolean);

    emailParts.push('');
    emailParts.push(validatedArgs.body);

    return emailParts.join('\r\n');
}

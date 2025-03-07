import { CodeArchitectClient } from '../client/index.js';

/**
 * Example demonstrating how to use the MCP Code Architect
 */
async function runExample() {
    // Create a new code architect client
    const codeArchitect = new CodeArchitectClient();

    try {
        // Connect to the code architect server
        await codeArchitect.connect();

        // Sample code context
        const codeContext = `
        // This is a simple Express.js API that needs to be extended
        import express from 'express';
        import { PrismaClient } from '@prisma/client';

        const app = express();
        const prisma = new PrismaClient();

        app.use(express.json());

        // Get all users
        app.get('/users', async (req, res) => {
            const users = await prisma.user.findMany();
            res.json(users);
        });

        // Get user by ID
        app.get('/users/:id', async (req, res) => {
            const { id } = req.params;
            const user = await prisma.user.findUnique({
                where: { id: Number(id) },
            });
            res.json(user);
        });

        app.listen(3000, () => {
            console.log('Server running on http://localhost:3000');
        });
        `;

        // Sample custom instructions
        const customInstructions = `
        We need to extend this API to include authentication using JWT tokens.
        The API should have the following new endpoints:
        - POST /auth/register - Register a new user
        - POST /auth/login - Login and get a JWT token
        - POST /auth/refresh - Refresh the JWT token
        
        Also, add middleware to protect certain routes that require authentication.
        `;

        // Generate an implementation plan
        console.log('Generating implementation plan...');
        const result = await codeArchitect.generateImplementationPlan(
            codeContext,
            customInstructions,
        );

        // Display the implementation plan
        console.log('\nImplementation Plan:');
        console.log(result.implementationPlan);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(
                'Error running code architect example:',
                error.message,
            );
        } else {
            console.error(
                'Error running code architect example:',
                String(error),
            );
        }
    } finally {
        // Disconnect from the code architect server
        await codeArchitect.disconnect();
    }
}

// Run the example
runExample().catch((error: unknown) => {
    if (error instanceof Error) {
        console.error('Unhandled error:', error.message);
    } else {
        console.error('Unhandled error:', String(error));
    }
});

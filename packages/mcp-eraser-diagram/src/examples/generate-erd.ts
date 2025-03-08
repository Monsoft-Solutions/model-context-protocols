import { EraserDiagramClient } from '../client/index.js';

/**
 * Example of using the MCP Eraser Diagram client to generate an ERD
 */
async function main() {
    // Create a new client
    const client = new EraserDiagramClient();

    try {
        // Get the API token from environment variables
        const apiToken = process.env.ERASER_API_TOKEN;

        if (!apiToken) {
            console.error('Error: ERASER_API_TOKEN environment variable is not set');
            process.exit(1);
        }

        // Connect to the server with the API token
        await client.connect(apiToken);

        // Example prompt for an ERD
        const prompt = `
            Create an entity relationship diagram for a blog application with the following entities:
            
            1. User: id (PK), username, email, password, created_at, updated_at
            2. Post: id (PK), title, content, user_id (FK), created_at, updated_at
            3. Comment: id (PK), content, user_id (FK), post_id (FK), created_at, updated_at
            4. Category: id (PK), name, description
            5. PostCategory: post_id (FK), category_id (FK)
            
            Show all relationships between entities.
        `;

        console.log('Generating ERD...');

        // Generate the diagram
        const result = await client.generateDiagram(prompt, {
            diagramType: 'entity-relationship-diagram',
            theme: 'dark',
        });

        console.log('ERD generated successfully!');
        console.log('Image URL:', result.imageUrl);
        console.log('Eraser File URL:', result.createEraserFileUrl);
        console.log('Diagram Type:', result.diagramType);
        console.log('Diagram Code:', result.code);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Disconnect from the server
        await client.disconnect();
    }
}

// Run the example
main();

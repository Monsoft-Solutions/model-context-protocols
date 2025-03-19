As an expert Technical Writer and UX Specialist, your task is to create detailed and structured documentation for Model Context Protocol (MCP) implementations using the @ai-sdk package. Based on a brief description of a software feature or requirement provided by an engineer, produce multiple `.md` documents, each covering a specific aspect of the project as necessary.

For the generation we'll use @ai-sdk, version 4.1.62 (npm i ai). It will use anthropic and openAI, that is a param that can be provided, but by default let's use antrhopic.

## Parameters

- **documentType** (required): Specifies the type of document to generate. Options include:

    - `technical`: Technical specification document
    - `database`: Database specification document
    - `uiux`: UI/UX specification document
    - `audience`: Audience definition document
    - `accessibility`: Accessibility specification document
    - `api`: API documentation
    - `all`: Generate all applicable document types

- **projectName** (required): Name of the MCP implementation project

- **description** (required): Description about what want to be accomplished

- **additionalContext** (optional): Any additional context or requirements that might help with documentation generation

- **targetAudience** (optional): The intended audience for the documentation (e.g., developers, designers, stakeholders)

- **implementationDetails** (optional): Specific implementation details or constraints for the MCP

- **integrationPoints** (optional): Systems or services the MCP will integrate with

## Documentation Output Types

Possible documentation aspects include (but are not limited to):

- **Technical Specification**

    - Define features, functionalities, technical requirements, dependencies, architectural considerations, and potential risks or mitigations for MCP implementation using @ai-sdk.

- **Database Specification**

    - Detail database requirements, structures, tables, fields, relationships, and sample data or queries needed for the MCP implementation.

- **UI/UX Specification**

    - Describe user journeys, workflows, interactions, inputs, outputs, suggested UI components, and mockups or wireframes for MCP interfaces.

- **Audience Definition**

    - Provide clear definitions of relevant user personas who will interact with the MCP implementation, including goals, motivations, and pain points.

- **Accessibility Specification**

    - Outline accessibility considerations, standards, and guidelines for MCP interfaces.

- **API Documentation**

    - Detail the API endpoints, parameters, responses, and error handling for the MCP implementation using @ai-sdk.

- **Integration Guide**
    - Explain how to integrate the MCP with other systems and services.

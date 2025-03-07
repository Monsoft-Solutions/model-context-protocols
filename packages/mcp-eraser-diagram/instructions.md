I want to generate an MCP server, that generates ERD (Entity Relationship Diagram) through Eraser API.

It shouod recieve the prompt for eraser to generate the diagram. THe Eraser api return the URL of the diagram (image format).

The following is the specification of the eraser API that we want to consume

```
From Prompt (AI diagram)
post
https://app.eraser.io/api/render/prompt
Log in to see full request history
time	status	user agent
Make a request to see history.
0 Requests This Month

This endpoint generates an AI diagram from a user-provided input.

An example cURL request is:


curl --location 'https://app.eraser.io/api/render/prompt' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $YOUR-TOKEN-HERE' \
--data '{
    "theme": "dark",
    "mode": "standard",
    "diagramType": "cloud-architecture-diagram",
    "text": "An Azure-based RAG application for querying a company’s codebase. Azure Front Door manages global request routing, directing users to a web interface hosted on Azure App Service or Static Web Apps. When a user asks a question, it’s routed through Azure API Management. Azure Cognitive Search indexes the codebase stored in Azure Blob Storage or Azure DevOps Repos to retrieve relevant snippets. These results are then passed to Azure OpenAI Service to generate context-rich responses. Azure Functions handle data transformations, while Azure Cache for Redis speeds up response times by caching frequent queries. The response flows back through API Management to the web interface, with monitoring managed by Azure Monitor and Application Insights."
}'
An example response is:


{
    "imageUrl": "https://IMAGE-SITE-URL/IMAGE-NAME.png",
    "createEraserFileUrl": "https://ERASER-URL-TO-OPEN-DIAGRAM-IN-EDITOR",
    "diagrams": [
        {
            "diagramType": "cloud-architecture-diagram",
            "code": "// EXAMPLE DIAGRAM \n A > B \n B > C"
        }
    ]
}
Full documentation of the endpoint below:

Body Params
text
string
required
The prompt. The input code or natural langauge which describes a diagram.

diagramType
string
Select desired diagram type. Will automatically detect diagram type when unspecified.


mode
string
Select "standard" for GPT-4o or "premium" for OpenAI-o1. Defaults to "standard"


returnFile
boolean
Select whether to return an image file (true) or an image URL (false).


background
boolean
Select transparent (false) or solid (true) background. Defaults to false.


theme
string
Select "light" or "dark" theme. Defaults to "light".


scale
string
Scale factor of returned image file. Use 1, 2, or 3. Defaults to 2.


Responses

200
The result of the diagram generation

400
The request is missing the 'text' parameter

403
Unauthorized

500
Eraser was unable to generate a result

503
Service temporarily unavailable. This may be the result of too many requests.
```

# Monsoft MCPs

A collection of Model Context Protocols (MCPs) developed by Monsoft Solutions, LLC for enhancing AI assistant capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Monsoft-Solutions/model-context-protocols?labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit%20Reviews)

## Overview

This repository contains a collection of Model Context Protocols (MCPs) developed by [Monsoft Solutions, LLC](https://monsoftsolutions.com). These protocols extend the capabilities of AI assistants like Claude and other MCP-compatible systems, allowing them to perform additional functions and access external resources.

These MCPs are used internally by Monsoft Solutions and are being shared with the community to help advance the development of more capable AI systems.

## Available MCPs

_List of available MCPs and brief descriptions will be added as they are developed_

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/Monsoft-Solutions/model-context-protocols.git
    cd model-context-protocols
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3. Build the project:
    ```bash
    npm run build
    # or
    yarn build
    ```

## Usage

To use these MCPs with your AI assistant:

1. Build the project as described above.

2. Set up the `.env` file for the specific MCP if needed. Note that the MCP servers will first try to get environment variables from the process environment, and if not found, will fall back to the `.env` file.

3. Copy the full path to the desired MCP's `dist/server/index.js` file and configure it in your AI assistant (Cursor, Claude, or any other MCP consumer).

4. Alternatively, you can set up the MCPs following the instructions at the [Model Context Protocol Quickstart Guide](https://modelcontextprotocol.io/quickstart/user).

## Configuration Examples

### Claude for Desktop

Add the following to your Claude Desktop configuration file:

```json
{
    "mcpServers": {
        "monsoft-mcp-name": {
            "command": "node",
            "args": ["/full/path/to/model-context-protocols/mcp-name/dist/server/index.js"]
        }
    }
}
```

### Cursor

_Configuration instructions for Cursor will be added_

## Contributing

We welcome contributions from the community! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the code style of the project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About Monsoft Solutions

[Monsoft Solutions, LLC](https://monsoftsolutions.com) is a software development company specializing in AI-powered solutions and tools. We're committed to advancing the capabilities of AI assistants and sharing our work with the community.

## Contact

For questions or support, please open an issue in this repository or contact us through our website.

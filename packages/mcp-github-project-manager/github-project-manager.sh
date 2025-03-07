#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# First try to load environment variables from dist/.env file if it exists
if [ -f "$SCRIPT_DIR/dist/.env" ]; then
    echo "Loading environment variables from $SCRIPT_DIR/dist/.env"
    export $(grep -v '^#' "$SCRIPT_DIR/dist/.env" | xargs)
# Then try the root .env file if dist/.env doesn't exist
elif [ -f "$SCRIPT_DIR/.env" ]; then
    echo "Loading environment variables from $SCRIPT_DIR/.env"
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Check if GITHUB_PERSONAL_TOKEN is set
if [ -z "$GITHUB_PERSONAL_TOKEN" ]; then
    echo "Error: GITHUB_PERSONAL_TOKEN environment variable is not set."
    echo "Please run the setup script first: npm run generate-env"
    exit 1
fi

# Run the server
echo "Starting GitHub Project Manager server..."
node "$SCRIPT_DIR/dist/server/index.js" 
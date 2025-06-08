#!/bin/bash

# This script helps publish the Jarvis AI Assistant to the VS Code Marketplace

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Publishing Jarvis AI Assistant to VS Code Marketplace${NC}"
echo

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo -e "${YELLOW}vsce is not installed. Installing now...${NC}"
    npm install -g @vscode/vsce
    
    # Check if installation was successful
    if ! command -v vsce &> /dev/null; then
        echo -e "${RED}Failed to install vsce. Please install it manually with: npm install -g @vscode/vsce${NC}"
        exit 1
    fi
fi

# Check if the user has a Personal Access Token
read -p "Do you have a Personal Access Token for the VS Code Marketplace? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}You need a Personal Access Token to publish to the VS Code Marketplace.${NC}"
    echo "Please follow these steps to create one:"
    echo "1. Go to https://dev.azure.com/"
    echo "2. Create a new organization or use an existing one"
    echo "3. Go to Personal Access Tokens"
    echo "4. Create a new token with the 'Marketplace (publish)' scope"
    echo "5. Copy the token and keep it safe"
    echo
    echo "Run this script again once you have a token."
    exit 1
fi

# Ask for the Personal Access Token
read -sp "Enter your Personal Access Token: " pat
echo

# Ask for publisher name
read -p "Enter your publisher name (create one if you don't have it): " publisher

# Check if the publisher exists
echo "Checking if publisher exists..."
vsce show $publisher > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Publisher '$publisher' does not exist. Creating now...${NC}"
    vsce create-publisher $publisher
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create publisher. Please try again or create it manually.${NC}"
        exit 1
    fi
fi

# Update package.json with the publisher name
echo "Updating package.json with publisher name..."
sed -i "s/\"publisher\": \".*\"/\"publisher\": \"$publisher\"/" package.json

# Package the extension
echo "Packaging the extension..."
./package-extension.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to package the extension. Please fix any errors and try again.${NC}"
    exit 1
fi

# Publish the extension
echo "Publishing the extension to VS Code Marketplace..."
vsce publish -p $pat

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to publish the extension. Please check the error message above.${NC}"
    exit 1
fi

echo -e "${GREEN}Extension published successfully!${NC}"
echo
echo "Your extension is now available on the VS Code Marketplace."
echo "It may take a few minutes to appear in search results."
echo
echo "Next steps:"
echo "1. Verify your extension on the Marketplace: https://marketplace.visualstudio.com/items?itemName=$publisher.jarvis-ai-assistant"
echo "2. Share the link with others"
echo "3. Consider publishing to Open VSX Registry as well: https://open-vsx.org/"
#!/bin/bash

# Ensure the script exits on any error
set -e

echo "Packaging Jarvis AI Assistant Extension..."

# Clean up previous builds
rm -rf out/ *.vsix

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile TypeScript
echo "Compiling TypeScript..."
npm run compile

# Package the extension
echo "Creating VSIX package..."
npx vsce package

echo "Done! The extension package has been created."
echo "You can install it in VSCode using: 'Extensions: Install from VSIX...'"
#!/bin/bash

# This script creates a new GitHub release with the VSIX file

# Get the version from package.json
VERSION=$(node -p "require('./package.json').version")
VSIX_FILE="jarvis-ai-assistant-$VERSION.vsix"

# Check if the VSIX file exists
if [ ! -f "$VSIX_FILE" ]; then
  echo "Error: $VSIX_FILE not found. Run 'npm run package' first."
  exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) is not installed. Please install it first:"
  echo "  https://cli.github.com/manual/installation"
  exit 1
fi

# Check if user is logged in to GitHub
if ! gh auth status &> /dev/null; then
  echo "You need to login to GitHub first. Run 'gh auth login'."
  exit 1
fi

# Create a new release
echo "Creating GitHub release v$VERSION..."
gh release create "v$VERSION" \
  --title "Jarvis AI Assistant v$VERSION" \
  --notes "See CHANGELOG.md for details." \
  "$VSIX_FILE"

echo "Release created successfully! Users can now download the VSIX file from GitHub."
echo "Installation instructions:"
echo "1. Download the VSIX file from the GitHub release"
echo "2. In VS Code, go to Extensions (Ctrl+Shift+X)"
echo "3. Click the '...' menu and select 'Install from VSIX...'"
echo "4. Choose the downloaded VSIX file"
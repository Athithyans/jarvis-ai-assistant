#!/bin/bash

# This script helps set up a GitHub repository for Jarvis AI Assistant

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up GitHub repository for Jarvis AI Assistant${NC}"
echo

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}Git is not installed. Please install git first.${NC}"
    exit 1
fi

# Check if the current directory is a git repository
if [ -d .git ]; then
    echo -e "${YELLOW}This directory is already a git repository.${NC}"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    # Initialize git repository
    echo "Initializing git repository..."
    git init
fi

# Ask for GitHub username
read -p "Enter your GitHub username: " github_username

# Ask for repository name
read -p "Enter repository name (default: jarvis-ai-assistant): " repo_name
repo_name=${repo_name:-jarvis-ai-assistant}

# Create .gitignore file if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore file..."
    cat > .gitignore << EOL
node_modules/
.vscode-test/
*.vsix
.DS_Store
.env
EOL
fi

# Stage all files
echo "Staging files..."
git add .

# Commit changes
echo "Committing files..."
git commit -m "Initial commit"

# Add GitHub remote
echo "Adding GitHub remote..."
git remote add origin https://github.com/$github_username/$repo_name.git

echo -e "${GREEN}Repository setup complete!${NC}"
echo
echo "Next steps:"
echo "1. Create a repository on GitHub named '$repo_name'"
echo "2. Push your code with: git push -u origin main"
echo "3. Set up GitHub Pages (optional) for documentation"
echo
echo -e "${YELLOW}Note: You may need to authenticate with GitHub when pushing.${NC}"
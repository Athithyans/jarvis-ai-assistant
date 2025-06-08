# Distribution Guide for Jarvis AI Assistant

This guide provides step-by-step instructions for making Jarvis AI Assistant available to everyone for free.

## 1. GitHub Repository Setup

### Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in (or create an account if you don't have one)
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository "jarvis-ai-assistant"
4. Add a description: "A powerful, free AI assistant for VSCode that runs locally"
5. Make it public
6. Check "Add a README file"
7. Choose the MIT License
8. Click "Create repository"

### Push Your Code to GitHub

Run the setup script in your project directory:

```bash
cd /path/to/jarvis-ai-assistant
./setup-github-repo.sh
```

Follow the prompts to enter your GitHub username and repository name.

## 2. VS Code Marketplace Publication

### Create a Publisher Account

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with your Microsoft account (or create one if needed)
3. Create a new organization if you don't have one
4. Generate a Personal Access Token (PAT) with "Marketplace (publish)" scope

### Publish to VS Code Marketplace

Run the publish script in your project directory:

```bash
cd /path/to/jarvis-ai-assistant
./publish-extension.sh
```

Follow the prompts to enter your PAT and publisher name.

## 3. Open VSX Registry Publication (for Open Source Editors)

The Open VSX Registry is used by open-source editors like VSCodium, Gitpod, and Eclipse Theia.

1. Install the Open VSX CLI:
   ```bash
   npm install -g ovsx
   ```

2. Generate a token at [Open VSX Registry](https://open-vsx.org/user-settings/tokens)

3. Publish your extension:
   ```bash
   ovsx publish -p <your-token>
   ```

## 4. Create a Project Website (GitHub Pages)

1. Create a `docs` folder in your repository
2. Add an `index.html` file with information about your extension
3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Select "main" branch and "/docs" folder
   - Click "Save"

## 5. Promote Your Extension

### Update Your README

Ensure your README includes:
- Clear description of features
- Installation instructions
- Usage examples
- Screenshots or GIFs
- Links to your GitHub repository and website

### Create Badges

Add badges to your README:
- VS Code Marketplace version
- Downloads
- Rating
- GitHub stars
- Build status

### Share on Social Media and Developer Communities

- Twitter/X
- Reddit (r/vscode, r/programming)
- Dev.to
- Hacker News
- VS Code subreddit

## 6. Gather Feedback and Iterate

1. Monitor GitHub issues for bug reports and feature requests
2. Encourage users to leave reviews on the VS Code Marketplace
3. Regularly update the extension based on feedback

## 7. Set Up Automated Releases

1. Use GitHub Actions for CI/CD (already set up in your repository)
2. Create a new release on GitHub when you want to publish a new version
3. The release workflow will automatically build and attach the VSIX file

## 8. Documentation

1. Keep your README up to date
2. Create a wiki on GitHub for more detailed documentation
3. Add screenshots and GIFs to show how features work

## 9. Community Building

1. Set up a Discord server for user discussions
2. Create a GitHub Discussions section in your repository
3. Respond promptly to issues and questions

## 10. Monetization Options (Optional, While Keeping the Extension Free)

1. GitHub Sponsors
2. Open Collective
3. Ko-fi or Buy Me a Coffee links

Remember, the goal is to make Jarvis AI Assistant accessible to everyone while maintaining its quality and sustainability.
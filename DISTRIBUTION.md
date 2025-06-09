# Distribution Guide for Jarvis AI Assistant

This guide explains how to make Jarvis AI Assistant available to everyone for free.

## Option 1: GitHub Releases (Recommended for Free Distribution)

GitHub Releases is the easiest way to distribute your extension for free without requiring any accounts or payments.

### Prerequisites

1. Create a GitHub account (if you don't have one already) - it's free
2. Create a GitHub repository for your extension
3. Install the GitHub CLI (`gh`) - [Installation Guide](https://cli.github.com/manual/installation)

### Steps to Distribute via GitHub Releases

1. **Package your extension**:
   ```bash
   npm run package
   ```
   This will create a `.vsix` file in your project directory.

2. **Create a GitHub release**:
   ```bash
   npm run create-github-release
   ```
   This will create a new GitHub release with your VSIX file attached.

3. **Share the link** to your GitHub release with users.

### Installation Instructions for Users

Include these instructions in your README.md:

1. Download the `.vsix` file from the [GitHub releases page](https://github.com/Athithyans/jarvis-ai-assistant/releases)
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X on Mac)
4. Click the "..." menu in the top-right of the Extensions panel
5. Select "Install from VSIX..."
6. Choose the downloaded .vsix file
7. Restart VS Code

## Option 2: VS Code Marketplace (Free but Requires Microsoft Account)

Publishing to the VS Code Marketplace makes your extension easily discoverable and installable directly from VS Code.

### Prerequisites

1. Create a Microsoft account (if you don't have one already) - it's free
2. Create an Azure DevOps organization - it's free
3. Create a Personal Access Token (PAT) with Marketplace publishing permissions

### Steps to Publish to VS Code Marketplace

1. **Create a Personal Access Token (PAT)**:
   - Go to https://dev.azure.com/
   - Sign in with your Microsoft account
   - Click on your profile picture in the top right corner
   - Select "Personal access tokens"
   - Click "New Token"
   - Name it "VSCode Marketplace"
   - Set the organization to "All accessible organizations"
   - Set the expiration to whatever you prefer
   - Under "Scopes", select "Custom defined"
   - Scroll down to "Marketplace" and check "Manage"
   - Click "Create"
   - Copy the token (you'll only see it once)

2. **Login to the VS Code Marketplace**:
   ```bash
   vsce login athithyansuresh
   ```
   When prompted, enter the Personal Access Token (PAT) you created.

3. **Publish your extension**:
   ```bash
   vsce publish
   ```

4. **Share the link** to your extension in the VS Code Marketplace.

## Option 3: Open VSX Registry (for Open Source Editors)

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

## Option 4: Host the VSIX File Yourself

You can host the VSIX file on any file hosting service.

### Steps to Self-Host

1. **Package your extension**:
   ```bash
   npm run package
   ```

2. **Upload the VSIX file** to a file hosting service:
   - Google Drive
   - Dropbox
   - Your own website
   - Any other file hosting service

3. **Share the download link** with users.

## Option 5: Open Source Repository

Make your extension open source and allow users to build it themselves.

### Steps for Open Source Distribution

1. **Create a GitHub repository** for your extension (if you haven't already)

2. **Add clear build instructions** in your README.md:
   ```markdown
   ## Building from Source

   1. Clone the repository:
      ```bash
      git clone https://github.com/Athithyans/jarvis-ai-assistant.git
      cd jarvis-ai-assistant
      ```

   2. Install dependencies:
      ```bash
      npm install
      ```

   3. Build the extension:
      ```bash
      npm run compile
      ```

   4. Package the extension:
      ```bash
      npm run package
      ```

   5. Install the extension in VS Code:
      - Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X on Mac)
      - Click the "..." menu in the top-right of the Extensions panel
      - Select "Install from VSIX..."
      - Choose the generated .vsix file
   ```

## Recommended Approach

For the easiest free distribution, we recommend:

1. **GitHub Releases** as the primary distribution method
2. **Open Source Repository** to allow users to build from source

This approach:
- Requires no payment or subscription
- Doesn't require a Microsoft account
- Makes your extension easily accessible
- Allows for community contributions
- Provides transparency and builds trust

## Maintaining Your Extension

Regardless of the distribution method you choose, remember to:

1. **Keep your extension updated** with bug fixes and new features
2. **Document changes** in a CHANGELOG.md file
3. **Respond to user feedback** and issues
4. **Provide clear installation and usage instructions**

## Need Help?

If you need help with distribution, feel free to:
- Open an issue on the GitHub repository
- Reach out to the VS Code extension development community
- Consult the [VS Code Extension API documentation](https://code.visualstudio.com/api)
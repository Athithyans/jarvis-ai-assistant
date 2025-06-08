# Jarvis AI Assistant for VSCode

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/Athithyans/jarvis-ai-assistant/releases/tag/v0.1.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/Athithyans/jarvis-ai-assistant)](https://github.com/Athithyans/jarvis-ai-assistant/issues)

A powerful, free AI assistant for VSCode that provides code completion, answers programming questions, assists with debugging, helps with project scaffolding, and much more - all running locally on your machine.

## Features

### Core Features

- **Ask Questions**: Get answers to your programming questions directly within VSCode
- **Code Completion**: Generate code completions based on your current code
- **Debugging Assistance**: Get help debugging your code by analyzing errors
- **Project Scaffolding**: Generate project structures for various frameworks and languages

### Advanced Features

- **Code Refactoring**: Improve code quality, optimize performance, or modernize syntax
- **Test Generation**: Create comprehensive tests for your code using popular testing frameworks
- **Documentation Generation**: Add inline documentation or create separate documentation files
- **Conversation Interface**: Chat with Jarvis in a dedicated conversation panel
- **Conversation History**: Save, view, and export your conversations with Jarvis
- **Model Management**: Easily download, switch between, and manage AI models

## How It Works

Jarvis AI Assistant uses [Ollama](https://ollama.ai/) to run open-source AI models locally on your machine, ensuring:

1. **Complete Privacy**: Your code never leaves your computer
2. **No Cost**: No subscription fees or API costs
3. **Works Offline**: No internet connection required after initial setup
4. **Customizable**: Choose different models based on your needs and hardware capabilities

## Supported Languages

Jarvis supports a wide range of programming languages and frameworks, including:

- JavaScript/TypeScript
- React, Vue, Angular
- Node.js, Express
- Python, Django, Flask
- Java, Kotlin
- C#, .NET
- Go, Rust
- Ruby, PHP
- HTML/CSS
- And many more!

## Getting Started

### Installation

#### From VS Code Marketplace (Recommended)
1. Install [Ollama](https://ollama.ai/download) on your machine
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X on Mac)
4. Search for "Jarvis AI Assistant"
5. Click "Install"
6. Restart VS Code
7. When first activated, Jarvis will download the necessary AI model (this may take a few minutes)

#### Manual Installation
1. Install [Ollama](https://ollama.ai/download) on your machine
2. Download the latest .vsix file from the [GitHub releases page](https://github.com/Athithyans/jarvis-ai-assistant/releases)
3. Open VS Code
4. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X on Mac)
5. Click the "..." menu in the top-right of the Extensions panel
6. Select "Install from VSIX..."
7. Choose the downloaded .vsix file
8. Restart VS Code

### Usage

- Press `Ctrl+Shift+J` (or `Cmd+Shift+J` on Mac) to ask Jarvis a question
- Press `Ctrl+Shift+K` (or `Cmd+Shift+K` on Mac) to complete your code
- Right-click in the editor to access all Jarvis features from the context menu
- Use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and type "Jarvis" to see all available commands

### Conversation History

Jarvis automatically saves your conversations for future reference:

- View past conversations using the "Jarvis: View Conversation History" command
- Export conversations as Markdown, HTML, or JSON for sharing or documentation
- Clear individual conversations or all history when no longer needed
- Conversations are stored locally on your machine for privacy

### Configuration Options

Configure Jarvis through VS Code settings (File > Preferences > Settings):

- **Model**: Choose which AI model to use (llama3, codellama, mistral, etc.)
- **Temperature**: Control the creativity of responses (0-2)
- **Max Tokens**: Set the maximum length of responses
- **Ollama URL**: Configure a custom Ollama server URL
- **Show Status Bar**: Toggle the Jarvis status bar item

You can also access these settings directly using the "Jarvis: Open Settings" command.

## Command Reference

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `Jarvis: Ask a Question` | Open the conversation panel to ask questions | `Ctrl+Shift+J` |
| `Jarvis: Complete Code` | Complete the code at the current cursor position | `Ctrl+Shift+K` |
| `Jarvis: Debug Code` | Get help debugging your code | - |
| `Jarvis: Generate Project` | Create a new project structure | - |
| `Jarvis: Refactor Code` | Improve your code quality | - |
| `Jarvis: Generate Tests` | Create tests for your code | - |
| `Jarvis: Generate Documentation` | Add documentation to your code | - |
| `Jarvis: View Conversation History` | Browse and manage past conversations | - |
| `Jarvis: Manage AI Models` | Download, delete, or switch between AI models | - |
| `Jarvis: Open Settings` | Configure Jarvis settings | - |

## Requirements

- VSCode 1.60.0 or higher
- [Ollama](https://ollama.ai/download) installed on your machine
- At least 8GB of RAM (16GB recommended)
- 4GB of free disk space for the AI models

## Privacy

Jarvis respects your privacy:
- All processing happens locally on your machine
- No data is sent to external servers
- No telemetry or usage tracking
- Your code stays on your computer

## Troubleshooting

### Common Issues

- **Ollama not found**: Make sure Ollama is installed and in your PATH
- **Model download fails**: Check your internet connection and try again
- **Slow responses**: Try using a smaller model or upgrade your hardware
- **Out of memory errors**: Close other applications or try a smaller model

## License

MIT

## Author

Athithyan Suresh

## Support

If you find Jarvis AI Assistant helpful, please consider:
- Starring the [GitHub repository](https://github.com/Athithyans/jarvis-ai-assistant)
- Sharing it with your friends and colleagues
- [Reporting issues](https://github.com/Athithyans/jarvis-ai-assistant/issues) if you encounter any problems
- Contributing to the project

---

## Development

### Building from Source

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile the TypeScript code
4. Run `./package-extension.sh` to create a VSIX package
5. Install the extension in VSCode using "Extensions: Install from VSIX..."

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Created with ❤️ to make AI accessible to everyone.
# Contributing to Jarvis AI Assistant

Thank you for your interest in contributing to Jarvis AI Assistant! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Describe the behavior you observed and what you expected to see
- Include screenshots if possible
- Provide your environment details (OS, VS Code version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Pull Requests

- Fill in the required template
- Follow the coding style of the project
- Include appropriate tests
- Update documentation for your changes
- Ensure all tests pass
- Link the PR to any related issues

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Compile the TypeScript code: `npm run compile`
4. Run the extension in debug mode:
   - Open the project in VS Code
   - Press F5 to start debugging

## Project Structure

- `src/`: Source code
  - `commands/`: Command implementations
  - `services/`: Service implementations
  - `ui/`: UI components
  - `models/`: Model interfaces
  - `utils/`: Utility functions
  - `extension.ts`: Extension entry point
- `out/`: Compiled JavaScript files
- `dist/`: Webpack bundled files
- `.vscode/`: VS Code configuration files

## Coding Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Write meaningful commit messages
- Document public APIs
- Write tests for new functionality

## Testing

- Run tests with `npm test`
- Ensure your changes don't break existing functionality
- Add tests for new features

## Documentation

- Update the README.md if necessary
- Document new features or changes in behavior
- Keep code comments up to date

## Submitting Changes

1. Push your changes to your fork
2. Submit a pull request to the main repository
3. The maintainers will review your PR and provide feedback
4. Make any requested changes
5. Once approved, your PR will be merged

## Questions?

If you have any questions, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to Jarvis AI Assistant!
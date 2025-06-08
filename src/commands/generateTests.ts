import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LocalModelService } from '../services/localModelService';

export class GenerateTestsCommand {
  private modelService: LocalModelService;

  constructor(modelService: LocalModelService) {
    this.modelService = modelService;
  }

  public async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found. Please open a file first.');
      return;
    }

    // Get the current document
    const document = editor.document;
    const code = document.getText();
    const fileName = path.basename(document.fileName);
    const fileExtension = path.extname(document.fileName);
    const languageId = document.languageId;

    // Determine the testing framework based on the language
    const testingFrameworks = this.getTestingFrameworksForLanguage(languageId);

    if (testingFrameworks.length === 0) {
      vscode.window.showErrorMessage(`Test generation is not supported for ${languageId} files.`);
      return;
    }

    // Ask for the testing framework
    const framework = await vscode.window.showQuickPick(
      testingFrameworks.map(fw => ({ label: fw.name, description: fw.description })),
      { placeHolder: 'Select a testing framework' }
    );

    if (!framework) {
      return; // User cancelled
    }

    // Get the selected framework
    const selectedFramework = testingFrameworks.find(fw => fw.name === framework.label);

    if (!selectedFramework) {
      return;
    }

    // Show progress indicator
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Jarvis is generating tests with ${selectedFramework.name}...`,
        cancellable: false,
      },
      async progress => {
        try {
          // Create a prompt for the test generation task
          const prompt = `You are Jarvis, an AI assistant specialized in writing tests. I have some ${languageId} code that I want to write tests for using ${selectedFramework.name}.

Here's the code:
\`\`\`${languageId}
${code}
\`\`\`

Please generate comprehensive tests for this code using ${selectedFramework.name}. The tests should:
- Cover all public functions and methods
- Include both positive and negative test cases
- Test edge cases and error handling
- Follow best practices for ${selectedFramework.name}
- Be well-commented and organized

Return only the test code without explanations, wrapped in a code block.`;

          // Get test code from the model service
          const response = await this.modelService.askQuestion(prompt);

          // Extract the code block from the response
          const codeBlockMatch = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
          let testCode = '';

          if (codeBlockMatch && codeBlockMatch[1]) {
            testCode = codeBlockMatch[1];
          } else {
            // If no code block is found, try to use the entire response
            testCode = response;
          }

          // Generate the test file name
          const testFileName = this.generateTestFileName(fileName, selectedFramework.filePattern);

          // Get the directory of the current file
          const currentDir = path.dirname(document.fileName);

          // Determine where to save the test file
          let testFilePath: string;

          if (selectedFramework.testDirPattern) {
            // If the framework has a test directory pattern, use it
            const testDir = path.join(currentDir, selectedFramework.testDirPattern);

            // Create the test directory if it doesn't exist
            if (!fs.existsSync(testDir)) {
              fs.mkdirSync(testDir, { recursive: true });
            }

            testFilePath = path.join(testDir, testFileName);
          } else {
            // Otherwise, save in the same directory
            testFilePath = path.join(currentDir, testFileName);
          }

          // Ask if the user wants to save the test file
          const saveOption = await vscode.window.showInformationMessage(
            `Jarvis has generated tests for ${fileName}. What would you like to do?`,
            'Save Test File',
            'Preview Only'
          );

          // Create a new document to show the test code
          const testDocument = await vscode.workspace.openTextDocument({
            content: testCode,
            language: languageId,
          });

          // Show the test document
          await vscode.window.showTextDocument(testDocument, vscode.ViewColumn.Beside);

          if (saveOption === 'Save Test File') {
            // Save the test file
            fs.writeFileSync(testFilePath, testCode);

            vscode.window.showInformationMessage(`Test file saved to ${testFilePath}`);

            // Open the saved file
            const savedDocument = await vscode.workspace.openTextDocument(testFilePath);
            await vscode.window.showTextDocument(savedDocument, vscode.ViewColumn.Beside);

            // Close the preview document
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Jarvis encountered an error: ${error}`);
        }
      }
    );
  }

  private getTestingFrameworksForLanguage(languageId: string): Array<{
    name: string;
    description: string;
    filePattern: string;
    testDirPattern?: string;
  }> {
    switch (languageId) {
      case 'javascript':
      case 'typescript':
        return [
          {
            name: 'Jest',
            description: "Facebook's JavaScript testing framework",
            filePattern: '{name}.test.{ext}',
            testDirPattern: '__tests__',
          },
          {
            name: 'Mocha',
            description: 'Feature-rich JavaScript test framework',
            filePattern: '{name}.spec.{ext}',
            testDirPattern: 'test',
          },
          {
            name: 'Jasmine',
            description: 'Behavior-driven development framework',
            filePattern: '{name}.spec.{ext}',
            testDirPattern: 'spec',
          },
        ];

      case 'python':
        return [
          {
            name: 'pytest',
            description: 'Python testing framework',
            filePattern: 'test_{name}.{ext}',
            testDirPattern: 'tests',
          },
          {
            name: 'unittest',
            description: 'Python standard library testing framework',
            filePattern: 'test_{name}.{ext}',
            testDirPattern: 'tests',
          },
        ];

      case 'java':
        return [
          {
            name: 'JUnit',
            description: 'Java testing framework',
            filePattern: '{name}Test.{ext}',
            testDirPattern: 'src/test/java',
          },
          {
            name: 'TestNG',
            description: 'Testing framework for Java',
            filePattern: '{name}Test.{ext}',
            testDirPattern: 'src/test/java',
          },
        ];

      case 'csharp':
        return [
          {
            name: 'NUnit',
            description: '.NET testing framework',
            filePattern: '{name}Tests.{ext}',
            testDirPattern: 'Tests',
          },
          {
            name: 'xUnit',
            description: '.NET testing tool',
            filePattern: '{name}Tests.{ext}',
            testDirPattern: 'Tests',
          },
        ];

      case 'go':
        return [
          {
            name: 'Go testing package',
            description: 'Standard Go testing package',
            filePattern: '{name}_test.{ext}',
          },
        ];

      case 'ruby':
        return [
          {
            name: 'RSpec',
            description: 'Behavior-driven development for Ruby',
            filePattern: '{name}_spec.{ext}',
            testDirPattern: 'spec',
          },
          {
            name: 'Minitest',
            description: 'Complete suite of testing facilities',
            filePattern: '{name}_test.{ext}',
            testDirPattern: 'test',
          },
        ];

      case 'php':
        return [
          {
            name: 'PHPUnit',
            description: 'Testing framework for PHP',
            filePattern: '{name}Test.{ext}',
            testDirPattern: 'tests',
          },
        ];

      default:
        return [];
    }
  }

  private generateTestFileName(fileName: string, pattern: string): string {
    const baseName = path.basename(fileName, path.extname(fileName));
    const extension = path.extname(fileName).substring(1); // Remove the dot

    return pattern.replace('{name}', baseName).replace('{ext}', extension);
  }
}

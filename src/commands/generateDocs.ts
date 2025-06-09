import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { LocalModelService } from '../services/localModelService';

export class GenerateDocsCommand {
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
    const languageId = document.languageId;

    // Determine the documentation format based on the language
    const docFormats = this.getDocFormatsForLanguage(languageId);

    if (docFormats.length === 0) {
      vscode.window.showErrorMessage(
        `Documentation generation is not supported for ${languageId} files.`
      );
      return;
    }

    // Ask for the documentation format
    const format = await vscode.window.showQuickPick(
      docFormats.map(fmt => ({ label: fmt.name, description: fmt.description })),
      { placeHolder: 'Select a documentation format' }
    );

    if (!format) {
      return; // User cancelled
    }

    // Get the selected format
    const selectedFormat = docFormats.find(fmt => fmt.name === format.label);

    if (!selectedFormat) {
      return;
    }

    // Ask for the documentation type
    const docType = await vscode.window.showQuickPick(
      [
        {
          label: 'Inline Documentation',
          description: 'Add documentation comments to the existing code',
        },
        {
          label: 'Separate Documentation File',
          description: 'Generate a separate documentation file',
        },
      ],
      {
        placeHolder: 'Select documentation type',
      }
    );

    if (!docType) {
      return; // User cancelled
    }

    // Show progress indicator
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Jarvis is generating ${docType.label.toLowerCase()} with ${selectedFormat.name}...`,
        cancellable: false,
      },
      async _progress => {
        try {
          if (docType.label === 'Inline Documentation') {
            await this.generateInlineDocs(document, code, languageId, selectedFormat, editor);
          } else {
            await this.generateSeparateDocsFile(document, code, languageId, selectedFormat);
          }
        } catch (error) {
          vscode.window.showErrorMessage(`Jarvis encountered an error: ${error}`);
        }
      }
    );
  }

  private async generateInlineDocs(
    document: vscode.TextDocument,
    code: string,
    languageId: string,
    format: { name: string; description: string; example: string },
    editor: vscode.TextEditor
  ): Promise<void> {
    // Create a prompt for inline documentation generation
    const prompt = `You are Jarvis, an AI assistant specialized in code documentation. I have some ${languageId} code that I want to add documentation comments to using ${format.name} style.

Here's the code:
\`\`\`${languageId}
${code}
\`\`\`

Please add comprehensive documentation comments to this code following ${format.name} style. The documentation should:
- Include a file header comment explaining the purpose of the file
- Document all classes, functions, and methods with parameter descriptions, return values, and examples where appropriate
- Explain complex logic with inline comments
- Follow ${format.name} conventions and best practices
- Preserve all existing code functionality

Here's an example of ${format.name} style:
${format.example}

Return only the fully documented code without explanations.`;

    // Get documented code from the model service
    const response = await this.modelService.askQuestion(prompt);

    // Extract the code block from the response
    const codeBlockMatch = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
    let documentedCode = '';

    if (codeBlockMatch && codeBlockMatch[1]) {
      documentedCode = codeBlockMatch[1];
    } else {
      // If no code block is found, try to use the entire response
      documentedCode = response;
    }

    // Create a new document to show the documented code
    const docDocument = await vscode.workspace.openTextDocument({
      content: documentedCode,
      language: languageId,
    });

    // Show the documented code
    await vscode.window.showTextDocument(docDocument, vscode.ViewColumn.Beside);

    // Ask if the user wants to apply the changes
    const applyChanges = await vscode.window.showInformationMessage(
      'Do you want to apply these documentation changes to your original code?',
      'Apply Changes',
      'Keep Original'
    );

    if (applyChanges === 'Apply Changes') {
      // Apply the changes to the original document
      const fullRange = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(
          document.lineCount - 1,
          document.lineAt(document.lineCount - 1).text.length
        )
      );

      editor.edit(editBuilder => {
        editBuilder.replace(fullRange, documentedCode);
      });

      // Close the diff document
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

      vscode.window.showInformationMessage('Documentation changes applied successfully!');
    }
  }

  private async generateSeparateDocsFile(
    document: vscode.TextDocument,
    code: string,
    languageId: string,
    _format: { name: string; description: string; example: string }
  ): Promise<void> {
    // Determine the documentation file format
    const docFileFormats = [
      { label: 'Markdown (.md)', extension: 'md' },
      { label: 'HTML (.html)', extension: 'html' },
      { label: 'Text (.txt)', extension: 'txt' },
    ];

    // Ask for the file format
    const fileFormat = await vscode.window.showQuickPick(docFileFormats, {
      placeHolder: 'Select documentation file format',
    });

    if (!fileFormat) {
      return; // User cancelled
    }

    // Create a prompt for separate documentation generation
    const prompt = `You are Jarvis, an AI assistant specialized in code documentation. I have some ${languageId} code that I want to generate a separate documentation file for in ${fileFormat.label} format.

Here's the code:
\`\`\`${languageId}
${code}
\`\`\`

Please generate comprehensive documentation for this code. The documentation should:
- Include a title and overview section explaining the purpose of the code
- Document all classes, functions, and methods with parameter descriptions, return values, and examples
- Include a table of contents for easy navigation
- Use proper ${fileFormat.label.split(' ')[0]} formatting with headings, lists, code blocks, etc.
- Be well-organized and easy to read

Return only the documentation content without explanations.`;

    // Get documentation from the model service
    const documentation = await this.modelService.askQuestion(prompt);

    // Generate the documentation file name
    const baseName = path.basename(document.fileName, path.extname(document.fileName));
    const docFileName = `${baseName}.docs.${fileFormat.extension}`;

    // Get the directory of the current file
    const currentDir = path.dirname(document.fileName);
    const docFilePath = path.join(currentDir, docFileName);

    // Create a new document to show the documentation
    const docDocument = await vscode.workspace.openTextDocument({
      content: documentation,
      language: fileFormat.extension,
    });

    // Show the documentation
    await vscode.window.showTextDocument(docDocument, vscode.ViewColumn.Beside);

    // Ask if the user wants to save the documentation file
    const saveOption = await vscode.window.showInformationMessage(
      `Jarvis has generated documentation for ${baseName}. What would you like to do?`,
      'Save Documentation File',
      'Preview Only'
    );

    if (saveOption === 'Save Documentation File') {
      // Save the documentation file
      fs.writeFileSync(docFilePath, documentation);

      vscode.window.showInformationMessage(`Documentation file saved to ${docFilePath}`);

      // Open the saved file
      const savedDocument = await vscode.workspace.openTextDocument(docFilePath);
      await vscode.window.showTextDocument(savedDocument, vscode.ViewColumn.Beside);

      // Close the preview document
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    }
  }

  private getDocFormatsForLanguage(languageId: string): Array<{
    name: string;
    description: string;
    example: string;
  }> {
    switch (languageId) {
      case 'javascript':
      case 'typescript':
        return [
          {
            name: 'JSDoc',
            description: 'JavaScript documentation standard',
            example: `/**
 * Calculates the sum of two numbers.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of a and b.
 * @example
 * // returns 3
 * add(1, 2);
 */
function add(a, b) {
    return a + b;
}`,
          },
          {
            name: 'TSDoc',
            description: 'TypeScript documentation standard',
            example: `/**
 * Calculates the sum of two numbers.
 *
 * @param a - The first number.
 * @param b - The second number.
 * @returns The sum of a and b.
 * @example
 * // returns 3
 * add(1, 2);
 */
function add(a: number, b: number): number {
    return a + b;
}`,
          },
        ];

      case 'python':
        return [
          {
            name: 'Google Style',
            description: "Google's Python documentation style",
            example: `def add(a, b):
    """Calculates the sum of two numbers.
    
    Args:
        a: The first number.
        b: The second number.
        
    Returns:
        The sum of a and b.
        
    Examples:
        >>> add(1, 2)
        3
    """
    return a + b`,
          },
          {
            name: 'NumPy Style',
            description: "NumPy's Python documentation style",
            example: `def add(a, b):
    """Calculates the sum of two numbers.
    
    Parameters
    ----------
    a : number
        The first number.
    b : number
        The second number.
        
    Returns
    -------
    number
        The sum of a and b.
        
    Examples
    --------
    >>> add(1, 2)
    3
    """
    return a + b`,
          },
          {
            name: 'Sphinx Style',
            description: 'reStructuredText documentation style',
            example: `def add(a, b):
    """Calculates the sum of two numbers.
    
    :param a: The first number.
    :type a: number
    :param b: The second number.
    :type b: number
    :return: The sum of a and b.
    :rtype: number
    
    :Example:
    
    >>> add(1, 2)
    3
    """
    return a + b`,
          },
        ];

      case 'java':
      case 'kotlin':
        return [
          {
            name: 'Javadoc',
            description: 'Java documentation standard',
            example: `/**
 * Calculates the sum of two numbers.
 *
 * @param a The first number.
 * @param b The second number.
 * @return The sum of a and b.
 * @throws IllegalArgumentException If the result overflows.
 * @see SomeOtherClass#someMethod()
 */
public int add(int a, int b) {
    return a + b;
}`,
          },
        ];

      case 'csharp':
        return [
          {
            name: 'XML Documentation',
            description: 'C# XML documentation standard',
            example: `/// <summary>
/// Calculates the sum of two numbers.
/// </summary>
/// <param name="a">The first number.</param>
/// <param name="b">The second number.</param>
/// <returns>The sum of a and b.</returns>
/// <exception cref="OverflowException">Thrown when the result overflows.</exception>
/// <example>
/// <code>
/// int result = Add(1, 2); // returns 3
/// </code>
/// </example>
public int Add(int a, int b)
{
    return a + b;
}`,
          },
        ];

      case 'go':
        return [
          {
            name: 'GoDoc',
            description: 'Go documentation standard',
            example: `// Add calculates the sum of two numbers.
//
// It takes two integers and returns their sum.
// If the result overflows, it will wrap around.
//
// Example:
//
//     result := Add(1, 2) // returns 3
//
func Add(a, b int) int {
    return a + b
}`,
          },
        ];

      case 'php':
        return [
          {
            name: 'PHPDoc',
            description: 'PHP documentation standard',
            example: `/**
 * Calculates the sum of two numbers.
 *
 * @param int $a The first number.
 * @param int $b The second number.
 * @return int The sum of a and b.
 * @throws \\OverflowException If the result overflows.
 * @example
 * $result = add(1, 2); // returns 3
 */
function add(int $a, int $b): int
{
    return $a + $b;
}`,
          },
        ];

      case 'ruby':
        return [
          {
            name: 'YARD',
            description: 'Ruby documentation standard',
            example: `# Calculates the sum of two numbers.
#
# @param a [Integer] The first number.
# @param b [Integer] The second number.
# @return [Integer] The sum of a and b.
# @raise [OverflowError] If the result overflows.
# @example
#   add(1, 2) #=> 3
#
def add(a, b)
  a + b
end`,
          },
        ];

      default:
        return [];
    }
  }
}

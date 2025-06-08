import * as vscode from 'vscode';
import { LocalModelService } from '../services/localModelService';

export class RefactorCodeCommand {
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
        
        // Get the current document and selection
        const document = editor.document;
        const selection = editor.selection;
        
        // Get the selected text or the entire document if nothing is selected
        let code: string;
        let replaceRange: vscode.Range;
        
        if (selection.isEmpty) {
            // If no text is selected, use the entire document
            const startPosition = new vscode.Position(0, 0);
            const endPosition = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
            replaceRange = new vscode.Range(startPosition, endPosition);
            code = document.getText();
        } else {
            // Use the selected text
            replaceRange = selection;
            code = document.getText(selection);
        }
        
        // Get the language ID of the current document
        const languageId = document.languageId;
        
        // Ask for refactoring options
        const refactoringOption = await vscode.window.showQuickPick([
            { label: 'Improve Code Quality', description: 'Enhance readability and maintainability' },
            { label: 'Optimize Performance', description: 'Make the code more efficient' },
            { label: 'Add Comments', description: 'Add detailed comments to explain the code' },
            { label: 'Convert to Modern Syntax', description: 'Update to latest language features' },
            { label: 'Simplify Logic', description: 'Reduce complexity and make code more straightforward' }
        ], {
            placeHolder: 'Select a refactoring option'
        });
        
        if (!refactoringOption) {
            return; // User cancelled
        }
        
        // Show progress indicator
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Jarvis is refactoring your code (${refactoringOption.label})...`,
            cancellable: false
        }, async (progress) => {
            try {
                // Create a prompt for the refactoring task
                const prompt = `You are Jarvis, an AI assistant specialized in code refactoring. I have some ${languageId} code that I want to refactor for "${refactoringOption.label}". 

Here's the code:
\`\`\`${languageId}
${code}
\`\`\`

Please refactor this code to ${refactoringOption.label.toLowerCase()}. Specifically:
${this.getRefactoringInstructions(refactoringOption.label)}

Return only the refactored code without explanations, wrapped in a code block.`;
                
                // Get refactored code from the model service
                const response = await this.modelService.askQuestion(prompt);
                
                // Extract the code block from the response
                const codeBlockMatch = response.match(/```(?:\w+)?\n([\s\S]*?)```/);
                let refactoredCode = code; // Default to original code
                
                if (codeBlockMatch && codeBlockMatch[1]) {
                    refactoredCode = codeBlockMatch[1];
                } else {
                    // If no code block is found, try to use the entire response
                    refactoredCode = response;
                }
                
                // Create a new document to show the diff
                const diffDocument = await vscode.workspace.openTextDocument({
                    content: refactoredCode,
                    language: languageId
                });
                
                // Show the diff document
                const diffEditor = await vscode.window.showTextDocument(diffDocument, vscode.ViewColumn.Beside);
                
                // Ask if the user wants to apply the changes
                const applyChanges = await vscode.window.showInformationMessage(
                    'Do you want to apply these refactoring changes to your original code?',
                    'Apply Changes',
                    'Keep Original'
                );
                
                if (applyChanges === 'Apply Changes') {
                    // Apply the changes to the original document
                    editor.edit(editBuilder => {
                        editBuilder.replace(replaceRange, refactoredCode);
                    });
                    
                    // Close the diff document
                    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                    
                    vscode.window.showInformationMessage('Refactoring changes applied successfully!');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Jarvis encountered an error: ${error}`);
            }
        });
    }
    
    private getRefactoringInstructions(option: string): string {
        switch (option) {
            case 'Improve Code Quality':
                return `- Improve variable and function naming for clarity
- Break down complex functions into smaller, more manageable ones
- Remove redundant code
- Apply consistent formatting and style
- Follow best practices for the language`;
                
            case 'Optimize Performance':
                return `- Identify and fix performance bottlenecks
- Optimize loops and data structures
- Reduce unnecessary computations
- Use more efficient algorithms where applicable
- Minimize memory usage`;
                
            case 'Add Comments':
                return `- Add a file header comment explaining the purpose of the code
- Add function/method documentation comments
- Explain complex logic with inline comments
- Document any assumptions or edge cases
- Use the standard comment format for the language`;
                
            case 'Convert to Modern Syntax':
                return `- Update to modern language features and syntax
- Replace older patterns with contemporary equivalents
- Use newer APIs and functions when available
- Apply current best practices
- Maintain the same functionality while modernizing the code`;
                
            case 'Simplify Logic':
                return `- Reduce nested conditionals
- Simplify complex boolean expressions
- Remove unnecessary checks and validations
- Use guard clauses and early returns
- Make the code more straightforward and easier to understand`;
                
            default:
                return `- Improve the overall quality and readability of the code
- Apply best practices for the language
- Maintain the same functionality`;
        }
    }
}
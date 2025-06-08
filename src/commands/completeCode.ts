import * as vscode from 'vscode';
import { LocalModelService } from '../services/localModelService';

export class CompleteCodeCommand {
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
            // If no text is selected, use the entire document up to the cursor position
            const cursorPosition = selection.active;
            const startPosition = new vscode.Position(0, 0);
            replaceRange = new vscode.Range(cursorPosition, cursorPosition);
            code = document.getText(new vscode.Range(startPosition, cursorPosition));
        } else {
            // Use the selected text
            replaceRange = selection;
            code = document.getText(selection);
        }
        
        // Get the language ID of the current document
        const languageId = document.languageId;
        
        // Show progress indicator
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Jarvis is generating code...",
            cancellable: false
        }, async (progress) => {
            try {
                // Get code completion from the model service
                const completedCode = await this.modelService.completeCode(code, languageId);
                
                // Replace the selected text or insert at cursor position
                editor.edit(editBuilder => {
                    if (selection.isEmpty) {
                        // If no text was selected, just insert the completion at the cursor
                        editBuilder.insert(selection.active, completedCode.substring(code.length));
                    } else {
                        // Replace the selected text with the completed code
                        editBuilder.replace(selection, completedCode);
                    }
                });
                
                vscode.window.showInformationMessage('Jarvis has completed your code!');
            } catch (error) {
                vscode.window.showErrorMessage(`Jarvis encountered an error: ${error}`);
            }
        });
    }
}
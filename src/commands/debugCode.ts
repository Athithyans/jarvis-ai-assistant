import * as vscode from 'vscode';
import { LocalModelService } from '../services/localModelService';

export class DebugCodeCommand {
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
    if (selection.isEmpty) {
      code = document.getText();
    } else {
      code = document.getText(selection);
    }

    // Ask the user for the error message
    const errorMessage = await vscode.window.showInputBox({
      prompt: 'What error are you encountering?',
      placeHolder: 'e.g., TypeError: Cannot read property of undefined',
    });

    if (!errorMessage) {
      return; // User cancelled
    }

    // Show progress indicator
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Jarvis is analyzing your code...',
        cancellable: false,
      },
      async _progress => {
        try {
          // Get debugging suggestions from the model service
          const debugSuggestions = await this.modelService.debugCode(code, errorMessage);

          // Create and show webview panel with the debugging suggestions
          const panel = vscode.window.createWebviewPanel(
            'jarvisDebug',
            'Jarvis: Debug Suggestions',
            vscode.ViewColumn.Beside,
            {
              enableScripts: true,
              localResourceRoots: [],
            }
          );

          panel.webview.html = this.getWebviewContent(code, errorMessage, debugSuggestions);

          // Handle messages from the webview
          panel.webview.onDidReceiveMessage(
            message => {
              if (message.command === 'applyFix') {
                const edit = new vscode.WorkspaceEdit();
                if (selection.isEmpty) {
                  const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                  );
                  edit.replace(document.uri, fullRange, message.text);
                } else {
                  edit.replace(document.uri, selection, message.text);
                }
                vscode.workspace.applyEdit(edit);
              }
            },
            undefined,
            undefined
          );
        } catch (error) {
          vscode.window.showErrorMessage(
            `Jarvis encountered an error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    );
  }

  private getWebviewContent(code: string, errorMessage: string, suggestions: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jarvis Debug Suggestions</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .code, .error, .suggestions {
            white-space: pre-wrap;
            padding: 10px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 5px;
        }
        .error {
            color: var(--vscode-errorForeground);
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 5px;
            overflow: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
        }
        .apply-fix-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 10px;
        }
        .apply-fix-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <h2>Jarvis Debug Assistant</h2>
    
    <div class="section">
        <div class="section-title">Your Code</div>
        <div class="code">${this.escapeHtml(code)}</div>
    </div>
    
    <div class="section">
        <div class="section-title">Error Message</div>
        <div class="error">${this.escapeHtml(errorMessage)}</div>
    </div>
    
    <div class="section">
        <div class="section-title">Jarvis's Suggestions</div>
        <div class="suggestions">${this.formatSuggestions(suggestions)}</div>
    </div>
    
    <button class="apply-fix-button" onclick="applyFix()">Apply Suggested Fix</button>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function applyFix() {
            // Extract the code from the suggestions
            const suggestionsElement = document.querySelector('.suggestions');
            if (!suggestionsElement) {
                console.error('Suggestions element not found');
                return;
            }
            
            const suggestions = suggestionsElement.textContent || '';
            
            // Find code blocks between triple backticks
            const startMarker = '\`\`\`';
            const endMarker = '\`\`\`';
            
            let startIndex = suggestions.indexOf(startMarker);
            if (startIndex !== -1) {
                // Skip the language identifier line if present
                startIndex = suggestions.indexOf('\\n', startIndex) + 1;
                
                const endIndex = suggestions.indexOf(endMarker, startIndex);
                if (endIndex !== -1) {
                    const codeBlock = suggestions.substring(startIndex, endIndex).trim();
                    
                    vscode.postMessage({
                        command: 'applyFix',
                        text: codeBlock
                    });
                    return;
                }
            }
            
            vscode.postMessage({
                command: 'showError',
                text: 'No code fix found in the suggestions.'
            });
        }
    </script>
</body>
</html>`;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatSuggestions(text: string): string {
    // Convert markdown-style code blocks to HTML
    let formattedText = text;

    // Replace code blocks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
    formattedText = formattedText.replace(codeBlockRegex, (_match: string, code: string) => {
      return `<pre><code>${this.escapeHtml(code)}</code></pre>`;
    });

    // Replace inline code
    const inlineCodeRegex = /`([^`]+)`/g;
    formattedText = formattedText.replace(inlineCodeRegex, (_match: string, code: string) => {
      return `<code>${this.escapeHtml(code)}</code>`;
    });

    // Replace newlines with <br>
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
  }
}

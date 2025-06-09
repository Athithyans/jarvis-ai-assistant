import * as vscode from 'vscode';
import { LocalModelService } from '../services/localModelService';
import { ConversationHistoryService } from '../services/conversationHistoryService';

/**
 * Manages the conversation panel UI
 */
export class ConversationPanel {
  public static currentPanel: ConversationPanel | undefined;
  private static readonly viewType = 'jarvisConversation';

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private modelService: LocalModelService;
  private historyService: ConversationHistoryService;
  private disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    modelService: LocalModelService,
    historyService: ConversationHistoryService
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.modelService = modelService;
    this.historyService = historyService;

    // Set the webview's initial html content
    this.updateWebview();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.command) {
          case 'askQuestion':
            await this.handleUserQuestion(message.text);
            break;
          case 'clearConversation':
            // Create a new conversation
            this.historyService.createConversation();
            this.updateWebview();
            break;
          case 'exportConversation':
            await this.exportConversation(message.format);
            break;
        }
      },
      null,
      this.disposables
    );
  }

  /**
   * Creates or shows the conversation panel
   */
  public static createOrShow(
    extensionUri: vscode.Uri,
    modelService: LocalModelService,
    historyService: ConversationHistoryService
  ): ConversationPanel {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (ConversationPanel.currentPanel) {
      ConversationPanel.currentPanel.panel.reveal(column);
      return ConversationPanel.currentPanel;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      ConversationPanel.viewType,
      'Jarvis Conversation',
      column || vscode.ViewColumn.One,
      {
        // Enable JavaScript in the webview
        enableScripts: true,

        // Restrict the webview to only load resources from the extension's directory
        localResourceRoots: [extensionUri],

        // Retain context when hidden
        retainContextWhenHidden: true,
      }
    );

    ConversationPanel.currentPanel = new ConversationPanel(
      panel,
      extensionUri,
      modelService,
      historyService
    );
    return ConversationPanel.currentPanel;
  }

  /**
   * Exports the current conversation
   */
  private async exportConversation(format: 'markdown' | 'html' | 'json'): Promise<void> {
    const conversation = this.historyService.getCurrentConversation();
    if (!conversation) {
      vscode.window.showErrorMessage('No active conversation to export.');
      return;
    }

    const filePath = await this.historyService.exportConversation(conversation.id, format);
    if (filePath) {
      vscode.window.showInformationMessage(`Conversation exported to ${filePath}`);

      // Open the exported file
      const document = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(document);
    }
  }

  /**
   * Handles a user question
   */
  private async handleUserQuestion(question: string): Promise<void> {
    // Add user message to conversation history
    this.historyService.addMessage('user', question);

    // Update the webview to show the user message
    this.updateWebview();

    try {
      // Get response from the model service
      const response = await this.modelService.askQuestion(question);

      // Add assistant message to conversation history
      this.historyService.addMessage('assistant', response);

      // Update the webview to show the assistant message
      this.updateWebview();
    } catch (error) {
      // Add error message to conversation history
      this.historyService.addMessage('assistant', `Error: ${error}`);

      // Update the webview to show the error message
      this.updateWebview();
    }
  }

  /**
   * Updates the webview content
   */
  private updateWebview(): void {
    this.panel.webview.html = this.getHtmlForWebview();
  }

  /**
   * Gets the HTML for the webview
   */
  private getHtmlForWebview(): string {
    // Get the current conversation
    const conversation = this.historyService.getCurrentConversation();
    const messages = conversation ? conversation.messages : [];

    // Convert messages to HTML
    const messagesHtml = messages
      .map(message => {
        const isUser = message.role === 'user';
        const messageClass = isUser ? 'user-message' : 'assistant-message';
        const avatarIcon = isUser ? '👤' : '🤖';
        const formattedTime = new Date(message.timestamp).toLocaleTimeString();

        // Format the message content with markdown-like syntax
        const formattedContent = this.formatMessageContent(message.content);

        return `
                <div class="message ${messageClass}">
                    <div class="message-avatar">${avatarIcon}</div>
                    <div class="message-content">
                        <div class="message-header">
                            <span class="message-sender">${isUser ? 'You' : 'Jarvis'}</span>
                            <span class="message-time">${formattedTime}</span>
                        </div>
                        <div class="message-text">${formattedContent}</div>
                    </div>
                </div>
            `;
      })
      .join('');

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Jarvis Conversation</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 0;
                    margin: 0;
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }
                
                .conversation-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .message {
                    display: flex;
                    margin-bottom: 20px;
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .message-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                
                .message-content {
                    flex: 1;
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 10px;
                    padding: 10px 15px;
                    position: relative;
                }
                
                .user-message .message-content {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                
                .message-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 5px;
                    font-size: 12px;
                }
                
                .message-sender {
                    font-weight: bold;
                }
                
                .message-time {
                    opacity: 0.7;
                }
                
                .message-text {
                    white-space: pre-wrap;
                    line-height: 1.5;
                }
                
                .message-text code {
                    font-family: var(--vscode-editor-font-family);
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 2px 5px;
                    border-radius: 3px;
                }
                
                .message-text pre {
                    background-color: var(--vscode-textCodeBlock-background);
                    padding: 10px;
                    border-radius: 5px;
                    overflow-x: auto;
                    margin: 10px 0;
                }
                
                .input-container {
                    display: flex;
                    padding: 15px;
                    border-top: 1px solid var(--vscode-panel-border);
                    background-color: var(--vscode-editor-background);
                }
                
                .message-input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border-radius: 5px;
                    resize: none;
                    font-family: var(--vscode-font-family);
                    min-height: 40px;
                    max-height: 150px;
                }
                
                .send-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 5px;
                    padding: 0 15px;
                    margin-left: 10px;
                    cursor: pointer;
                }
                
                .send-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .toolbar {
                    display: flex;
                    justify-content: flex-end;
                    padding: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .toolbar-button {
                    background-color: transparent;
                    color: var(--vscode-button-foreground);
                    border: 1px solid var(--vscode-button-background);
                    border-radius: 5px;
                    padding: 5px 10px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .toolbar-button:hover {
                    background-color: var(--vscode-button-background);
                }
                
                .empty-conversation {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    opacity: 0.7;
                    text-align: center;
                    padding: 0 20px;
                }
                
                .empty-conversation h2 {
                    margin-bottom: 10px;
                }
                
                .empty-conversation p {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="toolbar">
                <button class="toolbar-button" id="exportMarkdownButton">Export as Markdown</button>
                <button class="toolbar-button" id="exportHtmlButton">Export as HTML</button>
                <button class="toolbar-button" id="clearButton">Clear Conversation</button>
            </div>
            
            <div class="conversation-container" id="conversationContainer">
                ${
                  messagesHtml.length > 0
                    ? messagesHtml
                    : `
                    <div class="empty-conversation">
                        <h2>Welcome to Jarvis AI Assistant</h2>
                        <p>Ask me anything about programming, debugging, or project development.</p>
                        <p>I'm here to help you be more productive!</p>
                    </div>
                `
                }
            </div>
            
            <div class="input-container">
                <textarea 
                    class="message-input" 
                    id="messageInput" 
                    placeholder="Ask Jarvis a question..."
                    rows="1"
                ></textarea>
                <button class="send-button" id="sendButton">Send</button>
            </div>
            
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    const conversationContainer = document.getElementById('conversationContainer');
                    const messageInput = document.getElementById('messageInput');
                    const sendButton = document.getElementById('sendButton');
                    const clearButton = document.getElementById('clearButton');
                    
                    // Scroll to the bottom of the conversation
                    function scrollToBottom() {
                        conversationContainer.scrollTop = conversationContainer.scrollHeight;
                    }
                    
                    // Send a message to the extension
                    function sendMessage() {
                        const text = messageInput.value.trim();
                        if (text) {
                            vscode.postMessage({
                                command: 'askQuestion',
                                text: text
                            });
                            messageInput.value = '';
                            messageInput.style.height = 'auto';
                        }
                    }
                    
                    // Clear the conversation
                    function clearConversation() {
                        vscode.postMessage({
                            command: 'clearConversation'
                        });
                    }
                    
                    // Auto-resize the textarea
                    function autoResizeTextarea() {
                        messageInput.style.height = 'auto';
                        messageInput.style.height = (messageInput.scrollHeight) + 'px';
                    }
                    
                    // Export conversation as Markdown
                    function exportAsMarkdown() {
                        vscode.postMessage({
                            command: 'exportConversation',
                            format: 'markdown'
                        });
                    }
                    
                    // Export conversation as HTML
                    function exportAsHtml() {
                        vscode.postMessage({
                            command: 'exportConversation',
                            format: 'html'
                        });
                    }
                    
                    // Event listeners
                    sendButton.addEventListener('click', sendMessage);
                    
                    messageInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    });
                    
                    messageInput.addEventListener('input', autoResizeTextarea);
                    
                    clearButton.addEventListener('click', clearConversation);
                    
                    // Export buttons
                    document.getElementById('exportMarkdownButton').addEventListener('click', exportAsMarkdown);
                    document.getElementById('exportHtmlButton').addEventListener('click', exportAsHtml);
                    
                    // Initial scroll to bottom
                    scrollToBottom();
                    
                    // Focus the input field
                    messageInput.focus();
                })();
            </script>
        </body>
        </html>`;
  }

  /**
   * Formats a timestamp
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Formats message content with markdown-like syntax
   */
  private formatMessageContent(content: string): string {
    // Convert code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, language, code) => {
      return `<pre><code>${this.escapeHtml(code)}</code></pre>`;
    });

    // Convert inline code
    content = content.replace(/`([^`]+)`/g, (_, code) => {
      return `<code>${this.escapeHtml(code)}</code>`;
    });

    // Convert line breaks
    content = content.replace(/\n/g, '<br>');

    return content;
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Disposes of the panel
   */
  public dispose(): void {
    ConversationPanel.currentPanel = undefined;

    // Clean up our resources
    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}

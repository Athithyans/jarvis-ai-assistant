import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface representing a message in a conversation
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Interface representing a conversation
 */
export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Service for managing conversation history
 */
export class ConversationHistoryService {
  private static instance: ConversationHistoryService;
  private conversations: Map<string, Conversation>;
  private storageUri: vscode.Uri | undefined;
  private currentConversationId: string | null = null;

  private constructor(private context: vscode.ExtensionContext) {
    this.conversations = new Map<string, Conversation>();
    this.storageUri = context.globalStorageUri;

    // Create the storage directory if it doesn't exist
    if (this.storageUri) {
      const conversationsDir = vscode.Uri.joinPath(this.storageUri, 'conversations');
      if (!fs.existsSync(conversationsDir.fsPath)) {
        fs.mkdirSync(conversationsDir.fsPath, { recursive: true });
      }
    }

    // Load conversations from storage
    this.loadConversations();
  }

  /**
   * Get the singleton instance of ConversationHistoryService
   */
  public static getInstance(context: vscode.ExtensionContext): ConversationHistoryService {
    if (!ConversationHistoryService.instance) {
      ConversationHistoryService.instance = new ConversationHistoryService(context);
    }
    return ConversationHistoryService.instance;
  }

  /**
   * Create a new conversation
   */
  public createConversation(title: string = 'New Conversation'): string {
    const id = this.generateId();
    const conversation: Conversation = {
      id,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.set(id, conversation);
    this.currentConversationId = id;
    this.saveConversation(id);

    return id;
  }

  /**
   * Get the current conversation
   */
  public getCurrentConversation(): Conversation | null {
    if (!this.currentConversationId) {
      return null;
    }

    return this.conversations.get(this.currentConversationId) || null;
  }

  /**
   * Set the current conversation
   */
  public setCurrentConversation(id: string): boolean {
    if (this.conversations.has(id)) {
      this.currentConversationId = id;
      return true;
    }
    return false;
  }

  /**
   * Add a message to the current conversation
   */
  public addMessage(role: 'user' | 'assistant', content: string): void {
    if (!this.currentConversationId) {
      this.createConversation();
    }

    const conversation = this.conversations.get(this.currentConversationId!);
    if (conversation) {
      const message: ConversationMessage = {
        role,
        content,
        timestamp: Date.now(),
      };

      conversation.messages.push(message);
      conversation.updatedAt = Date.now();

      // Update the conversation title if it's the first user message
      if (role === 'user' && conversation.messages.length === 1) {
        conversation.title = this.generateTitleFromContent(content);
      }

      this.saveConversation(this.currentConversationId!);
    }
  }

  /**
   * Get all conversations
   */
  public getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Get a conversation by ID
   */
  public getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  /**
   * Delete a conversation
   */
  public deleteConversation(id: string): boolean {
    if (this.conversations.has(id)) {
      this.conversations.delete(id);

      // Delete the conversation file
      if (this.storageUri) {
        const filePath = vscode.Uri.joinPath(this.storageUri, 'conversations', `${id}.json`);
        if (fs.existsSync(filePath.fsPath)) {
          fs.unlinkSync(filePath.fsPath);
        }
      }

      // Reset current conversation if it was deleted
      if (this.currentConversationId === id) {
        this.currentConversationId = null;
      }

      return true;
    }
    return false;
  }

  /**
   * Clear all conversations
   */
  public clearAllConversations(): void {
    this.conversations.clear();
    this.currentConversationId = null;

    // Delete all conversation files
    if (this.storageUri) {
      const conversationsDir = vscode.Uri.joinPath(this.storageUri, 'conversations');
      if (fs.existsSync(conversationsDir.fsPath)) {
        const files = fs.readdirSync(conversationsDir.fsPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(conversationsDir.fsPath, file));
          }
        }
      }
    }
  }

  /**
   * Export a conversation to a file
   */
  public async exportConversation(
    id: string,
    format: 'json' | 'markdown' | 'html'
  ): Promise<string | null> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      return null;
    }

    // Ask the user where to save the file
    const defaultFileName = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
    const saveUri = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(defaultFileName),
      filters: {
        'All Files': ['*'],
      },
    });

    if (!saveUri) {
      return null;
    }

    let content = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(conversation, null, 2);
        break;

      case 'markdown':
        content = this.conversationToMarkdown(conversation);
        break;

      case 'html':
        content = this.conversationToHtml(conversation);
        break;
    }

    fs.writeFileSync(saveUri.fsPath, content);
    return saveUri.fsPath;
  }

  /**
   * Import a conversation from a file
   */
  public async importConversation(): Promise<string | null> {
    // Ask the user to select a file
    const fileUris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        'JSON Files': ['json'],
      },
    });

    if (!fileUris || fileUris.length === 0) {
      return null;
    }

    try {
      const content = fs.readFileSync(fileUris[0].fsPath, 'utf8');
      const conversation = JSON.parse(content) as Conversation;

      // Validate the conversation structure
      if (!conversation.id || !conversation.title || !Array.isArray(conversation.messages)) {
        throw new Error('Invalid conversation format');
      }

      // Generate a new ID to avoid conflicts
      conversation.id = this.generateId();

      this.conversations.set(conversation.id, conversation);
      this.saveConversation(conversation.id);

      return conversation.id;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to import conversation: ${error}`);
      return null;
    }
  }

  /**
   * Load all conversations from storage
   */
  private loadConversations(): void {
    if (!this.storageUri) {
      return;
    }

    const conversationsDir = vscode.Uri.joinPath(this.storageUri, 'conversations');
    if (!fs.existsSync(conversationsDir.fsPath)) {
      return;
    }

    const files = fs.readdirSync(conversationsDir.fsPath);
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(conversationsDir.fsPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const conversation = JSON.parse(content) as Conversation;

          this.conversations.set(conversation.id, conversation);
        } catch (error) {
          console.error(`Failed to load conversation: ${file}`, error);
        }
      }
    }
  }

  /**
   * Save a conversation to storage
   */
  private saveConversation(id: string): void {
    if (!this.storageUri) {
      return;
    }

    const conversation = this.conversations.get(id);
    if (!conversation) {
      return;
    }

    const conversationsDir = vscode.Uri.joinPath(this.storageUri, 'conversations');
    if (!fs.existsSync(conversationsDir.fsPath)) {
      fs.mkdirSync(conversationsDir.fsPath, { recursive: true });
    }

    const filePath = vscode.Uri.joinPath(conversationsDir, `${id}.json`);
    fs.writeFileSync(filePath.fsPath, JSON.stringify(conversation, null, 2));
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Generate a title from the content of a message
   */
  private generateTitleFromContent(content: string): string {
    // Use the first line or first few words as the title
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length <= 50) {
      return firstLine;
    }

    // If the first line is too long, use the first few words
    return firstLine.substring(0, 47) + '...';
  }

  /**
   * Convert a conversation to Markdown format
   */
  private conversationToMarkdown(conversation: Conversation): string {
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `*Created: ${new Date(conversation.createdAt).toLocaleString()}*\n\n`;

    for (const message of conversation.messages) {
      const role = message.role === 'user' ? '**You**' : '**Jarvis**';
      const time = new Date(message.timestamp).toLocaleString();

      markdown += `## ${role} - ${time}\n\n`;
      markdown += `${message.content}\n\n`;
      markdown += '---\n\n';
    }

    return markdown;
  }

  /**
   * Convert a conversation to HTML format
   */
  private conversationToHtml(conversation: Conversation): string {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversation.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .message {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .user {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
        }
        .assistant {
            background-color: #e6f7ff;
            padding: 15px;
            border-radius: 5px;
        }
        .role {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .time {
            color: #666;
            font-size: 0.8em;
            margin-bottom: 10px;
        }
        .content {
            white-space: pre-wrap;
        }
        pre {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: 'Courier New', Courier, monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${conversation.title}</h1>
        <p>Created: ${new Date(conversation.createdAt).toLocaleString()}</p>
    </div>`;

    for (const message of conversation.messages) {
      const role = message.role === 'user' ? 'You' : 'Jarvis';
      const time = new Date(message.timestamp).toLocaleString();

      html += `
    <div class="message ${message.role}">
        <div class="role">${role}</div>
        <div class="time">${time}</div>
        <div class="content">${this.formatHtmlContent(message.content)}</div>
    </div>`;
    }

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * Format message content for HTML display
   */
  private formatHtmlContent(content: string): string {
    // Escape HTML
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Convert code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre><code>${code}</code></pre>`;
    });

    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
      return `<code>${code}</code>`;
    });

    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }
}

import * as vscode from 'vscode';
import { ConversationHistoryService, Conversation } from '../services/conversationHistoryService';

// Define a type for our quick pick items
interface ConversationQuickPickItem extends vscode.QuickPickItem {
  conversation: Conversation | null;
}

export class ViewConversationHistoryCommand {
  private historyService: ConversationHistoryService;

  constructor(historyService: ConversationHistoryService) {
    this.historyService = historyService;
  }

  public async execute(): Promise<void> {
    const conversations = this.historyService.getAllConversations();

    if (conversations.length === 0) {
      vscode.window.showInformationMessage('No conversation history found.');
      return;
    }

    // Create quick pick items for each conversation
    const items: ConversationQuickPickItem[] = conversations.map(conversation => {
      const date = new Date(conversation.updatedAt).toLocaleString();
      const messageCount = conversation.messages.length;

      return {
        label: conversation.title,
        description: `${messageCount} messages`,
        detail: `Last updated: ${date}`,
        conversation,
      };
    });

    // Add an option to clear all conversations
    items.push({
      label: '$(trash) Clear All Conversations',
      description: 'Delete all conversation history',
      detail: 'This action cannot be undone',
      conversation: null,
    });

    // Show the quick pick
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a conversation to view or manage',
    });

    if (!selected) {
      return; // User cancelled
    }

    // Handle the clear all option
    if (selected.conversation === null) {
      const confirm = await vscode.window.showWarningMessage(
        'Are you sure you want to delete all conversations? This cannot be undone.',
        'Delete All',
        'Cancel'
      );

      if (confirm === 'Delete All') {
        this.historyService.clearAllConversations();
        vscode.window.showInformationMessage('All conversations have been deleted.');
      }

      return;
    }

    // Show the conversation management options
    await this.showConversationOptions(selected.conversation);
  }

  private async showConversationOptions(conversation: Conversation): Promise<void> {
    const options = [
      { label: '$(eye) View Conversation', action: 'view' },
      { label: '$(export) Export Conversation', action: 'export' },
      { label: '$(trash) Delete Conversation', action: 'delete' },
    ];

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: `Select an action for "${conversation.title}"`,
    });

    if (!selected) {
      return; // User cancelled
    }

    switch (selected.action) {
      case 'view':
        await this.viewConversation(conversation);
        break;

      case 'export':
        await this.exportConversation(conversation);
        break;

      case 'delete':
        await this.deleteConversation(conversation);
        break;
    }
  }

  private async viewConversation(conversation: Conversation): Promise<void> {
    // Create a webview panel to display the conversation
    const panel = vscode.window.createWebviewPanel(
      'jarvisConversation',
      `Conversation: ${conversation.title}`,
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [],
      }
    );

    // Set the HTML content
    panel.webview.html = this.getConversationHtml(conversation);
  }

  private async exportConversation(conversation: Conversation): Promise<void> {
    const formatOptions = [
      { label: 'Markdown (.md)', format: 'markdown' },
      { label: 'HTML (.html)', format: 'html' },
      { label: 'JSON (.json)', format: 'json' },
    ];

    const selected = await vscode.window.showQuickPick(formatOptions, {
      placeHolder: 'Select export format',
    });

    if (!selected) {
      return; // User cancelled
    }

    const filePath = await this.historyService.exportConversation(
      conversation.id,
      selected.format as 'markdown' | 'html' | 'json'
    );

    if (filePath) {
      vscode.window.showInformationMessage(`Conversation exported to ${filePath}`);

      // Open the exported file
      const document = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(document);
    }
  }

  private async deleteConversation(conversation: Conversation): Promise<void> {
    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete the conversation "${conversation.title}"? This cannot be undone.`,
      'Delete',
      'Cancel'
    );

    if (confirm === 'Delete') {
      this.historyService.deleteConversation(conversation.id);
      vscode.window.showInformationMessage(
        `Conversation "${conversation.title}" has been deleted.`
      );
    }
  }

  private getConversationHtml(conversation: Conversation): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversation.title}</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            line-height: 1.6;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .message {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .user {
            background-color: var(--vscode-input-background);
            padding: 15px;
            border-radius: 5px;
        }
        .assistant {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            padding: 15px;
            border-radius: 5px;
        }
        .role {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .time {
            color: var(--vscode-descriptionForeground);
            font-size: 0.8em;
            margin-bottom: 10px;
        }
        .content {
            white-space: pre-wrap;
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: var(--vscode-editor-font-family);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${conversation.title}</h1>
        <p>Created: ${new Date(conversation.createdAt).toLocaleString()}</p>
        <p>Last updated: ${new Date(conversation.updatedAt).toLocaleString()}</p>
        <p>Messages: ${conversation.messages.length}</p>
    </div>`;

    // Add each message
    for (const message of conversation.messages) {
      const role = message.role === 'user' ? 'You' : 'Jarvis';
      const time = new Date(message.timestamp).toLocaleString();

      let content = message.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

      // Format code blocks
      content = content.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${code}</code></pre>`;
      });

      // Format inline code
      content = content.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${code}</code>`;
      });

      // Convert line breaks
      content = content.replace(/\n/g, '<br>');

      const html = `
    <div class="message ${message.role}">
        <div class="role">${role}</div>
        <div class="time">${time}</div>
        <div class="content">${content}</div>
    </div>`;

      conversation.title += html;
    }

    conversation.title += `
</body>
</html>`;

    return conversation.title;
  }
}

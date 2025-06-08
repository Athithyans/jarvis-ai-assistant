import * as vscode from 'vscode';
import { LocalModelService } from '../services/localModelService';
import { ConversationPanel } from '../ui/conversationPanel';
import { ConversationHistoryService } from '../services/conversationHistoryService';

export class AskQuestionCommand {
  private modelService: LocalModelService;
  private context: vscode.ExtensionContext;
  private historyService: ConversationHistoryService;

  constructor(modelService: LocalModelService, context: vscode.ExtensionContext) {
    this.modelService = modelService;
    this.context = context;
    this.historyService = ConversationHistoryService.getInstance(context);
  }

  public async execute(): Promise<void> {
    // Create a new conversation if there isn't one already
    if (!this.historyService.getCurrentConversation()) {
      this.historyService.createConversation();
    }

    // Create or show the conversation panel
    const panel = ConversationPanel.createOrShow(
      this.context.extensionUri,
      this.modelService,
      this.historyService
    );

    // If the panel was just created, it will be empty and ready for input
    // If it already existed, it will be brought to focus
  }
}

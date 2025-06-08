import * as vscode from 'vscode';
import { AskQuestionCommand } from './commands/askQuestion';
import { CompleteCodeCommand } from './commands/completeCode';
import { DebugCodeCommand } from './commands/debugCode';
import { GenerateProjectCommand } from './commands/generateProject';
import { RefactorCodeCommand } from './commands/refactorCode';
import { GenerateTestsCommand } from './commands/generateTests';
import { GenerateDocsCommand } from './commands/generateDocs';
import { OpenSettingsCommand } from './commands/openSettings';
import { ManageModelsCommand } from './commands/manageModels';
import { ViewConversationHistoryCommand } from './commands/viewConversationHistory';
import { JarvisStatusBar } from './ui/statusBar';
import { LocalModelService } from './services/localModelService';
import { ConversationHistoryService } from './services/conversationHistoryService';

export async function activate(context: vscode.ExtensionContext) {
  console.log('Jarvis AI Assistant is now active!');

  // Initialize services
  const modelService = new LocalModelService(context);
  await modelService.initialize();

  // Initialize UI components
  const statusBar = new JarvisStatusBar();
  statusBar.show();

  // Register commands
  const askQuestionCommand = new AskQuestionCommand(modelService, context);
  const completeCodeCommand = new CompleteCodeCommand(modelService);
  const debugCodeCommand = new DebugCodeCommand(modelService);
  const generateProjectCommand = new GenerateProjectCommand(modelService);
  const refactorCodeCommand = new RefactorCodeCommand(modelService);
  const generateTestsCommand = new GenerateTestsCommand(modelService);
  const generateDocsCommand = new GenerateDocsCommand(modelService);
  const openSettingsCommand = new OpenSettingsCommand();
  const manageModelsCommand = new ManageModelsCommand();

  // Initialize the conversation history service
  const historyService = ConversationHistoryService.getInstance(context);
  const viewConversationHistoryCommand = new ViewConversationHistoryCommand(historyService);

  // Add commands to subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand('jarvis.askQuestion', () => askQuestionCommand.execute()),
    vscode.commands.registerCommand('jarvis.completeCode', () => completeCodeCommand.execute()),
    vscode.commands.registerCommand('jarvis.debugCode', () => debugCodeCommand.execute()),
    vscode.commands.registerCommand('jarvis.generateProject', () =>
      generateProjectCommand.execute()
    ),
    vscode.commands.registerCommand('jarvis.refactorCode', () => refactorCodeCommand.execute()),
    vscode.commands.registerCommand('jarvis.generateTests', () => generateTestsCommand.execute()),
    vscode.commands.registerCommand('jarvis.generateDocs', () => generateDocsCommand.execute()),
    vscode.commands.registerCommand('jarvis.openSettings', () => openSettingsCommand.execute()),
    vscode.commands.registerCommand('jarvis.manageModels', () => manageModelsCommand.execute()),
    vscode.commands.registerCommand('jarvis.viewConversationHistory', () =>
      viewConversationHistoryCommand.execute()
    ),
    statusBar
  );

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('jarvis.hasShownWelcome');
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'Welcome to Jarvis AI Assistant! Press Ctrl+Shift+J (Cmd+Shift+J on Mac) to ask me a question.'
    );
    context.globalState.update('jarvis.hasShownWelcome', true);
  }
}

export function deactivate() {
  console.log('Jarvis AI Assistant is now deactivated.');
}

import * as vscode from 'vscode';

export class OpenSettingsCommand {
  public async execute(): Promise<void> {
    // Open the settings UI focused on Jarvis settings
    await vscode.commands.executeCommand('workbench.action.openSettings', 'jarvis');
  }
}

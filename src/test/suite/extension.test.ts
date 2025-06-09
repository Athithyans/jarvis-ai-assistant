import * as assert from 'assert';
import * as vscode from 'vscode';
import { suite, test } from 'mocha';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Starting Jarvis AI Assistant tests');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('athithyansuresh.jarvis-ai-assistant'));
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('athithyansuresh.jarvis-ai-assistant');
    assert.ok(extension);
    if (!extension?.isActive) {
      await extension?.activate();
    }
    assert.ok(extension?.isActive);
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    // Check if all Jarvis commands are registered
    assert.ok(commands.includes('jarvis.askQuestion'));
    assert.ok(commands.includes('jarvis.completeCode'));
    assert.ok(commands.includes('jarvis.debugCode'));
    assert.ok(commands.includes('jarvis.generateProject'));
    assert.ok(commands.includes('jarvis.refactorCode'));
    assert.ok(commands.includes('jarvis.generateTests'));
    assert.ok(commands.includes('jarvis.generateDocs'));
    assert.ok(commands.includes('jarvis.openSettings'));
    assert.ok(commands.includes('jarvis.manageModels'));
    assert.ok(commands.includes('jarvis.viewConversationHistory'));
  });

  test('Configuration should be registered', () => {
    const config = vscode.workspace.getConfiguration('jarvis');
    assert.ok(config);
    // Check if all configuration options are registered
    assert.notStrictEqual(config.get('model'), undefined);
    assert.notStrictEqual(config.get('ollamaUrl'), undefined);
    assert.notStrictEqual(config.get('temperature'), undefined);
    assert.notStrictEqual(config.get('maxTokens'), undefined);
    assert.notStrictEqual(config.get('showStatusBar'), undefined);
  });
});

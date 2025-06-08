import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Starting test suite');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('jarvis-ai-assistant'));
  });

  // Add more tests as needed
});
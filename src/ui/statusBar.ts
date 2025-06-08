import * as vscode from 'vscode';

export class JarvisStatusBar implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    private config: vscode.WorkspaceConfiguration;
    
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = "$(hubot) Jarvis";
        this.statusBarItem.tooltip = "Click to ask Jarvis a question";
        this.statusBarItem.command = "jarvis.askQuestion";
        
        // Load configuration
        this.config = vscode.workspace.getConfiguration('jarvis');
        this.updateVisibility();
        
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('jarvis.showStatusBar')) {
                this.config = vscode.workspace.getConfiguration('jarvis');
                this.updateVisibility();
            }
        });
    }
    
    private updateVisibility(): void {
        const showStatusBar = this.config.get('showStatusBar', true);
        if (showStatusBar) {
            this.statusBarItem.show();
        } else {
            this.statusBarItem.hide();
        }
    }
    
    public show(): void {
        const showStatusBar = this.config.get('showStatusBar', true);
        if (showStatusBar) {
            this.statusBarItem.show();
        }
    }
    
    public hide(): void {
        this.statusBarItem.hide();
    }
    
    public setWorking(): void {
        this.statusBarItem.text = "$(sync~spin) Jarvis";
        this.statusBarItem.tooltip = "Jarvis is thinking...";
    }
    
    public setReady(): void {
        this.statusBarItem.text = "$(hubot) Jarvis";
        this.statusBarItem.tooltip = "Click to ask Jarvis a question";
    }
    
    public updateModelInfo(): void {
        const model = this.config.get('model', 'llama3');
        this.statusBarItem.text = `$(hubot) Jarvis (${model})`;
    }
    
    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
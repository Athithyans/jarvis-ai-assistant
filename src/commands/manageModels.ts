import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface OllamaModel {
    name: string;
    size: number;
    modified_at: string;
    digest: string;
}

export class ManageModelsCommand {
    private ollamaUrl: string;
    
    constructor() {
        const config = vscode.workspace.getConfiguration('jarvis');
        this.ollamaUrl = config.get('ollamaUrl', 'http://localhost:11434');
    }
    
    public async execute(): Promise<void> {
        try {
            // Get the list of available models
            const models = await this.getModels();
            
            if (models.length === 0) {
                const downloadModel = await vscode.window.showInformationMessage(
                    'No models found. Would you like to download a model?',
                    'Download Model',
                    'Cancel'
                );
                
                if (downloadModel === 'Download Model') {
                    await this.downloadModel();
                }
                
                return;
            }
            
            // Show the list of models
            const modelItems = models.map(model => {
                const sizeMB = Math.round(model.size / (1024 * 1024));
                const modifiedDate = new Date(model.modified_at).toLocaleDateString();
                
                return {
                    label: model.name,
                    description: `${sizeMB} MB`,
                    detail: `Last modified: ${modifiedDate}`
                };
            });
            
            modelItems.push({
                label: '$(add) Download New Model',
                description: '',
                detail: 'Download a new model from Ollama'
            });
            
            const selectedModel = await vscode.window.showQuickPick(modelItems, {
                placeHolder: 'Select a model to manage'
            });
            
            if (!selectedModel) {
                return; // User cancelled
            }
            
            if (selectedModel.label === '$(add) Download New Model') {
                await this.downloadModel();
                return;
            }
            
            // Show actions for the selected model
            const modelName = selectedModel.label;
            const action = await vscode.window.showQuickPick([
                {
                    label: '$(check) Set as Default',
                    description: 'Use this model for all Jarvis operations',
                    action: 'set-default'
                },
                {
                    label: '$(trash) Delete Model',
                    description: 'Remove this model from your system',
                    action: 'delete'
                }
            ], {
                placeHolder: `Select an action for ${modelName}`
            });
            
            if (!action) {
                return; // User cancelled
            }
            
            if (action.action === 'set-default') {
                await this.setDefaultModel(modelName);
            } else if (action.action === 'delete') {
                await this.deleteModel(modelName);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error managing models: ${error}`);
        }
    }
    
    private async getModels(): Promise<OllamaModel[]> {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`);
            
            if (!response.ok) {
                throw new Error(`Failed to get models: ${response.statusText}`);
            }
            
            const data = await response.json() as { models: OllamaModel[] };
            return data.models || [];
        } catch (error) {
            vscode.window.showErrorMessage(`Error getting models: ${error}`);
            return [];
        }
    }
    
    private async downloadModel(): Promise<void> {
        const popularModels = [
            { label: 'llama3', description: 'Meta\'s Llama 3 (8B parameters)' },
            { label: 'llama3:70b', description: 'Meta\'s Llama 3 (70B parameters)' },
            { label: 'codellama', description: 'Specialized for code generation' },
            { label: 'mistral', description: 'Mistral 7B model' },
            { label: 'phi3', description: 'Microsoft\'s Phi-3 model' },
            { label: 'gemma', description: 'Google\'s Gemma model' }
        ];
        
        const selectedModel = await vscode.window.showQuickPick(popularModels, {
            placeHolder: 'Select a model to download'
        });
        
        if (!selectedModel) {
            return; // User cancelled
        }
        
        const modelName = selectedModel.label;
        
        // Show progress indicator
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Downloading ${modelName}...`,
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ message: 'Starting download...' });
                
                const response = await fetch(`${this.ollamaUrl}/api/pull`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: modelName })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to download model: ${errorText}`);
                }
                
                progress.report({ message: 'Download complete!' });
                
                // Ask if the user wants to set this as the default model
                const setAsDefault = await vscode.window.showInformationMessage(
                    `Model ${modelName} downloaded successfully. Set as default?`,
                    'Set as Default',
                    'Not Now'
                );
                
                if (setAsDefault === 'Set as Default') {
                    await this.setDefaultModel(modelName);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error downloading model: ${error}`);
            }
        });
    }
    
    private async setDefaultModel(modelName: string): Promise<void> {
        try {
            // Update the configuration
            const config = vscode.workspace.getConfiguration('jarvis');
            await config.update('model', modelName, vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage(`Model ${modelName} set as default for Jarvis.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error setting default model: ${error}`);
        }
    }
    
    private async deleteModel(modelName: string): Promise<void> {
        // Confirm deletion
        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to delete ${modelName}? This cannot be undone.`,
            'Delete',
            'Cancel'
        );
        
        if (confirm !== 'Delete') {
            return;
        }
        
        try {
            const response = await fetch(`${this.ollamaUrl}/api/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: modelName })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete model: ${errorText}`);
            }
            
            vscode.window.showInformationMessage(`Model ${modelName} deleted successfully.`);
            
            // If this was the default model, suggest setting a new one
            const config = vscode.workspace.getConfiguration('jarvis');
            const currentModel = config.get('model', 'llama3');
            
            if (currentModel === modelName) {
                const models = await this.getModels();
                
                if (models.length > 0) {
                    const setNewDefault = await vscode.window.showInformationMessage(
                        `You deleted the default model. Would you like to set a new default?`,
                        'Set New Default',
                        'Later'
                    );
                    
                    if (setNewDefault === 'Set New Default') {
                        await this.execute(); // Re-run the command to select a new model
                    }
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error deleting model: ${error}`);
        }
    }
}
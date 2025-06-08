import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import fetch from 'node-fetch';

/**
 * Service for interacting with Ollama for local AI model inference
 */
export class OllamaService {
    private static instance: OllamaService;
    private ollamaProcess: ChildProcess | null = null;
    private ollamaPath: string;
    private isOllamaRunning: boolean = false;
    private modelName: string;
    private apiBaseUrl: string;
    private config: vscode.WorkspaceConfiguration;
    
    private constructor() {
        // Load configuration
        this.config = vscode.workspace.getConfiguration('jarvis');
        this.modelName = this.config.get('model', 'llama3');
        const ollamaUrl = this.config.get('ollamaUrl', 'http://localhost:11434');
        this.apiBaseUrl = `${ollamaUrl}/api`;
        
        // Set the path to the Ollama binary based on the OS
        if (os.platform() === 'win32') {
            this.ollamaPath = path.join(os.homedir(), '.ollama', 'ollama.exe');
        } else {
            this.ollamaPath = '/usr/local/bin/ollama';
        }
        
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('jarvis')) {
                this.updateConfiguration();
            }
        });
    }
    
    /**
     * Updates the service configuration when settings change
     */
    private updateConfiguration(): void {
        this.config = vscode.workspace.getConfiguration('jarvis');
        this.modelName = this.config.get('model', 'llama3');
        const ollamaUrl = this.config.get('ollamaUrl', 'http://localhost:11434');
        this.apiBaseUrl = `${ollamaUrl}/api`;
    }
    
    /**
     * Get the singleton instance of OllamaService
     */
    public static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }
    
    /**
     * Initialize the Ollama service
     */
    public async initialize(): Promise<void> {
        try {
            // Check if Ollama is already running
            const isRunning = await this.checkIfOllamaIsRunning();
            
            if (isRunning) {
                this.isOllamaRunning = true;
                vscode.window.showInformationMessage('Ollama is already running.');
                return;
            }
            
            // Check if Ollama is installed
            const isInstalled = await this.checkIfOllamaIsInstalled();
            
            if (!isInstalled) {
                const installOption = await vscode.window.showErrorMessage(
                    'Ollama is not installed. Please install it to use Jarvis AI Assistant.',
                    'Install Instructions'
                );
                
                if (installOption === 'Install Instructions') {
                    vscode.env.openExternal(vscode.Uri.parse('https://ollama.ai/download'));
                }
                
                return;
            }
            
            // Start Ollama
            await this.startOllama();
            
            // Check if the model is available, if not, pull it
            const isModelAvailable = await this.checkIfModelIsAvailable();
            
            if (!isModelAvailable) {
                await this.pullModel();
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to initialize Ollama: ${error}`);
        }
    }
    
    /**
     * Check if Ollama is installed
     */
    private async checkIfOllamaIsInstalled(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (fs.existsSync(this.ollamaPath)) {
                resolve(true);
                return;
            }
            
            // Try to find Ollama in PATH
            const command = os.platform() === 'win32' ? 'where' : 'which';
            const process = spawn(command, ['ollama']);
            
            process.on('close', (code) => {
                resolve(code === 0);
            });
        });
    }
    
    /**
     * Check if Ollama is already running
     */
    private async checkIfOllamaIsRunning(): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/tags`);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Start the Ollama process
     */
    private async startOllama(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.ollamaProcess = spawn('ollama', ['serve'], {
                    detached: true,
                    stdio: 'ignore'
                });
                
                // Give Ollama some time to start
                setTimeout(async () => {
                    const isRunning = await this.checkIfOllamaIsRunning();
                    
                    if (isRunning) {
                        this.isOllamaRunning = true;
                        vscode.window.showInformationMessage('Ollama started successfully.');
                        resolve();
                    } else {
                        reject(new Error('Failed to start Ollama.'));
                    }
                }, 2000);
                
                this.ollamaProcess.on('error', (error) => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Check if the model is available
     */
    private async checkIfModelIsAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/tags`);
            const data = await response.json() as { models: Array<{ name: string }> };
            
            return data.models && data.models.some(model => model.name === this.modelName);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Pull the model from Ollama
     */
    private async pullModel(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Downloading ${this.modelName} model`,
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ message: 'Starting download...' });
                    
                    const response = await fetch(`${this.apiBaseUrl}/pull`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: this.modelName })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to pull model: ${errorText}`);
                    }
                    
                    progress.report({ message: 'Model downloaded successfully!' });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
    
    /**
     * Generate a response from the model
     */
    public async generateResponse(prompt: string, options: {
        temperature?: number;
        maxTokens?: number;
        stream?: boolean;
    } = {}): Promise<string> {
        if (!this.isOllamaRunning) {
            throw new Error('Ollama is not running. Please initialize the service first.');
        }
        
        // Get default values from configuration
        const defaultOptions = {
            temperature: this.config.get('temperature', 0.7),
            maxTokens: this.config.get('maxTokens', 2048),
            stream: false
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.modelName,
                    prompt,
                    temperature: mergedOptions.temperature,
                    max_tokens: mergedOptions.maxTokens,
                    stream: mergedOptions.stream
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate response: ${errorText}`);
            }
            
            const data = await response.json() as { response: string };
            return data.response;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Generate a response with streaming
     */
    public async generateStreamingResponse(
        prompt: string,
        onToken: (token: string) => void,
        onComplete: (fullResponse: string) => void,
        options: {
            temperature?: number;
            maxTokens?: number;
        } = {}
    ): Promise<void> {
        if (!this.isOllamaRunning) {
            throw new Error('Ollama is not running. Please initialize the service first.');
        }
        
        const defaultOptions = {
            temperature: 0.7,
            maxTokens: 2048
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.modelName,
                    prompt,
                    temperature: mergedOptions.temperature,
                    max_tokens: mergedOptions.maxTokens,
                    stream: true
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate streaming response: ${errorText}`);
            }
            
            // For node-fetch v2, we need to handle the stream differently
            if (!response.body) {
                throw new Error('Response body is null');
            }
            
            let fullResponse = '';
            
            // Process the stream
            const processStream = async () => {
                try {
                    response.body.on('data', (chunk: Buffer) => {
                        // Convert the chunk to text
                        const chunkText = chunk.toString('utf8');
                        
                        // Parse the chunk as JSON
                        const lines = chunkText.split('\n').filter(line => line.trim());
                        
                        for (const line of lines) {
                            try {
                                const data = JSON.parse(line);
                                
                                if (data.response) {
                                    fullResponse += data.response;
                                    onToken(data.response);
                                }
                                
                                if (data.done) {
                                    onComplete(fullResponse);
                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error);
                            }
                        }
                    });
                    
                    response.body.on('end', () => {
                        onComplete(fullResponse);
                    });
                    
                    response.body.on('error', (error) => {
                        throw error;
                    });
                } catch (error) {
                    throw error;
                }
            };
            
            await processStream();
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Dispose of the Ollama service
     */
    public dispose(): void {
        if (this.ollamaProcess) {
            this.ollamaProcess.kill();
            this.ollamaProcess = null;
        }
    }
}
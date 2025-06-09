import * as vscode from 'vscode';
import { OllamaService } from './ollamaService';

export class LocalModelService {
  private context: vscode.ExtensionContext;
  private ollamaService: OllamaService;
  private isModelReady: boolean = false;
  private statusBarItem: vscode.StatusBarItem;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.ollamaService = OllamaService.getInstance();
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.statusBarItem.text = '$(sync~spin) Jarvis: Initializing...';
    this.statusBarItem.show();
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize Ollama service
      await this.ollamaService.initialize();
      this.isModelReady = true;
      this.statusBarItem.text = '$(hubot) Jarvis: Ready';
      this.statusBarItem.tooltip = 'Jarvis AI Assistant is ready to help';
      vscode.window.showInformationMessage('Jarvis AI Assistant is ready!');
    } catch (error) {
      this.statusBarItem.text = '$(error) Jarvis: Error';
      this.statusBarItem.tooltip = `Error: ${error}`;
      vscode.window.showErrorMessage(`Failed to initialize Jarvis: ${error}`);
    }
  }

  public async askQuestion(question: string): Promise<string> {
    if (!this.isModelReady) {
      throw new Error('Model is not ready yet. Please wait for initialization to complete.');
    }

    this.statusBarItem.text = '$(sync~spin) Jarvis: Thinking...';

    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Jarvis is thinking...',
        cancellable: false,
      },
      async progress => {
        progress.report({ message: 'Processing your question', increment: 20 });

        try {
          // Create a prompt that instructs the model to act as Jarvis
          const prompt = `You are Jarvis, an AI assistant created by Athithyan Suresh. You are helpful, creative, and provide accurate information. Answer the following question in a clear and concise manner:

Question: ${question}

Answer:`;

          progress.report({ message: 'Generating response', increment: 40 });

          const response = await this.ollamaService.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 2048,
          });

          progress.report({ message: 'Response ready', increment: 40 });
          this.statusBarItem.text = '$(hubot) Jarvis: Ready';
          return response;
        } catch (error) {
          this.statusBarItem.text = '$(error) Jarvis: Error';
          if (error instanceof Error) {
            throw new Error(`Failed to generate response: ${error.message}`);
          }
          throw new Error(`Failed to generate response: ${String(error)}`);
        }
      }
    );
  }

  public async completeCode(code: string, language: string): Promise<string> {
    if (!this.isModelReady) {
      throw new Error('Model is not ready yet. Please wait for initialization to complete.');
    }

    this.statusBarItem.text = '$(sync~spin) Jarvis: Coding...';

    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Jarvis is completing your code...',
        cancellable: false,
      },
      async progress => {
        progress.report({ message: 'Analyzing your code', increment: 20 });

        try {
          // Create a prompt that instructs the model to complete the code
          const prompt = `You are Jarvis, an AI assistant specialized in writing high-quality code. Complete the following ${language} code in a way that is efficient, readable, and follows best practices. Only return the completed code without explanations.

Code to complete:
\`\`\`${language}
${code}
\`\`\`

Completed code:
\`\`\`${language}`;

          progress.report({ message: 'Generating code completion', increment: 40 });

          const response = await this.ollamaService.generateResponse(prompt, {
            temperature: 0.5,
            maxTokens: 2048,
          });

          progress.report({ message: 'Formatting response', increment: 30 });

          this.statusBarItem.text = '$(hubot) Jarvis: Ready';

          // Extract just the code from the response
          const completedCode = response.trim();
          // Check if the response ends with the closing code block
          const formattedResponse = completedCode.endsWith('```')
            ? completedCode.substring(0, completedCode.lastIndexOf('```')).trim()
            : completedCode;

          progress.report({ message: 'Code completion ready', increment: 10 });

          return code + formattedResponse;
        } catch (error) {
          this.statusBarItem.text = '$(error) Jarvis: Error';
          if (error instanceof Error) {
            throw new Error(`Failed to complete code: ${error.message}`);
          }
          throw new Error(`Failed to complete code: ${String(error)}`);
        }
      }
    );
  }

  public async debugCode(code: string, error: string): Promise<string> {
    if (!this.isModelReady) {
      throw new Error('Model is not ready yet. Please wait for initialization to complete.');
    }

    this.statusBarItem.text = '$(sync~spin) Jarvis: Debugging...';

    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Jarvis is debugging your code...',
        cancellable: false,
      },
      async progress => {
        progress.report({ message: 'Analyzing error', increment: 20 });

        try {
          // Create a prompt that instructs the model to debug the code
          const prompt = `You are Jarvis, an AI assistant specialized in debugging code. Analyze the following code and the error message, then provide a detailed explanation of the issue and a corrected version of the code.

Code with error:
\`\`\`
${code}
\`\`\`

Error message:
${error}

Please provide:
1. An explanation of what's causing the error
2. A corrected version of the code
3. Any additional tips to avoid similar issues in the future`;

          progress.report({ message: 'Diagnosing issues', increment: 40 });

          const response = await this.ollamaService.generateResponse(prompt, {
            temperature: 0.3,
            maxTokens: 2048,
          });

          progress.report({ message: 'Preparing solution', increment: 40 });

          this.statusBarItem.text = '$(hubot) Jarvis: Ready';
          return response;
        } catch (error) {
          this.statusBarItem.text = '$(error) Jarvis: Error';
          if (error instanceof Error) {
            throw new Error(`Failed to debug code: ${error.message}`);
          }
          throw new Error(`Failed to debug code: ${String(error)}`);
        }
      }
    );
  }

  public async generateProject(type: string, name: string): Promise<string> {
    if (!this.isModelReady) {
      throw new Error('Model is not ready yet. Please wait for initialization to complete.');
    }

    this.statusBarItem.text = '$(sync~spin) Jarvis: Generating Project...';

    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Jarvis is generating a ${type} project...`,
        cancellable: false,
      },
      async progress => {
        progress.report({ message: 'Planning project structure', increment: 20 });

        try {
          // Create a prompt that instructs the model to generate a project structure
          const prompt = `You are Jarvis, an AI assistant specialized in software development. Generate a detailed project structure for a ${type} project named "${name}". Include:

1. A list of all necessary files and directories
2. Brief descriptions of what each file should contain
3. Any dependencies that should be installed
4. Basic setup instructions

Make the structure comprehensive enough for a real-world application.`;

          progress.report({ message: 'Creating project blueprint', increment: 30 });

          const response = await this.ollamaService.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 4096,
          });

          progress.report({ message: 'Finalizing project details', increment: 50 });

          this.statusBarItem.text = '$(hubot) Jarvis: Ready';
          return response;
        } catch (error) {
          this.statusBarItem.text = '$(error) Jarvis: Error';
          if (error instanceof Error) {
            throw new Error(`Failed to generate project: ${error.message}`);
          }
          throw new Error(`Failed to generate project: ${String(error)}`);
        }
      }
    );
  }

  public dispose(): void {
    this.ollamaService.dispose();
    this.statusBarItem.dispose();
  }
}

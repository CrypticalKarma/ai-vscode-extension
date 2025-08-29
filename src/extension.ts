import * as vscode from 'vscode';
import { getWebviewContent } from './frontend/panelRenderer';
import { getAIResponse } from './backend/aiService';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI VS Code Extension is now active!');

    // Command 1: Show Project Files
    const showFiles = vscode.commands.registerCommand('aiAssistant.showFiles', async () => {
        const files = await vscode.workspace.findFiles('**/*');
        vscode.window.showQuickPick(files.map(f => f.fsPath));
    });

    // Command 2: Open File in Panel
    const readFile = vscode.commands.registerCommand('aiAssistant.readFile', async () => {
        const uri = await vscode.window.showOpenDialog({ canSelectMany: false });
        if (uri && uri[0]) {
            const doc = await vscode.workspace.openTextDocument(uri[0]);
            vscode.window.showTextDocument(doc);
        }
    });

    // Command 3: Open AI Panel
    const openPanel = vscode.commands.registerCommand('aiAssistant.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'aiPanel', // Identifies the type of the webview
            'AI Assistant', // Title of the panel
            vscode.ViewColumn.Beside, // Open side-by-side
            {
                enableScripts: true, // Allow JS in the webview
                retainContextWhenHidden: true // Keep state when hidden
            }
        );

        // Set the HTML content from panelRenderer.ts
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

        // Handle messages from the frontend
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'log':
                        console.log('Message from panel:', message.text);
                        break;
                    case 'askAI':
                        const response = await getAIResponse(message.prompt);
                        panel.webview.postMessage({ command: 'aiResponse', text: response });
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    // Register all disposables
    context.subscriptions.push(showFiles, readFile, openPanel);
}

export function deactivate() {}

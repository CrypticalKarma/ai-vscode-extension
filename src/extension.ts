import * as vscode from 'vscode';
import { getWebviewContent } from './frontend/panelRenderer';
import { getAIResponse } from './backend/aiService';

export function activate(context: vscode.ExtensionContext) {
    console.log('AI VS Code Extension is now active!');

    // Command to open AI panel
    const openPanel = vscode.commands.registerCommand('aiAssistant.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'aiPanel',
            'AI Assistant',
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

        // Handle messages from frontend
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'askAI':
                    // message.prompt = user query
                    // message.content = optional user work for proofreading
                    const aiResult = await getAIResponse(message.prompt, message.content);
                    panel.webview.postMessage({ command: 'aiResponse', text: aiResult.text, checklist: aiResult.checklist });
                    break;

                case 'updateChecklist':
                    // AI-driven checklist updates from frontend manual changes
                    console.log('Checklist manually updated:', message.checklist);
                    break;
            }
        }, undefined, context.subscriptions);
    });

    context.subscriptions.push(openPanel);
}

export function deactivate() {}

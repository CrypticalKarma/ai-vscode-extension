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

        // Set initial HTML content
        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

        // Handle messages from frontend
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'askAI':
                    // Show AI thinking in panel
                    panel.webview.postMessage({ command: 'showThinking', text: true });

                    const aiResult = await getAIResponse(message.prompt, message.content);

                    // Send AI response and updated checklist back to panel
                    panel.webview.postMessage({
                        command: 'aiResponse',
                        text: aiResult.text,
                        checklist: aiResult.checklist
                    });

                    // Hide AI thinking
                    panel.webview.postMessage({ command: 'showThinking', text: false });
                    break;

                case 'updateChecklist':
                    console.log('Checklist manually updated:', message.checklist);
                    break;
            }
        }, undefined, context.subscriptions);
    });

    context.subscriptions.push(openPanel);
}

export function deactivate() {}

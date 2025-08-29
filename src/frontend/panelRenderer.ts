import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AI Assistant</title>
        </head>
        <body>
            <h1>AI Panel</h1>
            <input type="text" id="userInput" placeholder="Ask AI..."/>
            <button id="sendBtn">Send</button>
            <div id="output"></div>

            <script>
                const vscode = acquireVsCodeApi();
                const input = document.getElementById('userInput');
                const output = document.getElementById('output');
                const btn = document.getElementById('sendBtn');

                btn.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'log',
                        text: input.value
                    });
                    input.value = '';
                });
            </script>
        </body>
        </html>
    `;
}

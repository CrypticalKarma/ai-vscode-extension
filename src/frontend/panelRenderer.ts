import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const nonce = getNonce();

    // Default checklist items
    const defaultChecklist = [
        { label: 'Send first AI query', done: false },
        { label: 'Receive AI response', done: false },
        { label: 'Mark a checklist item', done: false }
    ];

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
        <title>AI Assistant</title>
    </head>
    <body>
        <h2>AI Assistant</h2>
        
        <!-- User Input -->
        <input id="userQuery" type="text" placeholder="Ask AI..." />
        <button id="sendBtn">Send</button>
        
        <!-- AI Response -->
        <div id="aiResponse" style="margin-top:10px; border:1px solid #ccc; padding:5px;"></div>
        
        <!-- Project Checklist -->
        <h3>Project Checklist</h3>
        <ul id="checklist"></ul>

        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();

            // Load or initialize checklist from localStorage
            let checklistData = JSON.parse(localStorage.getItem('aiChecklist') || 'null');
            if (!checklistData) {
                checklistData = ${JSON.stringify(defaultChecklist)};
                localStorage.setItem('aiChecklist', JSON.stringify(checklistData));
            }

            const checklistEl = document.getElementById('checklist');

            function renderChecklist() {
                checklistEl.innerHTML = '';
                checklistData.forEach((item, idx) => {
                    const li = document.createElement('li');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = item.done;
                    checkbox.onchange = () => {
                        item.done = checkbox.checked;
                        localStorage.setItem('aiChecklist', JSON.stringify(checklistData));
                    };
                    li.appendChild(checkbox);
                    li.appendChild(document.createTextNode(' ' + item.label));
                    checklistEl.appendChild(li);
                });
            }

            renderChecklist();

            // Send query to extension
            document.getElementById('sendBtn').addEventListener('click', () => {
                const query = document.getElementById('userQuery').value;
                vscode.postMessage({ command: 'askAI', prompt: query });
            });

            // Receive messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'aiResponse':
                        document.getElementById('aiResponse').textContent = message.text;
                        break;
                }
            });
        </script>
    </body>
    </html>
    `;
}

// Helper to generate nonce for security
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

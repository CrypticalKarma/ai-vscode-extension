import * as vscode from 'vscode';

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const nonce = getNonce();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
        <title>AI Assistant</title>
        <style>
            body { font-family: sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
            #chatContainer { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 5px; }
            .message { padding: 8px 12px; border-radius: 8px; max-width: 80%; }
            .user { align-self: flex-end; background-color: #0b93f6; color: white; }
            .ai { align-self: flex-start; background-color: #e5e5ea; color: black; }
            #inputContainer { display: flex; border-top: 1px solid #ccc; padding: 5px; }
            #userQuery { flex: 1; padding: 5px; }
            #sendBtn { margin-left: 5px; }
            #checklist { margin-top: 10px; padding-left: 0; list-style: none; }
            #checklist li { display: flex; align-items: center; gap: 5px; }
            #aiThinking { font-style: italic; margin-top: 5px; display: none; }
        </style>
    </head>
    <body>
        <div id="chatContainer"></div>
        <div id="aiThinking">AI is thinking...</div>
        <div id="inputContainer">
            <input id="userQuery" type="text" placeholder="Ask AI or confirm step..." />
            <button id="sendBtn">Send</button>
        </div>
        <h3>Project Checklist</h3>
        <ul id="checklist"></ul>

        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();

            let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
            let checklist = JSON.parse(localStorage.getItem('aiChecklist') || '[]');

            const chatContainer = document.getElementById('chatContainer');
            const checklistEl = document.getElementById('checklist');
            const aiThinking = document.getElementById('aiThinking');

            function renderChat() {
                chatContainer.innerHTML = '';
                chatHistory.forEach(msg => {
                    const div = document.createElement('div');
                    div.className = 'message ' + (msg.sender === 'user' ? 'user' : 'ai');
                    div.textContent = msg.text;
                    chatContainer.appendChild(div);
                });
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            function renderChecklist() {
                checklistEl.innerHTML = '';
                checklist.forEach((item, idx) => {
                    const li = document.createElement('li');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = item.done;
                    checkbox.onchange = () => {
                        item.done = checkbox.checked;
                        vscode.postMessage({ command: 'updateChecklist', checklist });
                        localStorage.setItem('aiChecklist', JSON.stringify(checklist));
                    };
                    li.appendChild(checkbox);
                    li.appendChild(document.createTextNode(' ' + item.label));
                    checklistEl.appendChild(li);
                });
            }

            function addMessage(sender, text) {
                chatHistory.push({ sender, text });
                localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
                renderChat();
            }

            renderChat();
            renderChecklist();

            document.getElementById('sendBtn').addEventListener('click', () => {
                const input = document.getElementById('userQuery');
                const text = input.value.trim();
                if (!text) return;
                input.value = '';
                addMessage('user', text);
                aiThinking.style.display = 'block';
                vscode.postMessage({ command: 'askAI', prompt: text, content: text }); // send content for proofreading
            });

            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'aiResponse':
                        addMessage('ai', message.text);
                        if (message.checklist) {
                            checklist = message.checklist;
                            renderChecklist();
                            localStorage.setItem('aiChecklist', JSON.stringify(checklist));
                        }
                        aiThinking.style.display = 'none';
                        break;
                    case 'updateChecklistFromAI':
                        checklist = message.checklist;
                        renderChecklist();
                        localStorage.setItem('aiChecklist', JSON.stringify(checklist));
                        break;
                }
            });
        </script>
    </body>
    </html>
    `;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

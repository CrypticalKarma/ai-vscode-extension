import * as vscode from 'vscode'

export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
  const nonce = getNonce()
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Assistant</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; }
      #chat { flex: 1; overflow-y: auto; padding: 10px; background: #1e1e1e; color: #fff; }
      .message { margin: 5px 0; padding: 8px 12px; border-radius: 8px; max-width: 80%; word-wrap: break-word; }
      .user { background: #0a84ff; align-self: flex-end; }
      .ai { background: #3c3c3c; align-self: flex-start; }
      #input-container { display: flex; padding: 10px; background: #252526; }
      #input { flex: 1; padding: 8px; border-radius: 4px; border: none; outline: none; color: #fff; background: #1e1e1e; }
      #send { margin-left: 5px; padding: 8px 12px; border: none; border-radius: 4px; background: #0a84ff; color: #fff; cursor: pointer; }
      #checklist { padding: 10px; background: #2d2d2d; max-height: 150px; overflow-y: auto; color: #fff; }
      .checklist-item { display: flex; justify-content: space-between; margin-bottom: 4px; }
      .thinking { font-style: italic; color: #ccc; margin: 5px 0; }
    </style>
  </head>
  <body>
    <div id="chat"></div>
    <div id="checklist"></div>
    <div id="input-container">
      <input id="input" placeholder="Ask AI or confirm step..." />
      <button id="send">Send</button>
    </div>

    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi()
      const chat = document.getElementById('chat')
      const input = document.getElementById('input')
      const sendBtn = document.getElementById('send')
      const checklistDiv = document.getElementById('checklist')

      let thinkingElem

      function addMessage(text, sender) {
        const msg = document.createElement('div')
        msg.className = 'message ' + sender
        msg.textContent = text
        chat.appendChild(msg)
        chat.scrollTop = chat.scrollHeight
      }

      function showThinking() {
        thinkingElem = document.createElement('div')
        thinkingElem.className = 'thinking'
        thinkingElem.textContent = 'AI is thinking...'
        chat.appendChild(thinkingElem)
        chat.scrollTop = chat.scrollHeight
      }

      function hideThinking() {
        if(thinkingElem) {
          thinkingElem.remove()
          thinkingElem = null
        }
      }

      function updateChecklist(items) {
        checklistDiv.innerHTML = ''
        items.forEach(i => {
          const div = document.createElement('div')
          div.className = 'checklist-item'
          div.textContent = i.text + ' [' + i.status + ']'
          checklistDiv.appendChild(div)
        })
      }

      function sendMessage() {
        const text = input.value
        if(!text) return
        addMessage(text, 'user')
        showThinking()
        vscode.postMessage({ command: 'askAI', prompt: text })
        input.value = ''
      }

      sendBtn.addEventListener('click', sendMessage)
      input.addEventListener('keydown', e => {
        if(e.key === 'Enter') sendMessage()
      })

      window.addEventListener('message', event => {
        const message = event.data
        switch(message.command) {
          case 'aiResponse':
            hideThinking()
            addMessage(message.text, 'ai')
            if(message.checklist) updateChecklist(message.checklist)
            break
          case 'updateChecklist':
            if(message.checklist) updateChecklist(message.checklist)
            break
        }
      })
    </script>
  </body>
  </html>
  `
}

function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
  return text
}

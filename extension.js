const vscode = require('vscode');

function activate(context) {
  const disposable = vscode.commands.registerCommand('chatbox.start', () => {
    const panel = vscode.window.createWebviewPanel(
      'chatbox', 
      'Chat Box', 
      vscode.ViewColumn.Beside, 
      { enableScripts: true }
    );
    panel.webview.html = getWebviewContent();
  });
  context.subscriptions.push(disposable);
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Chat Box</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background-color: #1e1e1e;
      color: #e6e6e6;
      font-family: sans-serif;
    }
    body {
      display: flex;
      flex-direction: column;
      padding: 10px;
      box-sizing: border-box;
    }
    #chat {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      background: #2c2f33;
      border: 1px solid #333;
      border-radius: 5px;
      margin-bottom: 10px;
    }
    #chat div {
      padding: 5px;
      margin-bottom: 5px;
      border-bottom: 1px solid #444;
    }
    #input_field {
      display: flex;
    }
    #input {
      flex: 1;
      padding: 8px;
      background: #36393f;
      border: 1px solid #333;
      border-radius: 5px;
      color: #e6e6e6;
      box-sizing: border-box;
    }
    #send {
      width: 50px;
      padding: 8px;
      margin-left: 10px;
      background: #9146ff;
      border: none;
      border-radius: 5px;
      color: #fff;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="chat"></div>
  <div id="input_field">
    <input type="text" id="input" placeholder="Type a message..." />
    <button id="send">Send</button>
  </div>
  <script>
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    document.getElementById('send').addEventListener('click', () => {
      if (input.value.trim()) {
        const msg = document.createElement('div');
        msg.textContent = input.value;
        chat.appendChild(msg);
        input.value = '';
        chat.scrollTop = chat.scrollHeight;
      }
    });
    // Send on Enter key press
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('send').click();
      }
    });
  </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };

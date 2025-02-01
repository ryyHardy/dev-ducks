const vscode = require('vscode');

function activate(context) {
  const disposable = vscode.commands.registerCommand('chatbox.start', () => {
    const panel = vscode.window.createWebviewPanel(
      'chatbox', 
      'Chat Box', 
      vscode.ViewColumn.One, 
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
    body { font-family: sans-serif; padding: 10px; }
    #chat { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; }
    #input { width: 80%; }
    #send { width: 15%; }
  </style>
</head>
<body>
  <div id="chat"></div>
  <input type="text" id="input" placeholder="Type a message..." />
  <button id="send">Send</button>
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
  </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };

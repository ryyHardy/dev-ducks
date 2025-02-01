const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  const disposable = vscode.commands.registerCommand('chatbox.start', () => {
    const panel = vscode.window.createWebviewPanel(
      'chatbox',
      'Chat Box',
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );
    panel.webview.html = getWebviewContent();

    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'userInput') {
        const userCode = message.text;
        const count = 1; // Adjust as needed
        getAiResponse(userCode, count, (err, aiOutput) => {
          if (err) {
            vscode.window.showErrorMessage("AI error: " + err);
          } else {
            // Send AI response back to the webview
            panel.webview.postMessage({ command: 'aiResponse', text: aiOutput });
          }
        });
      }
    });
  });
  context.subscriptions.push(disposable);
}

function getAiResponse(code, count, callback) {
  // Adjust the path to your Python script accordingly.
  // Make sure to escape quotes in the user-provided code.
  const safeCode = code.replace(/"/g, '\\"');
  const cmd = `python path/to/your_script.py "${safeCode}" ${count}`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      callback(stderr || error.toString());
    } else {
      callback(null, stdout.trim());
    }
  });
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
    const vscode = acquireVsCodeApi();
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const sendButton = document.getElementById('send');

    sendButton.addEventListener('click', () => {
      if (input.value.trim()) {
        // Display user's message
        const userMsg = document.createElement('div');
        userMsg.textContent = "You: " + input.value;
        chat.appendChild(userMsg);
        chat.scrollTop = chat.scrollHeight;

        // Send the message to the extension
        vscode.postMessage({ command: 'userInput', text: input.value });
        input.value = '';
      }
    });

    // Send on Enter key press
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendButton.click();
      }
    });

    // Listen for AI responses from the extension
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'aiResponse') {
        const aiMsg = document.createElement('div');
        aiMsg.textContent = "AI: " + message.text;
        chat.appendChild(aiMsg);
        chat.scrollTop = chat.scrollHeight;
      }
    });
  </script>
</body>
</html>`;
}

function deactivate() {}

module.exports = { activate, deactivate };

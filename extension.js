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

const fs = require('fs');
const path = require('path');
function getWebviewContent() {
  const htmlPath = path.join(__dirname, 'webview.html');
  return fs.readFileSync(htmlPath, 'utf8');
}

function deactivate() {}

module.exports = { activate, deactivate };

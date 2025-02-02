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
        getMessages(userCode, count)
          .then(aiOutput => {
            // Send AI response back to the webview
            panel.webview.postMessage({ command: 'aiResponse', text: aiOutput });
          })
          .catch(err => {
            vscode.window.showErrorMessage("AI error: " + err);
          });
      }
    });
  });
  context.subscriptions.push(disposable);
}

function getMessages(inputData, count) {
  const params = {
    input_data: inputData,
    count: count
  };

  return fetch(encodeURI(`http://127.0.0.1:8000/generate_chat/?input_data=${params.input_data}&count=${params.count}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => data) // Return the data to be used in the caller function
    .catch(error => {
      console.error("Error:", error);
      throw error; // Propagate the error to be handled by the caller
    });
}

const fs = require('fs');
const path = require('path');
function getWebviewContent() {
  const htmlPath = path.join(__dirname, 'webview.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Placeholder for dynamic content
  const dynamicContent = '<div id="dynamic-content"></div>';
  
  // Insert dynamic content into the HTML
  htmlContent = htmlContent.replace('</body>', `${dynamicContent}</body>`);
  
  return htmlContent;
}

function deactivate() {}

module.exports = { activate, deactivate };

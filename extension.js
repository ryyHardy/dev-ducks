// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let panel;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Typing Logger extension is now active!');
  
  let currentStatement = ''; // Buffer to store the current statement
  let braceCount = 0; // To track the nested braces

  // Monitor text document changes
  const disposable = vscode.workspace.onDidChangeTextDocument(event => {
    const changes = event.contentChanges;
    const editor = vscode.window.activeTextEditor;
    const cursorPosition = editor ? editor.selection.active : new vscode.Position(0, 0);

    // Monitor any open file regardless of file type
    const result = readChanges(changes, currentStatement, braceCount, cursorPosition);
    currentStatement = result.statement; // Update the statement
    braceCount = result.braceCount; // Update the brace count
  });

  context.subscriptions.push(disposable);

  // Register the command for the chatbox UI
  const commandDisposable = vscode.commands.registerCommand('chatbox.start', () => {
    panel = vscode.window.createWebviewPanel(
      'chatbox',
      'Chat Box',
      vscode.ViewColumn.Beside,  // You can change this to a different column if needed
      { enableScripts: true }
    );
  
    // Load the HTML content into the webview
    panel.webview.html = getWebviewContent();
  
    // Send a test message to the chat box
    panel.webview.postMessage({ command: 'aiResponse', text: "Welcome to the Dev Ducks Chatbox! Let's start chatting!" });

    // Listen for messages from the webview (user input)
    panel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'userInput') {
        const userCode = message.text;
        console.log(`User: ${userCode}`); // Log user input to the console

        const count = 1; // Adjust as needed
        getMessages(userCode, count)
          .then(aiOutput => {
            // Send AI response back to the webview
            panel.webview.postMessage({ command: 'aiResponse', text: aiOutput });

            // Also log the AI output to the console
            //console.log(`AI: ${aiOutput}`);
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

  return fetch(encodeURI(`http://000.0.0.0:8000/generate_chat/?input_data=${params.input_data}&count=${params.count}`), {
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

function getMessages(input_data, count) {
  return fetch(encodeURI(`http://0.0.0.0:8000/generate_chat/?input_data=${input_data}&count=${count}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        // Collect messages as a single string for the chatbox
        const messages = data
          .map(item => {
            if (Array.isArray(item) && item.length === 2) {
              const username = item[0];
              const message = item[1];
              return `${username}: "${message}"`;
            }
            return null; // Ignore invalid entries
          })
          .filter(Boolean) // Remove null values
          .join('\n'); // Join messages with line breaks

        console.log(messages); // Log the combined messages
        return messages; // Return combined messages for the chatbox
      } else {
        console.error("Unexpected response format:", data);
        return "Error: Unexpected response format.";
      }
    })
    .catch(error => {
      console.error("Error in getMessages:", error);
      return "Error: Failed to fetch messages.";
    });
}

function deactivate() {}

module.exports = { activate, deactivate };

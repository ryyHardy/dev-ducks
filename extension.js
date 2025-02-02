
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Typing Logger extension is now active!');

  let currentStatement = ''; // Buffer to store the current statement
  let braceCount = 0; // To track the nested braces

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

  const commandDisposable = vscode.commands.registerCommand('chatbox.start', () => {
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

  context.subscriptions.push(commandDisposable);
}

function readChanges(changes, currentStatement, braceCount, cursorPosition) {
  changes.forEach(change => {
    // Handle opening brace
    if (change.text === '{') {
      braceCount++; // Increment brace count for nested blocks
    } 
    // Handle closing brace
    else if (change.text === '}') {
      braceCount--; // Decrement brace count when closing brace is encountered

      // Log the statement only if cursor is outside the closing brace (after auto-completion)
      if (braceCount === 0 && cursorPosition.character === change.range.end.character) {
        console.log('Statement inside braces:');
        nestedStatement(currentStatement); // Log the current statement
        currentStatement = ''; // Clear the buffer after logging
      }
    } 
    // Handle Enter key (new line)
    else if (change.text === '\n') {
      if (braceCount === 0) {
        console.log('Statement outside braces:');
        getMessages(nestedStatement(currentStatement), 1).then(response => console.log(response));
        currentStatement = ''; // Clear the buffer after logging
      }
    }
    // Handle backspace (remove characters)
    else if (change.text === '') {
      currentStatement = currentStatement.slice(0, currentStatement.length - change.rangeLength);
    } 
    // Append the typed text
    else {
      currentStatement += change.text;
    }
  });

  return { statement: currentStatement, braceCount, cursorPosition }; // Return updated values
}

function nestedStatement(statement) {
  const formattedStatement = statement.trim();
  return formattedStatement; // Output the formatted statement
}

<<<<<<< HEAD
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
=======
function getMessages(inputData, count) {
  const params = {
    input_data: inputData,
    count: count
  };

  return fetch(encodeURI(`http://127.0.0.1:8000/generate_chat/?input_data=${params.input_data}&count=${params.count}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
>>>>>>> 0a366bda7e603180a5751ed9300557fb8141a75a
    }
  })
    .then(response => response.json())
    .then(data => data) // Return the data to be used in the caller function
    .catch(error => {
      console.error("Error:", error);
      throw error; // Propagate the error to be handled by the caller
    });
}

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

function getMessages(input_data, count) {
  return fetch(encodeURI(`http://0.0.0.0:8000/generate_chat/?input_data=${input_data}&count=${count}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.json())
  .then(data => {
    // Check if the response is an array of arrays
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (Array.isArray(item) && item.length === 2) {
          const username = item[0];
          const message = item[1];

          // Add a check to ensure both username and message are defined
          if (username && message) {
            console.log(`${username}: "${message}"`);
          } else {
            console.log(`Skipping invalid entry at index ${index}:`, item);
          }
        } else {
          console.log(`Unexpected data format at index ${index}:`, item);
        }
      });
    } else {
      console.log("Unexpected response format:", data);
    }
  })
  .catch(error => console.error("Error:", error));
}

const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let panel;
let previousLine = -1; // To track the previous line
let messageQueue = [];

// A list of introductory messages to display when the user first starts
const introMessages = [
  "Welcome to Dev Ducks! Enjoy the increase in productivity.",
  "Our ducks are always ready to quack up some code with you!",
  "Dev Ducks: Bringing productivity and fun to your dev life!"
];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Typing Logger extension is now active!');

  // Register the command for the chatbox UI
  const commandDisposable = vscode.commands.registerCommand('chatbox.start', () => {
    panel = vscode.window.createWebviewPanel(
      'chatbox',
      'Chat Box',
      vscode.ViewColumn.Beside, // Open the chatbox beside the editor
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    // Welcome message
    panel.webview.postMessage({
      command: 'aiResponse',
      text: "Welcome to the Dev Ducks Chatbox! Let's start chatting!",
    });

    // Listen for messages from the webview (chat)
    panel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'userInput') {
        const userCode = message.text;
        console.log(`User typed: ${userCode}`);
    
        // Process the user's input as if it were code in the editor
        getMessages(userCode, 1)
          .then((response) => {
            console.log(response); // Log the AI response
            if (panel && panel.webview) {
              panel.webview.postMessage({
                command: 'aiResponse',
                text: response,
              });
            }
          })
          .catch((err) => {
            console.error('Error in getMessages:', err);
            if (panel && panel.webview) {
              panel.webview.postMessage({
                command: 'aiResponse',
                text: 'Error processing your input. Please try again.',
              });
            }
          });
      }
    });    
  });

  context.subscriptions.push(commandDisposable);

  // Automatically start the chatbox on activation
  vscode.commands.executeCommand('chatbox.start');

  // Monitor cursor movement in the editor
  const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const currentLine = editor.selection.active.line;

      // Check if the cursor moved to a new line
      if (currentLine !== previousLine && previousLine >= 1) {
        const document = editor.document;
        const previousLineText = document.lineAt(previousLine).text.trim();

        if (previousLineText) {
          console.log(`Processing line: ${previousLineText}`);

          getMessages(previousLineText, 1)
            .then((response) => {
              console.log(response); // Log the AI response
              if (panel && panel.webview) {
                panel.webview.postMessage({
                  command: 'aiResponse',
                  text: response,
                });
              }
            })
            .catch((err) => {
              console.error('Error in getMessages:', err);
              if (panel && panel.webview) {
                panel.webview.postMessage({
                  command: 'aiResponse',
                  text: 'Error processing your input. Please try again.',
                });
              }
            });
        }
      }

      // Update the previous line
      previousLine = currentLine;
    }
  });

  context.subscriptions.push(selectionDisposable);
}



function getMessages(input_data, count) {
  return fetch(encodeURI(`https://dev-ducks.onrender.com/generate_chat/?input_data=${input_data}&count=${count}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        // Add new messages to the queue
        data.forEach(([username, message]) => {
          messageQueue.push(`${username}: "${message}"`);
        });

        // After adding messages, manage the queue size
        manageMessageQueue();

        // Return the updated queue as a string
        return messageQueue.join('\n');
      } else {
        console.error('Unexpected response format:', data);
        return 'Error: Unexpected response format.'; // Return premade message in case of error
      }
    })
    .catch((error) => {
      console.error('Error in getMessages:', error);
      return 'Error: Failed to fetch messages.';
    });
}

// Get content for the chatbox UI
function getWebviewContent() {
  const htmlPath = path.join(__dirname, 'webview.html');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  return htmlContent;
}

// This function handles adding messages to the queue, and clearing the queue if necessary
function manageMessageQueue() {
  // If the queue exceeds 15 messages, clear it
  if (messageQueue.length > 15) {
    messageQueue = [];
  }
}


function deactivate() {
  console.log('Thanks for using Dev Ducks!');
}

module.exports = { activate, deactivate };
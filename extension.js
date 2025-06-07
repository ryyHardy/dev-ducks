const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

let panel;
let messageQueue = [];

// Maximum number of lines around the cursor to gather context from
const MAX_CONTEXT_LINES = 5;

let debounceTimer = null;
const DEBOUNCE_DELAY = 1000; // 1 second

function getCodeContext(editor, currentLine) {
  const document = editor.document;
  const startLine = Math.max(0, currentLine - MAX_CONTEXT_LINES);
  const endLine = Math.min(
    document.lineCount - 1,
    currentLine + MAX_CONTEXT_LINES
  );

  const contextLines = [];
  for (let i = startLine; i <= endLine; i++) {
    const lineText = document.lineAt(i).text;
    contextLines.push({
      lineNumber: i + 1,
      text: lineText,
      isCurrent: i === currentLine,
    });
  }

  return {
    language: document.languageId,
    fileName: document.fileName, // Changed to camelCase to match usage
    context: contextLines,
  };
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("Typing Logger extension is now active!");

  // Register the command for the chatbox UI
  const commandDisposable = vscode.commands.registerCommand(
    "chatbox.start",
    () => {
      panel = vscode.window.createWebviewPanel(
        "chatbox",
        "Chat Box",
        vscode.ViewColumn.Beside, // Open the chatbox beside the editor
        { enableScripts: true }
      );

      panel.webview.html = getWebviewContent();

      // Welcome message
      panel.webview.postMessage({
        command: "aiResponse",
        text: "Welcome to the Dev Ducks Chatbox! Let's start chatting!",
      });

      // Listen for messages from the webview (chat)
      panel.webview.onDidReceiveMessage(message => {
        if (message.command === "userInput") {
          const userCode = message.text;
          console.log(`User typed: ${userCode}`);

          // Process the user's input as if it were code in the editor
          getMessages(userCode, 1)
            .then(response => {
              console.log(response); // Log the AI response
              if (panel && panel.webview) {
                panel.webview.postMessage({
                  command: "aiResponse",
                  text: response,
                });
              }
            })
            .catch(err => {
              console.error("Error in getMessages:", err);
              if (panel && panel.webview) {
                panel.webview.postMessage({
                  command: "aiResponse",
                  text: "Error processing your input. Please try again.",
                });
              }
            });
        }
      });
    }
  );

  context.subscriptions.push(commandDisposable);

  // Automatically start the chatbox on activation
  vscode.commands.executeCommand("chatbox.start");

  // Monitor cursor movement in the editor
  const changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
    // Clear any existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(() => {
      console.log("---Debug Info---");
      console.log("1. Debounced text change event");
      console.log("Event document:", event.document.fileName);

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        console.log("2. No active editor");
        return;
      }

      console.log("3. Active editor file:", editor.document.fileName);
      console.log("4. Content changes:", event.contentChanges);

      if (event.document !== editor.document) {
        console.log("5. Document mismatch");
        return;
      }

      console.log("6. Processing text change");
      console.log("7. Current line:", editor.selection.active.line);

      const currentLine = editor.selection.active.line;
      const codeContext = getCodeContext(editor, currentLine);
      console.log("8. Code context:", {
        language: codeContext.language,
        fileName: codeContext.fileName,
        contextLines: codeContext.context.length,
      });

      // Convert context to a more readable format for the API
      const contextString = codeContext.context
        .map(
          line =>
            `${line.isCurrent ? ">" : " "} ${line.lineNumber}: ${line.text}`
        )
        .join("\n");

      const requestData = {
        context: contextString,
        language: codeContext.language,
        fileName: path.basename(codeContext.fileName),
      };

      getMessages(requestData, 1)
        .then(response => {
          if (panel && panel.webview) {
            panel.webview.postMessage({
              command: "aiResponse",
              text: response,
            });
          }
        })
        .catch(err => {
          console.error("Error in getMessages:", err);
          if (panel && panel.webview) {
            panel.webview.postMessage({
              command: "aiResponse",
              text: "Error processing your input. Please try again.",
            });
          }
        });
    }, DEBOUNCE_DELAY);
  });

  context.subscriptions.push(changeDisposable);
}

function getMessages(input_data, count) {
  console.log("getMessages called with:", {
    input_data,
    count,
    type: typeof input_data,
  });

  const params = new URLSearchParams({
    input_data: JSON.stringify(input_data),
    count: count.toString(),
  });

  const url = `https://dev-ducks.onrender.com/generate_chat?${params.toString()}`;
  console.log("9. Sending request to:", url);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => {
      console.log("10. Response status:", response.status);
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data)) {
        // Add new messages to the queue
        console.log(data);
        data.forEach(([username, message]) => {
          messageQueue.push(`${username}: ${message}`);
        });

        // After adding messages, manage the queue size
        manageMessageQueue();

        // Return the updated queue as a string
        return messageQueue.join("\n");
      } else {
        console.error("Unexpected response format:", data);
        return "Error: Unexpected response format."; // Return premade message in case of error
      }
    })
    .catch(error => {
      console.error("Error in getMessages:", error);
      return "Error: Failed to fetch messages.";
    });
}

// Get content for the chatbox UI
function getWebviewContent() {
  const htmlPath = path.join(__dirname, "webview.html");
  let htmlContent = fs.readFileSync(htmlPath, "utf8");
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
  console.log("Thanks for using Dev Ducks!");
}

module.exports = { activate, deactivate };

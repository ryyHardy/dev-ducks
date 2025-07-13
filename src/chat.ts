import * as fs from "fs";
import * as vscode from "vscode";
import path from "path";

import { getCodeContext } from "./editor";
import { generateReactionChats } from "./api";

/// How many messages to generate when editor context changes
const MESSAGES_PER_CONTEXT_CHANGE = 10;

// single webview panel
let chatPanel: vscode.WebviewPanel | undefined;

let updateTimeout: NodeJS.Timeout | undefined;

/// Minimum time between sending context updates
const DEBOUNCE_TIME = 300;

export function sendToWebview(message: any) {
  chatPanel?.webview.postMessage(message);
}

export function showPanel() {
  if (!chatPanel) {
    chatPanel = vscode.window.createWebviewPanel(
      "devducks-chat",
      "DevDucks Chat",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    chatPanel.webview.html = getWebviewContent();
  }

  chatPanel.reveal();

  const updateContext = async (editor: vscode.TextEditor | undefined) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(async () => {
      if (!editor) {
        return;
      }

      const context = getCodeContext(editor);

      const messages = await generateReactionChats(
        context,
        MESSAGES_PER_CONTEXT_CHANGE
      );

      sendToWebview({ name: "add-messages", content: messages });
    }, DEBOUNCE_TIME);
  };

  // Update context for AI when the user changes between editors
  vscode.window.onDidChangeActiveTextEditor(editor => {
    updateContext(editor);
  });

  // Update context for AI when changes in the documment happen
  vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document === event.document) {
      updateContext(editor);
    }
  });
}

function getWebviewContent() {
  const webviewPath = path.join(__dirname, "views/chat/webview.html");
  return fs.readFileSync(webviewPath, "utf8");
}

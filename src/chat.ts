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
const DEBOUNCE_TIME = 3000;

export function sendToWebview(message: any) {
  chatPanel?.webview.postMessage(message);
}

export function showPanel(context: vscode.ExtensionContext) {
  if (!chatPanel) {
    chatPanel = vscode.window.createWebviewPanel(
      "devducks-chat",
      "DevDucks Chat",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    chatPanel.webview.html = getWebviewContent(context);
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

  // Update context for AI when the visible range of editor content changes
  vscode.window.onDidChangeTextEditorVisibleRanges(event => {
    const editor = event.textEditor;
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

function getWebviewContent(context: vscode.ExtensionContext) {
  const webviewPath = context.asAbsolutePath(
    path.join("src", "views", "chat", "webview.html")
  );
  let html = fs.readFileSync(webviewPath, "utf8");

  const styleUri = vscode.Uri.file(
    context.asAbsolutePath(path.join("src", "views", "chat", "style.css"))
  ).with({ scheme: "vscode-resource" });

  const scriptUri = vscode.Uri.file(
    context.asAbsolutePath(path.join("src", "views", "chat", "script.js"))
  ).with({ scheme: "vscode-resource" });

  html = html.replace('href="style.css"', `href="${styleUri}"`);
  html = html.replace('src="script.js"', `src="${scriptUri}"`);

  return html;
}

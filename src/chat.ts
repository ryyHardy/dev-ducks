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
  if (!chatPanel) {
    return;
  }
  console.log("Sending message to webview:", message);
  chatPanel.webview.postMessage(message);
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
    console.log("Active editor changed to:", editor?.document.fileName);
    updateContext(editor);
  });

  // Update context for AI when the visible range of editor content changes
  vscode.window.onDidChangeTextEditorVisibleRanges(event => {
    const editor = event.textEditor;
    console.log(
      "Visible ranges changed in: ",
      event.textEditor.document.fileName
    );
    updateContext(editor);
  });

  // Update context for AI when changes in the documment happen
  vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    console.log("Changes in current document:", event.document.fileName);
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

  const scriptUri = chatPanel!.webview.asWebviewUri(
    vscode.Uri.joinPath(
      context.extensionUri,
      "src",
      "views",
      "chat",
      "script.js"
    )
  );

  // Replace the link and script tag with the correct URI
  html = html.replace(
    '<script src="script.js"></script>',
    `<script src="${scriptUri}"></script>`
  );

  return html;
}

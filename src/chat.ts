import * as fs from "fs";
import * as vscode from "vscode";
import path from "path";

// single webview panel
let chatPanel: vscode.WebviewPanel | undefined;

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
}

function getWebviewContent() {
  const webviewPath = path.join(__dirname, "views/chat/webview.html");
  return fs.readFileSync(webviewPath, "utf8");
}

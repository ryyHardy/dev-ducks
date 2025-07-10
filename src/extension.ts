import * as vscode from "vscode";
import { showPanel } from "./chat";

export function activate(context: vscode.ExtensionContext) {
  console.log("DevDucks is now active!");

  const disposable = vscode.commands.registerCommand(
    "dev-ducks.chat",
    async () => {
      showPanel();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("DevDucks is no longer active!");
}

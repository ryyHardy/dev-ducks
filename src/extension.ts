import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("DevDucks is now active!");

  const disposable = vscode.commands.registerCommand("dev-ducks.chat", () => {
    vscode.window.showInformationMessage("DevDucks chat!");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log("DevDucks is no longer active!");
}

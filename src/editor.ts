import * as vscode from "vscode";
import { CodeContext } from "./types";

export function getCodeContext(): CodeContext | undefined {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  // Currently, we only use the code actually visible in the editor as context
  const document = editor.document;
  const visibleRange = editor.visibleRanges[0];
  const code = document.getText(visibleRange);

  const cursorLine = editor.selection.active.line;

  return {
    language: document.languageId,
    filename: document.fileName,
    currentLine: cursorLine,
    code: code,
  };
}

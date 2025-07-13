import * as vscode from "vscode";
import { CodeContext } from "./types";

export function firstAndLastVisibleLines(editor: vscode.TextEditor): {
  first: number;
  last: number;
} {
  return {
    first: editor.visibleRanges[0].start.line,
    last: editor.visibleRanges[0].end.line,
  };
}

export function getCodeContext(editor: vscode.TextEditor): CodeContext {
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

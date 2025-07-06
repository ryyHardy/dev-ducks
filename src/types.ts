export interface CodeContext {
  language: string;
  filename: string;
  currentLine: number;
  code: string;
}

export interface ChatMessage {
  username: string;
  message: string;
}

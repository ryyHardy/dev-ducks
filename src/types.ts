export interface CodeContext {
  language: string;
  fileName: string;
  context: Array<{
    lineNumber: number;
    text: string;
    isCurrent: boolean;
  }>;
}

export interface ChatMessage {
  username: string;
  message: string;
}

export enum Role {
  User = 'user',
  Assistant = 'assistant',
}

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface ChatbotSession {
  token: string;
  sessionId: string;
  expiresAt: string;
}

export type Role = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  role: Role;
  content: string;
  timestamp: string;
};

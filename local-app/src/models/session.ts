import type { ChatMessage } from './message.js';

export type SessionState = {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

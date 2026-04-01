import path from 'node:path';
import type { ChatMessage } from '../models/message.js';
import type { SessionState } from '../models/session.js';
import { readJsonFile, writeJsonFile } from '../utils/fileStore.js';

export class SessionService {
  constructor(private readonly dataDir: string, private readonly maxHistoryMessages: number) {}

  private getSessionFile(sessionId: string): string {
    return path.join(this.dataDir, `${sessionId}.json`);
  }

  loadOrCreate(sessionId: string): SessionState {
    const file = this.getSessionFile(sessionId);
    const now = new Date().toISOString();
    const fallback: SessionState = { id: sessionId, createdAt: now, updatedAt: now, messages: [] };
    return readJsonFile(file, fallback);
  }

  appendMessage(session: SessionState, message: ChatMessage): SessionState {
    const nextMessages = [...session.messages, message].slice(-this.maxHistoryMessages);
    const updated: SessionState = { ...session, updatedAt: new Date().toISOString(), messages: nextMessages };
    writeJsonFile(this.getSessionFile(session.id), updated);
    return updated;
  }
}

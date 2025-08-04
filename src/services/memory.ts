import { SessionMemory } from '../types/index.js';
import { config } from '../config/index.js';

export class MemoryService {
  private sessions: Map<string, SessionMemory> = new Map();

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { messages: [] });
    }

    const session = this.sessions.get(sessionId)!;
    session.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    // Keep only the last N messages to prevent memory bloat
    if (session.messages.length > config.maxMemoryMessages) {
      session.messages = session.messages.slice(-config.maxMemoryMessages);
    }
  }

  getRecentMessages(sessionId: string, count: number = 2): Array<{role: string, content: string}> {
    const session = this.sessions.get(sessionId);
    if (!session || session.messages.length === 0) {
      return [];
    }

    return session.messages
      .slice(-count)
      .map(msg => ({ role: msg.role, content: msg.content }));
  }

  getSessionHistory(sessionId: string): SessionMemory | null {
    return this.sessions.get(sessionId) || null;
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getAllSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}


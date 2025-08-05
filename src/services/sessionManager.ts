import { Session, Message } from '../types';

export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, Session> = new Map();

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public getSession(sessionId: string): Session {
    if (!this.sessions.has(sessionId)) {
      const newSession: Session = {
        id: sessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.sessions.set(sessionId, newSession);
    }
    return this.sessions.get(sessionId)!;
  }

  public addMessage(sessionId: string, message: Message): void {
    const session = this.getSession(sessionId);
    session.messages.push(message);
    session.updatedAt = new Date();
    
    // Keep only last 20 messages to manage memory
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }
  }

  public getRecentMessages(sessionId: string, count: number = 5): Message[] {
    const session = this.getSession(sessionId);
    return session.messages.slice(-count);
  }

  public clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  public getSessionSummary(sessionId: string): string {
    const session = this.getSession(sessionId);
    const recentMessages = this.getRecentMessages(sessionId, 2);
    
    if (recentMessages.length === 0) {
      return 'No previous conversation history.';
    }

    let summary = 'Recent conversation:\n';
    recentMessages.forEach(msg => {
      summary += `${msg.role}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}\n`;
    });

    return summary;
  }
}

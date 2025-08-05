export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  content: string;
  metadata: {
    filename: string;
    chunkIndex: number;
    totalChunks: number;
  };
  embedding?: number[];
}

export interface PluginResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface Plugin {
  name: string;
  description: string;
  execute: (query: string) => Promise<PluginResult>;
}

export interface AgentRequest {
  message: string;
  session_id: string;
}

export interface AgentResponse {
  reply: string;
  session_id: string;
  timestamp: string;
  context_used?: string[];
  plugins_called?: string[];
}

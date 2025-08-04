export interface MessageRequest {
  message: string;
  session_id: string;
}

export interface MessageResponse {
  reply: string;
  session_id: string;
  timestamp: string;
}

export interface SessionMemory {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    filename: string;
    chunkIndex: number;
  };
}

export interface PluginResult {
  pluginName: string;
  result: any;
  success: boolean;
  error?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface MathResult {
  expression: string;
  result: number;
}

export interface ToolInfo {
  name: string;
  description: string;
  type: 'plugin' | 'service';
  status: 'active' | 'inactive';
  capabilities: string[];
}

export interface ToolUsageLog {
  toolName: string;
  timestamp: string;
  input?: any;
  success: boolean;
  executionTime?: number;
}


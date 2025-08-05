import { AgentRequest, AgentResponse, Message } from '../types';
import { LLMService } from './llmService';
import { VectorStore } from './vectorStore';
import { SessionManager } from './sessionManager';
import { PluginManager } from '../plugins/pluginManager';

export class AgentService {
  private llmService: LLMService;
  private vectorStore: VectorStore;
  private sessionManager: SessionManager;
  private pluginManager: PluginManager;

  constructor() {
    this.llmService = new LLMService();
    this.vectorStore = VectorStore.getInstance();
    this.sessionManager = SessionManager.getInstance();
    this.pluginManager = PluginManager.getInstance();
  }

  public async processMessage(request: AgentRequest): Promise<AgentResponse> {
    try {
      console.log(`Processing message for session ${request.session_id}: ${request.message}`);

      // Add user message to session
      const userMessage: Message = {
        role: 'user',
        content: request.message,
        timestamp: new Date()
      };
      this.sessionManager.addMessage(request.session_id, userMessage);

      // Get conversation history
      const conversationHistory = this.sessionManager.getRecentMessages(request.session_id, 10);

      // Search for relevant context in vector store
      console.log('Searching for relevant context...');
      const relevantDocs = await this.vectorStore.searchSimilar(request.message, 3);
      const contextChunks = relevantDocs.map(doc => 
        `[${doc.metadata.filename}] ${doc.content}`
      );

      // Execute applicable plugins
      console.log('Analyzing query for plugin execution...');
      const pluginExecution = await this.pluginManager.analyzeAndExecute(request.message);

      // Build context for LLM
      const context = contextChunks.length > 0 
        ? `Relevant information from knowledge base:\n${contextChunks.join('\n\n')}`
        : '';

      const pluginResults = pluginExecution.summary || '';

      // Generate response using LLM
      console.log('Generating response with LLM...');
      const response = await this.llmService.generateResponse(
        conversationHistory,
        context,
        pluginResults
      );

      // Add assistant response to session
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      this.sessionManager.addMessage(request.session_id, assistantMessage);

      // Prepare response
      const agentResponse: AgentResponse = {
        reply: response,
        session_id: request.session_id,
        timestamp: new Date().toISOString(),
        context_used: relevantDocs.map(doc => doc.metadata.filename),
        plugins_called: pluginExecution.pluginsUsed
      };

      console.log(`Response generated for session ${request.session_id}`);
      return agentResponse;

    } catch (error) {
      console.error('Agent processing error:', error);
      throw new Error(`Failed to process message: ${error}`);
    }
  }

  public async getSessionHistory(sessionId: string): Promise<Message[]> {
    return this.sessionManager.getRecentMessages(sessionId, 20);
  }

  public clearSession(sessionId: string): void {
    this.sessionManager.clearSession(sessionId);
  }

  public getAvailablePlugins() {
    return this.pluginManager.getAvailablePlugins().map(plugin => ({
      name: plugin.name,
      description: plugin.description
    }));
  }

  public async healthCheck(): Promise<{ status: string; components: any }> {
    const health = {
      status: 'healthy',
      components: {
        vectorStore: 'healthy',
        llmService: 'healthy',
        sessionManager: 'healthy',
        pluginManager: 'healthy'
      }
    };

    try {
      // Test vector store
      await this.vectorStore.searchSimilar('test', 1);
    } catch (error) {
      health.components.vectorStore = 'unhealthy';
      health.status = 'degraded';
    }

    try {
      // Test LLM service with a simple prompt
      await this.llmService.generateResponse([{
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      }]);
    } catch (error) {
      health.components.llmService = 'unhealthy';
      health.status = 'degraded';
    }

    return health;
  }
}

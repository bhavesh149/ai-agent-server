import { LLMService } from './llm';
import { MemoryService } from './memory';
import { ChromaRAGService } from './chromadb-rag';
import { WeatherPlugin } from '../plugins/weather';
import { MathPlugin } from '../plugins/math';
import { MessageRequest, MessageResponse, PluginResult, ToolInfo } from '../types';

export class AgentService {
  private llmService: LLMService;
  private memoryService: MemoryService;
  private ragService: ChromaRAGService;
  private weatherPlugin: WeatherPlugin;
  private mathPlugin: MathPlugin;

  constructor() {
    this.llmService = new LLMService();
    this.memoryService = new MemoryService();
    this.ragService = new ChromaRAGService(this.llmService);
    this.weatherPlugin = new WeatherPlugin();
    this.mathPlugin = new MathPlugin();
  }

  async initialize(documentsPath: string): Promise<void> {
    await this.ragService.initializeKnowledgeBase(documentsPath);
  }

  async processMessage(request: MessageRequest): Promise<MessageResponse> {
    const { message, session_id } = request;
    const timestamp = new Date().toISOString();

    try {
      // Add user message to memory
      this.memoryService.addMessage(session_id, 'user', message);

      // Detect plugin intents
      const pluginResults: PluginResult[] = [];
      
      // Check for weather intent
      const weatherIntent = WeatherPlugin.detectIntent(message);
      if (weatherIntent.isWeatherQuery && weatherIntent.location) {
        const weatherResult = await this.weatherPlugin.execute(weatherIntent.location);
        pluginResults.push(weatherResult);
      }

      // Check for math intent
      const mathIntent = MathPlugin.detectIntent(message);
      if (mathIntent.isMathQuery && mathIntent.expression) {
        const mathResult = await this.mathPlugin.execute(mathIntent.expression);
        pluginResults.push(mathResult);
      }

      // Retrieve relevant context from RAG
      const relevantChunks = await this.ragService.retrieveRelevantChunks(message);

      // Get recent conversation history
      const recentMessages = this.memoryService.getRecentMessages(session_id, 2);

      // Build the system prompt
      const systemPrompt = this.buildSystemPrompt(
        message,
        recentMessages,
        relevantChunks.map(chunk => chunk.content),
        pluginResults
      );

      // Generate response using LLM
      const reply = await this.llmService.generateResponse(systemPrompt);

      // Add assistant response to memory
      this.memoryService.addMessage(session_id, 'assistant', reply);

      return {
        reply,
        session_id,
        timestamp
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        reply: 'I apologize, but I encountered an error while processing your message. Please try again.',
        session_id,
        timestamp
      };
    }
  }

  private buildSystemPrompt(
    userMessage: string,
    recentMessages: Array<{role: string, content: string}>,
    relevantChunks: string[],
    pluginResults: PluginResult[]
  ): string {
    let prompt = `You are an intelligent AI assistant with access to a knowledge base and various tools. Your goal is to provide helpful, accurate, and contextual responses to user queries.

## System Instructions:
- Be conversational, helpful, and informative
- Use the provided context and plugin results to enhance your responses
- If you have access to real-time data (weather, calculations), incorporate it naturally
- Maintain context from the conversation history
- Be concise but thorough in your explanations

## Conversation History:`;

    if (recentMessages.length > 0) {
      prompt += '\n';
      recentMessages.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    } else {
      prompt += '\n(No previous conversation history)\n';
    }

    if (relevantChunks.length > 0) {
      prompt += `\n## Relevant Knowledge Base Context:
${relevantChunks.map((chunk, index) => `${index + 1}. ${chunk}`).join('\n\n')}`;
    }

    if (pluginResults.length > 0) {
      prompt += '\n## Plugin Results:';
      pluginResults.forEach(result => {
        if (result.success) {
          if (result.pluginName === 'weather') {
            const weather = result.result;
            prompt += `\nWeather data for ${weather.location}: ${weather.temperature}°C, ${weather.description}, humidity ${weather.humidity}%, wind speed ${weather.windSpeed} m/s`;
          } else if (result.pluginName === 'math') {
            const math = result.result;
            prompt += `\nMath calculation: ${math.expression} = ${math.result}`;
          }
        } else {
          prompt += `\n${result.pluginName} plugin error: ${result.error}`;
        }
      });
    }

    prompt += `\n\n## Current User Message:
${userMessage}

## Your Response:
Please provide a helpful response based on the above context, conversation history, and any plugin results. Be natural and conversational.`;

    return prompt;
  }

  async getStats(): Promise<any> {
    const chunkCount = await this.ragService.getChunkCount();
    return {
      knowledgeBaseChunks: chunkCount,
      activeSessions: this.memoryService.getAllSessions().length
    };
  }

  getAvailableTools(): ToolInfo[] {
    return [
      {
        name: 'weather',
        description: 'Get current weather information for any location worldwide',
        type: 'plugin',
        status: 'active',
        capabilities: [
          'Current weather conditions',
          'Temperature (Celsius)',
          'Weather description',
          'Humidity percentage',
          'Wind speed'
        ]
      },
      {
        name: 'math',
        description: 'Perform mathematical calculations and solve expressions',
        type: 'plugin',
        status: 'active',
        capabilities: [
          'Basic arithmetic (+, -, *, /)',
          'Parentheses grouping',
          'Decimal numbers',
          'Mathematical expressions',
          'Expression validation'
        ]
      }
    ];
  }
}


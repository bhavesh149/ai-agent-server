import Groq from 'groq-sdk';
import { Message } from '../types';

export class LLMService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  public async generateResponse(
    messages: Message[],
    context: string = '',
    pluginResults: string = ''
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context, pluginResults);
      
      const groqMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];

      const completion = await this.groq.chat.completions.create({
        messages: groqMessages,
        model: 'llama3-8b-8192',
        max_tokens: 1024,
        temperature: 0.7,
        stream: false,
      });

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('LLM Service error:', error);
      throw new Error('Failed to generate response from LLM');
    }
  }

  private buildSystemPrompt(context: string, pluginResults: string): string {
    let prompt = `You are an intelligent AI assistant with access to a knowledge base and various tools.

CORE INSTRUCTIONS:
- Be helpful, accurate, and concise
- Use the provided context to enhance your responses
- When plugin results are available, incorporate them naturally into your response
- Maintain conversation history and context
- If you cannot answer something definitively, say so clearly

CAPABILITIES:
- Access to a knowledge base about markdown, blogging, and AI performance
- Weather information lookup
- Mathematical calculations
- Conversational memory`;

    if (context) {
      prompt += `\n\nRELEVANT CONTEXT FROM KNOWLEDGE BASE:
${context}`;
    }

    if (pluginResults) {
      prompt += `\n\nPLUGIN RESULTS:
${pluginResults}`;
    }

    prompt += `\n\nPlease provide helpful, contextual responses based on the user's question and the available information.`;

    return prompt;
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    // For now, we'll use a simple approach
    // In production, you might want to use OpenAI's embeddings API
    // or implement a more sophisticated embedding method
    return this.generateSimpleEmbedding(text);
  }

  private generateSimpleEmbedding(text: string): number[] {
    // Simple hash-based embedding for demonstration
    const normalized = text.toLowerCase();
    const embedding = new Array(384).fill(0); // Common embedding dimension
    
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = charCode % 384;
      embedding[index] += 1;
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }
}

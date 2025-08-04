import Groq from 'groq-sdk';
import { config } from '../config';

export class LLMService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: config.groqApiKey
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    const startTime = Date.now();
    console.log(`🤖 [TOOL CALLED] LLM Service - Generating response`);
    
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 1024
      });

      const executionTime = Date.now() - startTime;
      console.log(`✅ [TOOL SUCCESS] LLM Service - Response generated - Execution time: ${executionTime}ms`);

      return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [TOOL ERROR] LLM Service - Execution time: ${executionTime}ms, Error:`, error);
      throw new Error('Failed to generate response from LLM');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const startTime = Date.now();
    console.log(`🔤 [TOOL CALLED] LLM Service - Generating embedding for text (${text.length} chars)`);
    
    try {
      // For this implementation, we'll use a simple text-to-vector approach
      // In production, you'd use a proper embedding model
      const words = text.toLowerCase().split(/\s+/);
      const embedding = new Array(384).fill(0);
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length && j < embedding.length; j++) {
          embedding[j] += word.charCodeAt(j % word.length) / 1000;
        }
      }
      
      // Normalize the embedding
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      const result = embedding.map(val => magnitude > 0 ? val / magnitude : 0);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ [TOOL SUCCESS] LLM Service - Embedding generated (${result.length} dimensions) - Execution time: ${executionTime}ms`);
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [TOOL ERROR] LLM Service - Embedding generation failed - Execution time: ${executionTime}ms, Error:`, error);
      throw error;
    }
  }
}


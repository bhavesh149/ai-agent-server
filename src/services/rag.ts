import fs from 'fs';
import path from 'path';
import { DocumentChunk } from '../types';
import { LLMService } from './llm';
import { config } from '../config';

export class RAGService {
  private chunks: DocumentChunk[] = [];
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  async initializeKnowledgeBase(documentsPath: string): Promise<void> {
    console.log('Initializing knowledge base...');
    
    const files = fs.readdirSync(documentsPath).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(documentsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const chunks = this.chunkDocument(content, file);
      
      for (const chunk of chunks) {
        const embedding = await this.llmService.generateEmbedding(chunk.content);
        chunk.embedding = embedding;
        this.chunks.push(chunk);
      }
    }
    
    console.log(`Knowledge base initialized with ${this.chunks.length} chunks from ${files.length} documents`);
  }

  private chunkDocument(content: string, filename: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > config.chunkSize) {
        if (currentChunk.trim()) {
          chunks.push({
            id: `${filename}_chunk_${chunkIndex}`,
            content: currentChunk.trim(),
            embedding: [], // Will be filled later
            metadata: {
              filename,
              chunkIndex
            }
          });
          chunkIndex++;
        }
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `${filename}_chunk_${chunkIndex}`,
        content: currentChunk.trim(),
        embedding: [],
        metadata: {
          filename,
          chunkIndex
        }
      });
    }
    
    return chunks;
  }

  async retrieveRelevantChunks(query: string): Promise<DocumentChunk[]> {
    if (this.chunks.length === 0) {
      return [];
    }

    const queryEmbedding = await this.llmService.generateEmbedding(query);
    
    const similarities = this.chunks.map(chunk => ({
      chunk,
      similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
    }));
    
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities
      .slice(0, config.ragTopK)
      .map(item => item.chunk);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  getChunkCount(): number {
    return this.chunks.length;
  }
}


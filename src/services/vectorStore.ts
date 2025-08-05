import * as fs from 'fs';
import * as path from 'path';
import { Document } from '../types';
import { LLMService } from './llmService';

export class VectorStore {
  private static instance: VectorStore;
  private documents: Document[] = [];
  private llmService: LLMService;
  private isInitialized = false;

  private constructor() {
    this.llmService = new LLMService();
  }

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('Initializing vector store (fallback mode)...');
    await this.loadDocuments();
    this.isInitialized = true;
    console.log(`Vector store initialized with ${this.documents.length} documents`);
  }

  private async loadDocuments(): Promise<void> {
    const dataDir = path.join(__dirname, '../../data');
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const chunks = this.chunkText(content, 500);
      
      chunks.forEach((chunk, index) => {
        const document: Document = {
          id: `${file}_chunk_${index}`,
          content: chunk,
          metadata: {
            filename: file,
            chunkIndex: index,
            totalChunks: chunks.length
          },
          embedding: this.generateSimpleEmbedding(chunk)
        };
        this.documents.push(document);
      });
    }
  }

  private chunkText(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
      const chunk = words.slice(i, i + maxWords).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  public async searchSimilar(query: string, topK: number = 3): Promise<Document[]> {
    const queryEmbedding = this.generateSimpleEmbedding(query);
    
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, topK).map(item => item.document);
  }

  private generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    const wordFreq: { [key: string]: number } = {};
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    const commonWords = [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did',
      'its', 'let', 'put', 'say', 'she', 'too', 'use', 'way', 'may', 'come',
      'could', 'first', 'into', 'made', 'over', 'think', 'also', 'back',
      'after', 'other', 'many', 'than', 'then', 'them', 'these', 'time',
      'very', 'when', 'much', 'before', 'right', 'through', 'just', 'form',
      'sentence', 'great', 'think', 'help', 'low', 'line', 'differ', 'turn',
      'cause', 'move', 'same', 'tell', 'does', 'set', 'three', 'want', 'air',
      'well', 'also', 'play', 'small', 'end', 'put', 'home', 'read', 'hand',
      'port', 'large', 'spell', 'add', 'even', 'land', 'here', 'must', 'big',
      'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went'
    ];

    const embedding = new Array(100).fill(0);
    
    commonWords.forEach((word, index) => {
      if (index < 100) {
        embedding[index] = wordFreq[word] || 0;
      }
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
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
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async reset(): Promise<void> {
    this.documents = [];
    this.isInitialized = false;
  }
}

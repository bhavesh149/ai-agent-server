import fs from 'fs';
import path from 'path';
import { ChromaClient } from 'chromadb';
import { DocumentChunk } from '../types';
import { LLMService } from './llm';
import { config } from '../config';

export class ChromaRAGService {
  private chromaClient: ChromaClient;
  private collection: any = null;
  private llmService: LLMService;
  private collectionName = 'knowledge_base';

  constructor(llmService: LLMService) {
    this.llmService = llmService;
    
    // Initialize ChromaDB client to connect to server
    this.chromaClient = new ChromaClient({
      host: config.chromaHost,
      port: config.chromaPort,
      ssl: false
    });
  }

  async initializeKnowledgeBase(documentsPath: string): Promise<void> {
    console.log('Initializing ChromaDB knowledge base...');
    console.log(`Connecting to ChromaDB at ${config.chromaHost}:${config.chromaPort}`);
    
    try {
      // Test connection first
      const collections = await this.chromaClient.listCollections();
      console.log('Existing collections:', collections);
      
      // Create or get collection
      this.collection = await this.chromaClient.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'AI Agent Knowledge Base' }
      });
      
      console.log(`Created/Retrieved collection: ${this.collectionName}`);
    } catch (error: any) {
      console.error('Error creating/getting collection:', error);
      throw error;
    }

    // Process and add documents
    const files = fs.readdirSync(documentsPath).filter(file => file.endsWith('.md'));
    let totalChunks = 0;
    
    for (const file of files) {
      const filePath = path.join(documentsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const chunks = this.chunkDocument(content, file);
      
      // Prepare data for ChromaDB
      const ids: string[] = [];
      const documents: string[] = [];
      const metadatas: any[] = [];
      const embeddings: number[][] = [];
      
      for (const chunk of chunks) {
        const embedding = await this.llmService.generateEmbedding(chunk.content);
        
        ids.push(chunk.id);
        documents.push(chunk.content);
        metadatas.push({
          filename: chunk.metadata.filename,
          chunkIndex: chunk.metadata.chunkIndex,
          source: 'markdown'
        });
        embeddings.push(embedding);
      }
      
      // Add to ChromaDB collection
      if (ids.length > 0) {
        await this.collection.add({
          ids,
          documents,
          metadatas,
          embeddings
        });
        
        totalChunks += ids.length;
        console.log(`Added ${ids.length} chunks from ${file}`);
      }
    }
    
    console.log(`ChromaDB knowledge base initialized with ${totalChunks} chunks from ${files.length} documents`);
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
    const startTime = Date.now();
    console.log(`📚 [TOOL CALLED] Knowledge Base RAG - Query: "${query}"`);
    
    if (!this.collection) {
      console.warn('❌ [TOOL ERROR] ChromaDB collection not initialized');
      return [];
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.llmService.generateEmbedding(query);
      
      // Query ChromaDB for similar chunks
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: config.ragTopK,
        include: ['documents', 'metadatas', 'distances']
      });

      // Convert results to DocumentChunk format
      const chunks: DocumentChunk[] = [];
      
      if (results.documents && results.documents[0] && results.metadatas && results.metadatas[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          const document = results.documents[0][i];
          const metadata = results.metadatas[0][i] as any;
          
          if (document && metadata) {
            chunks.push({
              id: `${metadata.filename}_chunk_${metadata.chunkIndex}`,
              content: document,
              embedding: [], // Not needed for retrieval results
              metadata: {
                filename: metadata.filename,
                chunkIndex: metadata.chunkIndex
              }
            });
          }
        }
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ [TOOL SUCCESS] Knowledge Base RAG - Retrieved ${chunks.length} chunks - Execution time: ${executionTime}ms`);
      
      return chunks;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [TOOL ERROR] Knowledge Base RAG - Execution time: ${executionTime}ms, Error:`, error);
      return [];
    }
  }

  async getChunkCount(): Promise<number> {
    if (!this.collection) {
      return 0;
    }

    try {
      const count = await this.collection.count();
      return count;
    } catch (error) {
      console.error('Error getting chunk count:', error);
      return 0;
    }
  }

  async resetCollection(): Promise<void> {
    try {
      if (this.collection) {
        await this.chromaClient.deleteCollection({ name: this.collectionName });
        console.log(`Deleted collection: ${this.collectionName}`);
      }
    } catch (error) {
      console.error('Error resetting collection:', error);
    }
  }
}


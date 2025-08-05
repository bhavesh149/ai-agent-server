import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { agentRouter } from './routes/agent';
import { VectorStore } from './services/vectorStore';
import { setupErrorHandling } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/agent', agentRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
setupErrorHandling(app);

// Initialize vector store
VectorStore.getInstance().initialize().then(() => {
  console.log('Vector store initialized successfully');
}).catch((error) => {
  console.error('Failed to initialize vector store:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`AI Agent Backend running on port ${PORT}`);
});

export default app;

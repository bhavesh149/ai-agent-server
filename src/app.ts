import express from 'express';
import cors from 'cors';
import path from 'path';
import agentRoutes, { initializeAgent } from './routes/agent.js';
import { config } from './config/index.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/agent', agentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Agent Server',
    version: '1.0.0',
    description: 'A pluggable AI agent server with RAG and memory capabilities',
    endpoints: {
      'POST /agent/message': 'Send a message to the AI agent',
      'GET /agent/stats': 'Get agent statistics',
      'GET /agent/health': 'Health check endpoint'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

export { app, initializeAgent };


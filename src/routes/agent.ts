import { Router, Request, Response } from 'express';
import { AgentService } from '../services/agent.js';
import { MessageRequest } from '../types/index.js';

const router = Router();
let agentService: AgentService;

// Initialize the agent service
export const initializeAgent = async (documentsPath: string) => {
  agentService = new AgentService();
  await agentService.initialize(documentsPath);
  console.log('Agent service initialized successfully');
};

// POST /agent/message
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, session_id }: MessageRequest = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string'
      });
    }

    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({
        error: 'Session ID is required and must be a string'
      });
    }

    // Process the message
    const response = await agentService.processMessage({ message, session_id });
    
    res.json(response);
  } catch (error) {
    console.error('Error in /agent/message:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /agent/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await agentService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in /agent/stats:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /agent/health
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// GET /agent/tools
router.get('/tools', (req: Request, res: Response) => {
  try {
    const tools = agentService.getAvailableTools();
    res.json({
      tools,
      count: tools.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /agent/tools:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;


import { Router, Request, Response } from 'express';
import { AgentService } from '../services/agentService';
import { AgentRequest, AgentResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const agentService = new AgentService();

// Main agent endpoint
router.post('/message', asyncHandler(async (req: Request, res: Response) => {
  const { message, session_id } = req.body;

  // Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: {
        message: 'Message is required and must be a string',
        status: 400
      }
    });
  }

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({
      error: {
        message: 'Session ID is required and must be a string',
        status: 400
      }
    });
  }

  const request: AgentRequest = { message, session_id };
  const response: AgentResponse = await agentService.processMessage(request);

  res.json(response);
}));

// Get session history
router.get('/session/:sessionId/history', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({
      error: {
        message: 'Session ID is required',
        status: 400
      }
    });
  }

  const history = await agentService.getSessionHistory(sessionId);
  
  res.json({
    session_id: sessionId,
    messages: history,
    count: history.length
  });
}));

// Clear session
router.delete('/session/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.status(400).json({
      error: {
        message: 'Session ID is required',
        status: 400
      }
    });
  }

  agentService.clearSession(sessionId);
  
  res.json({
    message: 'Session cleared successfully',
    session_id: sessionId
  });
}));

// Get available plugins
router.get('/plugins', asyncHandler(async (req: Request, res: Response) => {
  const plugins = agentService.getAvailablePlugins();
  
  res.json({
    plugins,
    count: plugins.length
  });
}));

// Health check
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const health = await agentService.healthCheck();
  
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}));

export { router as agentRouter };

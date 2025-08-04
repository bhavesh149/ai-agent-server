import path from 'path';
import { fileURLToPath } from 'url';
import { app, initializeAgent } from './app.js';
import { config } from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    // Initialize the agent with knowledge base
    const documentsPath = path.join(__dirname, '../documents');
    await initializeAgent(documentsPath);

    // Start the server
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 AI Agent Server is running on port ${config.port}`);
      console.log(`📚 Knowledge base loaded from: ${documentsPath}`);
      console.log(`🌐 Server accessible at: http://0.0.0.0:${config.port}`);
      console.log('\n📋 Available endpoints:');
      console.log(`  POST http://0.0.0.0:${config.port}/agent/message`);
      console.log(`  GET  http://0.0.0.0:${config.port}/agent/stats`);
      console.log(`  GET  http://0.0.0.0:${config.port}/agent/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

startServer();


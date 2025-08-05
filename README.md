# AI Agent Backend with RAG and Plugin System

A sophisticated AI agent backend built with TypeScript and Node.js, featuring Retrieval-Augmented Generation (RAG), plugin system, and conversational memory.

## 🚀 Features

- **LLM Integration**: Uses Groq API with Llama3 model for intelligent responses
- **RAG (Retrieval-Augmented Generation)**: Vector-based document search for contextual responses
- **Plugin System**: Extensible plugin architecture with weather and math calculation plugins
- **Session Management**: Persistent conversation memory per session
- **Vector Store**: Custom implementation for document embedding and similarity search
- **RESTful API**: Clean REST endpoints for agent interaction

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │  Agent Service  │    │   LLM Service   │
│                 │────│                 │────│                 │
│ POST /message   │    │  Orchestrates   │    │  Groq/Llama3    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │Vector Store  │ │Session Mgr  │ │Plugin Mgr  │
        │              │ │             │ │            │
        │RAG Documents │ │Conversation │ │Weather API │
        │Embeddings    │ │Memory       │ │Math Calc   │
        └──────────────┘ └─────────────┘ └────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Groq API key

## 🛠️ Setup Steps

1. **Clone and install dependencies:**
```bash
cd ai-agent-backend
npm install
```

2. **Environment configuration:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Build the project:**
```bash
npm run build
```

4. **Start the development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### POST `/agent/message`
Send a message to the AI agent.

**Request:**
```json
{
  "message": "What is markdown and how to use it for blogging?",
  "session_id": "user123"
}
```

**Response:**
```json
{
  "reply": "Markdown is a lightweight markup language...",
  "session_id": "user123",
  "timestamp": "2025-08-04T14:30:00.000Z",
  "context_used": ["markdown-guide.md"],
  "plugins_called": []
}
```

### GET `/agent/session/{sessionId}/history`
Get conversation history for a session.

### DELETE `/agent/session/{sessionId}`
Clear a session's conversation history.

### GET `/agent/plugins`
List available plugins.

### GET `/agent/health`
Health check endpoint.

## 🔧 Sample Commands

### Basic conversation:
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Tell me about markdown blogging.",
    "session_id": "demo123"
  }'
```

### Weather query:
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather like in Bangalore?",
    "session_id": "demo123"
  }'
```

### Math calculation:
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 25 * 4 + 10",
    "session_id": "demo123"
  }'
```

### Get session history:
```bash
curl http://localhost:3000/agent/session/demo123/history
```

## 🧩 Plugin System

The agent supports extensible plugins:

- **Weather Plugin**: Provides weather information for locations
- **Math Plugin**: Evaluates mathematical expressions

### Adding New Plugins

1. Extend `BasePlugin` class
2. Implement `execute()` method
3. Register in `PluginManager`

```typescript
export class CustomPlugin extends BasePlugin {
  name = 'custom';
  description = 'Custom functionality';

  async execute(query: string): Promise<PluginResult> {
    // Plugin logic here
    return this.createSuccessResult(data);
  }
}
```

## 📚 RAG Knowledge Base

The system includes markdown documents about:
- Markdown blogging best practices
- AI performance optimization
- Technical documentation

Documents are automatically chunked, embedded, and indexed for similarity search.

## 🚀 Production Deployment

### Docker Deployment
```bash
docker build -t ai-agent-backend .
docker run -p 3000:3000 --env-file .env ai-agent-backend
```

### Environment Variables
```
GROQ_API_KEY=your_groq_api_key
OPENWEATHER_API_KEY=your_weather_api_key (optional)
PORT=3000
NODE_ENV=production
```

## 🔍 Monitoring & Logs

- Structured logging with timestamps
- Health check endpoints
- Error handling and reporting
- Performance metrics

## 📈 Performance

- Vector search optimized for < 100ms response times
- Session management with automatic cleanup
- Lightweight embedding generation
- Async plugin execution

## 🛡️ Security

- Input validation and sanitization
- Rate limiting ready (add middleware)
- Environment-based configuration
- Safe expression evaluation for math plugin

## 📝 Development

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (TBD)

### Code Structure
```
src/
├── index.ts              # Application entry point
├── types.ts              # TypeScript interfaces
├── routes/               # API route handlers
├── services/             # Business logic services
├── plugins/              # Plugin implementations
└── middleware/           # Express middleware
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using TypeScript, Express, and Groq API.

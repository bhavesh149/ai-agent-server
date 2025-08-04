# 🧠 AI Agent - Intelligent Multi-Tool Assistant

A sophisticated TypeScript-based AI agent server that combines Large Language Model capabilities with Retrieval-Augmented Generation (RAG), persistent session memory, and an extensible plugin system for dynamic tool execution.

## ✨ Features

### Core Intelligence
- **🤖 LLM-Powered Agent**: Groq's Llama3-8b model for natural language understanding and generation
- **📚 RAG Knowledge Base**: ChromaDB-powered semantic search over markdown documents
- **🧠 Session Memory**: Persistent conversation history with context preservation
- **🔧 Plugin Architecture**: Modular tool system for extensible functionality

### Available Tools
- **🌤️ Weather Plugin**: Real-time weather data from OpenWeatherMap API
- **🧮 Math Plugin**: Mathematical expression evaluation and calculation
- **📖 Knowledge Base**: Semantic document search and retrieval
- **💾 Memory System**: Conversation context and session management
- **🎯 Tool Monitoring**: Real-time logging and performance tracking

### API Features
- **RESTful Endpoints**: Clean HTTP API for integration
- **Tool Discovery**: Dynamic tool listing and capabilities
- **Health Monitoring**: System status and performance metrics
- **Error Handling**: Comprehensive error management and logging

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Client   │───▶│  Express Server │───▶│  Agent Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Plugin System  │◀───│  Memory Service │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                    ┌──────────────────────┐   ┌─────────────────┐
                    │ 🌤️ Weather Plugin    │   │ 📚 ChromaDB RAG │
                    │ 🧮 Math Plugin       │   │    Service      │
                    │ 📊 Tool Monitoring   │   └─────────────────┘
                    └──────────────────────┘            │
                                                ┌─────────────────┐
                                                │   ChromaDB      │
                                                │ Vector Database │
                                                └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │ 🤖 LLM Service  │
                                               │  (Groq/Llama3)  │
                                               └─────────────────┘
```

## � Quick Start

### Prerequisites
- Node.js 18+ 
- npm
- Python 3.8+ (for ChromaDB)
- Git

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ai-agent
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys:
   # GROQ_API_KEY=your_groq_api_key_here
   # OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

3. **Setup ChromaDB (Local Development)**
   ```bash
   # Create Python virtual environment
   python -m venv chroma_env
   
   # Windows
   chroma_env\Scripts\activate
   
   # Linux/Mac
   source chroma_env/bin/activate
   
   # Install ChromaDB
   pip install chromadb
   
   # Start ChromaDB server
   python -m chromadb.cli.cli run --host 0.0.0.0 --port 8000 --path ./chroma_data
   ```

4. **Start Development Server**
   ```bash
   # In a new terminal
   npm run dev
   ```

### Production Deployment (AWS EC2)

For production deployment on AWS EC2 with Amazon Linux 2023, use our automated deployment script:

```bash
# On your EC2 instance
wget https://raw.githubusercontent.com/your-repo/ai-agent/main/deploy-amazon-linux.sh
chmod +x deploy-amazon-linux.sh
./deploy-amazon-linux.sh
```

See [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md) for detailed deployment instructions.

---

## 📡 API Endpoints

### 🔄 POST /agent/message
Send a message to the AI agent and get intelligent responses.

**Request:**
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the weather in London?",
    "session_id": "user-123"
  }'
```

**Response:**
```json
{
  "reply": "The current weather in London, GB is 15°C with light rain. Humidity is at 78% and wind speed is 3.2 m/s.",
  "session_id": "user-123",
  "timestamp": "2025-08-04T15:02:29.760Z"
}
```

### 🔧 GET /agent/tools
Get list of available tools and their capabilities.

```bash
curl -X GET http://localhost:3000/agent/tools
```

**Response:**
```json
{
  "tools": [
    {
      "name": "weather",
      "description": "Get current weather information for any location worldwide",
      "type": "plugin",
      "status": "active",
      "capabilities": [
        "Current weather conditions",
        "Temperature (Celsius)",
        "Weather description",
        "Humidity percentage",
        "Wind speed"
      ]
    },
    {
      "name": "math",
      "description": "Perform mathematical calculations and solve expressions",
      "type": "plugin",
      "status": "active",
      "capabilities": [
        "Basic arithmetic (+, -, *, /)",
        "Parentheses grouping",
        "Decimal numbers",
        "Mathematical expressions",
        "Expression validation"
      ]
    }
  ],
  "count": 5,
  "timestamp": "2025-08-04T15:02:29.760Z"
}
```

### 📊 GET /agent/stats
Get agent performance statistics and system health.

```bash
curl -X GET http://localhost:3000/agent/stats
```

**Response:**
```json
{
  "knowledgeBaseChunks": 180,
  "activeSessions": 5
}
```

### 🏥 GET /agent/health
Health check endpoint for monitoring system status.

```bash
curl -X GET http://localhost:3000/agent/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-04T15:02:20.717Z"
}
```

## 🔌 Plugin System

The agent features an intelligent plugin system that automatically detects user intent and executes appropriate tools:

### 🌤️ Weather Plugin
- **Triggers**: Keywords like "weather", "temperature", "forecast", "climate"
- **Capabilities**: Real-time weather data from OpenWeatherMap API
- **Examples**: 
  - "What's the weather in Paris?"
  - "How hot is it in Tokyo today?"
  - "Is it raining in London?"

### 🧮 Math Plugin
- **Triggers**: Mathematical expressions or keywords like "calculate", "compute"
- **Capabilities**: Safe arithmetic evaluation with validation
- **Examples**:
  - "Calculate 2 + 2 * 5"
  - "What's 15% of 200?"
  - "Compute (100 - 25) / 3"

### 📚 Knowledge Base RAG
- **Triggers**: Questions about topics covered in the knowledge base
- **Capabilities**: Semantic search and retrieval from markdown documents
- **Examples**:
  - "Tell me about markdown syntax"
  - "How does Next.js work?"
  - "What are the benefits of static sites?"

### 🔧 Tool Monitoring

All tools include comprehensive logging with:
- ✅ Success/failure status
- ⏱️ Execution time tracking
- 📊 Input/output logging
- 🐛 Error details and debugging

**Console Output Example:**
```
🌤️  [TOOL CALLED] Weather Plugin - Location: London
✅ [TOOL SUCCESS] Weather Plugin - Execution time: 245ms

🧮 [TOOL CALLED] Math Plugin - Expression: 2 + 2 * 5
✅ [TOOL SUCCESS] Math Plugin - Result: 12 - Execution time: 3ms

📚 [TOOL CALLED] Knowledge Base RAG - Query: "markdown syntax"
✅ [TOOL SUCCESS] Knowledge Base RAG - Retrieved 3 chunks - Execution time: 156ms
```

### Adding New Plugins

1. **Create Plugin Class** in `src/plugins/`:

```typescript
export class CustomPlugin {
  async execute(input: string): Promise<PluginResult> {
    const startTime = Date.now();
    console.log(`🔧 [TOOL CALLED] Custom Plugin - Input: ${input}`);
    
    try {
      // Your plugin logic here
      const result = await processInput(input);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ [TOOL SUCCESS] Custom Plugin - Execution time: ${executionTime}ms`);
      
      return {
        pluginName: 'custom',
        result,
        success: true
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ [TOOL ERROR] Custom Plugin - Execution time: ${executionTime}ms, Error:`, error);
      return {
        pluginName: 'custom',
        result: null,
        success: false,
        error: error.message
      };
    }
  }

  static detectIntent(message: string): { isCustomQuery: boolean; data?: any } {
    // Intent detection logic
    const keywords = ['custom', 'special'];
    const isMatch = keywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    return { 
      isCustomQuery: isMatch,
      data: isMatch ? extractData(message) : null
    };
  }
}
```

2. **Register in AgentService** (`src/services/agent.ts`):

```typescript
// Add to constructor
this.customPlugin = new CustomPlugin();

// Add to processMessage method
const customIntent = CustomPlugin.detectIntent(message);
if (customIntent.isCustomQuery && customIntent.data) {
  const result = await this.customPlugin.execute(customIntent.data);
  pluginResults.push(result);
}

// Add to getAvailableTools method
{
  name: 'custom',
  description: 'Your custom plugin description',
  type: 'plugin',
  status: 'active',
  capabilities: ['capability1', 'capability2']
}
```

## 🧠 RAG Knowledge System

The Retrieval-Augmented Generation system powered by ChromaDB:

1. **Document Processing**: Chunks markdown files into semantic pieces
2. **Vector Storage**: Stores document embeddings in ChromaDB vector database
3. **Similarity Search**: Uses ChromaDB's built-in similarity search for relevant chunks
4. **Context Injection**: Feeds top-K relevant chunks into the LLM prompt

### ChromaDB Integration Benefits:
- **Production-ready**: Scalable vector database designed for AI applications
- **Efficient Storage**: Optimized for large-scale embedding storage and retrieval
- **Advanced Querying**: Built-in similarity search with distance metrics
The RAG system provides intelligent document retrieval using:

### 🔍 Semantic Search
- **ChromaDB Integration**: Vector database for efficient similarity search
- **Embedding Generation**: Text-to-vector conversion for semantic matching
- **Chunk Management**: Automatic document segmentation and processing
- **Relevance Ranking**: Top-K retrieval based on cosine similarity

### 📄 Document Processing
- **Markdown Support**: Native handling of markdown documents
- **Intelligent Chunking**: Configurable chunk size (500 chars) with overlap (50 chars)
- **Metadata Preservation**: File names and chunk indices maintained
- **Automatic Indexing**: Real-time processing during server startup

### ⚡ Performance Features
- **Vector Storage**: Persistent embeddings with ChromaDB
- **Fast Retrieval**: Optimized query performance
- **Configurable Parameters**: Adjustable top-K results (default: 3)
- **Error Handling**: Graceful fallbacks when no relevant content found

## 💾 Memory Management

The conversation system maintains intelligent context through:

### 🗃️ Session Management
- **Unique Sessions**: Each `session_id` maintains separate conversation history
- **Context Preservation**: Recent messages included in prompts for continuity
- **Memory Limits**: Configurable limits (10 messages) to prevent context bloat
- **Multi-user Support**: Concurrent sessions with isolated histories

### 🧠 Context Integration
- **Recent History**: Last 2 messages for immediate context
- **RAG Integration**: Relevant knowledge base chunks included
- **Plugin Results**: Real-time tool outputs incorporated
- **Dynamic Prompting**: Context-aware system prompt generation

## 🎯 System Prompt Engineering

The agent constructs intelligent prompts that combine:

### 📝 Prompt Components
- **System Instructions**: Agent persona and behavior guidelines
- **Conversation History**: Contextual message history
- **Knowledge Base Context**: Relevant document chunks from RAG
- **Plugin Results**: Real-time data from executed tools
- **Current Query**: User's immediate request

### 🔧 Dynamic Assembly
```
System Role: You are a helpful AI assistant...

Conversation History:
User: Previous question
Assistant: Previous response

Relevant Knowledge Base Context:
1. Document chunk about topic X
2. Information about related concept Y

Plugin Results:
Weather data for London: 15°C, light rain...

Current User Message:
What's the weather like today?
```

## 🚀 Live Demo

**Public URL**: https://3000-iireyuvlix6o9iucy3vyk-4815ebf6.manusvm.computer

Try these sample requests:

```bash
# Weather query
curl -X POST https://your-server-url/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Weather in Tokyo?", "session_id": "demo-1"}'

# Math calculation  
curl -X POST https://your-server-url/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 15 * 7 + 3?", "session_id": "demo-2"}'

# Knowledge base query
curl -X POST https://your-server-url/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Markdown", "session_id": "demo-3"}'

# Get available tools
curl -X GET https://your-server-url/agent/tools

# Check system health
curl -X GET https://your-server-url/agent/health
```

## 📁 Project Structure

```
ai-agent/
├── src/
│   ├── config/           # Configuration management
│   │   └── index.ts      # Environment variables and settings
│   ├── plugins/          # Tool implementations
│   │   ├── weather.ts    # Weather API integration
│   │   └── math.ts       # Math expression evaluator
│   ├── routes/           # Express route handlers
│   │   └── agent.ts      # API endpoints and routing
│   ├── services/         # Core business logic
│   │   ├── agent.ts      # Main agent orchestration and tool management
│   │   ├── llm.ts        # LLM integration (Groq/Llama3)
│   │   ├── memory.ts     # Session memory management
│   │   └── chromadb-rag.ts  # RAG implementation with ChromaDB
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Interfaces and type definitions
│   ├── app.ts            # Express application setup
│   ├── index.ts          # Application entry point
│   └── server.ts         # Server startup and initialization
├── documents/            # Knowledge base markdown files
│   ├── *.md             # Markdown documents for RAG
├── chroma/              # ChromaDB persistent storage
├── dist/                # Compiled JavaScript output
├── .env                 # Environment variables (not in repo)
├── nodemon.json         # Development server configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables
```env
# Required API Keys
OPENWEATHER_API_KEY=your_openweather_key
GROQ_API_KEY=your_groq_key

# Server Configuration
PORT=3000
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

### System Configuration
Key settings in `src/config/index.ts`:

```typescript
export const config = {
  port: parseInt(process.env.PORT || '3000'),
  maxMemoryMessages: 10,        // Messages to keep per session
  ragTopK: 3,                   // Top chunks to retrieve from RAG
  chunkSize: 500,               // Document chunk size in characters
  chunkOverlap: 50,             // Character overlap between chunks
  chromaHost: 'localhost',      // ChromaDB server host
  chromaPort: 8000              // ChromaDB server port
};
```

## 🧪 Testing & Validation

The system includes comprehensive testing coverage:

### ✅ API Endpoints
- **Message Processing**: Natural language understanding and response generation
- **Tool Discovery**: Dynamic tool listing with capabilities
- **Health Monitoring**: System status and performance metrics
- **Statistics**: Real-time system statistics and usage metrics

### ✅ Plugin System
- **Weather Integration**: Real-time weather data from OpenWeatherMap
- **Math Calculations**: Safe mathematical expression evaluation
- **Tool Logging**: Comprehensive execution tracking and performance monitoring
- **Error Handling**: Graceful failure management and user feedback

### ✅ RAG Knowledge System
- **Document Processing**: Markdown file chunking and embedding generation
- **Semantic Search**: Vector similarity search with ChromaDB
- **Context Retrieval**: Relevant information extraction for query enhancement

### ✅ Memory & Session Management
- **Session Isolation**: Independent conversation contexts per user
- **Context Preservation**: Intelligent conversation history management
- **Multi-user Support**: Concurrent session handling with proper isolation

## ☁️ AWS EC2 Deployment

### 🚀 Quick Deployment Options

**Option 1: Amazon Linux 2023 (Recommended)**
- **AMI**: Amazon Linux 2023 AMI
- **Default User**: `ec2-user`
- **Package Manager**: `dnf`

```bash
# Upload and run deployment script
scp -i your-key.pem deploy-amazon-linux.sh ec2-user@your-ec2-ip:/home/ec2-user/
ssh -i your-key.pem ec2-user@your-ec2-ip
chmod +x deploy-amazon-linux.sh && ./deploy-amazon-linux.sh
```

**Option 2: Ubuntu Server 22.04 LTS**
- **AMI**: Ubuntu Server 22.04 LTS
- **Default User**: `ubuntu`
- **Package Manager**: `apt`

```bash
# Upload and run deployment script
scp -i your-key.pem deploy-ec2.sh ubuntu@your-ec2-ip:/home/ubuntu/
ssh -i your-key.pem ubuntu@your-ec2-ip
chmod +x deploy-ec2.sh && ./deploy-ec2.sh
```

**Instance Requirements:**
- **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
- **Storage**: 20GB GP3
- **Security Group**: Allow ports 22 (SSH) and 3000 (HTTP)

**Configure and start:**
```bash
# Add your API keys
nano .env

# Start services with PM2
npm run pm2:setup
npm run pm2:start
```

### 🔧 PM2 Service Management

The application uses PM2 to manage both ChromaDB and the Node.js server:

```bash
# Start all services
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs

# Restart services
npm run pm2:restart

# Deploy updates
npm run pm2:deploy

# Create backup
npm run pm2:backup
```

### 📊 Production Monitoring

**Service Health Checks:**
```bash
# Check ChromaDB
curl http://localhost:8000/api/v1/version

# Check Weather Agent
curl http://localhost:3000/agent/health

```bash
# Check AI Agent
curl http://localhost:3000/agent/health

# Monitor all services
pm2 monit
```

**Log Management:**
- **ChromaDB Logs**: `./logs/chromadb*.log`
- **Server Logs**: `./logs/ai-agent*.log`
- **PM2 Dashboard**: `pm2 monit`
```

**Log Management:**
- **ChromaDB Logs**: `./logs/chromadb*.log`
- **Server Logs**: `./logs/weather-agent*.log`
- **PM2 Dashboard**: `pm2 monit`

### 🔐 Security Configuration

**Environment Variables:**
```bash
# Production .env file
OPENWEATHER_API_KEY=your_actual_key
GROQ_API_KEY=your_actual_key
NODE_ENV=production
PORT=3000
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

**EC2 Security Group:**
```
Inbound Rules:
- SSH (22): Your IP only
- HTTP (3000): 0.0.0.0/0 (or restrict as needed)
- ChromaDB (8000): localhost only (handled by application)
```

### 💰 Cost Optimization

**Recommended Instance Sizes:**
- **Development**: t3.micro (Free tier) - $0/month
- **Production**: t3.medium - ~$30/month  
- **High Traffic**: t3.large - ~$60/month

**Monitoring Costs:**
- Use AWS CloudWatch for detailed monitoring
- Set up billing alerts for cost management
- Consider Reserved Instances for long-term savings

For detailed deployment instructions, see [AWS-DEPLOYMENT.md](./AWS-DEPLOYMENT.md)

## 🔧 Development
- **Knowledge Base Management**: Dynamic document indexing and updates

### ✅ Memory & Sessions
- **Session Isolation**: Independent conversation histories per user
- **Context Preservation**: Conversation continuity across multiple interactions
- **Memory Management**: Automatic cleanup and memory limit enforcement
- **Multi-user Support**: Concurrent session handling

## 🚀 Deployment Status

### ✅ Production Ready
The AI Agent is now fully configured and tested for production deployment:

- **ES Module Support**: All TypeScript imports properly configured with `.js` extensions
- **Clean Build**: TypeScript compilation successful with zero errors
- **Module Resolution**: All relative imports working correctly in ES module environment
- **PM2 Configuration**: Production-ready process management with smart environment detection
- **AWS EC2 Ready**: Automated deployment scripts tested for Amazon Linux 2023
- **Cross-Platform**: Works on Windows (development) and Linux (production)

### 🔧 Technical Validation
- ✅ TypeScript builds without errors (`npm run build`)
- ✅ Server starts successfully with proper ES module imports
- ✅ All services properly initialize (LLM, Memory, RAG, Plugins)
- ✅ API endpoints functional (`/api/agent`, `/api/tools`, `/health`)
- ✅ PM2 ecosystem configuration optimized for production
- ✅ Environment detection working for development and production modes

### 📦 Deployment Options

### Local Development
```bash
npm run dev  # Development with auto-reload
npm start    # Production mode
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment
The application is cloud-ready with:
- ✅ Environment variable configuration
- ✅ Health check endpoints for load balancers
- ✅ Stateless design (external ChromaDB)
- ✅ Configurable ports and hosts
- ✅ Production build optimization

## 🔍 Monitoring & Debugging

### Real-time Tool Logging
Monitor tool execution in real-time:

```bash
# Console output shows detailed tool execution
🌤️  [TOOL CALLED] Weather Plugin - Location: Tokyo
✅ [TOOL SUCCESS] Weather Plugin - Execution time: 234ms

🧮 [TOOL CALLED] Math Plugin - Expression: 15 * 7 + 3
✅ [TOOL SUCCESS] Math Plugin - Result: 108 - Execution time: 2ms

📚 [TOOL CALLED] Knowledge Base RAG - Query: "markdown benefits"
✅ [TOOL SUCCESS] Knowledge Base RAG - Retrieved 3 chunks - Execution time: 145ms

🤖 [TOOL CALLED] LLM Service - Generating response
✅ [TOOL SUCCESS] LLM Service - Response generated - Execution time: 892ms
```

### Performance Metrics
- **Execution Time**: Millisecond precision for each tool call
- **Success/Failure Rates**: Real-time tool reliability monitoring
- **Context Size**: Dynamic prompt and context size tracking
- **Session Statistics**: Active user sessions and memory usage

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-tool`
3. **Add your plugin** in `src/plugins/`
4. **Update AgentService** to register your tool
5. **Add tool info** to `getAvailableTools()` method
6. **Test thoroughly** with various inputs
7. **Submit a pull request**

### Plugin Development Guidelines
- ✅ Include comprehensive logging with timing
- ✅ Implement robust error handling
- ✅ Add intent detection for automatic triggering
- ✅ Provide clear capability descriptions
- ✅ Follow TypeScript best practices
- ✅ Add tool info to the tools endpoint

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: This README contains comprehensive setup and usage information
- **API Reference**: All endpoints documented with example requests/responses
- **Plugin Development**: Follow the plugin template and guidelines above

---

**Built with ❤️ using TypeScript, Express, ChromaDB, and Groq AI**

- **Stateless**: No persistent storage dependencies
- **Containerizable**: Ready for Docker deployment
- **Scalable**: Horizontal scaling supported
- **Cloud-ready**: Compatible with AWS EC2, Lambda, or similar platforms

## 📈 Performance

- **Knowledge Base**: 180 chunks from 5 markdown documents
- **Response Time**: ~1-3 seconds for complex queries
- **Memory Usage**: Efficient in-memory storage with configurable limits
- **Concurrent Sessions**: Supports multiple simultaneous users

## 🔮 Future Enhancements

- [ ] Persistent storage for session memory
- [ ] Advanced embedding models (OpenAI, Sentence Transformers)
- [ ] Plugin marketplace and dynamic loading
- [ ] WebSocket support for real-time interactions
- [ ] Advanced RAG techniques (hybrid search, reranking)
- [ ] Monitoring and analytics dashboard

---

**Built with ❤️ using TypeScript, Express, and Groq**


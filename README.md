# AI Agent Backend with RAG and Plugin System

A sophisticated AI agent backend built with TypeScript and Node.js, featuring Retrieval-Augmented Generation (RAG), plugin system, and conversational memory.

🌐 **Repository**: [https://github.com/bhavesh149/ai-agent-server.git](https://github.com/bhavesh149/ai-agent-server.git)

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

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/bhavesh149/ai-agent-server.git
cd ai-agent-server
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

### AWS EC2 Deployment

#### 1. EC2 Instance Setup
```bash
# Launch Ubuntu 22.04 LTS instance (t3.small or larger recommended)
# Security Groups: Allow inbound traffic on ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (API)

# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### 2. Server Dependencies Installation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

#### 3. Application Deployment
```bash
# Clone the repository
git clone https://github.com/bhavesh149/ai-agent-server.git
cd ai-agent-server

# Install dependencies
npm install

# Create production environment file
sudo nano .env
```

**Environment Configuration (.env):**
```bash
# Required API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional: Database URLs (if using external databases)
# VECTOR_DB_URL=your_vector_db_url
# REDIS_URL=your_redis_url_for_sessions
```

#### 4. Build and Start Application
```bash
# Build the TypeScript application
npm run build

# Start with PM2 for production
pm2 start dist/index.js --name "ai-agent-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

#### 5. Nginx Reverse Proxy (Recommended)
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ai-agent

# Add the following configuration:
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 public IP
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/ai-agent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL/HTTPS Setup (Optional but Recommended)
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

#### 7. Monitoring and Maintenance
```bash
# View application logs
pm2 logs ai-agent-backend

# Monitor application status
pm2 status

# Restart application
pm2 restart ai-agent-backend

# View system resources
pm2 monit

# Update application
git pull
npm run build
pm2 restart ai-agent-backend
```

### Docker Deployment on EC2
### Docker Deployment on EC2

#### 1. Install Docker on EC2
```bash
# Install Docker
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

#### 2. Deploy with Docker
```bash
# Clone repository
git clone https://github.com/bhavesh149/ai-agent-server.git
cd ai-agent-server

# Create .env file
nano .env

# Build and run container
docker build -t ai-agent-backend .
docker run -d --name ai-agent \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  ai-agent-backend

# Or use with docker-compose (create docker-compose.yml)
docker-compose up -d
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
- `npm run pm2:start` - Start with PM2 process manager
- `npm run pm2:restart` - Restart PM2 process
- `npm run pm2:logs` - View PM2 logs
- `npm run deploy:ec2` - Build and deploy to EC2

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

## 🌐 EC2 Deployment

For comprehensive EC2 deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick EC2 Deployment:**
```bash
# On your EC2 instance
git clone https://github.com/bhavesh149/ai-agent-server.git
cd ai-agent-server
chmod +x deploy.sh
./deploy.sh setup
./deploy.sh deploy
# Edit .env file with your API keys
./deploy.sh start
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

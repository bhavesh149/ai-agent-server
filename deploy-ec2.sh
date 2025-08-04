#!/bin/bash

# AWS EC2 AI Agent Deployment Script for Amazon Linux 2023
# Run this script on your EC2 instance as ec2-user

set -e

echo "🚀 Starting AI Agent deployment on Amazon Linux 2023 EC2..."

# Update system
echo "📦 Updating system packages..."
sudo dnf update -y

# Install Node.js 18.x
echo "🟢 Installing Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install Python and pip
echo "🐍 Installing Python and pip..."
sudo dnf install -y python3 python3-pip python3-devel gcc

# Install PM2 globally
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Install Git if not present
echo "📂 Installing Git..."
sudo dnf install -y git

# Clone the repository (update with your actual repo URL)
echo "📥 Cloning repository..."
cd /home/ec2-user
if [ -d "ai-agent" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd ai-agent
    git pull
else
    # Replace with your actual repository URL
    git clone https://github.com/bhavesh149/ai-agent-server.git
    cd ai-agent-server
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the TypeScript project
echo "🔨 Building TypeScript project..."
npm run build

# Create Python virtual environment for ChromaDB
if [ ! -d "chromadb-venv" ]; then
  echo "🐍 Creating Python virtual environment..."
  python3 -m venv chromadb-venv
fi
source chromadb-venv/bin/activate
pip install --upgrade pip
pip install chromadb

# Create logs directory
echo "📝 Creating logs directory..."
mkdir -p logs

# Create .env file (you'll need to add your API keys)
echo "🔐 Creating environment file..."
cat > .env << EOF
OPENWEATHER_API_KEY=your_openweather_api_key_here
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
CHROMA_HOST=localhost
CHROMA_PORT=8000
EOF

echo "⚠️  IMPORTANT: Please edit the .env file and add your actual API keys:"
echo "   nano .env"

# Set up PM2 to start on boot
echo "🔄 Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "✅ Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys: nano .env"
echo "2. Start services: pm2 start ecosystem.config.cjs"
echo "3. Save PM2 configuration: pm2 save"
echo "4. Check status: pm2 status"
echo ""
echo "Your server will be accessible at: http://your-ec2-public-ip:3000"

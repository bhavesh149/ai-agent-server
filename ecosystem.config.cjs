const os = require('os');
const path = require('path');

// Detect environment
const isLinux = os.platform() === 'linux';
const isProduction = process.env.NODE_ENV === 'production';
const userHome = os.homedir();

// Set paths based on environment
const basePath = isLinux && isProduction 
  ? '/home/ec2-user/ai-agent-server' 
  : process.cwd();

const pythonInterpreter = isLinux ? 'python3' : 'python';

module.exports = {
  apps: [
    {
      name: 'chromadb-server',
      script: isLinux ? '/home/ec2-user/chroma_env/bin/python' : 'python',
      args: isLinux ? '-m chromadb.cli.cli run --host 0.0.0.0 --port 8000 --path ./chroma_data' : '-m chromadb.cli.cli run --host 0.0.0.0 --port 8000 --path ./chroma_data',
      cwd: basePath,
      env: {
        NODE_ENV: isProduction ? 'production' : 'development',
        VIRTUAL_ENV: isLinux ? '/home/ec2-user/chroma_env' : undefined,
        PATH: isLinux ? `/home/ec2-user/chroma_env/bin:${process.env.PATH}` : process.env.PATH
      },
      log_file: './logs/chromadb.log',
      out_file: './logs/chromadb-out.log',
      error_file: './logs/chromadb-error.log',
      restart_delay: 5000,
      max_restarts: 5,
      autorestart: true,
      watch: false
    },
    {
      name: 'ai-agent-server',
      script: 'dist/server.js',
      cwd: basePath,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: isProduction ? 'production' : 'development',
        PORT: 3000,
        CHROMA_HOST: 'localhost',
        CHROMA_PORT: 8000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_file: './logs/ai-agent.log',
      out_file: './logs/ai-agent-out.log',
      error_file: './logs/ai-agent-error.log',
      restart_delay: 3000,
      max_restarts: 10,
      autorestart: true,
      watch: false,
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};

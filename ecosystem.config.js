module.exports = {
  apps: [
    {
      name: 'chromadb-server',
      script: 'chroma',
      args: 'run --host 0.0.0.0 --port 8000',
      interpreter: 'python3',
      cwd: '/home/ubuntu/ai-agent',
      env: {
        NODE_ENV: 'production'
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
      cwd: '/home/ubuntu/ai-agent',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
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

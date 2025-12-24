// PM2 Ecosystem Configuration for Dookan Backend
// Usage: pm2 start pm2-ecosystem.config.js
// Docs: https://pm2.keymetrics.io/docs/usage/ecosystem-file/

module.exports = {
  apps: [
    {
      // Backend API Server
      name: 'dookan-backend',
      script: 'dist/main.js',
      cwd: '/root/dookan/backend-afghan-grocery',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Process management
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster', // Cluster mode for better performance
      merge_logs: true,

      // Auto restart settings
      watch: false, // Set to true to auto-restart on file changes
      ignore_watch: ['node_modules', 'dist', 'uploads', 'db'],
      max_memory_restart: '1G', // Restart if memory exceeds 1GB

      // Logging
      out_file: '/var/log/pm2/dookan-backend-out.log',
      error_file: '/var/log/pm2/dookan-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Additional settings
      max_restarts: 10,
      min_uptime: '10s',
    }
  ],

  // Global settings
  deploy: {
    production: {
      user: 'root',
      host: 'your-vps-ip-here',
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/dookan.git',
      path: '/root/dookan',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};

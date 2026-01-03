import dotenv from 'dotenv';
dotenv.config();


const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  apiVersion: process.env.API_VERSION || 'v1',
  cors: {
    // Use explicit origin (cannot be '*') when sending credentials from frontend
    origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    optionsSuccessStatus: 200,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'changeme',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'changemerefresh',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  // Optional runtime URLs & external service config
  server: {
    url: process.env.BACKEND_URL || ''
  },
  frontend: {
    url: process.env.FRONTEND_URL || ''
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || ''
  },
};

// Export Config type for consumers
export type Config = typeof config;

export default config;

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface Config {
    env: string;
    port: number;
    apiVersion: string;
    db: {
        path: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string | string[];
        credentials: boolean;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    upload: {
        maxFileSize: number;
        uploadPath: string;
    };
    server?: {
        url?: string;
    };
    frontend?: {
        url?: string;
    };
    supabase?: {
        url: string;
        anonKey: string;
        serviceKey: string;
    };
}

const config: Config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiVersion: process.env.API_VERSION || 'v1',

    db: {
        path: process.env.DB_PATH || path.join(__dirname, '../db/database.sqlite'),
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },

    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // Increased from 100 to 1000 for development
    },

    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
        uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
    },
};

// Add Supabase config if provided
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_KEY) {
    config.supabase = {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_KEY,
    };
}

// Validate critical configuration on startup
function validateConfig() {
    const errors: string[] = [];
    
    if (!config.jwt.secret || config.jwt.secret === 'your-secret-key-change-in-production') {
        errors.push('JWT_SECRET must be set and changed from default');
    }
    
    if (!config.jwt.refreshSecret || config.jwt.refreshSecret === 'your-refresh-secret-key') {
        errors.push('JWT_REFRESH_SECRET must be set and changed from default');
    }
    
    if (config.env === 'production') {
        if (!config.supabase) {
            errors.push('SUPABASE configuration is required in production');
        }
        
        if (config.rateLimit.maxRequests > 1000) {
            console.warn('⚠️ Rate limit maxRequests is very high in production');
        }
    }
    
    if (errors.length > 0) {
        console.error('❌ Configuration Validation Errors:');
        errors.forEach(err => console.error(`   - ${err}`));
        if (config.env === 'production') {
            throw new Error('Invalid configuration - cannot start in production');
        }
    } else {
        console.log('✅ Configuration validated successfully');
    }
}

// Run validation
validateConfig();

export default config;

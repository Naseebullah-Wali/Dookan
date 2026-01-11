// Start with immediate logging
console.log('🔧 Backend starting...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('PORT env:', process.env.PORT);

import App from './core/app';
// Cleanup service disabled temporarily
// import { accountCleanup } from './services/accountCleanup';

// Global error handlers for unhandled errors
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('❌ Unhandled Promise Rejection:', {
        reason,
        promise,
        timestamp: new Date().toISOString(),
        stack: reason?.stack || 'No stack trace available'
    });
    // Log but don't exit - try to keep server alive
});

process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', {
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack
    });
    // Must exit for uncaught exceptions
    process.exit(1);
});

// Start the application (Supabase is used as the primary datastore)
function initializeApp() {
    try {
        console.log('📦 Creating App instance...');
        // Create and start server
        const app = new App();
        console.log('✅ App instance created');
        app.listen();
        console.log('✅ Server listening');
        
        // Account cleanup service disabled temporarily
        // accountCleanup.init();
        
    } catch (error: any) {
        console.error('❌ Failed to initialize app:', error?.message || error);
        console.error(error?.stack);
        process.exit(1);
    }
}

// Start the application
console.log('🚀 Calling initializeApp...');
initializeApp();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

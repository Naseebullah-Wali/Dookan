import App from './core/app';

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
    // Create and start server
    const app = new App();
    app.listen();
}

// Start the application
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

import App from './core/app';

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

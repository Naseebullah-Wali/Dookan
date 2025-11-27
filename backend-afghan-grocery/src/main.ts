import App from './core/app';
import DatabaseConnection from './db/connection';
import initializeDatabase from './db/schema';
import seedDatabase from './db/seed';

// Initialize database
async function initializeApp() {
    try {
        await DatabaseConnection.getInstance();
        await initializeDatabase();
        await seedDatabase();
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }

    // Create and start server
    const app = new App();
    app.listen();
}

// Start the application
initializeApp();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    DatabaseConnection.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    DatabaseConnection.close();
    process.exit(0);
});

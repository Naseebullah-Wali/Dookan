import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import config from '../config';

class DatabaseConnection {
    private static instance: Database | null = null;

    private constructor() { }

    public static async getInstance(): Promise<Database> {
        if (!DatabaseConnection.instance) {
            // Ensure the database directory exists
            const dbDir = path.dirname(config.db.path);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Create database connection
            DatabaseConnection.instance = await open({
                filename: config.db.path,
                driver: sqlite3.Database
            });

            // Enable foreign keys
            await DatabaseConnection.instance.exec('PRAGMA foreign_keys = ON');

            // Set journal mode to WAL for better concurrency
            await DatabaseConnection.instance.exec('PRAGMA journal_mode = WAL');

            console.log('✅ Database connected successfully');
        }

        return DatabaseConnection.instance;
    }

    public static async close(): Promise<void> {
        if (DatabaseConnection.instance) {
            await DatabaseConnection.instance.close();
            DatabaseConnection.instance = null;
            console.log('Database connection closed');
        }
    }
}

export default DatabaseConnection;

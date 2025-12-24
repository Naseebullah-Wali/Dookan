// SQLite support removed. This stub exists to make leftover imports fail loudly.
class DatabaseConnection {
    public static async getInstance(): Promise<any> {
        throw new Error('SQLite support has been removed. Migrate this model to Supabase.');
    }

    public static async close(): Promise<void> {
        return;
    }
}

export default DatabaseConnection;

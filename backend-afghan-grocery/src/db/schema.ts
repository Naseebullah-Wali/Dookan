// Schema initialization for SQLite has been removed.
// The application now uses Supabase (Postgres). Create database schema
// and seed data using the provided SQL file:
// afghan-grocery-vue/supabase-add-news-testimonials.sql
// or use the Supabase dashboard to run the SQL migration.
console.error('Schema initialization script removed. Use Supabase SQL script instead.');
export const initializeDatabase = async (): Promise<void> => {
  throw new Error('Schema initialization is deprecated. Use Supabase.');
};

export default initializeDatabase;

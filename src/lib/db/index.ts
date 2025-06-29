import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Initialize Better-SQLite3 database. DATABASE_URL should point to a file path, e.g. ".data/db.sqlite".
const dbFilePath = (process.env.DATABASE_URL as string) || './sqlite.db';

const sqlite = new Database(dbFilePath);

// Create Drizzle instance wired up with our table schema.
export const db = drizzle(sqlite, {
  schema,
});

export { schema }; 
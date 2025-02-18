import { Pool } from 'pg';
import dotenv from 'dotenv'; // import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { getDbConnectionString } from '../utils/database';

dotenv.config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || '5432', 10),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

// Initialize drizzle using the pool instance
export const db = drizzle(pool);

export async function closeDB() {
    await pool.end();
}
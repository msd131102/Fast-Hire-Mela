import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query('DROP VIEW IF EXISTS active_jobs_view CASCADE;');
  await pool.query('DROP VIEW IF EXISTS visible_jobs CASCADE;');
  console.log('Dropped job views');
  await pool.end();
}

main().catch(console.error);

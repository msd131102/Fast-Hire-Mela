import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const pool = new Pool({
  connectionString: 'postgresql://postgres:Shiva1311@db.qtiwyriyuonuahulnkrb.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query(`
    CREATE OR REPLACE VIEW visible_jobs AS
    SELECT *
    FROM jobs
    WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW());
  `);
  console.log('Created visible_jobs view');
  await pool.end();
}

main().catch(console.error);

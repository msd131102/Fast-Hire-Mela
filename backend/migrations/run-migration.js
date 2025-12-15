import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running migration: create_active_jobs_view.sql');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create_active_jobs_view.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute migration
    await query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 View "visible_jobs" has been created with indexes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

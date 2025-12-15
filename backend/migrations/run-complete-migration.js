import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCompleteMigration() {
  try {
    console.log('🔄 Step 1: Adding posted_by column to jobs table...');
    
    // Read and execute the column addition
    const columnSql = fs.readFileSync(path.join(__dirname, 'add_posted_by_column.sql'), 'utf8');
    await query(columnSql);
    console.log('✅ posted_by column added successfully!');
    
    console.log('🔄 Step 2: Creating visible_jobs view...');
    
    // Read and execute the view creation
    const viewSql = fs.readFileSync(path.join(__dirname, 'create_active_jobs_view.sql'), 'utf8');
    await query(viewSql);
    console.log('✅ visible_jobs view created successfully!');
    
    console.log('🎉 Complete migration finished successfully!');
    console.log('📊 Database view "visible_jobs" now enforces job visibility rules');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runCompleteMigration();

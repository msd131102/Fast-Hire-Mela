import { query } from '../config/database.js';
import { generateJobSlug, generateUniqueSlug } from '../utils/slugGenerator.js';

/**
 * Script to backfill slugs for existing jobs
 */
async function backfillJobSlugs() {
  try {
    console.log('Starting slug backfill process...');
    
    // Get all jobs without slugs
    const jobsWithoutSlugs = await query(
      'SELECT id, title, company_name FROM jobs WHERE slug IS NULL OR slug = \'\''
    );
    
    console.log(`Found ${jobsWithoutSlugs.rows.length} jobs without slugs`);
    
    for (const job of jobsWithoutSlugs.rows) {
      try {
        // Generate base slug
        const baseSlug = generateJobSlug(job.title, job.company_name);
        
        // Generate unique slug
        const slug = await generateUniqueSlug(baseSlug, async (slugToCheck) => {
          const result = await query('SELECT id FROM jobs WHERE slug = $1', [slugToCheck]);
          return result.rows.length > 0;
        });
        
        // Update job with slug
        await query(
          'UPDATE jobs SET slug = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [slug, job.id]
        );
        
        console.log(`Updated job ${job.id}: "${job.title}" -> slug: "${slug}"`);
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
      }
    }
    
    console.log('Slug backfill process completed!');
    
    // Verify results
    const jobsWithSlugs = await query(
      'SELECT COUNT(*) as count FROM jobs WHERE slug IS NOT NULL AND slug != \'\''
    );
    
    console.log(`Total jobs with slugs: ${jobsWithSlugs.rows[0].count}`);
    
  } catch (error) {
    console.error('Error in slug backfill process:', error);
  }
}

// Run the script if this file is executed directly
if (process.argv[1] && process.argv[1].includes('backfillSlugs.js')) {
  backfillJobSlugs();
}

export default backfillJobSlugs;

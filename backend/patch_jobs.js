import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToPatch = [
  path.join(__dirname, 'routes/jobs.js'),
  path.join(__dirname, 'routes/admin-jobs.js'),
  path.join(__dirname, 'models/Job.js')
];

filesToPatch.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');

  // Replace SELECT fields
  content = content.replace(/j\.company_name,?/g, '');
  content = content.replace(/j\.company_logo,?/g, '');
  content = content.replace(/c\.name as category_name,/g, 'c.name as category_name, co.name as company_name, co.logo_url as company_logo,');

  // Replace WHERE clauses
  content = content.replace(/j\.company_name/g, 'co.name');
  content = content.replace(/j\.company_logo/g, 'co.logo_url');

  // Replace ORDER BY j.${sortField} logic if it exists
  content = content.replace(/ORDER BY j\.\$\{sortField\}/g, "ORDER BY ${sortField === 'company_name' ? 'co.name' : 'j.' + sortField}");
  content = content.replace(/ORDER BY j\.\$\{sort_by\}/g, "ORDER BY ${sort_by === 'company_name' ? 'co.name' : 'j.' + sort_by}");

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Patched ${file}`);
});

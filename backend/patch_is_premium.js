import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'generated') {
        filelist = walkSync(path.join(dir, file), filelist);
      }
    }
    else {
      if (file.endsWith('.js')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const allJsFiles = walkSync(path.join(__dirname));

allJsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We are stripping 'is_premium' and 'premium_expiry' from raw SELECTs
  content = content.replace(/is_premium\s*,\s*premium_expiry\s*,/g, '');
  content = content.replace(/,\s*is_premium\s*,\s*premium_expiry/g, '');
  content = content.replace(/is_premium\s*,\s*premium_expiry/g, '');
  
  content = content.replace(/is_premium\s*,/g, '');
  content = content.replace(/,\s*is_premium/g, '');

  content = content.replace(/premium_plan_id\s*,/g, '');
  content = content.replace(/,\s*premium_plan_id/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched is_premium in ${file}`);
  }
});

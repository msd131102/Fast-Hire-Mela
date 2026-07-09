import fs from 'fs';
const files = ['routes/referrals.js', 'routes/payments.js', 'routes/analytics.js', 'routes/admin-analytics.js', 'config/database.js', 'controllers/payments.js']; 
files.forEach(f => { 
  if (fs.existsSync(f)) { 
    let c = fs.readFileSync(f, 'utf8'); 
    c = c.replace(/import\s*\{\s*PrismaClient\s*\}\s*from\s*['"]@prisma\/client['"];/g, "import pkgPrisma from '@prisma/client';\nconst { PrismaClient } = pkgPrisma;"); 
    fs.writeFileSync(f, c); 
    console.log('patched ' + f); 
  } 
});

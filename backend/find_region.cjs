const { Pool } = require('pg');

const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-east-1', 'ap-south-1', 'ap-northeast-1', 'ap-northeast-2',
  'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2',
  'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'eu-west-3', 'eu-north-1', 'eu-south-1', 'sa-east-1',
  'af-south-1', 'me-south-1'
];

async function checkRegion(region) {
  const connectionString = `postgresql://postgres.qtiwyriyuonuahulnkrb:Shiva1311@aws-1-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  
  try {
    const res = await pool.query('SELECT 1 as result');
    if (res.rows[0].result === 1) {
      console.log(`\n\nSUCCESS! Found region: ${region}`);
      return region;
    }
  } catch (error) {
    if (error.message.includes('tenant/user') || error.message.includes('ENOTFOUND')) {
      process.stdout.write('.');
    } else if (error.message.includes('password')) {
      console.log(`\nFound region ${region}, but wrong password.`);
      return region;
    } else {
      process.stdout.write('x');
    }
  } finally {
    pool.end();
  }
  return null;
}

async function run() {
  console.log('Testing regions...');
  for (const region of regions) {
    const found = await checkRegion(region);
    if (found) {
      process.exit(0);
    }
  }
  console.log('\nCould not find region.');
}

run();

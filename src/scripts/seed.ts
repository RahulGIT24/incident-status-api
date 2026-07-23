import fs from 'fs';
import path from 'path';
import { pool } from '../db';

async function seed() {
  const sql = fs.readFileSync(path.join(__dirname, '../../migrations/seed.sql'), 'utf8');
  await pool.query(sql);
  console.log('Seeded incidents table.');
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

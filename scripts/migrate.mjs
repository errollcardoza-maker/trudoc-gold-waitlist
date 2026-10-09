// Applies db/migrations/*.sql in order against DATABASE_URL.
// Usage: DATABASE_URL=postgres://... npm run db:migrate
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}
const sql = neon(url);
const dir = join(import.meta.dirname, '..', 'db', 'migrations');

for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
  const statements = readFileSync(join(dir, file), 'utf8')
    .split(/;\s*$/m)
    .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
    .filter(Boolean);
  for (const s of statements) await sql.query(s);
  console.log(`applied ${file} (${statements.length} statements)`);
}

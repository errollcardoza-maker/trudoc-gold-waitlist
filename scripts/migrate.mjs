// Applies lib/schema.ts against DATABASE_URL. The app also does this itself on a cold start,
// so this is only needed to prepare a database ahead of time.
// Usage: DATABASE_URL=postgres://... npm run db:migrate   (Node 22.18+/24 for .ts type stripping)
import { neon } from '@neondatabase/serverless';
import { SCHEMA_STATEMENTS } from '../lib/schema.ts';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}
const sql = neon(url);
for (const s of SCHEMA_STATEMENTS) await sql.query(s);
console.log(`applied ${SCHEMA_STATEMENTS.length} statements`);

// Helper for the scheduled Claude task that copies signups into the Google Sheet via the Sheets connector.
//
//   npm run -s sheet-sync -- pending          → JSON: signups not yet in the sheet, as ready-to-write rows
//   npm run -s sheet-sync -- mark <id> [...]  → marks those signups as copied
//
// Talks to the site's private /api/sheet-sync endpoint using SHEET_SYNC_TOKEN from .env.local
// (git-ignored). SHEET_SYNC_BASE_URL overrides the site (default: production).
const base = process.env.SHEET_SYNC_BASE_URL || 'https://trudoc-gold-waitlist.vercel.app';
const token = process.env.SHEET_SYNC_TOKEN;
if (!token) {
  console.error('SHEET_SYNC_TOKEN is not set in .env.local');
  process.exit(2);
}

const call = async (method, body) => {
  const res = await fetch(`${base}/api/sheet-sync`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    console.error(`sheet-sync ${method} failed: HTTP ${res.status} ${JSON.stringify(json)}`);
    process.exit(1);
  }
  return json;
};

const [cmd, ...ids] = process.argv.slice(2);
if (cmd === 'pending') console.log(JSON.stringify(await call('GET'), null, 2));
else if (cmd === 'mark' && ids.length) console.log(JSON.stringify(await call('POST', { ids })));
else {
  console.error('usage: npm run -s sheet-sync -- pending | mark <id> [...]');
  process.exit(1);
}

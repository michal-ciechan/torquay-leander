// Refreshes src/data/trophies-fallback.json from the club's OneDrive "Missing
// Trophies" sheet. The site reads the sheet live at build time; this snapshot is
// only what the build falls back to if OneDrive can't be reached.
//   npm run sync:trophies
import { writeFile } from 'node:fs/promises';
import { fetchTrophySheet, SHEET_URL } from '../src/data/trophies-feed.mjs';

const events = await fetchTrophySheet();
const out = new URL('../src/data/trophies-fallback.json', import.meta.url);
const snapshot = {
  about: 'Backup copy of the club\'s "Missing Trophies" sheet, used by the Club Championships page only if the live sheet cannot be read at build time (src/data/trophies.mjs).',
  source: SHEET_URL,
  refresh: 'npm run sync:trophies (scripts/sync-trophies.mjs), then commit this file',
  updated: new Date().toISOString().slice(0, 10),
  events,
};
await writeFile(out, JSON.stringify(snapshot, null, 2) + '\n');
const needed = events.filter((e) => /^no trophy$/i.test(e.trophy)).length;
console.log(`${events.length} events, ${needed} still need a trophy -> src/data/trophies-fallback.json`);

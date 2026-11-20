// Refreshes src/data/trophies-fallback.json from the club's OneDrive "Missing
// Trophies" sheet. The site reads the sheet live at build time; this snapshot is
// only what the build falls back to if OneDrive can't be reached.
//   npm run sync:trophies
import { writeFile } from 'node:fs/promises';
import { fetchTrophySheet } from '../src/data/trophies-feed.mjs';

const events = await fetchTrophySheet();
const out = new URL('../src/data/trophies-fallback.json', import.meta.url);
await writeFile(out, JSON.stringify(events, null, 2) + '\n');
const needed = events.filter((e) => /^no trophy$/i.test(e.trophy)).length;
console.log(`${events.length} events, ${needed} still need a trophy -> src/data/trophies-fallback.json`);

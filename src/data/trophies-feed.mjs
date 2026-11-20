// Reads the club's "Missing Trophies" spreadsheet straight from OneDrive. The sheet
// is shared as a public "anyone with the link" file, so no Microsoft sign-in is
// needed: OneDrive's share API accepts an anonymous "Badger" token for such links.
// Kept dependency-free: an .xlsx is a zip of XML files, and we only need two of them.
import { inflateRawSync } from 'node:zlib';

export const SHEET_URL = 'https://1drv.ms/x/c/f48baab3fa35dd67/IQCD9A1kYg9XR7T6zEduLA67AUKww3XITREioxlRXbWRhEo?e=72kutf';

const EXPECTED_HEADER = ['AGE', 'M/F', 'DISTANCE M', 'STROKE', 'TROPHY NUMBER', 'TROPHY / SPONSOR'];

async function download() {
  const badger = await fetch('https://api-badgerp.svc.ms/v1.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: '5cbed6ac-a083-4e14-b191-b4ba07653de2' }),
  }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`badger token HTTP ${r.status}`))));
  const share = 'u!' + Buffer.from(SHEET_URL).toString('base64url');
  const res = await fetch(`https://my.microsoftpersonalcontent.com/_api/v2.0/shares/${share}/driveitem/content`, {
    headers: { Authorization: `Badger ${badger.token}`, Prefer: 'autoredeem' },
  });
  if (!res.ok) throw new Error(`sheet download HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// Minimal zip reader: central directory -> named entries -> inflate.
function unzip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('not a zip file');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(start, start + size);
    files[name] = () => (method === 8 ? inflateRawSync(data) : data).toString('utf8');
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&');

function readFirstSheet(files) {
  const strings = [];
  const sst = files['xl/sharedStrings.xml']?.() ?? '';
  for (const [, si] of sst.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    strings.push(decode([...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join('')));
  }
  const sheet = files['xl/worksheets/sheet1.xml'];
  if (!sheet) throw new Error('sheet1 missing');
  const rows = [];
  for (const [, body] of sheet().matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const [, attrs, inner] of body.matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const col = attrs.match(/r="([A-Z]+)\d+"/)[1];
      const idx = [...col].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
      const type = attrs.match(/t="(\w+)"/)?.[1];
      let v = inner?.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (type === 'inlineStr') v = inner.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1];
      if (v === undefined) continue;
      row[idx] = type === 's' ? strings[+v] : decode(v);
    }
    rows.push(row);
  }
  return rows;
}

// Returns every row of the sheet as { age, gender, distance, stroke, number, trophy }.
// Throws if the sheet can't be fetched or no longer looks like the trophy list, so
// the caller can fall back to the committed snapshot.
export async function fetchTrophySheet() {
  const rows = readFirstSheet(unzip(await download()));
  const header = (rows[0] ?? []).slice(0, 6).map((h) => String(h ?? '').trim().toUpperCase());
  if (header.join('|') !== EXPECTED_HEADER.join('|')) throw new Error(`unexpected header: ${header.join(', ')}`);
  const events = rows.slice(1)
    .filter((r) => r[0] && r[2] && r[3])
    .map((r) => ({
      age: String(r[0]).trim(),
      gender: String(r[1] ?? '').trim().toUpperCase(),
      distance: Number(r[2]),
      stroke: String(r[3]).trim(),
      number: r[4] == null ? null : String(r[4]).trim(),
      trophy: String(r[5] ?? '').trim(),
    }));
  if (events.length < 100) throw new Error(`only ${events.length} events found`);
  return events;
}

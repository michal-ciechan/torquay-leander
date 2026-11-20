// Club Championship events still needing a trophy, for the "Sponsor a trophy"
// section on the Club Championships page. Read at build time from the club's
// OneDrive sheet (trophies-feed.mjs); the daily scheduled deploy keeps it current,
// so a trophy the club marks as sponsored drops off the site within a day. If the
// sheet can't be read, the build uses trophies-fallback.json (`npm run sync:trophies`).
import fallback from './trophies-fallback.json';
import { fetchTrophySheet } from './trophies-feed.mjs';

const STROKES = { FREE: 'Freestyle', BACK: 'Backstroke', BREAST: 'Breaststroke', FLY: 'Butterfly', IM: 'Individual Medley' };
const STROKE_SHORT = { FREE: 'Free', BACK: 'Back', BREAST: 'Breast', FLY: 'Fly', IM: 'IM' };

// "14 – 15 years" / "14 - 15 years" -> "14–15 years"; "9 & UNDER" -> "9 & under".
function cleanAge(age) {
  return age
    .replace(/\s*[-–—�]\s*/g, '–')
    .replace(/&\s*(UNDER|OVER)/i, (_, w) => `& ${w.toLowerCase()}`)
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadRows() {
  try {
    return await fetchTrophySheet();
  } catch (err) {
    console.warn(`[trophies] using fallback snapshot: ${err.message}`);
    return fallback;
  }
}

export async function loadTrophies() {
  const rows = await loadRows();
  const needed = rows
    .filter((r) => /^no trophy$/i.test(r.trophy))
    .map((r) => {
      const age = cleanAge(r.age);
      const stroke = r.stroke.toUpperCase();
      const g = r.gender === 'F' ? 'F' : 'M';
      return {
        age,
        gender: g === 'F' ? 'Female' : 'Male',
        distance: r.distance,
        stroke: STROKES[stroke] ?? r.stroke,
        strokeKey: STROKE_SHORT[stroke] ?? r.stroke,
        // Same shape as the poster's example ("10-11 F, 200 Backstroke") for the payment note.
        note: `${age.replace(/ years$/, '')} ${g}, ${r.distance} ${STROKES[stroke] ?? r.stroke}`,
      };
    });
  const unique = (xs) => [...new Set(xs)];
  // Rows whose trophy column holds a name rather than "Yes"/"NO TROPHY" are newly sponsored trophies.
  const sponsored = unique(rows.map((r) => r.trophy).filter((t) => t && !/^(yes|no trophy)$/i.test(t)));
  return {
    total: rows.length,
    needed,
    sponsored,
    ages: unique(needed.map((e) => e.age)),
    strokes: unique(['Free', 'Back', 'Breast', 'Fly', 'IM'].filter((s) => needed.some((e) => e.strokeKey === s))),
  };
}

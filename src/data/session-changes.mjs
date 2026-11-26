// Temporary changes to the normal training timetable (holidays, galas, county
// championships). Shown on the Training page (three small month calendars plus a
// list of the changes) and as a banner on the home page.
// Each change drops off once it has passed; the daily scheduled deploy (05:00 UTC)
// rebuilds the site, so nothing needs removing by hand. When nothing is left the
// panel and the banner disappear. Every other day follows the normal timetable
// (training-timetable.mjs).
import { trainingDays } from './training-timetable.mjs';

export const notice = {
  title: 'Christmas & upcoming session changes',
  poster: 'notices/christmas-session-changes-2026.jpg',
};

// Runs of days with no training at all (inclusive). Single-date changes inside a
// break (the Plymouth session) take precedence on the calendar.
export const breaks = [
  {
    from: '2026-12-20', to: '2027-01-03',
    what: 'Christmas break', why: 'No training until Monday 4 January',
    note: 'Except the Plymouth session on Sunday 27 December',
  },
];

// kind: 'info' (a key date, session on), 'off' (no training), 'partial' (some sessions off)
export const changes = [
  { date: '2026-12-19', kind: 'info', what: 'Last training session', why: 'Before Christmas' },
  { date: '2026-12-27', kind: 'info', what: 'Plymouth Life Centre', why: 'Training 8:00–10:00am' },
  { date: '2027-01-04', kind: 'info', what: 'First session back', why: 'Normal timetable resumes' },
  { date: '2027-01-09', kind: 'off', what: 'No training', why: 'Relays on Sunday' },
  { date: '2027-01-15', kind: 'off', what: 'No training at all', why: 'Club Champs Presentation Night' },
  { date: '2027-01-22', kind: 'partial', what: 'No training 7–8pm', why: 'Counties', note: 'Development (6–7pm) runs as normal' },
  { date: '2027-01-23', kind: 'off', what: 'No training', why: 'Counties' },
  { date: '2027-01-29', kind: 'partial', what: 'No training 7–8pm', why: 'Counties', note: 'Development (6–7pm) runs as normal' },
  { date: '2027-01-30', kind: 'off', what: 'No training', why: 'Counties' },
  { date: '2027-02-05', kind: 'partial', what: 'No training 7–8pm', why: 'Counties', note: 'Development (6–7pm) runs as normal' },
  { date: '2027-02-06', kind: 'off', what: 'No training', why: 'Counties' },
];

const utc = (iso) => new Date(`${iso}T00:00:00Z`);
const f = (opts) => new Intl.DateTimeFormat('en-GB', { ...opts, timeZone: 'UTC' });
const fmtMonShort = f({ month: 'short' });
const fmtMonthYear = f({ month: 'long', year: 'numeric' });
const fmtWeekday = f({ weekday: 'long' });
const fmtWdShort = f({ weekday: 'short' });
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const todayIso = (now) => now.toLocaleDateString('en-CA', { timeZone: 'Europe/London' }); // YYYY-MM-DD

// Upcoming items (changes and breaks) for the list, oldest first, grouped by month.
export function upcomingChanges(now = new Date()) {
  const today = todayIso(now);
  const items = [
    ...changes.filter((c) => c.date >= today).map((c) => {
      const d = utc(c.date);
      return { ...c, id: `change-${c.date}`, sort: c.date, month: fmtMonthYear.format(d),
        tile: { top: fmtMonShort.format(d), big: String(d.getUTCDate()), bottom: fmtWdShort.format(d) } };
    }),
    ...breaks.filter((b) => b.to >= today).map((b) => {
      const a = utc(b.from), z = utc(b.to);
      const days = Math.round((z - a) / 864e5) + 1;
      return { ...b, kind: 'break', id: `change-${b.from}`, sort: b.from, month: fmtMonthYear.format(a),
        tile: { top: `${fmtMonShort.format(a)}–${fmtMonShort.format(z)}`, big: `${a.getUTCDate()}–${z.getUTCDate()}`,
          bottom: days % 7 === 0 ? `${days / 7} wks` : `${days} days`, range: true } };
    }),
  ].sort((x, y) => x.sort.localeCompare(y.sort));
  const groups = [];
  for (const it of items) {
    if (groups.at(-1)?.month !== it.month) groups.push({ month: it.month, items: [] });
    groups.at(-1).items.push(it);
  }
  return { items, groups };
}

// Small month calendars covering the upcoming changes. Each day is one of
// change kinds ('info' | 'off' | 'partial'), 'break', 'normal' (normal timetable)
// or 'rest' (no sessions that weekday); `past` days are dimmed.
export function changeCalendars(now = new Date()) {
  const { items } = upcomingChanges(now);
  if (!items.length) return [];
  const today = todayIso(now);
  const byDate = Object.fromEntries(changes.map((c) => [c.date, c]));
  const breakFor = (d) => breaks.find((b) => d >= b.from && d <= b.to);
  const start = utc(items[0].sort);
  const last = items.map((i) => i.to ?? i.date).sort().at(-1);
  const end = utc(last);
  const months = [];
  for (let y = start.getUTCFullYear(), m = start.getUTCMonth();
    y < end.getUTCFullYear() || (y === end.getUTCFullYear() && m <= end.getUTCMonth());
    m === 11 ? (y++, m = 0) : m++) {
    const first = new Date(Date.UTC(y, m, 1));
    const n = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const days = [];
    for (let d = 1; d <= n; d++) {
      const key = iso(y, m, d);
      const change = byDate[key];
      const brk = breakFor(key);
      const kind = change?.kind ?? (brk ? 'break' : trainingDays.has(fmtWeekday.format(utc(key))) ? 'normal' : 'rest');
      const href = change ? `#change-${key}` : brk ? `#change-${brk.from}` : null;
      const title = change ? `${change.what}${change.why ? ` (${change.why})` : ''}` : brk ? brk.what : kind === 'normal' ? 'Normal training' : 'No sessions';
      days.push({ d, key, kind, href, title, past: key < today });
    }
    months.push({ title: fmtMonthYear.format(first), blanks: (first.getUTCDay() + 6) % 7, days });
  }
  return months;
}

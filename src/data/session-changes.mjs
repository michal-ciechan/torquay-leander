// Temporary changes to the normal training timetable (holidays, galas, county
// championships). Shown on the Training page and as a banner on the home page.
// Each date drops off once it has passed; the daily scheduled deploy (05:00 UTC)
// rebuilds the site, so nothing needs removing by hand. When the list is empty
// the panel and the banner disappear.
export const notice = {
  title: 'Christmas & upcoming session changes',
  poster: 'notices/christmas-session-changes-2026.jpg',
  posterAlt: 'Torquay Leander Christmas and upcoming session changes poster',
};

// kind: 'info' (a session on / back), 'off' (no training), 'partial' (some sessions off)
export const changes = [
  { date: '2026-12-19', kind: 'info', what: 'Last training session before Christmas' },
  { date: '2026-12-27', kind: 'info', what: 'Training at Plymouth Life Centre, 8:00–10:00am' },
  { date: '2027-01-04', kind: 'info', what: 'First session back' },
  { date: '2027-01-09', kind: 'off', what: 'No training', why: 'Relays on Sunday' },
  { date: '2027-01-15', kind: 'off', what: 'No training at all', why: 'Club Champs Presentation Night' },
  { date: '2027-01-22', kind: 'partial', what: 'No training 7–8pm', why: 'Counties', note: 'Development (6–7pm) runs as normal' },
  { date: '2027-01-23', kind: 'off', what: 'No training', why: 'Counties' },
  { date: '2027-01-29', kind: 'partial', what: 'No training 7–8pm', why: 'Counties', note: 'Development (6–7pm) runs as normal' },
  { date: '2027-01-30', kind: 'off', what: 'No training', why: 'Counties' },
  { date: '2027-02-05', kind: 'partial', what: 'No training 7–8pm', why: 'Counties', note: 'Development (6–7pm) runs as normal' },
  { date: '2027-02-06', kind: 'off', what: 'No training', why: 'Counties' },
];

const fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

// Changes from today (UK date) onwards, with a display date.
export function upcomingChanges(now = new Date()) {
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Europe/London' }); // YYYY-MM-DD
  return changes
    .filter((c) => c.date >= today)
    .map((c) => ({ ...c, label: fmt.format(new Date(`${c.date}T00:00:00Z`)) }));
}

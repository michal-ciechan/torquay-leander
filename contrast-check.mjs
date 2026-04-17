// WCAG 2.1 contrast audit for samples/site colour pairs.
// Usage: node contrast-check.mjs

const parseColor = (c) => {
  c = c.trim().toLowerCase();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    const full = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
    return [parseInt(full.slice(0,2),16), parseInt(full.slice(2,4),16), parseInt(full.slice(4,6),16), 1];
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map(s => parseFloat(s.trim()));
    return [parts[0], parts[1], parts[2], parts.length === 4 ? parts[3] : 1];
  }
  throw new Error(`Cannot parse: ${c}`);
};

// Alpha-composite fg over bg (both assumed opaque bg)
const composite = (fg, bg) => {
  const [fr,fg_,fb,fa] = fg;
  const [br,bg_,bb] = bg;
  return [
    Math.round(fr*fa + br*(1-fa)),
    Math.round(fg_*fa + bg_*(1-fa)),
    Math.round(fb*fa + bb*(1-fa)),
    1,
  ];
};

// sRGB relative luminance
const lum = ([r,g,b]) => {
  const f = (c) => {
    c = c/255;
    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  };
  return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b);
};

const ratio = (fg, bg) => {
  const fgSolid = fg[3] < 1 ? composite(fg, bg) : fg;
  const L1 = lum(fgSolid), L2 = lum(bg);
  const [a,b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
};

const grade = (r, large=false) => {
  const aa = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;
  if (r >= aaa) return 'AAA';
  if (r >= aa) return 'AA';
  return 'FAIL';
};

// Pairs from samples/site (fg, bg, label, optional `large` for >=18pt or >=14pt bold)
const pairs = [
  // NAV
  ['#ffffff',                '#dc2626', 'Nav link text on red nav'],
  ['#ffffff',                '#000000', 'Nav CTA "Free Trial" (white on black)'],
  ['#dc2626',                '#ffffff', 'Nav "Members Login" (red on white pill)'],
  // HERO
  ['#ffffff',                '#0a0a0a', 'Hero H1 (white on black)', true],
  ['rgba(255,255,255,0.75)', '#0a0a0a', 'Hero body paragraph'],
  ['#f87171',                '#23090a', 'Hero badge text (light-red on red-tinted overlay ~ near-black)'],
  // STATS (red band)
  ['#ffffff',                '#dc2626', 'Stats number (white on red)', true],
  ['#ffffff',                '#dc2626', 'Stats label (white on red)'],
  // SPONSORS header
  ['#dc2626',                '#ffffff', 'Sponsors "Our Sponsors" label (red on white)'],
  // TRUST BAR (new)
  ['#ffffff',                '#dc2626', 'Trust bar item text (white on red)'],
  // ABOUT
  ['#b91c1c',                '#fef2f2', 'About section-label (red-dark on red-light)'],
  ['#1a1a1a',                '#fef2f2', 'About H2 (near-black on red-light)', true],
  ['#525b6e',                '#fef2f2', 'About intro muted text on red-light'],
  ['#525b6e',                '#ffffff', 'Muted paragraph on white (generic)'],
  // PROGRAMS
  ['#b91c1c',                '#fef2f2', 'Program tag (red-dark on red-light chip)'],
  // GALLERY (dark red bg)
  ['#ffffff',                '#9b2020', 'Gallery H2 (white on dark red)', true],
  ['rgba(255,255,255,0.7)',  '#9b2020', 'Gallery label (70% white on dark red)'],
  ['rgba(255,255,255,0.75)', '#9b2020', 'Gallery intro (75% white on dark red)'],
  // JOIN form card (black)
  ['#ffffff',                '#0a0a0a', 'Join form heading (white on black)', true],
  ['rgba(255,255,255,0.7)',  '#0a0a0a', 'Join form lead text'],
  ['#ffffff',                '#0a0a0a', 'Join form input text (white on ~black field)'],
  ['rgba(255,255,255,0.6)',  '#0a0a0a', 'Join form placeholder (60% white on ~black)'],
  // MAP caption card
  ['#1a1a1a',                '#ffffff', 'Map card heading (black on white)', true],
  ['#525b6e',                '#ffffff', 'Map card body (muted on white)'],
  ['#b91c1c',                '#ffffff', '"Open in Google Maps" link (red-dark on white)'],
  // FOOTER
  ['rgba(255,255,255,0.55)', '#0a0a0a', 'Footer brand blurb (55% white)'],
  ['rgba(255,255,255,0.6)',  '#0a0a0a', 'Footer column links (60% white)'],
  ['rgba(255,255,255,0.6)',  '#0a0a0a', 'Footer copyright (60% white)'],
  ['#ffffff',                '#0a0a0a', 'Footer column headings (white, uppercase)'],
];

const rows = pairs.map(([fg, bg, label, large]) => {
  const r = ratio(parseColor(fg), parseColor(bg));
  return { label, fg, bg, large: !!large, ratio: r.toFixed(2), grade: grade(r, !!large) };
});

const pad = (s, n) => String(s).padEnd(n);
console.log('\n' + pad('Where', 54) + pad('Ratio', 8) + pad('Size', 8) + 'WCAG');
console.log('-'.repeat(74));
for (const row of rows) {
  console.log(
    pad(row.label, 54) +
    pad(row.ratio + 'x', 8) +
    pad(row.large ? 'large' : 'normal', 8) +
    row.grade
  );
}

const fails = rows.filter(r => r.grade === 'FAIL');
const aaOnly = rows.filter(r => r.grade === 'AA');
const aaa = rows.filter(r => r.grade === 'AAA');
console.log('\nSummary:');
console.log(`  AAA: ${aaa.length}   AA: ${aaOnly.length}   FAIL: ${fails.length}`);
if (fails.length) {
  console.log('\nFailing pairs (below WCAG AA):');
  fails.forEach(f => console.log(`  - ${f.label}  (${f.ratio}x)`));
}

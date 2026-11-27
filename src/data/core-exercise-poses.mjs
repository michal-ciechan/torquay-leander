// Cartoon swimmer frames for the Dry-Land Core Training page: 3 frames per exercise.
// Coordinates sit in a 120-wide box; the floor is y = 72 (each exercise crops via viewBoxes).
//
// A frame: head, neck (shoulders), hip, arms [{ p: [elbow, hand], far?, move?, from? }],
// legs [{ p: [knee, foot], far?, move?, from? }], optional shoulders/hips (front view: arms/legs
// start there instead of neck/hip), moveTorso, face (1 = default facing, -1 = flipped, 0 = front:
// two eyes), legsFront (front view: legs drawn over the torso), floor (false hides it) and props:
// ball (medicine ball), bell (dumbbell), arrow (SVG path), guide (dashed line), text.

const A = (elbow, hand, o = {}) => ({ p: [elbow, hand], ...o });

// ---------- drawing ----------
const C = {
  line: '#3b2a20', skin: '#f6c9a3', skinFar: '#d9a67e', shirt: '#18181b', shirtFar: '#52525b',
  shorts: '#dc2626', shortsFar: '#f08a8a', cap: '#dc2626', glow: '#fde047',
};
const W = { torso: 12, upperArm: 6, foreArm: 5.2, thigh: 8, shin: 6.4, outline: 2.6 };
const f1 = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const seg = (a, b, w, col, extra = '') =>
  `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"${extra}/>`;

function limb(start, [mid, end], kind, far) {
  const [w1, w2] = kind === 'arm' ? [W.upperArm, W.foreArm] : [W.thigh, W.shin];
  const skin = far ? C.skinFar : C.skin;
  const cloth = kind === 'arm' ? (far ? C.shirtFar : C.shirt) : (far ? C.shortsFar : C.shorts);
  const clothTo = lerp(start, mid, kind === 'arm' ? 0.42 : 0.62);
  return [
    seg(start, mid, w1 + W.outline, C.line), seg(mid, end, w2 + W.outline, C.line),
    seg(start, mid, w1, skin), seg(mid, end, w2, skin),
    seg(start, clothTo, w1 + 0.4, cloth),
    kind === 'arm' ? `<circle cx="${f1(end[0])}" cy="${f1(end[1])}" r="3.1" fill="${skin}" stroke="${C.line}" stroke-width="1.3"/>` : '',
  ].join('');
}

function glow(start, pts) {
  const all = [start, ...pts].map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');
  return `<polyline points="${all}" fill="none" stroke="${C.glow}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
}

function head(h, neck, face) {
  const r = 7.2;
  let u = [h[0] - neck[0], h[1] - neck[1]];
  const len = Math.hypot(u[0], u[1]) || 1;
  u = [u[0] / len, u[1] / len];
  const perp = [-u[1], u[0]];
  const a = [h[0] + perp[0] * r, h[1] + perp[1] * r];
  const b = [h[0] - perp[0] * r, h[1] - perp[1] * r];
  // Swim cap: the half of the head away from the neck, slightly bigger than the head.
  const capR = r + 0.6;
  const ca = [h[0] + perp[0] * capR, h[1] + perp[1] * capR];
  const cb = [h[0] - perp[0] * capR, h[1] - perp[1] * capR];
  const cap = `<path d="M${f1(ca[0])} ${f1(ca[1])} A${capR} ${capR} 0 0 0 ${f1(cb[0])} ${f1(cb[1])} Z" fill="${C.cap}" stroke="${C.line}" stroke-width="1.3"/>`;
  void a; void b;
  let eyes = '';
  if (face === 0) {
    const y = h[1] + 1.8;
    eyes = `<circle cx="${f1(h[0] - 2.6)}" cy="${f1(y)}" r="1.1" fill="${C.line}"/><circle cx="${f1(h[0] + 2.6)}" cy="${f1(y)}" r="1.1" fill="${C.line}"/>`;
  } else {
    const s = face === -1 ? -1 : 1;
    const dir = [-u[1] * s, u[0] * s]; // the way the face points
    const e = [h[0] + dir[0] * 3.6 - u[0] * 0.6, h[1] + dir[1] * 3.6 - u[1] * 0.6];
    eyes = `<circle cx="${f1(e[0])}" cy="${f1(e[1])}" r="1.2" fill="${C.line}"/>`;
  }
  return `<circle cx="${f1(h[0])}" cy="${f1(h[1])}" r="${r}" fill="${C.skin}" stroke="${C.line}" stroke-width="1.4"/>${cap}${eyes}`;
}

function prop(p, id) {
  if (p.type === 'ball') {
    const [x, y] = p.at;
    return `<circle cx="${x}" cy="${y}" r="7" fill="#9a3412" stroke="${C.line}" stroke-width="1.4"/><path d="M${x - 6.5} ${y} Q${x} ${y - 3.5} ${x + 6.5} ${y}" fill="none" stroke="#fdba74" stroke-width="1.1"/>`;
  }
  if (p.type === 'bell') {
    const [x, y] = p.at;
    const col = p.far ? '#9ca3af' : '#334155';
    return `<line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}" stroke="${col}" stroke-width="2.4"/><rect x="${x - 3}" y="${y - 8.5}" width="6" height="4.5" rx="1.2" fill="${col}"/><rect x="${x - 3}" y="${y + 4}" width="6" height="4.5" rx="1.2" fill="${col}"/>`;
  }
  if (p.type === 'arrow') return `<path d="${p.d}" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round" marker-end="url(#${id})"/>`;
  if (p.type === 'guide') return `<path d="${p.d}" fill="none" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="3 3"/>`;
  if (p.type === 'text') return `<text x="${p.at[0]}" y="${p.at[1]}" font-size="9" font-weight="800" fill="#dc2626" text-anchor="middle" letter-spacing="1">${p.text.toUpperCase()}</text>`;
  return '';
}

export function renderFrame(f, id) {
  const out = [];
  out.push(`<defs><marker id="${id}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#dc2626"/></marker></defs>`);
  if (f.floor !== false) out.push(`<line x1="2" y1="${72 + 4.2}" x2="118" y2="${72 + 4.2}" stroke="#cbd5e1" stroke-width="2"/>`);
  for (const p of f.props) if (p.type === 'guide') out.push(prop(p, id));

  const armStart = (a, i) => a.from ?? (f.shoulders ? f.shoulders[i] : f.neck);
  const legStart = (l, i) => l.from ?? (f.hips ? f.hips[i] : f.hip);

  // Highlighter glow behind whatever moves.
  if (f.moveTorso) out.push(glow(f.neck, [f.hip]));
  f.arms.forEach((a, i) => a.move && out.push(glow(armStart(a, i), a.p)));
  f.legs.forEach((l, i) => l.move && out.push(glow(legStart(l, i), l.p)));

  const drawLegs = (far) => f.legs.forEach((l, i) => !!l.far === far && out.push(limb(legStart(l, i), l.p, 'leg', far)));
  const drawArms = (far) => f.arms.forEach((a, i) => !!a.far === far && out.push(limb(armStart(a, i), a.p, 'arm', far)));

  drawArms(true);
  drawLegs(true);
  if (!f.legsFront) drawLegs(false);
  // Torso: t-shirt with outline, shorts over the hips.
  const top = f.shoulders ? [(f.shoulders[0][0] + f.shoulders[1][0]) / 2, f.neck[1]] : f.neck;
  out.push(seg(top, f.hip, W.torso + W.outline, C.line), seg(top, f.hip, W.torso, C.shirt));
  if (f.shoulders) out.push(seg(f.shoulders[0], f.shoulders[1], 7 + W.outline, C.line), seg(f.shoulders[0], f.shoulders[1], 7, C.shirt));
  const hipBand = lerp(f.hip, top, 0.18);
  out.push(seg(hipBand, f.hip, W.torso, C.shorts));
  if (f.legsFront) drawLegs(false);
  out.push(head(f.head, f.neck, f.face ?? 1));
  drawArms(false);
  for (const p of f.props) if (p.type !== 'guide') out.push(prop(p, id));
  return out.join('');
}

// ---------- poses ----------
const mx = ([x, y]) => [120 - x, y];
const mirror = (f, extra = {}) => ({
  ...f,
  head: mx(f.head), neck: mx(f.neck), hip: mx(f.hip),
  shoulders: f.shoulders && f.shoulders.map(mx).reverse(),
  hips: f.hips && f.hips.map(mx).reverse(),
  arms: f.arms.map((a) => ({ ...a, p: a.p.map(mx) })).reverse(),
  legs: f.legs.map((l) => ({ ...l, p: l.p.map(mx) })).reverse(),
  props: [],
  ...extra,
});

const forearmDown = A([86, 71], [98, 71]);
const plankUp = { head: [95, 52], neck: [86, 58], hip: [56, 63.5], legs: [A([38, 66.8], [20, 70])] };

const sidePlankUp = {
  cap: 'Lift hips: head to feet in line',
  ...plankUp,
  arms: [A([86, 71], [95, 71]), A([86, 46], [86, 35], { move: true })],
  moveTorso: true,
  props: [{ type: 'arrow', d: 'M50 54 L50 42' }],
};

const twistBase = {
  head: [60, 35], neck: [60, 43], hip: [60, 66], legsFront: true, floor: false, face: 0,
  hips: [[55, 67], [65, 67]],
  legs: [A([49, 53], [45, 71]), A([71, 53], [75, 71])],
};
const twistLeft = {
  ...twistBase,
  cap: 'Turn to one side',
  head: [57, 36],
  shoulders: [[53, 46], [64, 46]],
  arms: [A([45, 53], [39, 57], { move: true }), A([51, 55], [41, 59], { move: true })],
  props: [{ type: 'ball', at: [34, 57] }, { type: 'arrow', d: 'M64 25 Q48 18 38 36' }],
};

export const poses = {
  'Prone Bridge (Plank)': [
    { cap: 'Forearms and knees down', head: [95, 52], neck: [86, 58], hip: [58, 56], arms: [forearmDown], legs: [A([46, 71], [28, 71])], props: [] },
    { cap: 'Lift hips and knees', ...plankUp, arms: [forearmDown], moveTorso: true, legs: [A([38, 66.8], [20, 70], { move: true })], props: [{ type: 'arrow', d: 'M50 54 L50 42' }] },
    { cap: 'Hold a straight line', ...plankUp, arms: [forearmDown], props: [{ type: 'guide', d: 'M12 71.5 L106 54' }, { type: 'text', at: [52, 42], text: 'hold' }] },
  ],
  'Side Bridge (Side Plank)': [
    { cap: 'On your side, on one elbow', head: [95, 56], neck: [86, 62], hip: [56, 68], arms: [A([86, 71], [95, 71]), A([72, 63], [60, 64])], legs: [A([38, 69.5], [20, 70.5])], props: [] },
    sidePlankUp,
    mirror(sidePlankUp, { cap: 'Hold, then swap sides' }),
  ],
  'Bird Dog': [
    { cap: 'Hands and knees, flat back', head: [92, 45], neck: [80, 51], hip: [48, 51],
      arms: [A([80, 61], [80, 71], { far: true }), A([80, 61], [80, 71])], legs: [A([48, 71], [28, 71], { far: true }), A([48, 71], [28, 71])], props: [] },
    { cap: 'Reach opposite arm and leg', head: [92, 45], neck: [80, 51], hip: [48, 51],
      arms: [A([80, 61], [80, 71], { far: true }), A([93, 48], [106, 45], { move: true })],
      legs: [A([34, 50], [20, 49], { far: true, move: true }), A([48, 71], [28, 71])],
      props: [{ type: 'arrow', d: 'M101 36 L113 34' }, { type: 'arrow', d: 'M28 40 L14 40' }] },
    { cap: 'Back in, then swap sides', head: [92, 45], neck: [80, 51], hip: [48, 51],
      arms: [A([93, 48], [106, 45], { far: true, move: true }), A([80, 61], [80, 71])],
      legs: [A([48, 71], [28, 71], { far: true }), A([34, 50], [20, 49], { move: true })], props: [] },
  ],
  'Supine Leg Raise': [
    { cap: 'Lie flat, legs straight', head: [103, 64], neck: [92, 68], hip: [60, 69], face: -1,
      arms: [A([80, 70], [69, 70])], legs: [A([40, 70], [20, 70], { far: true }), A([40, 70], [20, 70])], props: [] },
    { cap: 'Lift one leg to about 75°', head: [103, 64], neck: [92, 68], hip: [60, 69], face: -1,
      arms: [A([80, 70], [69, 70])], legs: [A([40, 70], [20, 70], { far: true }), A([56, 54.5], [52, 40], { move: true })],
      props: [{ type: 'arrow', d: 'M32 63 Q32 45 43 37' }] },
    { cap: 'Lower slowly, switch legs', head: [103, 64], neck: [92, 68], hip: [60, 69], face: -1,
      arms: [A([80, 70], [69, 70])], legs: [A([56, 54.5], [52, 40], { far: true, move: true }), A([40, 70], [20, 70])],
      props: [{ type: 'arrow', d: 'M44 33 Q30 39 30 61' }] },
  ],
  'Overhead Squat': [
    { cap: 'Ball straight overhead', head: [66, 9], neck: [60, 17], hip: [60, 43],
      arms: [A([58, 3], [57, -9])], legs: [A([61, 57.5], [60, 71])], props: [{ type: 'ball', at: [57, -16] }] },
    { cap: 'Squat, chest up', head: [64, 23], neck: [58, 31], hip: [55, 56],
      arms: [A([56, 17], [55, 5])], legs: [A([70, 60], [60, 71], { move: true })],
      props: [{ type: 'ball', at: [55, -2] }, { type: 'arrow', d: 'M94 22 L94 46' }] },
    { cap: 'Low as you can, then stand', head: [61, 28], neck: [55, 36], hip: [56, 61],
      arms: [A([54, 22], [53, 10])], legs: [A([72, 63], [60, 71], { move: true })],
      props: [{ type: 'ball', at: [53, 3] }, { type: 'arrow', d: 'M94 50 L94 26' }] },
  ],
  'Seated Twist': [
    { ...twistBase, cap: 'Sit, knees bent, ball in front', shoulders: [[51, 46], [69, 46]],
      arms: [A([50, 55], [56, 60]), A([70, 55], [64, 60])], props: [{ type: 'ball', at: [60, 60] }] },
    twistLeft,
    mirror(twistLeft, { cap: 'Turn to the other side', props: [{ type: 'ball', at: [86, 57] }, { type: 'arrow', d: 'M56 25 Q72 18 82 36' }] }),
  ],
  'Prone Shoulder Press': [
    { cap: 'Face down, arms overhead', head: [89, 63], neck: [80, 68], hip: [50, 69],
      arms: [A([94, 70], [106, 70])], legs: [A([34, 70], [18, 70])], props: [{ type: 'bell', at: [106, 70] }] },
    { cap: 'Lift one arm', head: [89, 63], neck: [80, 68], hip: [50, 69],
      arms: [A([94, 70], [106, 70], { far: true }), A([93, 62], [105, 56], { move: true })], legs: [A([34, 70], [18, 70])],
      props: [{ type: 'bell', at: [106, 70], far: true }, { type: 'bell', at: [105, 56] }, { type: 'arrow', d: 'M115 66 L115 49' }] },
    { cap: 'Lower, then the other arm', head: [89, 63], neck: [80, 68], hip: [50, 69],
      arms: [A([93, 62], [105, 56], { far: true, move: true }), A([94, 70], [106, 70])], legs: [A([34, 70], [18, 70])],
      props: [{ type: 'bell', at: [105, 56], far: true }, { type: 'bell', at: [106, 70] }] },
  ],
};

// Crop per exercise so lying-down figures aren't lost in empty space (default fits floor work).
export const viewBoxes = {
  'Overhead Squat': '0 -26 120 104',
  'Seated Twist': '10 14 100 64',
};
export const defaultViewBox = '0 26 120 54';

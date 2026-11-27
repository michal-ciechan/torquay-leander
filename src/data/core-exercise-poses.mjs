// Stick-figure frames for the Dry-Land Core Training page: 3 frames per exercise.
// Coordinates are in a 120 x 100 box (viewBox "0 -24 120 100"); the floor is y = 72.
// Each limb is a polyline: cls 'near' (dark), 'far' (grey, the limb behind) or 'move' (red, the
// limb that moves in this frame). Props: ball (medicine ball), bell (dumbbell), arrow (SVG path), text.

const L = (cls, ...pts) => ({ cls, pts });
const mirrorPt = ([x, y]) => [120 - x, y];
const mirror = (f, extra = {}) => ({
  ...f,
  head: mirrorPt(f.head),
  limbs: f.limbs.map((l) => ({ ...l, pts: l.pts.map(mirrorPt) })),
  props: [],
  ...extra,
});

// Prone bridge / side bridge share the straight-line hold.
const plankLine = [L('move', [86, 58], [56, 63.5], [38, 66.8], [20, 70])];

const sidePlankUp = {
  cap: 'Lift hips: head to feet in line',
  head: [95, 52],
  limbs: [
    L('near', [86, 58], [86, 72], [96, 72]),
    ...plankLine,
    L('move', [86, 58], [86, 46], [86, 34]),
  ],
  props: [{ type: 'arrow', d: 'M56 54 L56 42' }],
};

const twistLeft = {
  cap: 'Turn to one side',
  head: [58, 37],
  limbs: [
    L('near', [60, 70], [58, 44]),
    L('near', [54, 46], [64, 46]),
    L('near', [54, 70], [50, 54], [46, 72]),
    L('near', [66, 70], [70, 54], [74, 72]),
    L('move', [54, 46], [46, 54], [40, 57]),
    L('move', [64, 46], [50, 54], [40, 57]),
  ],
  props: [{ type: 'ball', at: [36, 57] }, { type: 'arrow', d: 'M62 28 Q46 22 38 40' }],
  floor: false,
};

export const poses = {
  'Prone Bridge (Plank)': [
    {
      cap: 'Forearms and knees down',
      head: [95, 53],
      limbs: [L('near', [86, 58], [86, 72], [98, 72]), L('near', [86, 58], [58, 56], [46, 72], [28, 72])],
      props: [],
    },
    {
      cap: 'Lift hips and knees',
      head: [95, 54],
      limbs: [L('near', [86, 58], [86, 72], [98, 72]), ...plankLine],
      props: [{ type: 'arrow', d: 'M56 54 L56 42' }],
    },
    {
      cap: 'Hold a straight line',
      head: [95, 54],
      limbs: [L('near', [86, 58], [86, 72], [98, 72]), ...plankLine],
      props: [{ type: 'guide', d: 'M14 71 L104 54.5' }, { type: 'text', at: [56, 40], text: 'hold' }],
    },
  ],
  'Side Bridge (Side Plank)': [
    {
      cap: 'On your side, on one elbow',
      head: [95, 57],
      limbs: [
        L('near', [86, 62], [86, 72], [96, 72]),
        L('near', [86, 62], [56, 70], [38, 71], [20, 71]),
        L('near', [86, 62], [72, 66], [60, 66]),
      ],
      props: [],
    },
    sidePlankUp,
    mirror(sidePlankUp, { cap: 'Hold, then swap sides' }),
  ],
  'Bird Dog': [
    {
      cap: 'Hands and knees, flat back',
      head: [91, 45],
      limbs: [
        L('far', [80, 50], [80, 61], [80, 72]),
        L('far', [48, 50], [48, 72], [28, 72]),
        L('near', [80, 50], [48, 50]),
        L('near', [80, 50], [80, 61], [80, 72]),
        L('near', [48, 50], [48, 72], [28, 72]),
      ],
      props: [],
    },
    {
      cap: 'Reach opposite arm and leg',
      head: [91, 45],
      limbs: [
        L('far', [80, 50], [80, 61], [80, 72]),
        L('move', [48, 50], [34, 50], [20, 50]),
        L('near', [80, 50], [48, 50]),
        L('near', [48, 50], [48, 72], [28, 72]),
        L('move', [80, 50], [93, 47], [106, 44]),
      ],
      props: [{ type: 'arrow', d: 'M100 36 L112 34' }, { type: 'arrow', d: 'M28 42 L14 42' }],
    },
    {
      cap: 'Back in, then swap sides',
      head: [91, 45],
      limbs: [
        L('move', [80, 50], [93, 47], [106, 44]),
        L('far', [48, 50], [48, 72], [28, 72]),
        L('near', [80, 50], [48, 50]),
        L('near', [80, 50], [80, 61], [80, 72]),
        L('move', [48, 50], [34, 50], [20, 50]),
      ],
      props: [],
    },
  ],
  'Supine Leg Raise': [
    {
      cap: 'Lie flat, legs straight',
      head: [102, 64],
      limbs: [L('near', [92, 68], [60, 70], [40, 70], [20, 70]), L('near', [92, 68], [80, 70], [68, 70])],
      props: [],
    },
    {
      cap: 'Lift one leg to about 75°',
      head: [102, 64],
      limbs: [
        L('far', [60, 70], [40, 70], [20, 70]),
        L('near', [92, 68], [60, 70]),
        L('near', [92, 68], [80, 70], [68, 70]),
        L('move', [60, 70], [56, 55.5], [52, 41]),
      ],
      props: [{ type: 'arrow', d: 'M34 64 Q34 46 44 38' }],
    },
    {
      cap: 'Lower slowly, switch legs',
      head: [102, 64],
      limbs: [
        L('move', [60, 70], [56, 55.5], [52, 41]),
        L('near', [92, 68], [60, 70], [40, 70], [20, 70]),
        L('near', [92, 68], [80, 70], [68, 70]),
      ],
      props: [{ type: 'arrow', d: 'M44 34 Q30 40 30 62' }],
    },
  ],
  'Overhead Squat': [
    {
      cap: 'Ball straight overhead',
      head: [65, 10],
      limbs: [L('near', [60, 72], [61, 57], [60, 42], [60, 16]), L('near', [60, 16], [59, 2], [58, -10])],
      props: [{ type: 'ball', at: [58, -16] }],
    },
    {
      cap: 'Squat, chest up',
      head: [63, 24],
      limbs: [L('move', [60, 72], [70, 61], [56, 56]), L('near', [56, 56], [58, 30]), L('near', [58, 30], [57, 17], [56, 5])],
      props: [{ type: 'ball', at: [56, -1] }, { type: 'arrow', d: 'M92 22 L92 46' }],
    },
    {
      cap: 'Low as you can, then stand',
      head: [60, 28],
      limbs: [L('move', [60, 72], [72, 63], [58, 60]), L('near', [58, 60], [55, 34]), L('near', [55, 34], [54, 21], [53, 9])],
      props: [{ type: 'ball', at: [53, 3] }, { type: 'arrow', d: 'M92 50 L92 26' }],
    },
  ],
  'Seated Twist': [
    {
      cap: 'Sit, knees bent, ball in front',
      head: [60, 36],
      limbs: [
        L('near', [60, 70], [60, 44]),
        L('near', [50, 46], [70, 46]),
        L('near', [54, 70], [50, 54], [46, 72]),
        L('near', [66, 70], [70, 54], [74, 72]),
        L('near', [50, 46], [51, 56], [57, 60]),
        L('near', [70, 46], [69, 56], [63, 60]),
      ],
      props: [{ type: 'ball', at: [60, 60] }],
      floor: false,
    },
    twistLeft,
    mirror(twistLeft, { cap: 'Turn to the other side', props: [{ type: 'ball', at: [84, 57] }, { type: 'arrow', d: 'M58 28 Q74 22 82 40' }], floor: false }),
  ],
  'Prone Shoulder Press': [
    {
      cap: 'Face down, arms overhead',
      head: [88, 62],
      limbs: [L('near', [80, 68], [50, 70], [34, 70], [18, 70]), L('near', [80, 68], [94, 70], [106, 70])],
      props: [{ type: 'bell', at: [106, 70] }],
    },
    {
      cap: 'Lift one arm',
      head: [88, 62],
      limbs: [
        L('far', [80, 68], [94, 70], [106, 70]),
        L('near', [80, 68], [50, 70], [34, 70], [18, 70]),
        L('move', [80, 68], [93, 62], [105, 56]),
      ],
      props: [{ type: 'bell', at: [106, 70], far: true }, { type: 'bell', at: [105, 56] }, { type: 'arrow', d: 'M114 66 L114 50' }],
    },
    {
      cap: 'Lower, then the other arm',
      head: [88, 62],
      limbs: [
        L('move', [80, 68], [93, 62], [105, 56]),
        L('near', [80, 68], [50, 70], [34, 70], [18, 70]),
        L('near', [80, 68], [94, 70], [106, 70]),
      ],
      props: [{ type: 'bell', at: [105, 56] }, { type: 'bell', at: [106, 70] }],
    },
  ],
};

// Crop per exercise so lying-down figures aren't lost in empty space (default fits floor work).
export const viewBoxes = {
  'Overhead Squat': '0 -24 120 100',
  'Seated Twist': '12 16 96 62',
};
export const defaultViewBox = '0 24 120 54';

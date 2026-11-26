// The normal weekly training timetable. Shown on the Training page, and used by the
// session-changes calendar to mark which days normally have training.
export const squadSessions = [
  {
    name: 'Development Squad',
    desc: 'Our improving swimmers in the Development squad are working on reinforcing their basic skills, stroke technique and improving their dives and turns. An introduction to competitive swimming as their stamina improves, includes in-house ribbon galas and club championships before attending galas further afield.',
    times: [
      { day: 'Monday', time: '6pm – 7pm' },
      { day: 'Thursday', time: '6pm – 7pm' },
      { day: 'Friday', time: '6pm – 7pm' },
    ],
    accent: 'dev',
  },
  {
    name: 'Junior Squad',
    desc: 'Swimmers continue to build their stamina through tougher training sessions. Race skills are developed such as starts, turns and finishes for each stroke and Individual Medley. Swimmers can enjoy competing in local competitions, team gala events and Devon Developments.',
    times: [
      { day: 'Monday', time: '7pm – 8pm' },
      { day: 'Thursday', time: '7pm – 8pm' },
      { day: 'Friday', time: '7pm – 8pm' },
      { day: 'Saturday', time: '9am – 10am' },
    ],
    accent: 'junior',
  },
  {
    name: 'Senior Squad',
    desc: 'Senior swimmers train with a commitment to participate in County competitions, team gala events and open meets. Those who swim for fitness only, are also encouraged to support the club in team galas.',
    times: [
      { day: 'Monday', time: '8pm – 9pm' },
      { day: 'Tuesday', time: '7pm – 9pm' },
      { day: 'Wednesday', time: '8pm – 9pm' },
      { day: 'Thursday', time: '8pm – 9pm' },
      { day: 'Friday', time: '7pm – 8pm' },
      { day: 'Saturday', time: '9am – 10am' },
    ],
    accent: 'senior',
  },
];

// Weekdays that normally have at least one session, e.g. new Set(['Monday', ...]).
export const trainingDays = new Set(squadSessions.flatMap((s) => s.times.map((t) => t.day)));

// Winter Arc logic: dates, scoring, streaks, stats.
// Scoring mirrors the Notion "Daily Log" formulas exactly.

export const START = '2026-10-01';
export const TOTAL = 92;
export const STORAGE_KEY = 'wa_data_v1'; // same key and shape as the original /winterarc page

// ── Targets (edit these to change scoring) ──
export const PROTEIN_TARGET = 90; // grams/day for full protein points
export const MEDITATION_TARGET = 15; // minutes
export const PAGES_TARGET = 10;
export const QS_TARGET = 10; // practice questions
export const BLOCKS_TARGET = 3; // deep study blocks
export const REEL_MIN = 80;
export const REEL_GOAL = 90;
export const WORKOUT_TARGET = 6; // per week
export const WEIGHT_GAIN_GOAL = 4; // kg

export const CLIPS_TARGET = 3;

// Same shape as the original page: store[dayNumber 1..92] = Entry, numbers default to 0,
// `logged` flips to true on the first edit of a day, weight 0 = not logged.
export interface Entry {
  logged: boolean;
  workout: boolean; workoutType: string; overload: boolean; protein: number; diet: boolean; weight: number;
  reel: boolean; clips: number; tried: boolean; reelLink: string;
  revision: boolean; qs: number; blocks: number;
  meditation: number; pages: number; deepWork: boolean; comm: boolean; reflected: boolean;
  sleep: number; mood: string; energy: number; notes: string;
}

export const BLANK: Entry = {
  logged: false,
  workout: false, workoutType: '', overload: false, protein: 0, diet: false, weight: 0,
  reel: false, clips: 0, tried: false, reelLink: '',
  revision: false, qs: 0, blocks: 0,
  meditation: 0, pages: 0, deepWork: false, comm: false, reflected: false,
  sleep: 0, mood: '', energy: 0, notes: '',
};

export interface Scored {
  physical: number; mindset: number; academics: number; content: number;
  total: number; core: boolean[]; coreHit: number; won: boolean; grade: string; logged: boolean;
}
export interface Day { idx: number; key: string; e: Entry; s: Scored }

export const GRADES = ['S', 'A', 'B', 'C', 'D', 'F'] as const;
export const GRADE_COLOR: Record<string, string> = {
  S: '#FFFFFF', A: '#3B82F6', B: '#22C55E', C: '#F59E0B', D: '#808080', F: '#EF4444',
};

// ── Dates (UTC math on yyyy-mm-dd keys) ──
const DAY_MS = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n: number) => String(n).padStart(2, '0');
const toUTC = (k: string) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export const keyAt = (i: number) => {
  const d = new Date(toUTC(START) + i * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
export const todayKey = () => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; };
export const idxOf = (k: string) => Math.round((toUTC(k) - toUTC(START)) / DAY_MS);
export const fmtShort = (k: string) => { const [, m, d] = k.split('-').map(Number); return `${MONTHS[m - 1]} ${d}`; };
export const dowOf = (k: string) => DOW[new Date(toUTC(k)).getUTCDay()];
export const dayLabel = (i: number) => `Day ${pad(i + 1)}`;

// ── Scoring ──
const c1 = (x: number) => Math.min(Math.max(x, 0), 1);
export const gradeOf = (t: number) => (t >= 90 ? 'S' : t >= 80 ? 'A' : t >= 70 ? 'B' : t >= 55 ? 'C' : t >= 40 ? 'D' : 'F');

export function score(e: Entry): Scored {
  const trained = e.workout || e.workoutType === 'Rest';
  const physical = Math.round((trained ? 12 : 0) + (e.overload ? 6 : 0) + c1(e.protein / PROTEIN_TARGET) * 8 + (e.diet ? 4 : 0));
  const mindset = Math.round(c1(e.meditation / MEDITATION_TARGET) * 6 + c1(e.pages / PAGES_TARGET) * 4 + (e.deepWork ? 7 : 0) + (e.comm ? 4 : 0) + (e.reflected ? 4 : 0));
  const academics = Math.round((e.revision ? 8 : 0) + c1(e.qs / QS_TARGET) * 10 + c1(e.blocks / BLOCKS_TARGET) * 7);
  const content = Math.round((e.reel ? 12 : 0) + c1(e.clips / CLIPS_TARGET) * 4 + (e.tried ? 4 : 0));
  const total = physical + mindset + academics + content;
  const core = [trained, e.reel, e.revision && e.qs >= QS_TARGET, e.meditation >= MEDITATION_TARGET];
  const coreHit = core.filter(Boolean).length;
  return { physical, mindset, academics, content, total, core, coreHit, won: coreHit === 4, grade: gradeOf(total), logged: e.logged };
}

export const isDayKey = (k: string) => /^\d+$/.test(k) && Number(k) >= 1 && Number(k) <= TOTAL;

export function buildDays(store: Record<string, Entry>): Day[] {
  return Array.from({ length: TOTAL }, (_, idx) => {
    const raw = store[String(idx + 1)];
    const e = raw ? { ...BLANK, ...raw } : BLANK;
    return { idx, key: keyAt(idx), e, s: score(e) };
  });
}

export function sanitize(v: Record<string, unknown>): Entry {
  const out: Record<string, unknown> = { ...BLANK };
  (Object.keys(BLANK) as (keyof Entry)[]).forEach((k) => {
    const b = BLANK[k]; const x = v[k];
    if (typeof b === 'boolean') out[k] = x === true;
    else if (typeof b === 'string') out[k] = typeof x === 'string' ? x.slice(0, 2000) : '';
    else out[k] = typeof x === 'number' && isFinite(x) && x >= 0 ? x : 0;
  });
  return out as unknown as Entry;
}

// ── Stats ──
export function streaks(days: Day[], todayIdx: number) {
  let longest = 0; let run = 0;
  for (const d of days) { if (d.s.won) { run++; longest = Math.max(longest, run); } else run = 0; }
  if (todayIdx < 0) return { current: 0, longest };
  let i = Math.min(todayIdx, TOTAL - 1);
  if (i === todayIdx && !days[i].s.won) i--; // today is still open, so it can't break the chain yet
  let current = 0;
  while (i >= 0 && days[i].s.won) { current++; i--; }
  return { current, longest };
}

export function summarize(days: Day[]) {
  const logged = days.filter((d) => d.s.logged);
  const sum = (f: (d: Day) => number) => logged.reduce((a, d) => a + f(d), 0);
  const avg = logged.length ? Math.round(sum((d) => d.s.total) / logged.length) : 0;
  const pillarAvg = {
    physical: logged.length ? sum((d) => d.s.physical) / logged.length : 0,
    mindset: logged.length ? sum((d) => d.s.mindset) / logged.length : 0,
    academics: logged.length ? sum((d) => d.s.academics) / logged.length : 0,
    content: logged.length ? sum((d) => d.s.content) / logged.length : 0,
  };
  const grades: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  logged.forEach((d) => { grades[d.s.grade]++; });
  const weights = days.filter((d) => d.e.weight > 0);
  const first = weights.length ? weights[0].e.weight : null;
  const latest = weights.length ? weights[weights.length - 1].e.weight : null;
  const weeks: (number | null)[] = Array.from({ length: 14 }, (_, w) => {
    const ds = days.slice(w * 7, w * 7 + 7).filter((d) => d.s.logged);
    return ds.length ? Math.round(ds.reduce((a, d) => a + d.s.total, 0) / ds.length) : null;
  });
  return {
    logged: logged.length, won: days.filter((d) => d.s.won).length, avg, pillarAvg, grades,
    reels: days.filter((d) => d.e.reel).length, first, latest,
    delta: first !== null && latest !== null ? latest - first : 0, weeks,
  };
}

export const workoutsInWeek = (days: Day[], w: number) =>
  days.slice(w * 7, w * 7 + 7).filter((d) => d.e.workout).length;

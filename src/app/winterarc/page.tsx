'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ───────────────────────── config ───────────────────────── */

const TOTAL_DAYS = 92;
const START = Date.UTC(2026, 9, 1); // Oct 1, 2026
const STORAGE_KEY = 'wa_data_v1';
const PROTEIN_TARGET = 90; // g/day, editable
const WORKOUT_TYPES = ['Push', 'Pull', 'Legs', 'Skills', 'Cardio', 'Rest'] as const;
const MOODS = ['Great', 'Good', 'Okay', 'Low', 'Drained'] as const;

const COLORS = {
  physical: '#34d399',
  mindset: '#a78bfa',
  academics: '#60a5fa',
  content: '#f472b6',
  win: '#34d399',
  loss: '#fb7185',
  dim: 'rgba(255,255,255,0.07)',
};

const PLAN = [
  {
    goal: 'Physical',
    icon: '💪',
    target: 'Gain 4 kg lean muscle',
    system: 'Workout 6 days/week with progressive overload + protein-rich tracked diet',
    rule: '1 day miss never becomes 2 days',
    color: COLORS.physical,
  },
  {
    goal: 'Content',
    icon: '🎬',
    target: '80–90 reels in 90 days',
    system: 'Record clips of yourself working, document the whole day honestly, try new things to improve quality',
    rule: 'Post daily even if editing isn’t perfect. Value matters, build trust',
    color: COLORS.content,
  },
  {
    goal: 'Academics',
    icon: '📚',
    target: '9.0+ CGPA / SGPA',
    system: 'Regular revision, consistent practice, deep study blocks',
    rule: 'No day ends without revision + 10 practice questions',
    color: COLORS.academics,
  },
  {
    goal: 'Mindset',
    icon: '🧠',
    target: 'Critical thinking, calm, communication',
    system: '15 min meditation, 10 pages reading, communication practice, deep work, daily reflection',
    rule: 'Consistency over quality. No comparison',
    color: COLORS.mindset,
  },
];

/* ───────────────────────── types ───────────────────────── */

type Entry = {
  logged: boolean;
  // physical
  workout: boolean;
  workoutType: (typeof WORKOUT_TYPES)[number] | '';
  overload: boolean;
  protein: number;
  diet: boolean;
  weight: number; // 0 = not logged
  // content
  reel: boolean;
  clips: number;
  tried: boolean;
  reelLink: string;
  // academics
  revision: boolean;
  qs: number;
  blocks: number;
  // mindset
  meditation: number;
  pages: number;
  deepWork: boolean;
  comm: boolean;
  reflected: boolean;
  // other
  sleep: number;
  mood: (typeof MOODS)[number] | '';
  energy: number;
  notes: string;
};

const EMPTY: Entry = {
  logged: false,
  workout: false,
  workoutType: '',
  overload: false,
  protein: 0,
  diet: false,
  weight: 0,
  reel: false,
  clips: 0,
  tried: false,
  reelLink: '',
  revision: false,
  qs: 0,
  blocks: 0,
  meditation: 0,
  pages: 0,
  deepWork: false,
  comm: false,
  reflected: false,
  sleep: 0,
  mood: '',
  energy: 5,
  notes: '',
};

type Store = Record<string, Entry>;

/* ───────────────────────── scoring ───────────────────────── */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function score(e: Entry) {
  const trained = e.workout || e.workoutType === 'Rest';
  const physical =
    (trained ? 12 : 0) +
    (e.overload ? 6 : 0) +
    clamp01(e.protein / PROTEIN_TARGET) * 8 +
    (e.diet ? 4 : 0);
  const mindset =
    clamp01(e.meditation / 15) * 6 +
    clamp01(e.pages / 10) * 4 +
    (e.deepWork ? 7 : 0) +
    (e.comm ? 4 : 0) +
    (e.reflected ? 4 : 0);
  const academics =
    (e.revision ? 8 : 0) + clamp01(e.qs / 10) * 10 + clamp01(e.blocks / 3) * 7;
  const content = (e.reel ? 12 : 0) + clamp01(e.clips / 3) * 4 + (e.tried ? 4 : 0);
  const total = physical + mindset + academics + content;
  const core = [trained, e.reel, e.revision && e.qs >= 10, e.meditation >= 15];
  const coreHit = core.filter(Boolean).length;
  return {
    physical,
    mindset,
    academics,
    content,
    total,
    core,
    coreHit,
    won: coreHit === 4,
  };
}

function grade(total: number) {
  if (total >= 90) return 'S';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 55) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

const GRADE_COLOR: Record<string, string> = {
  S: '#fbbf24',
  A: '#34d399',
  B: '#60a5fa',
  C: '#a78bfa',
  D: '#fb923c',
  F: '#fb7185',
};

/* ───────────────────────── date helpers ───────────────────────── */

function todayDayNumber() {
  const n = new Date();
  const utc = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.floor((utc - START) / 86400000) + 1; // may be <1 or >92
}

function dayLabel(day: number) {
  const d = new Date(START + (day - 1) * 86400000);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

function phaseOf(day: number) {
  if (day <= 31) return 'Foundation';
  if (day <= 61) return 'Grind';
  return 'Finish Strong';
}

/* ───────────────────────── small UI pieces ───────────────────────── */

const mono = { fontFamily: "'Roboto Mono', ui-monospace, monospace" } as const;

function Card({
  children,
  className = '',
  title,
  right,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl ${className}`}
    >
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-white/50" style={mono}>
              {title}
            </h2>
          )}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

function Ring({
  value,
  max,
  color,
  size = 84,
  label,
  sub,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
  label: string;
  sub?: string;
}) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const pct = clamp01(value / max);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size * 0.24}
          fontWeight={800}
        >
          {Math.round(value)}
        </text>
      </svg>
      <div className="text-[10px] uppercase tracking-widest text-white/50" style={mono}>
        {label}
      </div>
      {sub && <div className="text-[10px] text-white/30">{sub}</div>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
        checked
          ? 'border-emerald-400/40 bg-emerald-400/10 text-white'
          : 'border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
      }`}
    >
      <span>{label}</span>
      <span
        className={`h-4 w-4 rounded-full border ${
          checked ? 'border-emerald-400 bg-emerald-400' : 'border-white/30'
        }`}
      />
    </button>
  );
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  max,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-white/50">
      <span style={mono} className="uppercase tracking-wider">
        {label}
        {unit ? ` (${unit})` : ''}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={max}
        step={step}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60"
      />
    </label>
  );
}

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T | '';
  onChange: (v: T | '') => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? '' : o)}
          className={`rounded-full border px-3 py-1 text-xs transition ${
            value === o
              ? 'border-purple-400/60 bg-purple-400/20 text-white'
              : 'border-white/10 text-white/50 hover:bg-white/[0.06]'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40" style={mono}>
        {label}
      </div>
      <div className="mt-1 text-3xl font-black tracking-tight" style={{ color: color ?? 'white' }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function WinterArcPage() {
  const [store, setStore] = useState<Store>({});
  const [loaded, setLoaded] = useState(false);
  const [day, setDay] = useState(1);
  const [today, setToday] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  // load (deferred so setState isn't called synchronously inside the effect)
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setStore(JSON.parse(raw));
      } catch {}
      const t = todayDayNumber();
      setToday(t);
      setDay(Math.min(TOTAL_DAYS, Math.max(1, t)));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // save
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {}
  }, [store, loaded]);

  const entry: Entry = { ...EMPTY, ...(store[day] ?? {}) };
  const update = (patch: Partial<Entry>) =>
    setStore((s) => ({ ...s, [day]: { ...EMPTY, ...(s[day] ?? {}), ...patch, logged: true } }));

  const s = score(entry);
  const g = grade(s.total);

  /* derived analytics */
  const stats = useMemo(() => {
    const days = Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const e = store[i + 1] ? { ...EMPTY, ...store[i + 1] } : null;
      const sc = e && e.logged ? score(e) : null;
      return { day: i + 1, e, sc };
    });
    const logged = days.filter((d) => d.sc);
    const won = logged.filter((d) => d.sc!.won).length;
    const avg = logged.length ? logged.reduce((a, d) => a + d.sc!.total, 0) / logged.length : 0;

    // streaks (only up to today)
    const upTo = Math.min(TOTAL_DAYS, Math.max(0, today));
    let longest = 0;
    let run = 0;
    for (let i = 0; i < upTo; i++) {
      if (days[i].sc?.won) {
        run++;
        longest = Math.max(longest, run);
      } else run = 0;
    }
    let current = 0;
    let i = upTo - 1;
    if (i >= 0 && !days[i].sc?.won) i--; // today not won yet: don't break streak
    for (; i >= 0 && days[i].sc?.won; i--) current++;

    const reels = logged.filter((d) => d.e!.reel).length;
    const weights = logged.filter((d) => d.e!.weight > 0).map((d) => ({ day: d.day, w: d.e!.weight }));
    const startW = weights[0]?.w ?? 0;
    const lastW = weights[weights.length - 1]?.w ?? 0;

    const weekly = Array.from({ length: 14 }, (_, w) => {
      const ws = logged.filter((d) => Math.ceil(d.day / 7) === w + 1);
      return {
        week: w + 1,
        avg: ws.length ? ws.reduce((a, d) => a + d.sc!.total, 0) / ws.length : 0,
        n: ws.length,
      };
    });

    const pillarAvg = {
      physical: logged.length ? logged.reduce((a, d) => a + d.sc!.physical, 0) / logged.length / 30 : 0,
      mindset: logged.length ? logged.reduce((a, d) => a + d.sc!.mindset, 0) / logged.length / 25 : 0,
      academics: logged.length ? logged.reduce((a, d) => a + d.sc!.academics, 0) / logged.length / 25 : 0,
      content: logged.length ? logged.reduce((a, d) => a + d.sc!.content, 0) / logged.length / 20 : 0,
    };

    const curWeek = Math.ceil(day / 7);
    const workoutsThisWeek = logged.filter(
      (d) => Math.ceil(d.day / 7) === curWeek && d.e!.workout && d.e!.workoutType !== 'Rest',
    ).length;

    return {
      days, logged, won, avg, longest, current, reels, weights, startW, lastW, weekly, pillarAvg,
      workoutsThisWeek, curWeek,
    };
  }, [store, today, day]);

  /* backup */
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `winter-arc-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = (f: File | undefined) => {
    if (!f) return;
    f.text().then((t) => {
      try {
        const parsed = JSON.parse(t);
        if (typeof parsed === 'object' && parsed) setStore(parsed);
      } catch {
        alert('That file is not a valid Winter Arc backup.');
      }
    });
  };

  const dayNo = Math.min(TOTAL_DAYS, Math.max(0, today));
  const notStarted = today < 1;
  const weightDelta = stats.startW && stats.lastW ? stats.lastW - stats.startW : 0;

  return (
    <main
      className="relative min-h-screen overflow-x-hidden text-white"
      style={{ background: '#06070E', fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/25 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[30rem] w-[30rem] rounded-full bg-purple-600/25 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 h-[26rem] w-[26rem] rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">
        {/* header */}
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-purple-300/80" style={mono}>
              Neo Life OS · Oct 1 → Dec 31, 2026
            </div>
            <h1 className="mt-1 text-5xl font-black tracking-tight sm:text-6xl">
              Winter <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Arc</span>
            </h1>
            <p className="mt-2 text-white/50">
              {notStarted
                ? 'Starts Oct 1. Get ready.'
                : `Day ${dayNo} of ${TOTAL_DAYS} · ${phaseOf(dayNo)} phase`}
            </p>
          </div>
          <Ring value={dayNo} max={TOTAL_DAYS} color="#a78bfa" size={120} label="Arc progress" sub={`${TOTAL_DAYS - dayNo} days left`} />
        </header>

        {/* stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <Stat label="Current streak" value={`${stats.current}🔥`} sub={`Longest ${stats.longest}`} color="#fbbf24" />
          <Stat label="Days won" value={`${stats.won}`} sub={`of ${stats.logged.length} logged`} color={COLORS.win} />
          <Stat label="Avg score" value={stats.avg ? stats.avg.toFixed(0) : '–'} sub={stats.avg ? `Grade ${grade(stats.avg)}` : 'no data yet'} />
          <Stat label="Reels" value={`${stats.reels}`} sub="target 80–90" color={COLORS.content} />
          <Stat label={`Workouts wk ${stats.curWeek}`} value={`${stats.workoutsThisWeek}/6`} sub="target per week" color={COLORS.physical} />
          <Stat
            label="Weight Δ"
            value={stats.startW ? `${weightDelta >= 0 ? '+' : ''}${weightDelta.toFixed(1)}` : '–'}
            sub="target +4 kg"
            color={COLORS.physical}
          />
        </div>

        {/* day selector + score */}
        <Card
          title="Daily log"
          right={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDay((d) => Math.max(1, d - 1))}
                className="rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
              >
                ←
              </button>
              <button
                onClick={() => setDay(Math.min(TOTAL_DAYS, Math.max(1, today)))}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs hover:bg-white/10"
                style={mono}
              >
                TODAY
              </button>
              <button
                onClick={() => setDay((d) => Math.min(TOTAL_DAYS, d + 1))}
                className="rounded-lg border border-white/10 px-3 py-1 text-sm hover:bg-white/10"
              >
                →
              </button>
            </div>
          }
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-black tracking-tight">
                Day {String(day).padStart(2, '0')}{' '}
                <span className="text-white/40">· {dayLabel(day)}</span>
              </div>
              <div className="mt-1 text-sm tracking-widest" style={mono}>
                {['💪', '🎬', '📚', '🧠'].map((ic, i) => (
                  <span key={ic} className="mr-2" style={{ opacity: s.core[i] ? 1 : 0.25 }}>
                    {s.core[i] ? ic : '▫️'}
                  </span>
                ))}
                <span className="ml-1 text-xs text-white/40">
                  {s.coreHit}/4 core · {s.won ? 'DAY WON 🔥' : entry.logged ? 'not won yet' : 'not logged'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-5xl font-black" style={{ color: GRADE_COLOR[g] }}>
                  {entry.logged ? g : '–'}
                </div>
                <div className="text-xs text-white/40" style={mono}>
                  {s.total.toFixed(0)}/100
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-4 gap-2">
            <Ring value={s.physical} max={30} color={COLORS.physical} label="Physical" sub="/30" />
            <Ring value={s.mindset} max={25} color={COLORS.mindset} label="Mindset" sub="/25" />
            <Ring value={s.academics} max={25} color={COLORS.academics} label="Academics" sub="/25" />
            <Ring value={s.content} max={20} color={COLORS.content} label="Content" sub="/20" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Physical */}
            <FormGroup title="💪 Physical" color={COLORS.physical}>
              <Chips options={WORKOUT_TYPES} value={entry.workoutType} onChange={(v) => update({ workoutType: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Workout done" checked={entry.workout} onChange={(v) => update({ workout: v })} />
                <Toggle label="Progressive overload" checked={entry.overload} onChange={(v) => update({ overload: v })} />
                <Toggle label="Diet tracked" checked={entry.diet} onChange={(v) => update({ diet: v })} />
                <NumField label="Protein" unit="g" value={entry.protein} onChange={(v) => update({ protein: v })} />
                <NumField label="Body weight" unit="kg" step={0.1} value={entry.weight} onChange={(v) => update({ weight: v })} />
              </div>
            </FormGroup>

            {/* Content */}
            <FormGroup title="🎬 Content" color={COLORS.content}>
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Reel posted" checked={entry.reel} onChange={(v) => update({ reel: v })} />
                <Toggle label="Tried something new" checked={entry.tried} onChange={(v) => update({ tried: v })} />
                <NumField label="Clips recorded" value={entry.clips} onChange={(v) => update({ clips: v })} />
                <label className="flex flex-col gap-1 text-xs text-white/50">
                  <span style={mono} className="uppercase tracking-wider">Reel link</span>
                  <input
                    value={entry.reelLink}
                    onChange={(e) => update({ reelLink: e.target.value })}
                    placeholder="https://instagram.com/reel/…"
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-purple-400/60"
                  />
                </label>
              </div>
            </FormGroup>

            {/* Academics */}
            <FormGroup title="📚 Academics" color={COLORS.academics}>
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Revision done" checked={entry.revision} onChange={(v) => update({ revision: v })} />
                <NumField label="Practice Qs" value={entry.qs} onChange={(v) => update({ qs: v })} />
                <NumField label="Deep study blocks" value={entry.blocks} max={8} onChange={(v) => update({ blocks: v })} />
              </div>
            </FormGroup>

            {/* Mindset */}
            <FormGroup title="🧠 Mindset" color={COLORS.mindset}>
              <div className="grid grid-cols-2 gap-2">
                <NumField label="Meditation" unit="min" value={entry.meditation} onChange={(v) => update({ meditation: v })} />
                <NumField label="Pages read" value={entry.pages} onChange={(v) => update({ pages: v })} />
                <Toggle label="Deep work" checked={entry.deepWork} onChange={(v) => update({ deepWork: v })} />
                <Toggle label="Communication practice" checked={entry.comm} onChange={(v) => update({ comm: v })} />
                <Toggle label="Day reflected" checked={entry.reflected} onChange={(v) => update({ reflected: v })} />
              </div>
            </FormGroup>
          </div>

          {/* Other */}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <NumField label="Sleep" unit="h" step={0.5} max={14} value={entry.sleep} onChange={(v) => update({ sleep: v })} />
            <div className="flex flex-col gap-2 text-xs text-white/50">
              <span style={mono} className="uppercase tracking-wider">Mood</span>
              <Chips options={MOODS} value={entry.mood} onChange={(v) => update({ mood: v })} />
            </div>
            <label className="flex flex-col gap-2 text-xs text-white/50">
              <span style={mono} className="uppercase tracking-wider">Energy · {entry.energy}/10</span>
              <input
                type="range"
                min={1}
                max={10}
                value={entry.energy}
                onChange={(e) => update({ energy: Number(e.target.value) })}
                className="accent-purple-400"
              />
            </label>
          </div>
          <textarea
            value={entry.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="What I did today / reflection…"
            rows={3}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-purple-400/60"
          />
        </Card>

        {/* heatmap */}
        <Card title="92-day map" right={<Legend />}>
          <Heatmap days={stats.days} today={today} selected={day} onSelect={setDay} />
        </Card>

        {/* charts */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Score trend">
            <TrendChart points={stats.logged.map((d) => ({ x: d.day, y: d.sc!.total }))} />
          </Card>
          <Card title="Weekly average score">
            <WeeklyBars weekly={stats.weekly} currentWeek={stats.curWeek} />
          </Card>
          <Card title="Pillar balance (avg % of max)">
            <PillarBars p={stats.pillarAvg} />
          </Card>
          <Card title="Body weight → +4 kg">
            <WeightChart weights={stats.weights} start={stats.startW} />
          </Card>
        </div>

        {/* plan */}
        <Card title="The plan · source of truth">
          <div className="grid gap-3 md:grid-cols-2">
            {PLAN.map((p) => (
              <div
                key={p.goal}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                style={{ borderLeft: `3px solid ${p.color}` }}
              >
                <div className="text-lg font-extrabold">
                  {p.icon} {p.goal}
                </div>
                <div className="mt-1 text-sm font-semibold" style={{ color: p.color }}>
                  {p.target}
                </div>
                <div className="mt-2 text-sm text-white/60">{p.system}</div>
                <div className="mt-2 text-xs italic text-white/40">“{p.rule}”</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-white/40" style={mono}>
            Scoring: Physical 30 · Mindset 25 · Academics 25 · Content 20. Day is WON only when all 4 core rules hit
            (workout/rest, reel, revision + 10 Qs, 15 min meditation).
          </div>
        </Card>

        {/* backup */}
        <Card title="Backup (data lives in this browser)">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportJson}
              className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm hover:bg-white/10"
            >
              Export JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm hover:bg-white/10"
            >
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => importJson(e.target.files?.[0])}
            />
          </div>
          <p className="mt-3 text-xs text-white/40">
            Saved in localStorage: per device and per browser. Export weekly so a cleared cache can’t wipe your arc.
          </p>
        </Card>
      </div>
    </main>
  );
}

/* ───────────────────────── sub-components ───────────────────────── */

function FormGroup({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4" style={{ borderTop: `2px solid ${color}` }}>
      <div className="text-sm font-bold" style={{ color }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Legend() {
  const items = [
    ['Won', COLORS.win],
    ['Logged', '#fbbf24'],
    ['Missed', COLORS.loss],
    ['Upcoming', COLORS.dim],
  ];
  return (
    <div className="flex gap-3 text-[10px] text-white/50" style={mono}>
      {items.map(([n, c]) => (
        <span key={n} className="flex items-center gap-1">
          <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
          {n}
        </span>
      ))}
    </div>
  );
}

type DayRow = { day: number; e: Entry | null; sc: ReturnType<typeof score> | null };

function Heatmap({
  days,
  today,
  selected,
  onSelect,
}: {
  days: DayRow[];
  today: number;
  selected: number;
  onSelect: (d: number) => void;
}) {
  const cell = 26;
  const gap = 5;
  const cols = 14;
  const w = cols * (cell + gap);
  const h = 7 * (cell + gap);
  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h + 18} viewBox={`0 0 ${w} ${h + 18}`} className="min-w-[480px]">
        {days.map((d, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const past = d.day <= today;
          let fill: string = COLORS.dim;
          if (d.sc) fill = d.sc.won ? COLORS.win : '#fbbf24';
          else if (past) fill = COLORS.loss + '99';
          const x = col * (cell + gap);
          const y = row * (cell + gap);
          return (
            <g key={d.day} onClick={() => onSelect(d.day)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx={6}
                fill={fill}
                opacity={d.sc ? 0.35 + 0.65 * (d.sc.total / 100) : 1}
                stroke={d.day === selected ? 'white' : 'transparent'}
                strokeWidth={2}
              />
              <text x={x + cell / 2} y={y + cell / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="rgba(255,255,255,.75)">
                {d.day}
              </text>
            </g>
          );
        })}
        {Array.from({ length: cols }, (_, c) => (
          <text key={c} x={c * (cell + gap) + cell / 2} y={h + 12} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,.35)">
            W{c + 1}
          </text>
        ))}
      </svg>
    </div>
  );
}

function Empty({ msg = 'Log a few days to see this chart.' }: { msg?: string }) {
  return <div className="flex h-40 items-center justify-center text-sm text-white/30">{msg}</div>;
}

function TrendChart({ points }: { points: { x: number; y: number }[] }) {
  if (points.length < 2) return <Empty />;
  const W = 520, H = 190, P = 28;
  const sx = (x: number) => P + ((x - 1) / (TOTAL_DAYS - 1)) * (W - P * 2);
  const sy = (y: number) => H - P - (y / 100) * (H - P * 2);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x)},${sy(p.y)}`).join(' ');
  const area = `${d} L${sx(points[points.length - 1].x)},${H - P} L${sx(points[0].x)},${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="wa-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity=".4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 40, 55, 70, 80, 90, 100].map((v) => (
        <g key={v}>
          <line x1={P} x2={W - P} y1={sy(v)} y2={sy(v)} stroke="rgba(255,255,255,.06)" />
          <text x={4} y={sy(v)} fontSize={8} dominantBaseline="central" fill="rgba(255,255,255,.35)">{v}</text>
        </g>
      ))}
      <path d={area} fill="url(#wa-area)" />
      <path d={d} fill="none" stroke="#a78bfa" strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.x} cx={sx(p.x)} cy={sy(p.y)} r={3} fill="#a78bfa" />
      ))}
    </svg>
  );
}

function WeeklyBars({ weekly, currentWeek }: { weekly: { week: number; avg: number; n: number }[]; currentWeek: number }) {
  if (!weekly.some((w) => w.n)) return <Empty />;
  const W = 520, H = 190, P = 24;
  const bw = (W - P * 2) / weekly.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {weekly.map((w, i) => {
        const h = (w.avg / 100) * (H - P * 2);
        const x = P + i * bw + 4;
        return (
          <g key={w.week}>
            <rect x={x} y={H - P - h} width={bw - 8} height={h} rx={5} fill={w.week === currentWeek ? '#a78bfa' : '#60a5fa'} opacity={w.n ? 0.9 : 0.15} />
            {w.n > 0 && (
              <text x={x + (bw - 8) / 2} y={H - P - h - 5} textAnchor="middle" fontSize={9} fill="white">
                {w.avg.toFixed(0)}
              </text>
            )}
            <text x={x + (bw - 8) / 2} y={H - 8} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,.35)">
              W{w.week}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PillarBars({ p }: { p: Record<'physical' | 'mindset' | 'academics' | 'content', number> }) {
  const rows: [string, number, string][] = [
    ['Physical', p.physical, COLORS.physical],
    ['Mindset', p.mindset, COLORS.mindset],
    ['Academics', p.academics, COLORS.academics],
    ['Content', p.content, COLORS.content],
  ];
  return (
    <div className="space-y-4 py-2">
      {rows.map(([n, v, c]) => (
        <div key={n}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-white/70">{n}</span>
            <span style={{ ...mono, color: c }}>{(v * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v * 100}%`, background: c }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function WeightChart({ weights, start }: { weights: { day: number; w: number }[]; start: number }) {
  if (weights.length < 1) return <Empty msg="Log your body weight to track progress toward +4 kg." />;
  const W = 520, H = 190, P = 30;
  const target = start + 4;
  const vals = weights.map((x) => x.w).concat([start, target]);
  const lo = Math.min(...vals) - 0.5;
  const hi = Math.max(...vals) + 0.5;
  const sx = (x: number) => P + ((x - 1) / (TOTAL_DAYS - 1)) * (W - P * 2);
  const sy = (y: number) => H - P - ((y - lo) / (hi - lo)) * (H - P * 2);
  const d = weights.map((p, i) => `${i ? 'L' : 'M'}${sx(p.day)},${sy(p.w)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* ideal path: start → +4 kg at day 92 */}
      <line x1={sx(1)} y1={sy(start)} x2={sx(TOTAL_DAYS)} y2={sy(target)} stroke="rgba(255,255,255,.25)" strokeDasharray="4 4" />
      <text x={W - P} y={sy(target) - 6} textAnchor="end" fontSize={9} fill="rgba(255,255,255,.5)">
        target {target.toFixed(1)} kg
      </text>
      {weights.length > 1 && <path d={d} fill="none" stroke={COLORS.physical} strokeWidth={2.5} strokeLinejoin="round" />}
      {weights.map((p) => (
        <circle key={p.day} cx={sx(p.day)} cy={sy(p.w)} r={3.5} fill={COLORS.physical} />
      ))}
      <text x={4} y={sy(start)} fontSize={8} dominantBaseline="central" fill="rgba(255,255,255,.4)">
        {start}
      </text>
    </svg>
  );
}

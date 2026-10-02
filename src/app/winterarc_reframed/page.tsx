'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import Link from 'next/link';
import { WA_CSS } from './winterarc.styles';
import {
  BLANK, BLOCKS_TARGET, CLIPS_TARGET, GRADES, GRADE_COLOR, MEDITATION_TARGET, PAGES_TARGET, PROTEIN_TARGET, QS_TARGET,
  REEL_GOAL, REEL_MIN, STORAGE_KEY, TOTAL, WEIGHT_GAIN_GOAL, WORKOUT_TARGET,
  buildDays, dayLabel, dowOf, fmtShort, idxOf, isDayKey, sanitize, streaks, summarize, todayKey, workoutsInWeek,
} from './winterarc.logic';
import type { Day, Entry } from './winterarc.logic';

type Tab = 'today' | 'overview' | 'plan';
type Variant = 'neutral' | 'blue' | 'success' | 'warning' | 'danger';

/* Small UI pieces (Life OS components) */

function Ic({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const IconPhysical = <Ic><path d="M2 8h2l1.5-4 3 8L11 8h3" /></Ic>;
const IconMindset = <Ic><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.5" /></Ic>;
const IconAcademics = <Ic><path d="M3 3.5A1.5 1.5 0 014.5 2H13v10H4.5A1.5 1.5 0 003 13.5v-10z" /><path d="M3 13.5A1.5 1.5 0 004.5 15H13" /></Ic>;
const IconContent = <Ic><rect x="2" y="3.5" width="9" height="9" rx="2" /><path d="M11 7l3-1.5v5L11 9" /></Ic>;
const IconNotes = <Ic><path d="M3 4h10M3 8h10M3 12h6" /></Ic>;
const IconCheck = <Ic size={12}><polyline points="3,8.5 6.5,12 13,4.5" /></Ic>;

function Badge({ v = 'neutral', dot, children }: { v?: Variant; dot?: boolean; children: ReactNode }) {
  return <span className={`wa-badge wa-b-${v}`}>{dot && <i />}{children}</span>;
}

function Progress({ value, variant = 'default', label, right, small }: { value: number; variant?: 'default' | 'accent' | 'success'; label?: string; right?: string; small?: boolean }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="wa-bar">
      {(label || right) && <div className="wa-bar-head"><span>{label}</span><span>{right}</span></div>}
      <div className={`wa-track${small ? ' sm' : ''}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`wa-fill ${variant === 'default' ? '' : variant}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className="wa-tog" onClick={() => onChange(!on)}>
      <span className="wa-tog-text"><b>{label}</b>{hint && <small>{hint}</small>}</span>
      <span className="wa-sw" aria-hidden="true" />
    </button>
  );
}

function NumField({ id, label, hint, value, onChange, step = 1, placeholder }: { id: string; label: string; hint?: string; value: number; onChange: (v: number) => void; step?: number; placeholder?: string }) {
  return (
    <div className="wa-field">
      <label htmlFor={id}>{label}{hint && <span>{hint}</span>}</label>
      <input id={id} className="wa-input wa-num" type="number" inputMode="decimal" min={0} step={step} placeholder={placeholder ?? '0'}
        value={value === 0 ? '' : value} onChange={(ev) => onChange(ev.target.value === '' ? 0 : Math.max(0, Number(ev.target.value)))} />
    </div>
  );
}

function Pills({ items, value, onChange, label }: { items: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="wa-pills" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it} type="button" className="wa-pill" aria-pressed={value === it} onClick={() => onChange(value === it ? '' : it)}>{it}</button>
      ))}
    </div>
  );
}

function PillarCard({ icon, name, score, max, children }: { icon: ReactNode; name: string; score: number; max: number; children: ReactNode }) {
  const full = score >= max;
  return (
    <section className="wa-card" aria-label={name}>
      <div className="wa-card-head">
        <h3 className="wa-title">{icon}{name}</h3>
        <Badge v={full ? 'success' : score > 0 ? 'blue' : 'neutral'} dot>{score} / {max}</Badge>
      </div>
      <Progress value={(score / max) * 100} variant={full ? 'success' : 'accent'} small />
      <div className="wa-fields" style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function Ring({ value, won }: { value: number; won: boolean }) {
  const r = 54; const C = 2 * Math.PI * r;
  return (
    <div className="wa-ring" role="img" aria-label={`Score ${value} out of 100`}>
      <svg viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="#1F1F1F" strokeWidth="8" />
        <circle cx="66" cy="66" r={r} fill="none" stroke={won ? '#22C55E' : '#3B82F6'} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${(value / 100) * C} ${C}`} style={{ transition: 'stroke-dasharray 400ms cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div className="wa-ring-center"><strong className="wa-num">{value}</strong><span>out of 100</span></div>
    </div>
  );
}

/* Charts (plain SVG) */

function ScoreTrend({ days, sel, onSelect }: { days: Day[]; sel: number; onSelect: (i: number) => void }) {
  const W = 640, H = 230, L = 34, R = 10, T = 12, B = 26;
  const iw = W - L - R, ih = H - T - B;
  const x = (i: number) => L + (i / (TOTAL - 1)) * iw;
  const y = (v: number) => T + (1 - v / 100) * ih;
  const pts = days.filter((d) => d.s.logged);
  const line = pts.map((d, j) => `${j ? 'L' : 'M'}${x(d.idx).toFixed(1)} ${y(d.s.total).toFixed(1)}`).join(' ');
  const area = pts.length > 1 ? `${line} L${x(pts[pts.length - 1].idx).toFixed(1)} ${y(0)} L${x(pts[0].idx).toFixed(1)} ${y(0)} Z` : '';
  const cw = iw / (TOTAL - 1);
  const labels: [number, string, 'start' | 'middle' | 'end'][] = [[0, 'Oct 1', 'start'], [31, 'Nov 1', 'middle'], [61, 'Dec 1', 'middle'], [91, 'Dec 31', 'end']];
  return (
    <svg className="wa-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily score across the 92 days">
      <defs>
        <linearGradient id="wa-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.14" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#1D1D1D" /><text x={L - 8} y={y(t) + 3} textAnchor="end">{t}</text></g>
      ))}
      <line x1={L} x2={W - R} y1={y(70)} y2={y(70)} stroke="#404040" strokeDasharray="4 4" />
      <text x={W - R} y={y(70) - 5} textAnchor="end">Grade B · 70</text>
      {labels.map(([i, t, a]) => <text key={t} x={x(i)} y={H - 6} textAnchor={a}>{t}</text>)}
      <line x1={x(sel)} x2={x(sel)} y1={T} y2={T + ih} stroke="#3B82F6" strokeOpacity="0.45" />
      {area && <path d={area} fill="url(#wa-area)" />}
      {pts.length > 0 && <path d={line} fill="none" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((d) => <circle key={d.idx} cx={x(d.idx)} cy={y(d.s.total)} r={d.idx === sel ? 4 : 2.5} fill={d.idx === sel ? '#3B82F6' : '#fff'} />)}
      {days.map((d) => <rect key={d.idx} x={x(d.idx) - cw / 2} y={T} width={cw} height={ih} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onSelect(d.idx)} />)}
      {pts.length === 0 && <text x={W / 2} y={H / 2} textAnchor="middle" style={{ fontSize: 13 }}>Your scores will plot here once you log a day.</text>}
    </svg>
  );
}

function WeeklyBars({ weeks, cur }: { weeks: (number | null)[]; cur: number }) {
  const W = 340, H = 170, slot = (W - 16) / 14, bw = 14, base = 140, max = 116;
  return (
    <svg className="wa-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average score for each of the 14 weeks">
      <line x1="8" x2={W - 8} y1={base} y2={base} stroke="#1D1D1D" />
      {weeks.map((v, i) => {
        const h = v === null ? 2 : Math.max(2, (v / 100) * max);
        const cx = 8 + slot * i + slot / 2;
        const fill = i === cur ? '#3B82F6' : v === null ? '#404040' : '#FFFFFF';
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={base - h} width={bw} height={h} rx="3" fill={fill} opacity={v === null ? 0.6 : 1} />
            {v !== null && <text x={cx} y={base - h - 5} textAnchor="middle" style={{ fontSize: 9 }}>{v}</text>}
            <text x={cx} y={H - 8} textAnchor="middle" style={{ fontSize: 8.5 }}>W{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

function WeightLine({ days, first }: { days: Day[]; first: number | null }) {
  const pts = days.filter((d) => d.e.weight > 0);
  if (!pts.length || first === null) return <div className="wa-chart-empty">Log your weight to see the trend toward +{WEIGHT_GAIN_GOAL} kg.</div>;
  const goal = first + WEIGHT_GAIN_GOAL;
  const ws = pts.map((d) => d.e.weight);
  const lo = Math.min(...ws, first) - 1, hi = Math.max(...ws, goal) + 1;
  const W = 340, H = 170, L = 30, R = 8, T = 12, B = 26;
  const x = (i: number) => L + (i / (TOTAL - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const line = pts.map((d, j) => `${j ? 'L' : 'M'}${x(d.idx).toFixed(1)} ${y(d.e.weight).toFixed(1)}`).join(' ');
  return (
    <svg className="wa-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Body weight over time">
      <line x1={L} x2={W - R} y1={y(goal)} y2={y(goal)} stroke="#22C55E" strokeOpacity="0.6" strokeDasharray="4 4" />
      <text x={W - R} y={y(goal) - 5} textAnchor="end" style={{ fill: '#86EFAC' }}>Goal {goal.toFixed(1)} kg</text>
      <line x1={L} x2={W - R} y1={y(first)} y2={y(first)} stroke="#1D1D1D" />
      <text x={L - 8} y={y(first) + 3} textAnchor="end">{first.toFixed(0)}</text>
      <path d={line} fill="none" stroke="#fff" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((d) => <circle key={d.idx} cx={x(d.idx)} cy={y(d.e.weight)} r="2.5" fill="#fff" />)}
      <text x={L} y={H - 6}>Oct 1</text><text x={W - R} y={H - 6} textAnchor="end">Dec 31</text>
    </svg>
  );
}

function Donut({ counts }: { counts: Record<string, number> }) {
  const total = GRADES.reduce((a, g) => a + counts[g], 0);
  const r = 42, C = 2 * Math.PI * r;
  let off = 0;
  const segs = GRADES.map((g) => { const len = total ? (counts[g] / total) * C : 0; const s = { g, len, off }; off += len; return s; });
  return (
    <div className="wa-donut">
      <svg viewBox="0 0 100 100" role="img" aria-label="Grade distribution">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1F1F1F" strokeWidth="10" />
        <g transform="rotate(-90 50 50)">
          {segs.filter((s) => s.len > 0).map((s) => (
            <circle key={s.g} cx="50" cy="50" r={r} fill="none" stroke={GRADE_COLOR[s.g]} strokeWidth="10"
              strokeDasharray={`${Math.max(s.len - (total > counts[s.g] ? 1.5 : 0), 0.5)} ${C}`} strokeDashoffset={-s.off} />
          ))}
        </g>
        <text x="50" y="52" textAnchor="middle" style={{ fill: '#fff', fontSize: 18, fontWeight: 700 }}>{total}</text>
        <text x="50" y="65" textAnchor="middle" style={{ fontSize: 8 }}>days graded</text>
      </svg>
      <div className="wa-donut-legend">
        {GRADES.map((g) => <div key={g}><i style={{ background: GRADE_COLOR[g] }} />Grade {g}<b className="wa-num">{counts[g]}</b></div>)}
      </div>
    </div>
  );
}

/* Static content (from the handwritten plan) */

const GOALS = [
  { icon: IconPhysical, tag: 'Physical', title: 'Gain 4 kg as lean muscle mass',
    system: ['Workout 6 days a week with progressive overload', 'Protein-rich, tracked diet'],
    rule: 'One missed day never becomes two. Never let it turn into a habit.' },
  { icon: IconContent, tag: 'Content', title: 'Post 80 to 90 reels in the next 90 days',
    system: ['Record clips of yourself working', 'Honestly document what you did the whole day', 'Try something new to improve quality every time'],
    rule: 'Post daily, even if the editing isn\u2019t at its peak. Value matters. Build trust.' },
  { icon: IconAcademics, tag: 'Academics', title: 'Do your absolute best: 9.0+ CGPA or SGPA',
    system: ['Regular revision', 'Consistent practice', 'Deep study blocks'],
    rule: 'No day ends without revision and 10 practice questions.' },
  { icon: IconMindset, tag: 'Mindset & communication', title: 'Critical thinking, meditation, positive attitude, great communication',
    system: ['15 minutes of meditation every morning', 'Read 10 pages every day', 'Deep work', 'Communication practice: writing, listening and speaking', 'Reflect on and track the day'],
    rule: 'Practice consistently even when fear of low quality shows up. No comparison.' },
];
const SCORING = [
  ['Physical', '30', 'Workout or rest day 12 · Progressive overload 6 · Protein (' + PROTEIN_TARGET + ' g = 8) · Diet tracked 4'],
  ['Mindset', '25', 'Meditation (' + MEDITATION_TARGET + ' min = 6) · Pages read (' + PAGES_TARGET + ' = 4) · Deep work 7 · Communication 4 · Reflection 4'],
  ['Academics', '25', 'Revision 8 · Practice questions (' + QS_TARGET + ' = 10) · Deep study blocks (' + BLOCKS_TARGET + ' = 7)'],
  ['Content', '20', 'Reel posted 12 · Clips recorded 4 · Tried something new 4'],
];
const CORE_RULES = ['Workout or rest day', 'Reel posted', 'Revision + ' + QS_TARGET + ' practice questions', MEDITATION_TARGET + ' min meditation'];
const PHASES = [
  { name: 'Phase 1 · Foundation', range: 'Oct 1 to Oct 31', from: 0, to: 30, note: 'Build the habits, lock the routine.' },
  { name: 'Phase 2 · Grind', range: 'Nov 1 to Nov 30', from: 31, to: 60, note: 'Raise the bar, protect the streak.' },
  { name: 'Phase 3 · Finish Strong', range: 'Dec 1 to Dec 31', from: 61, to: 91, note: 'Peak output, no excuses.' },
];
const GRADE_ROWS: [string, string][] = [['S', '90+'], ['A', '80+'], ['B', '70+'], ['C', '55+'], ['D', '40+'], ['F', 'under 40']];

/* Page */

export default function WinterArcPage() {
  const [mounted, setMounted] = useState(false);
  const [store, setStore] = useState<Record<string, Entry>>({});
  const [tab, setTab] = useState<Tab>('today');
  const [sel, setSel] = useState(0);
  const [todayIdx, setTodayIdx] = useState(0);
  const [toast, setToast] = useState<{ msg: string; err: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
        const next: Record<string, Entry> = {};
        Object.entries(parsed).forEach(([k, v]) => { if (isDayKey(k) && v && typeof v === 'object') next[k] = sanitize(v); });
        setStore(next);
      }
    } catch { /* unreadable storage: start empty */ }
    const t = idxOf(todayKey());
    setTodayIdx(t);
    setSel(Math.min(Math.max(t, 0), TOTAL - 1));
    setMounted(true);
  }, []);

  // keep "today" right if the tab stays open overnight
  useEffect(() => {
    const onVis = () => { if (!document.hidden) setTodayIdx(idxOf(todayKey())); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // autosave
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* storage full or blocked */ }
  }, [store, mounted]);

  const flash = useCallback((msg: string, err = false) => {
    setToast({ msg, err });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const days = useMemo(() => buildDays(store), [store]);
  const sum = useMemo(() => summarize(days), [days]);
  const st = useMemo(() => streaks(days, todayIdx), [days, todayIdx]);

  const cur = days[sel];
  const e = cur.e; const s = cur.s;
  const setField = <K extends keyof Entry>(k: K, v: Entry[K]) =>
    setStore((p) => ({ ...p, [String(cur.idx + 1)]: { ...(p[String(cur.idx + 1)] ?? BLANK), [k]: v, logged: true } as Entry }));

  const selectDay = (i: number) => { setSel(i); setTab('today'); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const doExport = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `winter-arc-backup-${todayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    flash('Backup downloaded');
  };
  const doImport = (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const raw = JSON.parse(String(r.result));
        const src = raw && typeof raw === 'object' && raw.entries ? raw.entries : raw; // accepts the original page's backup format
        const next = { ...store }; let count = 0;
        Object.entries(src as Record<string, unknown>).forEach(([k, v]) => {
          if (isDayKey(k) && v && typeof v === 'object') { next[k] = sanitize(v as Record<string, unknown>); count++; }
        });
        if (!count) throw new Error('empty');
        setStore(next); flash(`Imported ${count} days`);
      } catch { flash('Couldn\u2019t read that file. Choose a Winter Arc backup (.json).', true); }
    };
    r.readAsText(f); ev.target.value = '';
  };

  if (!mounted) return (<div className="wa"><style dangerouslySetInnerHTML={{ __html: WA_CSS }} /></div>);

  // hero numbers
  const dayNo = todayIdx < 0 ? 0 : Math.min(todayIdx + 1, TOTAL);
  const heroTitle = todayIdx < 0 ? `Starts in ${-todayIdx} day${-todayIdx === 1 ? '' : 's'}` : todayIdx >= TOTAL ? 'Arc complete' : `Day ${dayNo} of ${TOTAL}`;
  const curWeek = Math.floor(Math.min(Math.max(todayIdx, 0), TOTAL - 1) / 7);
  const weekWorkouts = workoutsInWeek(days, curWeek);
  const ws = Math.floor(sel / 7) * 7;
  const weekDays = days.slice(ws, ws + 7);
  const prev = todayIdx - 1;
  const showRecovery = tab === 'today' && sel === todayIdx && prev >= 0 && prev < TOTAL && !days[prev].s.won;
  const rulesOn = s.core;

  return (
    <div className="wa">
      <style dangerouslySetInnerHTML={{ __html: WA_CSS }} />

      {/* Glass navbar */}
      <header className="wa-nav">
        <Link className="wa-logo" href="/" aria-label="Back to Life OS">
          <span className="wa-logo-mark" aria-hidden="true">
            <svg viewBox="0 0 14 14" width="14" height="14" fill="#000">
              {[3, 7, 11].flatMap((cx) => [3, 7, 11].map((cy) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="1.2" />))}
            </svg>
          </span>
          <span className="wa-logo-word">Life OS</span>
        </Link>
        <span className="wa-crumb">Winter Arc</span>
        <div className="wa-nav-actions">
          <button type="button" className="wa-btn wa-btn-ghost wa-btn-sm" onClick={() => fileRef.current?.click()}><Ic><path d="M8 10V2M5 7l3 3 3-3M3 12v1.5h10V12" /></Ic>Import</button>
          <button type="button" className="wa-btn wa-btn-secondary wa-btn-sm" onClick={doExport}><Ic><path d="M8 2v8M5 5l3-3 3 3M3 12v1.5h10V12" /></Ic>Export</button>
          <div className="wa-avatar" title="Neo" aria-hidden="true">N</div>
          <input ref={fileRef} type="file" accept="application/json,.json" className="wa-hidden" onChange={doImport} aria-label="Import backup file" />
        </div>
      </header>

      <main className="wa-wrap wa-stack">
        {/* Hero */}
        <section className="wa-hero" aria-label="Arc progress">
          <div className="wa-hero-main">
            <span className="wa-label">Winter Arc 2026</span>
            <h1 className="wa-h1">{heroTitle}</h1>
            <p className="wa-caption">Oct 1 to Dec 31{todayIdx >= 0 && todayIdx < TOTAL ? ` · ${TOTAL - dayNo} days left` : ''}. One missed day never becomes two.</p>
            <Progress value={(dayNo / TOTAL) * 100} label="Arc progress" right={`${Math.round((dayNo / TOTAL) * 100)}%`} />
          </div>
          <div className="wa-hero-stats">
            <div className="wa-hero-stat"><span className="wa-label">Streak</span><strong className="wa-num">{st.current}</strong></div>
            <div className="wa-hero-stat"><span className="wa-label">Days won</span><strong className="wa-num">{sum.won}</strong></div>
            <div className="wa-hero-stat"><span className="wa-label">Avg score</span><strong className="wa-num">{sum.logged ? sum.avg : '–'}</strong></div>
          </div>
        </section>

        {/* Tabs */}
        <div className="wa-tabs" role="tablist" aria-label="Winter Arc sections">
          {(['today', 'overview', 'plan'] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className="wa-tab" onClick={() => setTab(t)}>{t === 'today' ? 'Today' : t === 'overview' ? 'Overview' : 'Plan'}</button>
          ))}
        </div>

        {/* TODAY */}
        {tab === 'today' && (
          <div className="wa-stack">
            <section className="wa-card wa-daybar" aria-label="Choose a day">
              <div className="wa-daybar-top">
                <div className="wa-daybar-title">
                  <strong>{dayLabel(sel)} of {TOTAL}</strong>
                  <span className="wa-caption wa-muted">{dowOf(cur.key)}, {fmtShort(cur.key)}{sel === todayIdx ? ' · Today' : ''}</span>
                </div>
                {sel !== todayIdx && todayIdx >= 0 && todayIdx < TOTAL && <button type="button" className="wa-btn wa-btn-ghost wa-btn-sm" onClick={() => setSel(todayIdx)}>Jump to today</button>}
                <button type="button" className="wa-btn wa-btn-secondary wa-icon-btn" aria-label="Previous day" disabled={sel === 0} onClick={() => setSel(sel - 1)}><Ic><polyline points="10,3 5,8 10,13" /></Ic></button>
                <button type="button" className="wa-btn wa-btn-secondary wa-icon-btn" aria-label="Next day" disabled={sel === TOTAL - 1} onClick={() => setSel(sel + 1)}><Ic><polyline points="6,3 11,8 6,13" /></Ic></button>
              </div>
              <div className="wa-week">
                {weekDays.map((d) => (
                  <button key={d.idx} type="button" className="wa-day" aria-pressed={d.idx === sel} onClick={() => setSel(d.idx)} aria-label={`${dayLabel(d.idx)}, ${fmtShort(d.key)}`}>
                    <small>{dowOf(d.key)}</small><b className="wa-num">{d.key.slice(8).replace(/^0/, '')}</b>
                    <span className={`wa-dot${d.s.won ? ' won' : d.s.logged ? ' miss' : ''}`} />
                  </button>
                ))}
              </div>
            </section>

            {showRecovery && (
              <div className="wa-banner" role="status">
                <Badge v="warning" dot>Recovery day</Badge>
                <p>Yesterday wasn&rsquo;t a win. Hit all four core rules today so one miss doesn&rsquo;t become two.</p>
              </div>
            )}

            <div className="wa-grid-today">
              <div className="wa-stack">
                <div className="wa-pillars">
                  <PillarCard icon={IconPhysical} name="Physical" score={s.physical} max={30}>
                    <Toggle label="Workout done" hint="6 days a week" on={e.workout} onChange={(v) => setField('workout', v)} />
                    <Pills label="Workout type" items={['Push', 'Pull', 'Legs', 'Skills', 'Cardio', 'Rest']} value={e.workoutType} onChange={(v) => setField('workoutType', v)} />
                    <Toggle label="Progressive overload" hint="Beat your last session" on={e.overload} onChange={(v) => setField('overload', v)} />
                    <div className="wa-two">
                      <NumField id="wa-protein" label="Protein (g)" hint={`${PROTEIN_TARGET} = full`} value={e.protein} onChange={(v) => setField('protein', v)} />
                      <NumField id="wa-weight" label="Weight (kg)" hint="Not scored" step={0.1} value={e.weight} onChange={(v) => setField('weight', v)} />
                    </div>
                    <Toggle label="Diet tracked" on={e.diet} onChange={(v) => setField('diet', v)} />
                  </PillarCard>

                  <PillarCard icon={IconMindset} name="Mindset & communication" score={s.mindset} max={25}>
                    <div className="wa-two">
                      <NumField id="wa-med" label="Meditation (min)" hint={`${MEDITATION_TARGET} = full`} value={e.meditation} onChange={(v) => setField('meditation', v)} />
                      <NumField id="wa-pages" label="Pages read" hint={`${PAGES_TARGET} = full`} value={e.pages} onChange={(v) => setField('pages', v)} />
                    </div>
                    <Toggle label="Deep work done" on={e.deepWork} onChange={(v) => setField('deepWork', v)} />
                    <Toggle label="Communication practice" hint="Writing, listening or speaking" on={e.comm} onChange={(v) => setField('comm', v)} />
                    <Toggle label="Day reflected" hint="Tracked and reviewed" on={e.reflected} onChange={(v) => setField('reflected', v)} />
                  </PillarCard>

                  <PillarCard icon={IconAcademics} name="Academics" score={s.academics} max={25}>
                    <Toggle label="Revision done" on={e.revision} onChange={(v) => setField('revision', v)} />
                    <div className="wa-two">
                      <NumField id="wa-qs" label="Practice questions" hint={`${QS_TARGET} = full`} value={e.qs} onChange={(v) => setField('qs', v)} />
                      <NumField id="wa-blocks" label="Deep study blocks" hint={`${BLOCKS_TARGET} = full`} value={e.blocks} onChange={(v) => setField('blocks', v)} />
                    </div>
                  </PillarCard>

                  <PillarCard icon={IconContent} name="Content" score={s.content} max={20}>
                    <Toggle label="Reel posted" hint="Post daily, even if editing isn’t perfect" on={e.reel} onChange={(v) => setField('reel', v)} />
                    <div className="wa-field">
                      <label htmlFor="wa-link">Reel link</label>
                      <input id="wa-link" className="wa-input" type="url" placeholder="https://instagram.com/reel/…" value={e.reelLink} onChange={(ev) => setField('reelLink', ev.target.value)} />
                    </div>
                    <NumField id="wa-clips" label="Clips recorded" hint={`${CLIPS_TARGET} = full`} value={e.clips} onChange={(v) => setField('clips', v)} />
                    <Toggle label="Tried something new" hint="To improve quality" on={e.tried} onChange={(v) => setField('tried', v)} />
                  </PillarCard>
                </div>

                <section className="wa-card" aria-label="Day notes">
                  <div className="wa-card-head"><h3 className="wa-title">{IconNotes}Notes for the day</h3><Badge>Not scored</Badge></div>
                  <div className="wa-fields">
                    <div className="wa-two">
                      <NumField id="wa-sleep" label="Sleep (hours)" step={0.5} value={e.sleep} onChange={(v) => setField('sleep', v)} />
                      <NumField id="wa-energy" label="Energy (1 to 10)" value={e.energy} onChange={(v) => setField('energy', Math.min(10, v))} />
                    </div>
                    <div className="wa-field"><label>Mood</label><Pills label="Mood" items={['Great', 'Good', 'Okay', 'Low', 'Drained']} value={e.mood} onChange={(v) => setField('mood', v)} /></div>
                    <div className="wa-field">
                      <label htmlFor="wa-note">What I did today</label>
                      <textarea id="wa-note" className="wa-input" placeholder="Document the whole day honestly: what you did, what you learned, what to change." value={e.notes} onChange={(ev) => setField('notes', ev.target.value)} />
                    </div>
                  </div>
                </section>
              </div>

              <aside className="wa-side" aria-label="Day score">
                <section className="wa-card">
                  <div className="wa-ring-wrap">
                    <Ring value={s.total} won={s.won} />
                    <div className="wa-ring-meta">
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Badge v={s.logged ? (s.grade === 'F' || s.grade === 'D' ? 'danger' : s.grade === 'C' ? 'warning' : s.grade === 'A' || s.grade === 'S' ? 'blue' : 'success') : 'neutral'}>Grade {s.logged ? s.grade : '–'}</Badge>
                        <Badge v={s.won ? 'success' : 'neutral'} dot>{s.won ? 'Day won' : 'In progress'}</Badge>
                      </div>
                      <p className="wa-caption">{s.won ? 'All four core rules hit. The chain holds.' : `${s.coreHit} of 4 core rules hit.`}</p>
                    </div>
                  </div>
                </section>
                <section className="wa-card">
                  <div className="wa-card-head"><h3 className="wa-title">Core 4 rules</h3><Badge v={s.won ? 'success' : 'neutral'}>{s.coreHit} / 4</Badge></div>
                  <ul className="wa-rules">
                    {CORE_RULES.map((r, i) => (
                      <li key={r} className={`wa-rule${rulesOn[i] ? ' on' : ''}`}><span className="wa-rule-mark">{IconCheck}</span>{r}</li>
                    ))}
                  </ul>
                </section>
                <section className="wa-card">
                  <div className="wa-card-head"><h3 className="wa-title">Streak</h3></div>
                  <div className="wa-two">
                    <div><span className="wa-label">Current</span><div className="wa-h3 wa-num">{st.current}</div></div>
                    <div><span className="wa-label">Longest</span><div className="wa-h3 wa-num">{st.longest}</div></div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )}

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="wa-stack">
            <div className="wa-stats">
              <div className="wa-card wa-stat"><span className="wa-label">Current streak</span><strong className="wa-num">{st.current}<small>days</small></strong><p className="wa-caption wa-muted">Longest {st.longest}</p></div>
              <div className="wa-card wa-stat"><span className="wa-label">Days won</span><strong className="wa-num">{sum.won}<small>of {TOTAL}</small></strong><Progress value={(sum.won / TOTAL) * 100} small /></div>
              <div className="wa-card wa-stat"><span className="wa-label">Average score</span><strong className="wa-num">{sum.logged ? sum.avg : '–'}<small>/ 100</small></strong><p className="wa-caption wa-muted">{sum.logged} days logged</p></div>
              <div className="wa-card wa-stat"><span className="wa-label">Reels posted</span><strong className="wa-num">{sum.reels}<small>/ {REEL_GOAL}</small></strong><Progress value={(sum.reels / REEL_GOAL) * 100} variant={sum.reels >= REEL_MIN ? 'success' : 'accent'} small /></div>
              <div className="wa-card wa-stat"><span className="wa-label">Workouts, week {curWeek + 1}</span><strong className="wa-num">{weekWorkouts}<small>/ {WORKOUT_TARGET}</small></strong><Progress value={(weekWorkouts / WORKOUT_TARGET) * 100} variant={weekWorkouts >= WORKOUT_TARGET ? 'success' : 'accent'} small /></div>
              <div className="wa-card wa-stat"><span className="wa-label">Weight</span><strong className="wa-num">{sum.latest !== null ? sum.latest.toFixed(1) : '–'}<small>kg</small></strong>
                <Progress value={(Math.max(sum.delta, 0) / WEIGHT_GAIN_GOAL) * 100} variant={sum.delta >= WEIGHT_GAIN_GOAL ? 'success' : 'accent'} small />
              </div>
            </div>

            <section className="wa-card" aria-label="92-day map">
              <div className="wa-card-head"><h3 className="wa-title">The 92 days</h3><Badge v="blue">Select a day to log it</Badge></div>
              <div className="wa-heat-layout">
                <div className="wa-heat-box">
                  <div className="wa-heat">
                    {days.map((d) => {
                      const cls = ['wa-cell'];
                      if (d.s.won) cls.push('won'); else if (d.s.logged) cls.push('miss');
                      else if (d.idx > todayIdx) cls.push('future');
                      if (d.idx === todayIdx) cls.push('today');
                      if (d.idx === sel) cls.push('sel');
                      const bg = d.s.won ? `rgba(34,197,94,${(0.4 + 0.6 * ((d.s.total - 55) / 45)).toFixed(2)})` : undefined;
                      return (
                        <button key={d.idx} type="button" className={cls.join(' ')} style={bg ? { background: bg } : undefined}
                          aria-label={`${dayLabel(d.idx)}, ${fmtShort(d.key)}: ${d.s.logged ? `${d.s.total} points, grade ${d.s.grade}, ${d.s.won ? 'won' : 'missed'}` : 'not logged'}`}
                          title={`${dayLabel(d.idx)} · ${fmtShort(d.key)}${d.s.logged ? ` · ${d.s.total}/100 · ${d.s.grade}` : ''}`} onClick={() => selectDay(d.idx)} />
                      );
                    })}
                  </div>
                  <div className="wa-heat-weeks" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <span key={i}>W{i + 1}</span>)}</div>
                </div>
                <div className="wa-heat-side">
                  <div className="wa-legend">
                    <span><i style={{ background: 'rgba(34,197,94,.85)', borderColor: 'rgba(34,197,94,.55)' }} />Won: all four core rules hit</span>
                    <span><i style={{ background: 'rgba(239,68,68,.4)', borderColor: 'rgba(239,68,68,.45)' }} />Logged, not won</span>
                    <span><i />Not logged</span>
                    <span><i style={{ background: 'transparent' }} />Upcoming</span>
                    <span><i style={{ boxShadow: '0 0 0 1.5px #fff' }} />Today</span>
                  </div>
                  <div className="wa-fields" style={{ gap: 16 }}>
                    {PHASES.map((ph) => {
                      const done = Math.max(0, Math.min(ph.to - ph.from + 1, todayIdx - ph.from + 1));
                      const pct = (done / (ph.to - ph.from + 1)) * 100;
                      return <Progress key={ph.name} label={ph.name} right={ph.range} value={pct} variant={pct >= 100 ? 'success' : 'accent'} small />;
                    })}
                  </div>
                </div>
              </div>
            </section>

            {sum.logged === 0 ? (
              <section className="wa-card">
                <div className="wa-empty">
                  <div className="wa-fan" aria-hidden="true">
                    <div className="wa-mock l"><div className="wa-mock-top">Goals</div><div className="wa-mock-body"><div className="wa-mock-bar"><b style={{ width: '70%' }} /></div><div className="wa-mock-bar"><b style={{ width: '40%' }} /></div><div className="wa-mock-bar"><b style={{ width: '85%' }} /></div></div></div>
                    <div className="wa-mock r"><div className="wa-mock-top">Streak</div><div className="wa-mock-body"><div className="wa-mock-cells">{Array.from({ length: 21 }, (_, i) => <i key={i} className={i % 3 !== 1 ? 'on' : ''} />)}</div></div></div>
                    <div className="wa-mock f"><div className="wa-mock-top">Today</div><div className="wa-mock-body">{[1, 1, 0, 1].map((on, i) => <div key={i} className="wa-mock-row"><i className={on ? 'on' : ''} /><s /></div>)}</div></div>
                  </div>
                  <div><h4>Log your first day to <em>start the chain</em></h4></div>
                  <p>Charts, grades and streaks fill in as you log each day.</p>
                  <div className="wa-empty-actions">
                    <button type="button" className="wa-btn wa-btn-primary" onClick={() => selectDay(Math.min(Math.max(todayIdx, 0), TOTAL - 1))}>Log today</button>
                    <button type="button" className="wa-btn wa-btn-ghost" onClick={() => setTab('plan')}>Read the plan</button>
                  </div>
                </div>
              </section>
            ) : (
              <div className="wa-charts">
                <section className="wa-card wa-span-4"><div className="wa-card-head"><h3 className="wa-title">Daily score</h3><Badge>{sum.logged} logged</Badge></div><ScoreTrend days={days} sel={sel} onSelect={selectDay} /></section>
                <section className="wa-card wa-span-2"><div className="wa-card-head"><h3 className="wa-title">Grades</h3></div><Donut counts={sum.grades} /></section>
                <section className="wa-card wa-span-2"><div className="wa-card-head"><h3 className="wa-title">Weekly average</h3></div><WeeklyBars weeks={sum.weeks} cur={curWeek} /></section>
                <section className="wa-card wa-span-2"><div className="wa-card-head"><h3 className="wa-title">Weight</h3><Badge v={sum.delta >= WEIGHT_GAIN_GOAL ? 'success' : 'blue'}>{sum.delta >= 0 ? '+' : ''}{sum.delta.toFixed(1)} / +{WEIGHT_GAIN_GOAL} kg</Badge></div><WeightLine days={days} first={sum.first} /></section>
                <section className="wa-card wa-span-2">
                  <div className="wa-card-head"><h3 className="wa-title">Average by pillar</h3></div>
                  <div className="wa-fields" style={{ gap: 16 }}>
                    {([['Physical', sum.pillarAvg.physical, 30], ['Mindset', sum.pillarAvg.mindset, 25], ['Academics', sum.pillarAvg.academics, 25], ['Content', sum.pillarAvg.content, 20]] as [string, number, number][]).map(([n, v, m]) => (
                      <Progress key={n} label={n} right={`${v.toFixed(1)} / ${m}`} value={(v / m) * 100} variant={v / m >= 0.9 ? 'success' : 'accent'} />
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* PLAN */}
        {tab === 'plan' && (
          <div className="wa-stack">
            <div className="wa-goals">
              {GOALS.map((g) => (
                <section key={g.tag} className="wa-card wa-goal">
                  <div><Badge v="neutral">{g.tag}</Badge></div>
                  <h4>{g.title}</h4>
                  <div><span className="wa-label">System</span><ul className="wa-list" style={{ marginTop: 10 }}>{g.system.map((x) => <li key={x}>{x}</li>)}</ul></div>
                  <div style={{ marginTop: 'auto' }}><span className="wa-label">Constraint</span><div className="wa-rule-box" style={{ marginTop: 10 }}>{g.rule}</div></div>
                </section>
              ))}
            </div>

            <section className="wa-card">
              <div className="wa-card-head"><h3 className="wa-title">How a day is scored</h3><Badge v="blue">100 points</Badge></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="wa-table"><thead><tr><th>Pillar</th><th>Max</th><th>Where the points come from</th></tr></thead>
                  <tbody>{SCORING.map(([a, b, c]) => <tr key={a}><td>{a}</td><td className="n">{b}</td><td>{c}</td></tr>)}</tbody></table>
              </div>
              <div style={{ marginTop: 20 }}>
                <span className="wa-label">Day won</span>
                <p className="wa-caption" style={{ marginTop: 8 }}>A day counts as won when all four core rules are hit: {CORE_RULES.join(', ').toLowerCase()}. The score then grades how well the day went.</p>
              </div>
              <div className="wa-chips" style={{ marginTop: 20 }}>
                {GRADE_ROWS.map(([g, r]) => <span key={g} className="wa-chip"><b style={{ color: GRADE_COLOR[g] }}>{g}</b>{r}</span>)}
              </div>
            </section>

            <section className="wa-card">
              <div className="wa-card-head"><h3 className="wa-title">Phases</h3></div>
              <div className="wa-fields" style={{ gap: 20 }}>
                {PHASES.map((p) => {
                  const done = Math.max(0, Math.min(p.to - p.from + 1, todayIdx - p.from + 1));
                  const pct = (done / (p.to - p.from + 1)) * 100;
                  return <Progress key={p.name} label={`${p.name} · ${p.range}`} right={p.note} value={pct} variant={pct >= 100 ? 'success' : 'accent'} />;
                })}
              </div>
            </section>
          </div>
        )}

        <p className="wa-foot"><i />Saved on this device. Export a backup to move your log to another browser.</p>
      </main>

      {toast && <div className={`wa-toast${toast.err ? ' err' : ''}`} role="status">{toast.msg}</div>}
    </div>
  );
}

# Neo Life OS — Claude Memory

## Product
Personal productivity OS for IIT Roorkee student (NeoGurpreet).
Dark glass morphism dashboard. Live at neo-life-os.vercel.app.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- localStorage for all client state (no backend yet)
- Notion MCP for weekly tracker data pushes
- Vercel — auto-deploys on every push to main
- Local alarm daemon: scripts/alarm_daemon.py (Python, runs separately)

## Design system — NEVER change these
- Background: #06070E
- Accent: #3B82F6 (blue)
- Glass layer 1: rgba(255,255,255,.045)
- Glass layer 2: rgba(255,255,255,.08)
- Glass border: rgba(255,255,255,.09)
- Backdrop blur: 10–12px
- Text: t1 = white, t2 = rgba(255,255,255,.7), t3 = rgba(255,255,255,.4)
- Font sans: Inter | Font mono: JetBrains Mono
- Overlay pattern: .vis class toggles opacity 0→1 + pointer-events

## Component map
src/components/sections/
  Hero.tsx            → header bar, subject pills, quick-launch buttons (Blueprint + Calendar)
  Kanban.tsx          → task board (Backlog / Today / Done columns)
  Pomodoro.tsx        → timer + lock-in mode overlay
  WeeklyTracker.tsx   → tab tracker Overview + Mon–Sun, Monday auto-reset
  EngVocab.tsx        → English vocabulary section

src/components/overlays/
  Blueprint.tsx       → Life Architecture overlay (z-index 960) — 13 Rules, Priority Pyramid, Daily Formula, Weekly Map, Academic/Fitness/Sleep OS
  WeeklyCalendar.tsx  → pixel-accurate schedule calendar overlay (z-index 955)
  WordModal.tsx       → add/edit word modal for EngVocab

src/components/ui/
  Button.tsx, Card.tsx, Modal.tsx, TabBar.tsx — reusable primitives

src/lib/
  storage.ts          → gs(key) / ss(key, val) localStorage helpers with try/catch
  utils.ts            → cn(), date helpers, score cycling logic

src/hooks/
  useLocalStorage.ts  → typed localStorage hook
  useWeeklyTracker.ts → tracker state, Monday reset logic
  usePomodoro.ts      → timer logic

src/types/
  index.ts            → all shared TypeScript types

## localStorage key prefixes
- wt_       → weekly tracker (wt_data_v1, wt_last_reset_v1)
- kanban_   → task board
- pomo_     → pomodoro
- eng_      → english vocab

## Rules Claude must always follow
1. Never change the dark glass morphism theme
2. Never add external API calls without asking first
3. Keep overlay open/close using the .vis class toggle pattern
4. All localStorage reads wrapped in try/catch
5. Mobile-first — everything must work at 375px width
6. Commit message format: "feat: ...", "fix: ...", "refactor: ..."
7. Never install a new package without asking first
8. Before any big refactor, read docs/ for context

## Git branches
- main      → production (deploys to Vercel)
- dev       → active development
- feature/* → individual features

## Existing local scripts (do not delete)
scripts/alarm_daemon.py    → Python alarm daemon, runs locally via start_life_os.bat
scripts/set_alarm.py       → alarm setter CLI
scripts/alarms/            → alarm queue JSON + PowerShell scripts

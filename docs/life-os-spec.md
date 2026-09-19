# Neo Life OS — Product Spec

## What it is
A personal operating system dashboard — built for one user (NeoGurpreet) at IIT Roorkee.
Dark, fast, no-distraction. Everything in one page, offline-first.

## Sections (top to bottom)
1. Hero — date, greeting, subject pills, quick-launch buttons
2. Kanban — Backlog / Today / Done task board
3. Pomodoro — focus timer with lock-in mode
4. Weekly Tracker — daily checklist (Fixed Anchors + dynamic tasks + score)
5. English Vocab — word bank with add/review flow

## Overlays (full-screen, triggered by buttons)
- Blueprint (📐) — Life Architecture reference: 13 Rules, Priority Pyramid, Daily Formula, Weekly Map, Academic/Fitness/Sleep OS
- Weekly Calendar (📅) — pixel-accurate visual schedule for the week

## Data model
All state lives in localStorage. No user accounts. No server.
Monday auto-reset: Weekly Tracker clears every Monday, optionally pushes to Notion first.

## Future features (do not build yet)
- Multi-user support
- Cloud sync
- Mobile app
- Notion two-way sync

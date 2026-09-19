# Component Notes

## WeeklyTracker
- Tab bar: Overview | MON | TUE | WED | THU | FRI | SAT | SUN
- Each day page: Fixed Anchors (locked list) + 4 dynamic groups (Academic/Life OS/Training/Personal) + Notes textarea + Daily Score grid
- Score cells: Sleep 😴 / Classes 🏛️ / Academics 📚 / Life OS ⚙️ / Training 🏋️
- Score cycle: – → ✓ → ~ → ✗ (CSS classes: '' / sc-g / sc-y / sc-r)
- Overview: Weekly Targets card + Priorities textareas + Day Snapshot chips
- Monday reset: modal appears, options: Push to Notion & Reset / Reset Only / Keep

## Blueprint overlay
- z-index: 960
- Sections: 13 Rules, Priority Hierarchy (6-tier pyramid), Daily Formula (morning Q + night pills), Weekly Map (day rows), Academic OS, Fitness OS, Sleep & Recovery

## Weekly Calendar overlay  
- z-index: 955
- Lazy-built: JS runs buildCalendar() only on first open
- Timeline: 5:30 AM → 1:00 AM next day, 1.25px per minute
- 7 day columns + time label column + stats strip

## Pomodoro
- 25min work / 5min break default
- Lock-in mode: overlay blocks everything except Pomodoro section
- Space bar starts/stops timer

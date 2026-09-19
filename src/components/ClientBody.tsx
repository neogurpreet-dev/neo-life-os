'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const BODY_HTML = `<!-- HERO -->
<section class="hero">
  <div class="hero-eyebrow">Life Operating System · IIT Roorkee · Sem 1 · 2026</div>
  <h1 class="hero-name">NeoGurpreet</h1>
  <p class="hero-sub">Mathematics &amp; Computing (BS-MS) &nbsp;·&nbsp; Rajendra Bhawan<br>Class Representative &nbsp;·&nbsp; Autumn Semester</p>
  <div class="hero-rule"></div>
  <div class="hero-pills">
    <span class="hero-pill" id="hp-done">— done</span>
    <span class="hero-pill" id="hp-week">— due this week</span>
  </div>
  <div class="hero-pills" style="margin-top:10px">
    <span class="hero-pill" style="color:#93C5FD;border-color:rgba(147,197,253,.25)">MAI-101</span>
    <span class="hero-pill" style="color:#C4B5FD;border-color:rgba(196,181,253,.25)">PHI-101</span>
    <span class="hero-pill" style="color:#6EE7B7;border-color:rgba(110,231,183,.25)">MAC-101</span>
    <span class="hero-pill" style="color:#FCA5A5;border-color:rgba(252,165,165,.25)">CSE-101</span>
    <span class="hero-pill" style="color:#FCD34D;border-color:rgba(252,211,77,.25)">TMI-102</span>
  </div>
  <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
    <button class="bp-open-btn" id="bp-open-btn">📐 Life Architecture Blueprint</button>
    <button class="cal-open-btn" id="cal-open-btn">📅 Weekly Architecture</button>
  </div>
</section>

<!-- STATS -->
<div class="stats-strip">
  <div class="stats-inner">
    <div class="sc"><span class="sc-v">5</span><span class="sc-l">Subjects</span></div>
    <div class="sc"><span class="sc-v" id="s-total">—</span><span class="sc-l">Assignments</span></div>
    <div class="sc"><span class="sc-v" id="s-done">—</span><span class="sc-l">Completed</span></div>
    <div class="sc"><span class="sc-v" id="s-week">—</span><span class="sc-l">Due This Week</span></div>
    <div class="sc"><span class="sc-v" id="s-rem">—</span><span class="sc-l">Reminders</span></div>
  </div>
</div>

<!-- HABITS -->
<section class="wrap" style="padding-bottom:12px">
  <div class="sec-hd">
    <div><span class="sl">Daily Rituals</span><div class="st">Habit Tracker</div></div>
    <div style="display:flex;align-items:center;gap:12px">
      <span class="hab-progress" id="hab-progress">0 / 0 done today</span>
      <button class="hab-add-btn" id="hab-add-btn">+ Add Habit</button>
    </div>
  </div>
  <div class="hab-add-form" id="hab-add-form" style="display:none">
    <input class="hab-emoji-inp" id="hab-emoji-inp" maxlength="2" placeholder="🙂" autocomplete="off">
    <input class="hab-name-inp" id="hab-name-inp" placeholder="Habit name…" maxlength="60" autocomplete="off">
    <button class="hab-save-btn" id="hab-save-btn">Add</button>
    <button class="hab-cancel-btn" id="hab-cancel-btn">Cancel</button>
  </div>
  <div class="hab-list" id="hab-list"></div>
  <div class="hab-archived-wrap" id="hab-archived-wrap" style="display:none">
    <button class="hab-archived-toggle" id="hab-archived-toggle">Archived (<span id="hab-archived-count">0</span>) ▾</button>
    <div class="hab-archived-list" id="hab-archived-list"></div>
  </div>
</section>

<!-- REMINDERS -->
<section id="reminders-section" class="wrap" style="margin-bottom:56px">
  <div class="sec-hd">
    <div><span class="sl">Quick Capture</span><div class="st">Reminders</div></div>
    <button class="rem-add-btn" id="rem-add-btn">+ Add Reminder</button>
  </div>
  <div class="rem-quickbar">
    <input class="rem-inp-title" id="rem-q-title" type="text" placeholder="What do you need to remember?" maxlength="120" autocomplete="off">
    <input class="rem-inp-dt" id="rem-q-dt" type="datetime-local">
    <button class="rem-set-btn" id="rem-q-set">Set</button>
  </div>
  <div class="rem-list" id="rem-list"></div>
</section>

<!-- REMINDER EDIT MODAL -->
<div class="rem-ov" id="rem-ov">
  <div class="rem-modal">
    <div class="rem-mhdr">
      <span class="rem-mtitle">Edit Reminder</span>
      <button class="rem-mx" id="rem-m-close">×</button>
    </div>
    <div class="rem-fg">
      <label>Title</label>
      <input id="rem-m-title" type="text" maxlength="120">
    </div>
    <div class="rem-fg">
      <label>Date &amp; Time</label>
      <input id="rem-m-dt" type="datetime-local">
    </div>
    <div class="rem-fg">
      <label>Message</label>
      <textarea id="rem-m-msg" maxlength="300"></textarea>
    </div>
    <div class="rem-mfoot">
      <button class="rem-btn rem-btn-r" id="rem-m-del">Delete</button>
      <button class="rem-btn rem-btn-g" id="rem-m-cancel">Cancel</button>
      <button class="rem-btn rem-btn-p" id="rem-m-save">Save</button>
    </div>
  </div>
</div>

<!-- KANBAN -->
<section class="wrap" style="padding-bottom:12px">
  <div class="sec-hd">
    <div><span class="sl">Assignment Tracker</span><div class="st">Kanban Board</div></div>
    <div style="display:flex;align-items:center;gap:8px">
      <div class="filters" id="filters"></div>
      <button id="kb-reset" title="Reset to defaults" style="background:transparent;border:1px solid var(--gb);border-radius:8px;color:var(--t3);font-size:11px;font-family:var(--sans);padding:6px 11px;cursor:pointer;transition:color 120ms,border-color 120ms;white-space:nowrap">↺ Reset</button>
    </div>
  </div>
  <div class="kanban" id="kanban"></div>
</section>

<!-- POMODORO -->
<section class="wrap" style="padding-top:60px;padding-bottom:60px" id="pomo-section">
  <div class="sec-hd">
    <div><span class="sl">Deep Work</span><div class="st">Pomodoro Timer</div></div>
    <button class="lockin-btn" id="lockin-btn">🔒 Lock-in</button>
  </div>
  <div class="pomo-layout">

    <!-- LEFT: timer card -->
    <div class="pomo-card" id="pomo-card" style="--pc:#3B82F6">
      <!-- mode tabs -->
      <div class="pomo-tabs" role="tablist">
        <button class="pomo-tab active" data-pmode="focus"  role="tab">Focus</button>
        <button class="pomo-tab"        data-pmode="short"  role="tab">Short Break</button>
        <button class="pomo-tab"        data-pmode="long"   role="tab">Long Break</button>
      </div>
      <!-- duration settings -->
      <div class="pomo-dur-row">
        <div class="pomo-dur">
          <div class="pomo-dur-lbl">Focus</div>
          <div class="pomo-dur-iw">
            <input class="pomo-dur-inp" id="pd-focus" type="number" min="1" max="120" value="25">
            <span class="pomo-dur-unit">min</span>
          </div>
        </div>
        <div class="pomo-dur">
          <div class="pomo-dur-lbl">Short</div>
          <div class="pomo-dur-iw">
            <input class="pomo-dur-inp" id="pd-short" type="number" min="1" max="60" value="5">
            <span class="pomo-dur-unit">min</span>
          </div>
        </div>
        <div class="pomo-dur">
          <div class="pomo-dur-lbl">Long</div>
          <div class="pomo-dur-iw">
            <input class="pomo-dur-inp" id="pd-long" type="number" min="1" max="120" value="15">
            <span class="pomo-dur-unit">min</span>
          </div>
        </div>
      </div>
      <!-- current task badge -->
      <div class="pomo-badge hidden" id="pomo-badge">
        <div class="pomo-badge-dot"></div>
        <div class="pomo-badge-name" id="pomo-badge-name"></div>
      </div>
      <!-- ring -->
      <div class="pomo-ring-wrap">
        <svg class="pomo-ring-svg" viewBox="0 0 200 200" aria-hidden="true">
          <circle class="pomo-ring-track" cx="100" cy="100" r="88"/>
          <circle class="pomo-ring-prog"  id="pomo-prog" cx="100" cy="100" r="88"
                  stroke-dasharray="552.92" stroke-dashoffset="0"/>
        </svg>
        <div class="pomo-ring-inner">
          <div class="pomo-time"    id="pomo-time">25:00</div>
          <div class="pomo-lbl"     id="pomo-lbl">focus time</div>
          <div class="pomo-elapsed" id="pomo-elapsed"></div>
        </div>
      </div>
      <!-- session dots -->
      <div class="pomo-dots" id="pomo-dots">
        <div class="pomo-dot cur"></div>
        <div class="pomo-dot"></div>
        <div class="pomo-dot"></div>
        <div class="pomo-dot"></div>
      </div>
      <!-- controls -->
      <div class="pomo-controls">
        <button class="pb pb-ghost" id="pb-reset" aria-label="Reset">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          Reset
        </button>
        <button class="pb pb-start" id="pb-start">
          <svg id="pb-icon" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span id="pb-lbl">Start</span>
        </button>
        <button class="pb pb-done" id="pb-done" disabled aria-label="Complete session">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Done
        </button>
        <button class="pb pb-ghost" id="pb-skip" aria-label="Skip">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 19 12 14 7"/><polyline points="14 17 19 12"/></svg>
          Skip
        </button>
      </div>
    </div>

    <!-- RIGHT: queue + log -->
    <div class="pomo-side">
      <!-- task queue -->
      <div>
        <div class="pomo-queue-inp-row">
          <input class="pomo-inp" id="pomo-task-inp" type="text" placeholder="Add task to queue… (Enter)" maxlength="80">
          <button class="pomo-add" id="pomo-add" aria-label="Add task">+</button>
        </div>
        <div class="pomo-queue-list" id="pomo-queue" style="margin-top:8px"></div>
      </div>

      <!-- break prompt -->
      <div class="pomo-break" id="pomo-break" style="display:none">
        <div>🎯 <strong>4 done.</strong> Long break?</div>
        <div class="pomo-break-btns">
          <button id="pb-brk-skip">Skip</button>
          <button id="pb-brk-take" class="pacc">Take it</button>
        </div>
      </div>

      <!-- stats -->
      <div class="pomo-stats" id="pomo-stats" style="display:none">
        <div class="pomo-stat">
          <div class="pomo-stat-lbl">Focused Today</div>
          <div class="pomo-stat-val" id="ps-total">0m</div>
          <div class="pomo-stat-sub">actual time</div>
        </div>
        <div class="pomo-stat">
          <div class="pomo-stat-lbl">Sessions</div>
          <div class="pomo-stat-val" id="ps-count">0</div>
          <div class="pomo-stat-sub">completed</div>
        </div>
        <div class="pomo-stat">
          <div class="pomo-stat-lbl">Avg Session</div>
          <div class="pomo-stat-val" id="ps-avg">—</div>
          <div class="pomo-stat-sub">minutes</div>
        </div>
      </div>

      <!-- log -->
      <div id="pomo-log-wrap" style="display:none">
        <div class="pomo-log-hd">
          <span class="sl" style="margin:0">Session Log</span>
          <button class="pomo-log-clear" id="pb-clear-log">Clear</button>
        </div>
        <div class="pomo-log-list" id="pomo-log-list"></div>
      </div>
    </div>

  </div>
</section>

<!-- SUBJECT RINGS -->
<section class="wrap" style="padding-top:60px;padding-bottom:88px">
  <span class="sl">Subject Progress</span>
  <div class="st">Completion Overview</div>
  <div class="rings-wrap" id="rings"></div>
</section>

<!-- ENGLISH TRACKER -->
<section class="wrap" style="padding-top:60px;padding-bottom:88px">
  <span class="sl">Language Development</span>
  <div class="st">English</div>
  <div class="eng-wrap">
    <!-- TABS -->
    <div class="eng-tabs">
      <button class="eng-tab on" data-etab="vocab">Vocabulary</button>
      <button class="eng-tab"    data-etab="reading">Reading</button>
      <button class="eng-tab"    data-etab="practice">Practice</button>
    </div>

    <!-- VOCAB PANEL -->
    <div class="eng-panel show" id="evocab-panel">
      <div class="eng-ph">
        <div class="eng-phstats" id="e-vstats"></div>
        <div class="eng-actions">
          <button class="eng-btn eng-btn-g" id="e-review">⟳ Review</button>
          <button class="eng-btn eng-btn-p" id="e-add-word">+ Add Word</button>
        </div>
      </div>
      <!-- last 3 words preview -->
      <div id="e-vocab-preview"></div>
      <button class="eng-btn-viewall" id="e-view-all">View All Words →</button>
    </div>

    <!-- READING PANEL -->
    <div class="eng-panel" id="ereading-panel">
      <div class="eng-ph">
        <div class="eng-phstats" id="e-rstats"></div>
        <div class="eng-actions">
          <button class="eng-btn eng-btn-p" id="e-add-reading">+ Add Entry</button>
        </div>
      </div>
      <div class="eng-chips" id="e-rfilters">
        <button class="eng-chip on" data-ef="all">All</button>
        <button class="eng-chip"    data-ef="book">Books</button>
        <button class="eng-chip"    data-ef="article">Articles</button>
        <button class="eng-chip"    data-ef="finished">Finished</button>
      </div>
      <div class="eng-list" id="e-reading-list"></div>
    </div>

    <!-- PRACTICE PANEL -->
    <div class="eng-panel" id="epractice-panel">
      <div class="eng-ph">
        <div class="eng-phstats" id="e-pstats"></div>
        <div class="eng-actions">
          <button class="eng-btn eng-btn-p" id="e-add-practice">+ Log Session</button>
        </div>
      </div>
      <div class="eng-chips" id="e-pfilters">
        <button class="eng-chip on" data-ef="all">All</button>
        <button class="eng-chip"    data-ef="speaking">Speaking</button>
        <button class="eng-chip"    data-ef="writing">Writing</button>
      </div>
      <div class="eng-list" id="e-practice-list"></div>
    </div>
  </div>
</section>

<!-- FITNESS TRACKER -->
<section class="wrap" style="padding-top:60px;padding-bottom:88px">
  <span class="sl">Physical Development</span>
  <div class="st">Fitness</div>
  <div class="fit-wrap">
    <div class="fit-preview-stats" id="fit-preview-stats"></div>
    <div id="fit-today-preview"></div>
    <button class="fit-open-btn" id="fit-open-btn">Open Fitness Tracker →</button>
  </div>
</section>

<!-- ENG: WORD MODAL -->
<div class="eng-ov" id="e-word-ov">
  <div class="eng-modal">
    <div class="eng-mhdr">
      <span class="eng-mtitle" id="e-wm-title">New Word</span>
      <button class="eng-mx" id="e-wm-close">×</button>
    </div>
    <div class="eng-fg"><label>Word</label><input id="e-wm-word" type="text" placeholder="e.g. Ephemeral" autocomplete="off"></div>
    <div class="eng-fg"><label>Definition</label><textarea id="e-wm-def" rows="2" placeholder="Lasting for a very short time…"></textarea></div>
    <div class="eng-fg"><label>Example sentence</label><textarea id="e-wm-ex" rows="2" placeholder="The ephemeral beauty of cherry blossoms…"></textarea></div>
    <div class="eng-fr">
      <div class="eng-fg"><label>Source</label><input id="e-wm-src" type="text" placeholder="Book, class…"></div>
      <div class="eng-fg"><label>Status</label>
        <select id="e-wm-status">
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="mastered">Mastered</option>
        </select>
      </div>
    </div>
    <div class="eng-mfoot">
      <button class="eng-btn eng-btn-r" id="e-wm-del" style="display:none">Delete</button>
      <button class="eng-btn eng-btn-p" id="e-wm-save">Save Word</button>
    </div>
  </div>
</div>

<!-- ENG: READING MODAL -->
<div class="eng-ov" id="e-reading-ov">
  <div class="eng-modal">
    <div class="eng-mhdr">
      <span class="eng-mtitle" id="e-rm-title">Add Entry</span>
      <button class="eng-mx" id="e-rm-close">×</button>
    </div>
    <div class="eng-fg"><label>Title</label><input id="e-rm-title-in" type="text" placeholder="Book or article name" autocomplete="off"></div>
    <div class="eng-fr">
      <div class="eng-fg"><label>Type</label>
        <select id="e-rm-type"><option value="book">Book</option><option value="article">Article</option></select>
      </div>
      <div class="eng-fg"><label>Status</label>
        <select id="e-rm-status"><option value="reading">Reading</option><option value="finished">Finished</option><option value="dropped">Dropped</option></select>
      </div>
    </div>
    <div class="eng-fr">
      <div class="eng-fg"><label>Pages Read</label><input id="e-rm-pread" type="number" placeholder="0" min="0"></div>
      <div class="eng-fg"><label>Total Pages</label><input id="e-rm-ptotal" type="number" placeholder="0" min="0"></div>
    </div>
    <div class="eng-fg"><label>Notes</label><textarea id="e-rm-notes" rows="3" placeholder="Key ideas, vocab, takeaways…"></textarea></div>
    <div class="eng-mfoot">
      <button class="eng-btn eng-btn-r" id="e-rm-del" style="display:none">Delete</button>
      <button class="eng-btn eng-btn-p" id="e-rm-save">Save Entry</button>
    </div>
  </div>
</div>

<!-- ENG: PRACTICE MODAL -->
<div class="eng-ov" id="e-practice-ov">
  <div class="eng-modal">
    <div class="eng-mhdr">
      <span class="eng-mtitle" id="e-pm-title">Log Session</span>
      <button class="eng-mx" id="e-pm-close">×</button>
    </div>
    <div class="eng-fr">
      <div class="eng-fg"><label>Type</label>
        <select id="e-pm-type"><option value="speaking">Speaking</option><option value="writing">Writing</option></select>
      </div>
      <div class="eng-fg"><label>Duration (min)</label><input id="e-pm-dur" type="number" placeholder="30" min="1"></div>
    </div>
    <div class="eng-fg"><label>Prompt / Topic</label><input id="e-pm-prompt" type="text" placeholder="What did you practice?" autocomplete="off"></div>
    <div class="eng-fg"><label>Self-rating</label>
      <select id="e-pm-rating">
        <option value="5">★★★★★  Excellent</option>
        <option value="4">★★★★☆  Good</option>
        <option value="3" selected>★★★☆☆  Okay</option>
        <option value="2">★★☆☆☆  Struggled</option>
        <option value="1">★☆☆☆☆  Rough</option>
      </select>
    </div>
    <div class="eng-fg"><label>Notes</label><textarea id="e-pm-notes" rows="3" placeholder="What went well? What to improve?"></textarea></div>
    <div class="eng-mfoot">
      <button class="eng-btn eng-btn-r" id="e-pm-del" style="display:none">Delete</button>
      <button class="eng-btn eng-btn-p" id="e-pm-save">Save Session</button>
    </div>
  </div>
</div>

<!-- ENG: FLASHCARD -->
<div id="eng-fc">
  <button class="eng-btn eng-btn-g eng-fc-close" id="e-fc-close">✕ Close</button>
  <div class="eng-fc-prog" id="e-fc-prog">1 / 5</div>
  <div class="eng-fc-card" id="e-fc-card">
    <div class="eng-fc-word" id="e-fc-word"></div>
    <div class="eng-fc-hint">Tap to reveal</div>
    <div class="eng-fc-def" id="e-fc-def"></div>
    <div class="eng-fc-ex"  id="e-fc-ex"></div>
  </div>
  <div class="eng-fc-btns">
    <button class="eng-btn eng-btn-g" id="e-fc-prev">← Prev</button>
    <button class="eng-btn eng-btn-p" id="e-fc-next">Next →</button>
  </div>
</div>

<!-- ENG: FULL VOCAB PAGE -->
<div id="eng-vocab-full">
  <div class="evf-bar">
    <button class="evf-back" id="e-vf-back">← Back</button>
    <span class="evf-title">Vocabulary</span>
    <button class="eng-btn eng-btn-p" id="e-vf-add">+ Add Word</button>
  </div>
  <div class="evf-body">
    <input class="evf-search" id="e-vf-search" type="text" placeholder="Search words, definitions, sources…" autocomplete="off">
    <div class="evf-frow">
      <div class="evf-fgrp">
        <span class="evf-flbl">Status</span>
        <div class="eng-chips" id="e-vf-status">
          <button class="eng-chip on" data-evfs="all">All</button>
          <button class="eng-chip"    data-evfs="new">New</button>
          <button class="eng-chip"    data-evfs="learning">Learning</button>
          <button class="eng-chip"    data-evfs="mastered">Mastered</button>
        </div>
      </div>
      <div class="evf-fgrp">
        <span class="evf-flbl">Sort</span>
        <div class="eng-chips" id="e-vf-sort">
          <button class="eng-chip on" data-evfsort="newest">Newest first</button>
          <button class="eng-chip"    data-evfsort="oldest">Oldest first</button>
          <button class="eng-chip"    data-evfsort="az">A → Z</button>
          <button class="eng-chip"    data-evfsort="za">Z → A</button>
        </div>
      </div>
    </div>
    <div class="evf-count" id="e-vf-count"></div>
    <div class="eng-grid" id="e-vf-grid"></div>
  </div>
</div>

<!-- FITNESS: FULL-SCREEN TRACKER -->
<div id="fit-page">
  <div class="fit-bar">
    <button class="fit-back" id="fit-back">← Back</button>
    <span class="fit-page-title">Fitness</span>
    <button class="fit-btn fit-btn-p" id="fit-add-btn" style="padding:7px 14px">+ Log Session</button>
  </div>
  <div class="fit-tabs">
    <button class="fit-tab on" data-ftab="log">Log</button>
    <button class="fit-tab" data-ftab="skills">Skills</button>
    <button class="fit-tab" data-ftab="nut">Nutrition</button>
  </div>
  <div class="fit-body">
    <div class="fit-panel show" id="fit-log-panel">
      <div class="fit-ph">
        <div class="fit-phstats" id="fit-log-stats"></div>
        <button class="fit-btn fit-btn-g" id="fit-log-add">+ Log Session</button>
      </div>
      <div class="fit-log-list" id="fit-log-list"></div>
    </div>
    <div class="fit-panel" id="fit-skills-panel">
      <p class="fit-skills-intro">Tap any step to mark it as your current level. Steps below are shown as achieved.</p>
      <div class="fit-skills-grid" id="fit-skills-grid"></div>
    </div>
    <div class="fit-panel" id="fit-nut-panel">
      <div class="fit-ph">
        <div class="fit-phstats" id="fit-nut-stats"></div>
        <button class="fit-btn fit-btn-g" id="fit-nut-add">+ Add Entry</button>
      </div>
      <div class="fit-nut-days" id="fit-nut-days"></div>
    </div>
  </div>
</div>

<!-- FITNESS: SESSION MODAL -->
<div class="fit-ov" id="fit-session-ov">
  <div class="fit-modal">
    <div class="fit-mhdr">
      <span class="fit-mtitle" id="fit-sm-title">Log Session</span>
      <button class="fit-mx" id="fit-sm-close">×</button>
    </div>
    <div class="fit-fr">
      <div class="fit-fg"><label>Session Name</label><input id="fit-sm-name" type="text" placeholder="Morning calisthenics…" autocomplete="off"></div>
      <div class="fit-fg"><label>Duration (min)</label><input id="fit-sm-dur" type="number" placeholder="60" min="1"></div>
    </div>
    <div class="fit-fg"><label>Date</label><input id="fit-sm-date" type="date"></div>
    <div class="fit-fg">
      <label>Exercises</label>
      <div style="display:grid;grid-template-columns:1fr 55px 75px 26px;gap:5px;margin-bottom:6px;padding:0 2px">
        <span style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Exercise</span>
        <span style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Sets</span>
        <span style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;font-weight:600">Reps / Time</span>
        <span></span>
      </div>
      <div class="fit-ex-builder" id="fit-ex-builder"></div>
      <button class="fit-ex-add" id="fit-ex-add">+ Add Exercise</button>
    </div>
    <div class="fit-fg"><label>Notes</label><textarea id="fit-sm-notes" rows="2" placeholder="How did it feel?"></textarea></div>
    <div class="fit-mfoot">
      <button class="fit-btn fit-btn-r" id="fit-sm-del" style="display:none">Delete</button>
      <button class="fit-btn fit-btn-p" id="fit-sm-save">Save Session</button>
    </div>
  </div>
</div>

<!-- FITNESS: NUTRITION MODAL -->
<div class="fit-ov" id="fit-nut-ov">
  <div class="fit-modal">
    <div class="fit-mhdr">
      <span class="fit-mtitle" id="fit-nm-title">Add Entry</span>
      <button class="fit-mx" id="fit-nm-close">×</button>
    </div>
    <div class="fit-fr">
      <div class="fit-fg"><label>Type</label>
        <select id="fit-nm-type">
          <option value="protein">🥤  Protein</option>
          <option value="creatine">🧪  Creatine</option>
          <option value="preworkout">⚡  Pre-workout</option>
          <option value="meal">🍽️  Meal Note</option>
        </select>
      </div>
      <div class="fit-fg"><label>Amount</label><input id="fit-nm-amount" type="text" placeholder="30g, 5g…" autocomplete="off"></div>
    </div>
    <div class="fit-fr">
      <div class="fit-fg"><label>Date</label><input id="fit-nm-date" type="date"></div>
      <div class="fit-fg"><label>Time</label><input id="fit-nm-time" type="time"></div>
    </div>
    <div class="fit-fg"><label>Notes</label><textarea id="fit-nm-notes" rows="2" placeholder="Whey isolate, post-workout…"></textarea></div>
    <div class="fit-mfoot">
      <button class="fit-btn fit-btn-r" id="fit-nm-del" style="display:none">Delete</button>
      <button class="fit-btn fit-btn-p" id="fit-nm-save">Save Entry</button>
    </div>
  </div>
</div>

<!-- FITNESS: NUTRITION DAY OVERLAY -->
<div class="fit-ov" id="fit-nut-day-ov">
  <div class="fit-modal">
    <div class="fit-mhdr">
      <span class="fit-mtitle" id="fit-nut-day-title">Entries</span>
      <button class="fit-mx" id="fit-nut-day-close">×</button>
    </div>
    <div class="fit-nut-list" id="fit-nut-day-list"></div>
    <button class="fit-btn fit-btn-g" id="fit-nut-day-add" style="margin-top:14px;width:100%;justify-content:center">+ Add Entry for This Day</button>
  </div>
</div>

<!-- FITNESS: SKILL EDIT MODAL -->
<div class="fit-ov" id="fit-skill-ov">
  <div class="fit-modal">
    <div class="fit-mhdr">
      <span class="fit-mtitle" id="fit-sk-title">Add Skill Tree</span>
      <button class="fit-mx" id="fit-sk-close">×</button>
    </div>
    <div class="fit-fr">
      <div class="fit-fg"><label>Skill Name</label><input id="fit-sk-name" type="text" placeholder="Front Lever…" autocomplete="off"></div>
      <div class="fit-fg"><label>Category</label><input id="fit-sk-cat" type="text" placeholder="Pulling…" autocomplete="off"></div>
    </div>
    <div class="fit-fg">
      <label>Progression Steps (easiest → hardest)</label>
      <div class="fit-step-builder" id="fit-step-builder"></div>
      <button class="fit-ex-add" id="fit-step-add">+ Add Step</button>
    </div>
    <div class="fit-mfoot">
      <button class="fit-btn fit-btn-r" id="fit-sk-del" style="display:none">Delete Tree</button>
      <button class="fit-btn fit-btn-p" id="fit-sk-save">Save Skill</button>
    </div>
  </div>
</div>

<!-- HABIT EDIT MODAL -->
<div class="hab-ov" id="hab-ov">
  <div class="hab-modal">
    <div class="hab-mhdr">
      <span class="hab-mtitle" id="hab-m-title">Edit Habit</span>
      <button class="hab-mx" id="hab-m-close">×</button>
    </div>
    <div class="hab-fg"><label>Emoji</label><input id="hab-m-emoji" type="text" maxlength="2" placeholder="🙂" autocomplete="off"></div>
    <div class="hab-fg"><label>Name</label><input id="hab-m-name" type="text" placeholder="Habit name…" maxlength="60" autocomplete="off"></div>
    <div class="hab-mfoot">
      <button class="hab-btn hab-btn-r" id="hab-m-del">Delete</button>
      <button class="hab-btn hab-btn-g" id="hab-m-archive">Archive</button>
      <button class="hab-btn hab-btn-p" id="hab-m-save">Save</button>
    </div>
  </div>
</div>

<!-- NOTION PUSH -->
<button class="ntn-fab" id="ntn-fab" title="Push to Notion">📤</button>
<div class="ntn-ov" id="ntn-ov">
  <div class="ntn-modal">
    <div class="ntn-mhdr">
      <span class="ntn-mtitle">📤 Push to Notion</span>
      <div class="ntn-mhdr-btns">
        <button class="ntn-gear" id="ntn-gear" title="Notion destination">⚙</button>
        <button class="ntn-mx" id="ntn-mx">×</button>
      </div>
    </div>
    <div id="ntn-main">
      <div class="ntn-msub">Pick what to send to today's Notion page (created under your chosen Notion page → month → date, only if it doesn't exist yet). Nothing is sent until you tap Push.</div>
      <div class="ntn-list" id="ntn-list"></div>
      <div class="ntn-mfoot">
        <button class="ntn-push-btn" id="ntn-push-btn" disabled>Push Selected</button>
      </div>
      <div class="ntn-status-line" id="ntn-status-line"></div>
    </div>
    <div id="ntn-settings" style="display:none">
      <div class="ntn-msub">Paste a link (or page ID) to any Notion page you own. Life OS will create <b>Month → Date</b> pages under it automatically, and only ever add to them — nothing else on that page is touched.</div>
      <input class="ntn-set-inp" id="ntn-hub-inp" type="text" placeholder="https://www.notion.so/Daily-Logs-2b1c3d4e5f...">
      <div class="ntn-set-foot">
        <button class="ntn-push-btn" id="ntn-hub-save" style="flex:1">Save destination</button>
        <button class="ntn-set-cancel" id="ntn-hub-cancel" style="display:none">Cancel</button>
      </div>
      <div class="ntn-status-line" id="ntn-hub-status"></div>
    </div>
  </div>
</div>

<!-- KANBAN EDIT MODAL -->
<div class="km-overlay" id="km-overlay" role="dialog" aria-modal="true" aria-labelledby="km-heading">
  <div class="km-dialog">
    <div class="km-heading" id="km-heading">Edit Task</div>
    <div class="km-field">
      <label class="km-label" for="km-title">Title</label>
      <input class="km-inp" id="km-title" type="text" maxlength="120" placeholder="Assignment title…">
    </div>
    <div class="km-row2">
      <div class="km-field">
        <label class="km-label" for="km-subject">Subject</label>
        <select class="km-sel" id="km-subject">
          <option value="MAI-101">MAI-101 — Mathematics</option>
          <option value="PHI-101">PHI-101 — Physics</option>
          <option value="MAC-101">MAC-101 — C++</option>
          <option value="CSE-101">CSE-101 — DSA</option>
          <option value="TMI-102">TMI-102 — Fine-tuning</option>
        </select>
      </div>
      <div class="km-field">
        <label class="km-label" for="km-status">Status</label>
        <select class="km-sel" id="km-status">
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
          <option value="Submitted">Submitted</option>
        </select>
      </div>
    </div>
    <div class="km-field">
      <label class="km-label" for="km-due">Due Date</label>
      <input class="km-inp" id="km-due" type="date">
    </div>
    <div class="km-field">
      <label class="km-label">Progress — <span id="km-prog-val">0%</span></label>
      <div class="km-prog-row">
        <input class="km-range" id="km-prog" type="range" min="0" max="100" value="0">
      </div>
    </div>
    <div class="km-footer">
      <button class="km-btn km-del" id="km-del">Delete</button>
      <button class="km-btn km-cancel" id="km-cancel">Cancel</button>
      <button class="km-btn km-save" id="km-save">Save</button>
    </div>
  </div>
</div>

<!-- SCRIPT -->


<!-- ═══════════════════════════════════════════════════════
     POMODORO  — fully scoped IIFE, no conflicts with Life OS
     ═══════════════════════════════════════════════════════ -->














<!-- LIFE ARCHITECTURE BLUEPRINT OVERLAY STYLES -->


<!-- LIFE ARCHITECTURE BLUEPRINT OVERLAY HTML -->
<div class="bp-ov" id="bp-ov">
  <div class="bp-ov-inner">
    <button class="bp-close-btn" id="bp-close">&times;</button>
    <div class="bp-hdr">
      <div class="bp-logo">NEO.OS</div>
      <div class="bp-title">Life Architecture Blueprint</div>
      <div class="bp-sub">Draft v1 &middot; derived from the Weekly Calendar Architecture &mdash; edit freely, this is a starting point.</div>
    </div>

    <div class="bp-section">
      <div class="bp-section-title">13 Rules</div>
      <div class="bp-rules">
        <div class="bp-rule"><span class="bp-rule-n">01</span><span class="bp-rule-t">Sleep is <strong>non-negotiable</strong> &mdash; minimum 7h every night, no exceptions for deadlines.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">02</span><span class="bp-rule-t">Training happens <strong>6:30&ndash;7:30 PM daily</strong> &mdash; a hard lock, nothing moves it.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">03</span><span class="bp-rule-t">The <strong>hardest academic subject</strong> goes first, every morning.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">04</span><span class="bp-rule-t">Mornings are protected for <strong>deep academic work</strong> &mdash; no Life OS before class on weekdays.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">05</span><span class="bp-rule-t">Life OS gets <strong>1&ndash;1.5h</strong> on weekday evenings (Mon/Wed/Fri only) &mdash; never Tue/Thu.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">06</span><span class="bp-rule-t">Weekend Life OS is capped around <strong>3&ndash;5.5h/day</strong>, Saturday prioritized over Sunday.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">07</span><span class="bp-rule-t">Thursday is the <strong>exception day</strong> &mdash; heaviest class load, no Life OS, review only.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">08</span><span class="bp-rule-t">Tue/Thu wake at <strong>6AM</strong>; Mon/Wed/Fri/Sat/Sun wake at <strong>7AM</strong>.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">09</span><span class="bp-rule-t">Bed by <strong>11PM</strong> on Tue/Thu, <strong>11:45PM</strong> every other night.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">10</span><span class="bp-rule-t">Sunday <strong>9&ndash;10PM</strong> is locked for Weekly Review &mdash; no new build work during it.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">11</span><span class="bp-rule-t">Next week's <strong>top 3 priorities</strong> are set before Sunday sleep.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">12</span><span class="bp-rule-t">Protein timing follows training &mdash; shake within <strong>45 minutes</strong> of the 6:30PM session.</span></div>
        <div class="bp-rule"><span class="bp-rule-n">13</span><span class="bp-rule-t">When load conflicts, the order of sacrifice is: <strong>Flex/buffer &rarr; Life OS</strong> &mdash; sleep, training and academics are never touched.</span></div>
      </div>
    </div>

    <div class="bp-section">
      <div class="bp-section-title">Priority Pyramid</div>
      <div class="bp-pyramid">
        <div class="bp-tier" style="width:100%;background:rgba(165,180,252,.15);border:1px solid rgba(165,180,252,.35);color:#a5b4fc">Sleep &amp; Recovery</div>
        <div class="bp-tier" style="width:82%;background:rgba(34,211,160,.15);border:1px solid rgba(34,211,160,.35);color:#22d3a0">Academic Deep Work</div>
        <div class="bp-tier" style="width:64%;background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.35);color:#f97316">Training / Fitness</div>
        <div class="bp-tier" style="width:46%;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.35);color:#8b5cf6">Life OS Build Time</div>
        <div class="bp-tier" style="width:28%;background:rgba(148,163,184,.15);border:1px solid rgba(148,163,184,.35);color:#94a3b8">Flex / Buffer</div>
      </div>
    </div>

    <div class="bp-section">
      <div class="bp-section-title">Daily Formula</div>
      <div class="bp-formula">7h+ <strong>Sleep</strong> &nbsp;+&nbsp; 1 <strong>Training</strong> block (6:30&ndash;7:30PM) &nbsp;+&nbsp; Morning <strong>Deep Work</strong><br>+&nbsp; Capped, weekday-gated <strong>Life OS</strong> &nbsp;+&nbsp; Locked Sunday <strong>Review</strong><br>= a day that compounds</div>
    </div>

    <div class="bp-section">
      <div class="bp-section-title">Weekly Map</div>
      <div class="bp-map-wrap">
        <table class="bp-map-table">
          <tr><th>Day</th><th>Wake</th><th>Academic</th><th>Life OS</th><th>Note</th></tr>
          <tr><td>Mon</td><td>7:00 AM</td><td>5.5h</td><td>1.5h</td><td>Morning-heavy</td></tr>
          <tr><td>Tue</td><td>6:00 AM</td><td>4.5h</td><td>&mdash;</td><td>6AM start</td></tr>
          <tr><td>Wed</td><td>7:00 AM</td><td>2.75h</td><td>1.5h</td><td>Morning-heavy</td></tr>
          <tr><td>Thu</td><td>6:00 AM</td><td>~0.5h</td><td>&mdash;</td><td style="color:#ef4444">&#9888; High load</td></tr>
          <tr><td>Fri</td><td>7:00 AM</td><td>5.5h</td><td>3.5h</td><td>Morning-heavy</td></tr>
          <tr><td>Sat</td><td>7:00 AM</td><td>5.5h</td><td>5.5h</td><td>Power day</td></tr>
          <tr><td>Sun</td><td>7:00 AM</td><td>5.5h</td><td>2.5h</td><td>Review day</td></tr>
        </table>
      </div>
    </div>

    <div class="bp-section">
      <div class="bp-section-title">Academic OS &middot; Fitness OS &middot; Sleep OS</div>
      <div class="bp-os-grid">
        <div class="bp-os-card" style="border-color:rgba(34,211,160,.3)"><h3 style="color:#22d3a0">Academic OS</h3><ul>
          <li>Hardest subject first, always</li>
          <li>Deep work happens before any class, in the morning block</li>
          <li>PYQ sessions slot into morning time when syllabus is ahead</li>
          <li>Thursday is protected, not pushed &mdash; accept lower output that day</li>
          <li>Review beats new material in the final hour before sleep</li>
        </ul></div>
        <div class="bp-os-card" style="border-color:rgba(249,115,22,.3)"><h3 style="color:#f97316">Fitness OS</h3><ul>
          <li>Training is 6:30&ndash;7:30PM, 7 days &mdash; never moves for anything else</li>
          <li>Protein shake within 45 minutes of finishing training</li>
          <li>Calisthenics programming layered in as a separate block (TBD)</li>
          <li>Training fatigue doesn't excuse skipping review &mdash; plan around it</li>
        </ul></div>
        <div class="bp-os-card" style="border-color:rgba(165,180,252,.3)"><h3 style="color:#a5b4fc">Sleep OS</h3><ul>
          <li>7h minimum, every night, always</li>
          <li>Two wake patterns: 6AM (Tue/Thu) and 7AM (every other day)</li>
          <li>Bedtime matches next morning's wake &mdash; 11PM before 6AM days, 11:45PM before 7AM days</li>
          <li>Wind-down window (no new work) starts 45min before target bedtime</li>
        </ul></div>
      </div>
    </div>
  </div>
</div>

<!-- WEEKLY CALENDAR OVERLAY STYLES -->


<!-- WEEKLY CALENDAR OVERLAY HTML -->
<div class="cal-ov" id="cal-ov">
  <div class="cal-ov-inner">
    <button class="cal-close-btn" id="cal-close">&times;</button>
    <div class="cal-hdr">
      <div class="cal-logo">NEO.OS</div>
      <div class="cal-title">Weekly Calendar Architecture</div>
      <div class="cal-sub">IIT Roorkee &middot; BS-MS MnC &middot; September 2026</div>
      <div class="cal-legend" id="cal-legend"></div>
    </div>
    <div class="cal-scroll">
      <div class="cal-grid" id="cal-grid"></div>
      <div class="stats-strip" id="cal-stats"></div>
    </div>
    <div class="cal-totals">
      <div class="cal-totals-title">Weekly Totals</div>
      <div class="totals-grid">
        <div class="tc"><div class="tc-icon">&#128218;</div><div><div class="tc-lbl">Academic Deep Work</div><div class="tc-val" style="color:#22d3a0">~28h</div><div class="tc-sub">Mon 5.5 &middot; Tue 4.5 &middot; Wed 2.75 &middot; Thu 0.5 &middot; Fri 5.5 &middot; Sat 5.5 &middot; Sun 5.5</div></div></div>
        <div class="tc"><div class="tc-icon">&#128640;</div><div><div class="tc-lbl">Life OS Build Time</div><div class="tc-val" style="color:#8b5cf6">~10h</div><div class="tc-sub">Mon 1.5 &middot; Wed 1.5 &middot; Fri 1.5 &middot; Sat 5 &middot; Sun 2.5</div></div></div>
        <div class="tc"><div class="tc-icon">&#128170;</div><div><div class="tc-lbl">Training</div><div class="tc-val" style="color:#f97316">7h</div><div class="tc-sub">6 sessions &middot; 1h each &middot; 6:30&ndash;7:30 PM daily</div></div></div>
        <div class="tc"><div class="tc-icon">&#127891;</div><div><div class="tc-lbl">Lectures / Classes</div><div class="tc-val" style="color:#93c5fd">~20h</div><div class="tc-sub">Varies Mon&ndash;Sat &middot; Thu heaviest</div></div></div>
        <div class="tc"><div class="tc-icon">&#128564;</div><div><div class="tc-lbl">Sleep (target)</div><div class="tc-val" style="color:#a5b4fc">~50h</div><div class="tc-sub">M/W/F/Sa/Su 7h15m &middot; Tu/Th 7h</div></div></div>
        <div class="tc"><div class="tc-icon">&#128267;</div><div><div class="tc-lbl">Focused Hours / Day</div><div class="tc-val" style="color:#00d9ff">8&ndash;10h</div><div class="tc-sub">Target: &ge;11h on Sat &middot; Thu exception ~3h</div></div></div>
      </div>
    </div>
    <div class="notes-grid">
      <div class="nc" style="border-color:rgba(239,68,68,.3)"><h3 style="color:#ef4444">&#9888; Thursday Warning</h3><ul><li>Heaviest class day (~8&ndash;9h lectures with gaps)</li><li>6AM wake &mdash; earliest of the week</li><li>No dedicated academic morning block</li><li>Evening: light review only, no Life OS</li><li>Bed 11PM sharp &mdash; recovery critical</li></ul></div>
      <div class="nc" style="border-color:rgba(34,211,160,.3)"><h3 style="color:#22d3a0">&#10003; Morning Work Protocol</h3><ul><li>Mornings = primary academic deep work</li><li>No classes until afternoon (Mon/Fri/Sat/Sun)</li><li>1st task: most difficult subject first</li><li>PYQ sessions during morning when ahead</li><li>Wed morning = 2.75h &mdash; still treated as heavy</li></ul></div>
      <div class="nc" style="border-color:rgba(139,92,246,.3)"><h3 style="color:#8b5cf6">&#128640; Life OS Rules</h3><ul><li>Weekday evenings: 1&ndash;1.5h (Mon/Wed/Fri only)</li><li>Weekend: ~3h/day (Saturday prioritized)</li><li>Total target: 7&ndash;10h/week</li><li>Never sacrifice sleep or class prep for it</li><li>Sunday: review only (no new build work)</li></ul></div>
      <div class="nc" style="border-color:rgba(251,191,36,.3)"><h3 style="color:#fbbf24">&#127769; Sleep Architecture</h3><ul><li>Mon / Wed / Fri / Sat / Sun &rarr; Bed 11:45 PM</li><li>Tue / Thu &rarr; Bed 11:00 PM (6AM wake days)</li><li>Minimum 7h quality sleep &mdash; non-negotiable</li><li>Mon/Wed/Fri/Sat/Sun wake 7AM (+7h15m)</li><li>Tue/Thu wake 6AM (+7h)</li></ul></div>
      <div class="nc" style="border-color:rgba(249,115,22,.3)"><h3 style="color:#f97316">&#128170; Training Lock</h3><ul><li>6:30&ndash;7:30 PM every day &mdash; hard lock</li><li>Friday: 15&ndash;20min rest after 6PM class end</li><li>Protein shake: Mon/Wed/Thu 5:30&ndash;5:45PM</li><li>Friday shake: 10:30AM (during morning block)</li><li>Calisthenics program: separate session TBD</li></ul></div>
      <div class="nc" style="border-color:rgba(20,184,166,.3)"><h3 style="color:#14b8a6">&#128260; Sunday Review (9&ndash;10PM)</h3><ul><li>Academic: PYQ gaps, assignments, weak topics</li><li>Life OS: revenue, user feedback, week output</li><li>Fitness: body weight, strength PRs, energy</li><li>Life Architecture: sleep avg, time audit</li><li>Lock next week's 3 priorities before sleep</li></ul></div>
    </div>
  </div>
</div>

<!-- WEEKLY TRACKER STYLES -->


<!-- WEEKLY TRACKER SECTION -->
<section id="wt-section" class="wrap" style="margin-bottom:56px">
  <div class="sec-hd">
    <div><span class="sl">Operating Rhythm</span><div class="st">Weekly Tracker</div></div>
  </div>
  <div class="wt-tabs">
    <button class="wt-tab on" data-wt="overview">Overview</button>
    <button class="wt-tab" data-wt="mon">Mon</button>
    <button class="wt-tab" data-wt="tue">Tue</button>
    <button class="wt-tab" data-wt="wed">Wed</button>
    <button class="wt-tab" data-wt="thu">Thu</button>
    <button class="wt-tab" data-wt="fri">Fri</button>
    <button class="wt-tab" data-wt="sat">Sat</button>
    <button class="wt-tab" data-wt="sun">Sun</button>
  </div>
  <div class="wt-page on" id="wt-page-overview">
    <div class="wt-card">
      <div class="wt-card-title">This Week at a Glance</div>
      <div id="wt-snap"></div>
    </div>
    <div class="wt-card">
      <div class="wt-card-title">Week Priorities</div>
      <div class="wt-ov-grid">
        <div class="wt-pri-field"><label class="wt-pri-label">Academic</label><input class="wt-pri-inp" id="wt-pri-acad" placeholder="This week's top academic goal&hellip;"></div>
        <div class="wt-pri-field"><label class="wt-pri-label">Life OS</label><input class="wt-pri-inp" id="wt-pri-life" placeholder="This week's Life OS milestone&hellip;"></div>
        <div class="wt-pri-field"><label class="wt-pri-label">Training</label><input class="wt-pri-inp" id="wt-pri-fit" placeholder="This week's training focus&hellip;"></div>
        <div class="wt-pri-field"><label class="wt-pri-label">Win Condition</label><input class="wt-pri-inp" id="wt-pri-win" placeholder="What does a win look like this week?"></div>
      </div>
    </div>
  </div>
  <div class="wt-page" id="wt-page-mon"></div>
  <div class="wt-page" id="wt-page-tue"></div>
  <div class="wt-page" id="wt-page-wed"></div>
  <div class="wt-page" id="wt-page-thu"></div>
  <div class="wt-page" id="wt-page-fri"></div>
  <div class="wt-page" id="wt-page-sat"></div>
  <div class="wt-page" id="wt-page-sun"></div>
</section>

<!-- MONDAY RESET MODAL -->
<div class="wt-reset-ov" id="wt-reset-ov">
  <div class="wt-reset-modal">
    <div class="wt-reset-title">New week, clean slate?</div>
    <div class="wt-reset-sub">It's Monday &mdash; last week's tracker data is still here. Choose how to start this week.</div>
    <div class="wt-reset-btns">
      <button id="wt-push-reset">Push to Notion &amp; Reset</button>
      <button id="wt-just-reset">Reset Without Push</button>
      <button id="wt-keep">Keep Last Week's Data</button>
    </div>
  </div>
</div>

<!-- BLUEPRINT OVERLAY CONTROLLER -->


<!-- WEEKLY CALENDAR CONTROLLER -->


<!-- WEEKLY TRACKER CONTROLLER -->`;

export default function ClientBody() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
      <Script src="/life-os-main.js" strategy="afterInteractive" />
    </>
  );
}

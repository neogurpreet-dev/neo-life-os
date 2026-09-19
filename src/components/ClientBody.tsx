'use client';

import Script from 'next/script';

const PAGE_CSS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Roboto+Mono:wght@400;500&family=Playfair+Display:wght@600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');


*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #06070E;
  --g1: rgba(255,255,255,.045);
  --g2: rgba(255,255,255,.08);
  --gb: rgba(255,255,255,.09);
  --gbh: rgba(255,255,255,.17);
  --t1: #F0F4FC;
  --t2: #8594AA;
  --t3: #3D4A5C;
  --accent: #3B82F6;
  --sans: 'Inter', system-ui, sans-serif;
  --mono: 'Roboto Mono', ui-monospace, monospace;
  /* shared action red (used by delete buttons outside scoped wrappers) */
  --er: #E05555; --er-d: rgba(224,85,85,.14);
  /* fitness tracker */
  --fa: #22C55E; --fa-d: rgba(34,197,94,.14);
  --fo: #F97316; --fo-d: rgba(249,115,22,.14);
  /* habit tracker */
  --ha: #A78BFA; --ha-d: rgba(167,139,250,.14);
  /* reminders */
  --ra: #34D399; --ra-d: rgba(52,211,153,.14);
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--t1);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Fixed gradient blobs — what glass blurs against */
body::before {
  content: '';
  position: fixed; inset: 0; z-index: -1;
  background:
    radial-gradient(ellipse 65% 55% at 10% 10%, rgba(59,130,246,.20) 0%, transparent 58%),
    radial-gradient(ellipse 55% 48% at 92% 75%, rgba(167,139,250,.15) 0%, transparent 58%),
    radial-gradient(ellipse 45% 40% at 55% 100%, rgba(52,211,153,.08) 0%, transparent 55%),
    var(--bg);
}

/* ─── HERO ─── */
.hero {
  min-height: 64vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 88px 24px 56px;
}
.hero-eyebrow {
  font-family: var(--mono);
  font-size: 10px; letter-spacing: .22em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 24px; opacity: .9;
}
.hero-name {
  font-weight: 900;
  font-size: clamp(60px, 10vw, 104px);
  letter-spacing: -5px; line-height: .90;
  background: linear-gradient(160deg, #fff 0%, rgba(255,255,255,.65) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-sub {
  margin-top: 24px;
  font-size: clamp(12px, 1.4vw, 14px);
  color: var(--t2); letter-spacing: .01em; line-height: 1.75;
  font-weight: 400;
}
.hero-rule {
  width: 48px; height: 1px; margin: 28px auto 0;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,.8), transparent);
}
.hero-pills {
  margin-top: 32px;
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
}
.hero-pill {
  font-family: var(--mono); font-size: 10px;
  letter-spacing: .07em; color: var(--t3);
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 9999px; padding: 5px 14px;
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
}

/* ─── STATS ROW ─── */
.stats-strip {
  padding-inline: clamp(16px,3vw,40px);
  max-width: 1320px; margin: 0 auto 60px;
}
.stats-inner {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.sc {
  background: var(--g1);
  border: 1px solid var(--gb);
  border-radius: 14px; padding: 20px 16px;
  text-align: center;
  -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
  transition: border-color 180ms, background 180ms;
  position: relative; overflow: hidden;
}
.sc::after {
  content: '';
  position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 32px; height: 2px;
  background: var(--accent); opacity: 0; transition: opacity 200ms;
}
.sc:hover { border-color: var(--gbh); background: var(--g2); }
.sc:hover::after { opacity: 1; }
.sc-v {
  font-family: var(--mono); font-size: 24px; font-weight: 500;
  color: var(--t1); display: block; letter-spacing: -.02em;
}
.sc-l {
  display: block; margin-top: 5px;
  font-size: 10px; color: var(--t3);
  letter-spacing: .12em; text-transform: uppercase;
}

/* ─── HABIT TRACKER ─── */
.hab-progress {
  font-family: var(--mono); font-size: 11px; color: var(--t3);
  letter-spacing: .02em;
}
.hab-add-btn {
  background: transparent; border: 1px solid var(--gb); color: var(--ha);
  border-radius: 8px; padding: 6px 14px;
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: border-color .15s, background .15s; white-space: nowrap;
}
.hab-add-btn:hover { border-color: var(--ha); background: var(--ha-d); }
.hab-add-form {
  display: flex; gap: 8px; margin-bottom: 14px; align-items: center;
  animation: habSlide .18s ease;
}
@keyframes habSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
.hab-emoji-inp {
  width: 52px; text-align: center; flex-shrink: 0;
  background: var(--g1); border: 1px solid var(--gb); border-radius: 10px;
  color: var(--t1); font-size: 18px; padding: 9px 6px; outline: none;
  transition: border-color .15s;
}
.hab-name-inp {
  flex: 1; min-width: 0;
  background: var(--g1); border: 1px solid var(--gb); border-radius: 10px;
  color: var(--t1); font-family: var(--sans); font-size: 13px; font-weight: 500;
  padding: 9px 14px; outline: none; transition: border-color .15s;
}
.hab-emoji-inp:focus, .hab-name-inp:focus { border-color: var(--ha); }
.hab-save-btn {
  background: var(--ha); color: #fff; border: none; border-radius: 10px;
  padding: 9px 18px; font-family: var(--sans); font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: opacity .15s;
}
.hab-save-btn:hover { opacity: .85; }
.hab-cancel-btn {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  border-radius: 10px; padding: 9px 14px; font-family: var(--sans);
  font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap;
  transition: color .15s, border-color .15s;
}
.hab-cancel-btn:hover { color: var(--t1); border-color: var(--gbh); }
.hab-list { display: flex; flex-direction: column; gap: 8px; }
.hab-row {
  display: flex; align-items: center; gap: 12px;
  background: var(--g1); border: 1px solid var(--gb); border-radius: 14px;
  padding: 12px 16px; cursor: pointer;
  -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
  transition: border-color .15s, opacity .15s;
}
.hab-row:hover { border-color: var(--gbh); }
.hab-row.dragging { opacity: .35; }
.hab-drag {
  cursor: grab; color: var(--t3); font-size: 14px; flex-shrink: 0;
  user-select: none; line-height: 1;
}
.hab-drag:active { cursor: grabbing; }
.hab-emoji { font-size: 18px; flex-shrink: 0; line-height: 1; }
.hab-name {
  flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: var(--t1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hab-dots { display: flex; gap: 6px; flex-shrink: 0; }
.hab-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: transparent; border: 1.5px solid rgba(255,255,255,.18);
  transition: background .38s cubic-bezier(.34,1.56,.64,1), border-color .38s ease,
    transform .38s cubic-bezier(.34,1.56,.64,1), box-shadow .38s ease;
}
.hab-dot.today:not(.filled) { border-color: rgba(167,139,250,.5); }
.hab-dot.filled {
  background: var(--ha); border-color: var(--ha);
  box-shadow: 0 0 6px rgba(167,139,250,.55);
  transform: scale(1.15);
}
.hab-streak {
  font-family: var(--mono); font-size: 11px; color: #FB923C;
  flex-shrink: 0; width: 30px; text-align: right;
}
.hab-toggle {
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  padding: 6px 14px; border-radius: 20px; cursor: pointer; flex-shrink: 0;
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  transition: background .15s, border-color .15s, color .15s, box-shadow .15s;
}
.hab-toggle:hover { border-color: var(--gbh); color: var(--t1); }
.hab-toggle.on {
  background: var(--ha); border-color: var(--ha); color: #fff;
  box-shadow: 0 0 10px rgba(167,139,250,.4);
}
.hab-empty {
  padding: 32px 0; text-align: center; color: var(--t3);
  font-size: 12px; font-family: var(--mono);
}
.hab-archived-wrap { margin-top: 14px; }
.hab-archived-toggle {
  background: none; border: none; color: var(--t3);
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  cursor: pointer; padding: 4px 0; transition: color .15s;
}
.hab-archived-toggle:hover { color: var(--t1); }
.hab-archived-list { display: none; flex-direction: column; gap: 6px; margin-top: 8px; }
.hab-arow {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px; padding: 8px 14px; cursor: pointer; opacity: .65;
  transition: opacity .15s;
}
.hab-arow:hover { opacity: 1; }
.hab-arow .hab-name { font-weight: 500; }
/* habit edit modal — centered, matches other add/edit dialogs in the app */
.hab-ov {
  -webkit-position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px);
  position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  z-index: 370; opacity: 0; pointer-events: none; transition: opacity .2s;
}
.hab-ov.vis { opacity: 1; pointer-events: all; }
.hab-modal {
  background: #131723; border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 26px 22px 28px;
  width: 100%; max-width: 420px; transform: translateY(14px) scale(.97);
  transition: transform .22s; max-height: 90vh; overflow-y: auto;
}
.hab-ov.vis .hab-modal { transform: translateY(0) scale(1); }
.hab-mhdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.hab-mtitle { font-size: 1.1rem; font-weight: 800; color: var(--t1); letter-spacing: -.02em; }
.hab-mx {
  background: rgba(255,255,255,.07); border: none; width: 30px; height: 30px;
  border-radius: 50%; color: var(--t2); font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: color .15s;
}
.hab-mx:hover { color: var(--t1); }
.hab-fg { margin-bottom: 12px; }
.hab-fg label {
  display: block; font-size: 11px; font-weight: 600; color: var(--t3);
  margin-bottom: 5px; text-transform: uppercase; letter-spacing: .06em;
}
.hab-fg input {
  width: 100%; background: rgba(255,255,255,.04); border: 1px solid var(--gb);
  border-radius: 8px; color: var(--t1); font-family: var(--sans);
  font-size: 14px; padding: 9px 12px; outline: none; transition: border-color .15s;
}
.hab-fg input:focus { border-color: var(--ha); }
.hab-mfoot { display: flex; gap: 8px; margin-top: 16px; }
.hab-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 15px; border-radius: 8px; font-family: var(--sans);
  font-size: 13px; font-weight: 600; cursor: pointer; border: none;
  transition: opacity .15s; white-space: nowrap;
}
.hab-btn:hover { opacity: .85; }
.hab-btn-p { background: var(--ha); color: #fff; flex: 1; justify-content: center; }
.hab-btn-g { background: var(--g1); border: 1px solid var(--gb); color: var(--t1); }
.hab-btn-r { background: var(--er-d); color: var(--er); }
/* emoji picker popover — anchored near whichever emoji field was clicked */
.hab-emoji-pop {
  position: fixed; z-index: 900;
  display: none; flex-direction: column;
  width: 320px; height: 360px;
  background: #131723; border: 1px solid var(--gbh);
  border-radius: 14px; padding: 10px;
  box-shadow: 0 24px 60px rgba(0,0,0,.55);
}
.hab-emoji-pop.vis { display: flex; }
.hab-emoji-search {
  width: 100%; flex-shrink: 0;
  background: rgba(255,255,255,.05); border: 1px solid var(--gb);
  border-radius: 8px; color: var(--t1); font-family: var(--sans);
  font-size: 12.5px; padding: 7px 10px; outline: none;
  transition: border-color .15s; margin-bottom: 8px;
}
.hab-emoji-search:focus { border-color: var(--ha); }
.hab-emoji-tabs {
  display: flex; gap: 2px; flex-shrink: 0; margin-bottom: 8px;
  overflow-x: auto; scrollbar-width: none;
}
.hab-emoji-tabs::-webkit-scrollbar { display: none; }
.hab-emoji-tabs button {
  flex-shrink: 0; width: 30px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 7px; cursor: pointer;
  font-size: 15px; line-height: 1; opacity: .5; transition: background .12s, opacity .12s;
}
.hab-emoji-tabs button:hover { opacity: .8; }
.hab-emoji-tabs button.on { background: var(--ha-d); opacity: 1; }
.hab-emoji-grid {
  flex: 1; min-height: 0; overflow-y: auto;
  display: flex; flex-wrap: wrap; align-content: flex-start; gap: 2px;
}
.hab-emoji-grid button {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; border-radius: 7px; cursor: pointer;
  font-size: 17px; line-height: 1; transition: background .12s; flex-shrink: 0;
}
.hab-emoji-grid button:hover { background: var(--ha-d); }
.hab-emoji-empty {
  width: 100%; text-align: center; color: var(--t3);
  font-size: 12px; font-family: var(--mono); padding: 24px 0;
}

/* ─── NOTION PUSH ─── */
.ntn-fab {
  position: fixed; right: 24px; bottom: 24px; z-index: 500;
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #2E2E2E, #000);
  border: 1px solid var(--gbh); color: #fff; font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,.5);
  transition: transform .15s, box-shadow .15s;
}
.ntn-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,0,0,.6); }
.ntn-ov {
  -webkit-position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px);
  position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  z-index: 950; opacity: 0; pointer-events: none; transition: opacity .2s;
}
.ntn-ov.vis { opacity: 1; pointer-events: all; }
.ntn-modal {
  background: #131723; border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 26px 22px 28px;
  width: 100%; max-width: 480px; transform: translateY(14px) scale(.97);
  transition: transform .22s; max-height: 88vh; overflow-y: auto;
}
.ntn-ov.vis .ntn-modal { transform: translateY(0) scale(1); }
.ntn-mhdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.ntn-mtitle { font-size: 1.1rem; font-weight: 800; color: var(--t1); letter-spacing: -.02em; }
.ntn-mhdr-btns { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.ntn-mx, .ntn-gear {
  background: rgba(255,255,255,.07); border: none; width: 30px; height: 30px;
  border-radius: 50%; color: var(--t2); font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: color .15s;
}
.ntn-gear { font-size: 14px; }
.ntn-mx:hover, .ntn-gear:hover { color: var(--t1); }
.ntn-msub { font-size: 12px; color: var(--t3); margin-bottom: 16px; line-height: 1.5; }
.ntn-set-inp {
  width: 100%; background: rgba(255,255,255,.04); border: 1px solid var(--gb);
  border-radius: 8px; color: var(--t1); font-family: var(--sans);
  font-size: 13px; padding: 9px 12px; outline: none; transition: border-color .15s;
  box-sizing: border-box; margin-bottom: 14px;
}
.ntn-set-inp:focus { border-color: var(--gbh); }
.ntn-set-foot { display: flex; gap: 8px; }
.ntn-set-cancel {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  border-radius: 8px; padding: 10px 16px; font-family: var(--sans);
  font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
  transition: color .15s, border-color .15s;
}
.ntn-set-cancel:hover { color: var(--t1); border-color: var(--gbh); }
.ntn-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
.ntn-row {
  display: flex; align-items: center; gap: 10px;
  background: var(--g1); border: 1px solid var(--gb); border-radius: 10px;
  padding: 10px 12px; cursor: pointer; transition: border-color .15s;
}
.ntn-row:hover { border-color: var(--gbh); }
.ntn-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--t1); cursor: pointer; flex-shrink: 0; }
.ntn-row-label { flex: 1; font-size: 13px; font-weight: 600; color: var(--t1); }
.ntn-row-sub { font-size: 11px; color: var(--t3); font-family: var(--mono); margin-top: 2px; }
.ntn-row-status { font-size: 12px; flex-shrink: 0; min-width: 20px; text-align: center; }
.ntn-mfoot { display: flex; gap: 8px; align-items: center; }
.ntn-push-btn {
  flex: 1; background: #fff; color: #111; border: none; border-radius: 8px;
  padding: 10px 15px; font-family: var(--sans); font-size: 13px; font-weight: 700;
  cursor: pointer; transition: opacity .15s;
}
.ntn-push-btn:hover { opacity: .85; }
.ntn-push-btn:disabled { opacity: .4; cursor: default; }
.ntn-status-line { font-size: 11px; color: var(--t3); font-family: var(--mono); margin-top: 10px; min-height: 14px; line-height: 1.5; }
.ntn-status-line.err { color: #F87171; }
.ntn-status-line.ok { color: #34D399; }

/* ─── LOCK-IN MODE ─── */
.lockin-btn {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  border-radius: 8px; padding: 6px 14px; font-family: var(--sans); font-size: 12px;
  font-weight: 600; cursor: pointer; transition: border-color .15s, background .15s, color .15s;
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); white-space: nowrap;
}
.lockin-btn:hover { border-color: var(--gbh); color: var(--t1); background: var(--g2); }
.lockin-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(6,7,14,.82);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  opacity: 0; pointer-events: none;
  transition: opacity .28s ease;
}
.lockin-overlay.vis { opacity: 1; pointer-events: auto; }
#pomo-section.lockin-focus {
  position: relative; z-index: 501;
  box-shadow: 0 0 0 1px rgba(167,139,250,.4);
  transition: box-shadow .2s;
}
.lockin-banner {
  position: fixed; top: 0; left: 0; right: 0; z-index: 502;
  background: rgba(13,15,26,.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(167,139,250,.25);
  padding: 10px 24px; display: none; align-items: center; justify-content: space-between;
}
.lockin-banner.vis { display: flex; }
.lockin-banner-text { font-size: 13px; color: var(--t1); font-weight: 500; }
.lockin-exit-btn {
  background: var(--ha-d); border: 1px solid var(--ha); color: var(--ha);
  padding: 5px 16px; border-radius: 20px; font-size: 12px; cursor: pointer;
  font-family: var(--sans); font-weight: 600; transition: opacity .15s; flex-shrink: 0;
}
.lockin-exit-btn:hover { opacity: .85; }

/* ─── REMINDER SETTER ─── */
.rem-add-btn {
  background: transparent; border: 1px solid var(--gb); color: var(--ra);
  border-radius: 8px; padding: 6px 14px;
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: border-color .15s, background .15s; white-space: nowrap;
}
.rem-add-btn:hover { border-color: var(--ra); background: var(--ra-d); }
.rem-quickbar { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.rem-inp-title {
  flex: 1; min-width: 180px;
  background: var(--g1); border: 1px solid var(--gb); border-radius: 11px;
  color: var(--t1); font-family: var(--sans); font-size: 13px; font-weight: 500;
  padding: 10px 14px; outline: none; transition: border-color .2s, box-shadow .2s;
}
.rem-inp-title::placeholder { color: var(--t3); }
.rem-inp-dt {
  background: var(--g1); border: 1px solid var(--gb); border-radius: 11px;
  color: var(--t1); font-family: var(--sans); font-size: 13px;
  padding: 10px 14px; outline: none; transition: border-color .2s, box-shadow .2s;
  color-scheme: dark;
}
.rem-inp-title:focus, .rem-inp-dt:focus {
  border-color: rgba(52,211,153,.55);
  box-shadow: 0 0 0 3px rgba(52,211,153,.10);
}
.rem-set-btn {
  background: var(--ra); color: #0D1017; border: none; border-radius: 11px;
  padding: 10px 20px; font-family: var(--sans); font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap; transition: opacity .15s;
}
.rem-set-btn:hover { opacity: .85; }
.rem-list { display: flex; flex-direction: column; gap: 8px; }
.rem-card {
  display: flex; align-items: center; gap: 12px;
  background: var(--g1); border: 1px solid var(--gb); border-radius: 14px;
  padding: 12px 16px; cursor: pointer;
  -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
  transition: border-color .15s;
}
.rem-card:hover { border-color: var(--gbh); }
.rem-card.overdue { border-left: 2px solid rgba(248,113,113,.55); }
.rem-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rem-dot.upcoming { background: var(--ra); box-shadow: 0 0 5px rgba(52,211,153,.55); }
.rem-dot.soon { background: #FBBF24; box-shadow: 0 0 5px rgba(251,191,36,.55); }
.rem-dot.overdue { background: #F87171; box-shadow: 0 0 5px rgba(248,113,113,.55); }
.rem-body { flex: 1; min-width: 0; }
.rem-top-row { display: flex; align-items: center; gap: 8px; }
.rem-title {
  font-size: 13px; font-weight: 600; color: var(--t1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rem-rel { font-family: var(--mono); font-size: 10px; color: var(--t2); flex-shrink: 0; }
.rem-when { font-family: var(--mono); font-size: 11px; color: var(--t2); margin-top: 3px; }
.rem-msg {
  font-size: 12px; color: var(--t3); margin-top: 3px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rem-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.rem-cal-btn {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  border-radius: 8px; width: 30px; height: 30px; font-size: 13px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: border-color .15s, color .15s, background .15s;
}
.rem-cal-btn:hover { border-color: var(--ra); color: var(--ra); background: var(--ra-d); }
.rem-cal-btn:disabled { opacity: .4; cursor: default; }
.rem-cal-chip {
  font-family: var(--mono); font-size: 9.5px; color: var(--ra);
  background: var(--ra-d); border: 1px solid rgba(52,211,153,.3);
  border-radius: 20px; padding: 3px 9px; flex-shrink: 0; white-space: nowrap;
}
.rem-done-btn {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  border-radius: 20px; padding: 5px 12px; font-family: var(--sans);
  font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0; white-space: nowrap;
  transition: background .15s, border-color .15s, color .15s;
}
.rem-done-btn:hover { background: var(--ra-d); border-color: var(--ra); color: var(--ra); }
.rem-trash-btn {
  background: none; border: none; color: var(--t3); cursor: pointer; font-size: 14px;
  padding: 4px; border-radius: 4px; transition: color .15s; flex-shrink: 0;
}
.rem-trash-btn:hover { color: #F87171; }
.rem-empty {
  padding: 32px 0; text-align: center; color: var(--t3);
  font-size: 12px; font-family: var(--mono); opacity: .35;
}
/* edit modal — centered, matches the app's other add/edit dialogs */
.rem-ov {
  -webkit-position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px);
  position: fixed; inset: 0; background: rgba(0,0,0,.62); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  z-index: 370; opacity: 0; pointer-events: none; transition: opacity .2s;
}
.rem-ov.vis { opacity: 1; pointer-events: all; }
.rem-modal {
  background: #131723; border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 26px 22px 28px;
  width: 100%; max-width: 420px; transform: translateY(14px) scale(.97);
  transition: transform .22s; max-height: 90vh; overflow-y: auto;
}
.rem-ov.vis .rem-modal { transform: translateY(0) scale(1); }
.rem-mhdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.rem-mtitle { font-size: 1.1rem; font-weight: 800; color: var(--t1); letter-spacing: -.02em; }
.rem-mx {
  background: rgba(255,255,255,.07); border: none; width: 30px; height: 30px;
  border-radius: 50%; color: var(--t2); font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: color .15s;
}
.rem-mx:hover { color: var(--t1); }
.rem-fg { margin-bottom: 12px; }
.rem-fg label {
  display: block; font-size: 11px; font-weight: 600; color: var(--t3);
  margin-bottom: 5px; text-transform: uppercase; letter-spacing: .06em;
}
.rem-fg input, .rem-fg textarea {
  width: 100%; background: rgba(255,255,255,.04); border: 1px solid var(--gb);
  border-radius: 8px; color: var(--t1); font-family: var(--sans);
  font-size: 14px; padding: 9px 12px; outline: none; transition: border-color .15s;
  color-scheme: dark;
}
.rem-fg input:focus, .rem-fg textarea:focus { border-color: var(--ra); }
.rem-fg textarea { resize: vertical; min-height: 64px; }
.rem-mfoot { display: flex; gap: 8px; margin-top: 16px; }
.rem-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 15px; border-radius: 8px; font-family: var(--sans);
  font-size: 13px; font-weight: 600; cursor: pointer; border: none;
  transition: opacity .15s; white-space: nowrap;
}
.rem-btn:hover { opacity: .85; }
.rem-btn-p { background: var(--ra); color: #0D1017; flex: 1; justify-content: center; }
.rem-btn-g { background: var(--g1); border: 1px solid var(--gb); color: var(--t1); }
.rem-btn-r { background: var(--er-d); color: var(--er); }

/* ─── WRAP ─── */
.wrap {
  max-width: 1320px; margin: 0 auto;
  padding-inline: clamp(16px,3vw,40px);
}

/* ─── SECTION HEADING ─── */
.sl {
  font-family: var(--mono); font-size: 10px;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--accent); display: block; margin-bottom: 6px;
}
.st {
  font-size: clamp(18px,2.2vw,22px);
  font-weight: 700; letter-spacing: -.3px; color: var(--t1);
}
.sec-hd {
  display: flex; flex-wrap: wrap;
  align-items: flex-end; justify-content: space-between;
  gap: 14px; margin-bottom: 22px;
}

/* ─── FILTER PILL GROUP ─── */
.filters {
  display: flex; gap: 2px;
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 10px; padding: 3px;
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
}
.ftab {
  background: transparent; border: none; cursor: pointer;
  color: var(--t2); font-weight: 500; font-size: 12px;
  padding: 6px 14px; border-radius: 7px;
  transition: color 110ms, background 110ms;
  font-family: var(--sans);
}
.ftab:hover { color: var(--t1); }
.ftab.on {
  background: var(--g2); color: var(--t1);
  box-shadow: 0 1px 4px rgba(0,0,0,.5);
}

/* ─── KANBAN ─── */
.kanban {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 14px; align-items: start;
}
.k-col {
  background: var(--g1);
  border: 1px solid var(--gb);
  border-radius: 16px; overflow: hidden;
  -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
}
.k-head {
  padding: 13px 15px 11px;
  border-bottom: 1px solid var(--gb);
  display: flex; align-items: center; gap: 9px;
  position: sticky; top: 0;
  background: inherit;
  -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
}
.k-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.k-hname {
  font-size: 11.5px; font-weight: 600; letter-spacing: .01em;
  color: var(--t1); flex: 1;
}
.k-cnt {
  font-family: var(--mono); font-size: 10px; color: var(--t3);
  background: rgba(255,255,255,.05);
  border: 1px solid var(--gb);
  border-radius: 5px; padding: 2px 7px;
}
.k-body {
  padding: 8px;
  display: flex; flex-direction: column; gap: 6px;
  max-height: 520px; overflow-y: auto;
}
.k-body::-webkit-scrollbar { width: 2px; }
.k-body::-webkit-scrollbar-track { background: transparent; }
.k-body::-webkit-scrollbar-thumb { background: var(--gb); border-radius: 2px; }

.k-card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px; padding: 11px 12px 9px;
  display: flex; flex-direction: column; gap: 7px;
  cursor: pointer; opacity: 0; transform: translateY(6px);
}
.k-card.in {
  opacity: 1; transform: none;
  transition: opacity 280ms ease, transform 280ms ease,
    background 150ms, border-color 150ms, box-shadow 150ms;
}
.k-card:hover {
  background: rgba(255,255,255,.055);
  border-color: rgba(255,255,255,.13);
}
.k-top {
  display: flex; justify-content: space-between; align-items: center;
}
.k-tag {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--mono); font-size: 9.5px; font-weight: 500;
  letter-spacing: .04em;
}
.k-tag-dot { width: 5px; height: 5px; border-radius: 50%; }
.k-due {
  font-family: var(--mono); font-size: 9.5px; color: var(--t3);
}
.k-due.urg { color: #F87171; }
.k-due.soon { color: #FBBF24; }

.k-title {
  font-size: 12px; font-weight: 500;
  color: var(--t1); line-height: 1.4;
}
.k-bar {
  height: 2px; border-radius: 9999px;
  background: rgba(255,255,255,.06); overflow: hidden;
}
.k-fill {
  height: 2px; border-radius: 9999px; width: 0;
}
.k-empty {
  padding: 24px 0; text-align: center;
  font-size: 11px; color: var(--t3); font-family: var(--mono);
}

/* ─── PROGRESS RINGS ─── */
.rings-wrap {
  display: flex; flex-wrap: wrap;
  gap: 24px; justify-content: center;
  margin-top: 28px;
}
.ri {
  display: flex; flex-direction: column;
  align-items: center; gap: 12px; flex: 0 0 auto;
}
.ri-svgw {
  position: relative; width: 116px; height: 116px;
}
.ri-svg {
  width: 116px; height: 116px;
  transform: rotate(-90deg); display: block;
}
.ri-track { fill: none; stroke: rgba(255,255,255,.06); stroke-width: 7; }
.ri-fill  {
  fill: none; stroke-width: 7; stroke-linecap: round;
  transition: stroke-dashoffset 1.3s cubic-bezier(.16,1,.3,1);
}
.ri-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.ri-pct {
  font-family: var(--mono); font-size: 19px; font-weight: 500;
  color: var(--t1); letter-spacing: -.02em; line-height: 1;
}
.ri-tasks {
  font-size: 9px; color: var(--t3); margin-top: 2px; letter-spacing: .06em;
}
.ri-code {
  font-family: var(--mono); font-size: 11px;
  letter-spacing: .06em;
}
.ri-name {
  font-size: 10px; color: var(--t3);
  margin-top: -6px;
}

/* ─── POMODORO ─── */
.pomo-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  align-items: start;
}
.pomo-card {
  background: var(--g1);
  border: 1px solid var(--gb);
  border-radius: 24px;
  padding: 28px 24px 24px;
  -webkit-backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}
.pomo-card::before {
  content: '';
  position: absolute;
  top: 0; left: 50%;
  transform: translateX(-50%);
  width: 60%; height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--pc, #3B82F6),
    transparent);
  transition: background .3s;
}
.pomo-tabs {
  display: flex; gap: 3px; width: 100%;
  background: rgba(255,255,255,.03);
  border: 1px solid var(--gb);
  border-radius: 11px; padding: 3px;
  margin-bottom: 16px;
}
.pomo-tab {
  flex: 1;
  font-family: var(--mono); font-size: 10px;
  letter-spacing: .05em; padding: 5px 6px;
  border-radius: 8px; border: none;
  background: transparent; color: var(--t3);
  cursor: pointer; white-space: nowrap; text-align: center;
  transition: background .2s, color .2s;
}
.pomo-tab:hover { color: var(--t2); }
.pomo-tab.active {
  background: var(--pc, #3B82F6); color: #fff;
  box-shadow: 0 0 10px color-mix(in srgb, var(--pc,#3B82F6) 40%, transparent);
}
.pomo-dur-row {
  display: flex; gap: 8px; width: 100%; margin-bottom: 16px;
}
.pomo-dur {
  flex: 1;
  background: rgba(255,255,255,.03);
  border: 1px solid var(--gb);
  border-radius: 10px; padding: 8px 12px;
  transition: border-color .2s;
}
.pomo-dur:focus-within {
  border-color: color-mix(in srgb, var(--pc,#3B82F6) 55%, transparent);
}
.pomo-dur-lbl {
  font-family: var(--mono); font-size: 8.5px;
  letter-spacing: .12em; text-transform: uppercase; color: var(--t3);
}
.pomo-dur-iw {
  display: flex; align-items: baseline; gap: 4px; margin-top: 2px;
}
.pomo-dur-inp {
  background: transparent; border: none; outline: none;
  font-family: var(--sans); font-size: 18px; font-weight: 700;
  color: var(--t1); width: 38px;
  -moz-appearance: textfield; font-variant-numeric: tabular-nums;
}
.pomo-dur-inp::-webkit-inner-spin-button,
.pomo-dur-inp::-webkit-outer-spin-button { -webkit-appearance: none; }
.pomo-dur-unit { font-family: var(--mono); font-size: 9px; color: var(--t3); }

/* ring */
.pomo-ring-wrap {
  position: relative; width: 200px; height: 200px;
  margin-bottom: 16px;
}
.pomo-ring-svg {
  position: absolute; inset: 0;
  transform: rotate(-90deg); overflow: visible;
}
.pomo-ring-track { fill: none; stroke: rgba(255,255,255,.05); stroke-width: 5; }
.pomo-ring-prog  {
  fill: none; stroke: var(--pc,#3B82F6); stroke-width: 5; stroke-linecap: round;
  transition: stroke-dashoffset .75s cubic-bezier(.16,1,.3,1), stroke .3s;
  filter: drop-shadow(0 0 7px color-mix(in srgb, var(--pc,#3B82F6) 55%, transparent));
}
.pomo-ring-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
}
.pomo-time {
  font-family: var(--sans); font-size: 44px; font-weight: 900;
  letter-spacing: -3px; color: var(--t1); line-height: 1;
  font-variant-numeric: tabular-nums;
}
.pomo-lbl {
  font-family: var(--mono); font-size: 9px;
  letter-spacing: .12em; text-transform: uppercase; color: var(--t3);
}
.pomo-elapsed {
  font-family: var(--mono); font-size: 9px;
  color: var(--pc,#3B82F6); opacity: 0; transition: opacity .3s;
}
.pomo-elapsed.vis { opacity: 1; }

/* badge */
.pomo-badge {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--gb);
  border-radius: 20px; padding: 4px 12px;
  margin-bottom: 14px; max-width: 100%; overflow: hidden;
  font-family: var(--sans); font-size: 11px; font-weight: 500; color: var(--t2);
}
.pomo-badge.hidden { display: none; }
.pomo-badge-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--pc,#3B82F6); flex-shrink: 0;
  animation: blink2 1.5s ease-in-out infinite;
}
@keyframes blink2 { 0%,100%{opacity:1} 50%{opacity:.35} }
.pomo-badge-name {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--t1);
}

/* dots */
.pomo-dots {
  display: flex; gap: 7px; align-items: center; margin-bottom: 20px;
}
.pomo-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--t3);
  transition: background .3s, box-shadow .3s, transform .2s;
}
.pomo-dot.filled {
  background: var(--pc,#3B82F6);
  box-shadow: 0 0 6px color-mix(in srgb, var(--pc,#3B82F6) 65%, transparent);
  transform: scale(1.2);
}
.pomo-dot.cur {
  background: color-mix(in srgb, var(--pc,#3B82F6) 38%, transparent);
  border: 1px solid color-mix(in srgb, var(--pc,#3B82F6) 55%, transparent);
}

/* controls */
.pomo-controls {
  display: flex; gap: 7px; flex-wrap: wrap; justify-content: center;
}
.pb {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  font-family: var(--mono); font-size: 10px; letter-spacing: .05em;
  border: none; border-radius: 10px; cursor: pointer;
  transition: background .2s, box-shadow .2s, transform .1s, opacity .2s;
  white-space: nowrap;
}
.pb:active { transform: scale(.97); }
.pb:disabled { opacity: .32; cursor: default; }
.pb-start {
  background: var(--pc,#3B82F6); color: #fff;
  padding: 10px 24px; font-size: 11px;
  box-shadow: 0 0 18px color-mix(in srgb, var(--pc,#3B82F6) 32%, transparent);
}
.pb-start:hover:not(:disabled) { filter: brightness(1.1); }
.pb-ghost {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  padding: 9px 14px;
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
}
.pb-ghost:hover:not(:disabled) { background: var(--g2); border-color: var(--gbh); color: var(--t1); }
.pb-done {
  background: rgba(52,211,153,.10);
  border: 1px solid rgba(52,211,153,.22);
  color: #34D399; padding: 9px 16px;
}
.pb-done:hover:not(:disabled) {
  background: rgba(52,211,153,.18);
  box-shadow: 0 0 12px rgba(52,211,153,.18);
}

/* side panel */
.pomo-side {
  display: flex; flex-direction: column; gap: 14px;
}
.pomo-queue-inp-row { display: flex; gap: 7px; }
.pomo-inp {
  flex: 1;
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 11px; padding: 10px 14px;
  font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--t1);
  outline: none; transition: border-color .2s, box-shadow .2s;
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
}
.pomo-inp::placeholder { color: var(--t3); }
.pomo-inp:focus {
  border-color: color-mix(in srgb, var(--pc,#3B82F6) 55%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pc,#3B82F6) 10%, transparent);
}
.pomo-add {
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 11px; padding: 0 14px;
  color: var(--t2); cursor: pointer; font-size: 18px;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, color .2s;
}
.pomo-add:hover { background: var(--g2); color: var(--t1); }

.pomo-queue-list {
  display: flex; flex-direction: column; gap: 5px;
  max-height: 200px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--t3) transparent;
}
.pomo-qi {
  display: flex; align-items: center; gap: 9px;
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 9px; padding: 7px 11px;
  font-family: var(--sans); font-size: 12px; font-weight: 500; color: var(--t2);
  animation: pqi .2s cubic-bezier(.16,1,.3,1);
}
@keyframes pqi { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:none} }
.pomo-qi.pact { border-color: color-mix(in srgb, var(--pc,#3B82F6) 45%, transparent); color: var(--t1); }
.pomo-qi.pact .pq-num { color: var(--pc,#3B82F6); }
.pq-num {
  font-family: var(--mono); font-size: 9px; color: var(--t3);
  flex-shrink: 0; width: 14px;
}
.pq-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pomo-qi:not(.pact) { cursor: pointer; }
.pomo-qi:not(.pact):hover { border-color: rgba(255,255,255,.14); color: var(--t1); }
.pq-task-time {
  font-family: var(--mono); font-size: 9px; color: var(--pc,#3B82F6);
  flex-shrink: 0; opacity: 0; transition: opacity .2s;
}
.pomo-qi.pact .pq-task-time,
.pq-task-time:not(:empty) { opacity: 1; }
.pq-del {
  background: none; border: none; color: var(--t3);
  cursor: pointer; font-size: 13px; padding: 0 2px;
  border-radius: 3px; transition: color .15s; flex-shrink: 0;
}
.pq-del:hover { color: #F87171; }
.pq-edit-inp {
  flex: 1; background: rgba(255,255,255,.06);
  border: 1px solid color-mix(in srgb, var(--pc,#3B82F6) 45%, transparent);
  border-radius: 5px; padding: 1px 7px;
  font-family: var(--sans); font-size: 12px; font-weight: 500; color: var(--t1);
  outline: none; min-width: 0;
}

/* break prompt */
.pomo-break {
  background: var(--g1);
  border: 1px solid color-mix(in srgb, #A78BFA 40%, var(--gb));
  border-radius: 14px; padding: 12px 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  font-family: var(--sans); font-size: 12px; color: var(--t2);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
}
.pomo-break strong { color: var(--t1); }
.pomo-break-btns { display: flex; gap: 6px; flex-shrink: 0; }
.pomo-break-btns button {
  font-family: var(--mono); font-size: 10px; padding: 5px 11px;
  border-radius: 7px; border: 1px solid var(--gb);
  background: var(--g1); color: var(--t2); cursor: pointer;
  transition: background .15s, color .15s;
}
.pomo-break-btns button:hover { background: var(--g2); color: var(--t1); }
.pomo-break-btns .pacc {
  background: #A78BFA; border-color: transparent; color: #fff;
  box-shadow: 0 0 10px rgba(167,139,250,.35);
}

/* stats row */
.pomo-stats {
  display: flex; gap: 8px;
}
.pomo-stat {
  flex: 1;
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 13px; padding: 11px 14px;
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
}
.pomo-stat-lbl {
  font-family: var(--mono); font-size: 8.5px;
  letter-spacing: .12em; text-transform: uppercase; color: var(--t3);
}
.pomo-stat-val {
  font-family: var(--sans); font-size: 18px; font-weight: 700; color: var(--t1);
  font-variant-numeric: tabular-nums; margin-top: 2px;
}
.pomo-stat-sub { font-family: var(--mono); font-size: 8.5px; color: var(--t3); }

/* log */
.pomo-log-hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.pomo-log-clear {
  font-family: var(--mono); font-size: 9.5px; letter-spacing: .06em;
  color: var(--t3); background: none; border: none; cursor: pointer;
  padding: 2px 5px; border-radius: 3px; transition: color .2s;
}
.pomo-log-clear:hover { color: #F87171; }
.pomo-log-list {
  display: flex; flex-direction: column; gap: 5px;
  max-height: 220px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--t3) transparent;
}
.pomo-log-item {
  display: flex; align-items: center; gap: 9px;
  background: var(--g1); border: 1px solid var(--gb);
  border-radius: 9px; padding: 8px 12px;
  animation: pqi .25s cubic-bezier(.16,1,.3,1);
}
.pomo-log-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.pomo-log-task {
  flex: 1; font-family: var(--sans); font-size: 12px; font-weight: 500; color: var(--t1);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pomo-log-time { font-family: var(--mono); font-size: 10px; color: var(--t2); flex-shrink: 0; }
.pomo-log-ago  { font-family: var(--mono); font-size: 9px; color: var(--t3); flex-shrink: 0; }
.pomo-log-more {
  width: 100%; padding: 7px; margin-top: 2px;
  background: transparent; border: 1px dashed var(--gb);
  border-radius: 8px; color: var(--t3); font-family: var(--sans);
  font-size: 11px; cursor: pointer; transition: color .15s, border-color .15s;
}
.pomo-log-more:hover { color: var(--t1); border-color: var(--t2); }

/* ─── KANBAN EDIT MODAL ─── */
.km-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.65);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  opacity: 0; pointer-events: none;
  transition: opacity 160ms;
}
.km-overlay.vis { opacity: 1; pointer-events: auto; }
.km-dialog {
  background: #0D1017;
  border: 1px solid var(--gbh);
  border-radius: 20px; padding: 28px;
  width: 100%; max-width: 400px;
  box-shadow: 0 32px 80px rgba(0,0,0,.75);
  transform: translateY(10px) scale(.98);
  transition: transform 160ms cubic-bezier(.16,1,.3,1);
}
.km-overlay.vis .km-dialog { transform: none; }
.km-heading {
  font-size: 13px; font-weight: 700; color: var(--t1);
  margin-bottom: 20px; letter-spacing: -.2px;
}
.km-field { margin-bottom: 13px; }
.km-label {
  display: block; font-family: var(--mono);
  font-size: 9px; letter-spacing: .15em; text-transform: uppercase;
  color: var(--t3); margin-bottom: 5px;
}
.km-inp, .km-sel {
  width: 100%; background: var(--g1);
  border: 1px solid var(--gb); border-radius: 8px;
  color: var(--t1); font-family: var(--sans); font-size: 12px;
  padding: 9px 11px; outline: none;
  transition: border-color 120ms;
  color-scheme: dark;
}
.km-inp:focus, .km-sel:focus { border-color: var(--gbh); }
.km-sel option { background: #0D1017; }
.km-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.km-prog-row { display: flex; align-items: center; gap: 10px; }
.km-range {
  flex: 1; appearance: none; height: 3px;
  background: var(--g2); border-radius: 9999px; outline: none; cursor: pointer;
}
.km-range::-webkit-slider-thumb {
  appearance: none; width: 14px; height: 14px;
  background: var(--accent); border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(59,130,246,.3);
}
.km-prog-val {
  font-family: var(--mono); font-size: 11px; color: var(--t2);
  width: 32px; text-align: right; flex-shrink: 0;
}
.km-footer { display: flex; gap: 8px; margin-top: 22px; }
.km-btn {
  flex: 1; border: none; border-radius: 10px;
  font-family: var(--sans); font-size: 12px; font-weight: 600;
  padding: 10px; cursor: pointer; transition: filter 120ms, background 120ms;
}
.km-btn:hover { filter: brightness(1.12); }
.km-save   { background: var(--accent); color: #fff; }
.km-cancel { background: var(--g2); color: var(--t2); flex: none; padding: 10px 18px; }
.km-del    {
  background: rgba(248,113,113,.12); color: #F87171;
  flex: none; padding: 10px 14px;
}
.km-del:hover { background: rgba(248,113,113,.25); filter: none; }

/* Add-task button in column header */
.k-add {
  margin-left: auto; background: transparent; border: none;
  color: var(--t3); font-size: 16px; line-height: 1;
  cursor: pointer; padding: 0 2px; border-radius: 4px;
  transition: color 120ms;
}
.k-add:hover { color: var(--t1); }

/* Edit icon on card hover */
.k-card { position: relative; }
.k-edit-btn {
  position: absolute; top: 7px; right: 7px;
  background: rgba(255,255,255,.07); border: 1px solid var(--gb);
  border-radius: 6px; padding: 3px 7px; color: var(--t3);
  font-size: 10px; cursor: pointer; opacity: 0;
  transition: opacity 120ms, color 120ms, background 120ms;
  font-family: var(--sans); line-height: 1.4;
}
.k-card:hover .k-edit-btn { opacity: 1; }
.k-edit-btn:hover { color: var(--t1); background: rgba(255,255,255,.13); }

/* ─── ENGLISH TRACKER ─── */
.eng-wrap {
  --ea: #E0A030; --ea-d: rgba(224,160,48,.14);
  --el: #5B8DB0; --el-d: rgba(91,141,176,.14);
  --eg: #4BAF8C; --eg-d: rgba(75,175,140,.14);
  --er: #E05555; --er-d: rgba(224,85,85,.14);
  margin-top: 28px;
}
.eng-tabs { display:flex; border-bottom:1px solid var(--gb); margin-bottom:22px; }
.eng-tab  {
  background:none; border:none; border-bottom:2px solid transparent; margin-bottom:-1px;
  padding:9px 22px; font-family:'DM Sans',system-ui,sans-serif; font-size:14px; font-weight:500;
  color:var(--t2); cursor:pointer; transition:color .15s,border-color .15s;
}
.eng-tab:hover { color:var(--t1); }
.eng-tab.on    { color:var(--ea); border-bottom-color:var(--ea); }
.eng-panel { display:none; }
.eng-panel.show { display:block; }
.eng-ph {
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; margin-bottom:14px; flex-wrap:wrap;
}
.eng-phstats { display:flex; gap:14px; flex-wrap:wrap; }
.eng-pstat { font-size:13px; color:var(--t2); }
.eng-pstat strong { color:var(--t1); font-family:'DM Mono',monospace; font-weight:500; }
.eng-actions { display:flex; gap:8px; }
.eng-chips { display:flex; gap:7px; margin-bottom:16px; flex-wrap:wrap; }
.eng-chip {
  background:var(--g1); border:1px solid var(--gb); border-radius:20px;
  padding:5px 13px; font-size:12px; font-weight:500; color:var(--t2);
  cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s;
  -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);
}
.eng-chip:hover { border-color:var(--ea); color:var(--t1); }
.eng-chip.on { background:var(--ea-d); border-color:var(--ea); color:var(--ea); }
.eng-btn {
  display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:8px;
  font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer;
  border:none; transition:opacity .15s; white-space:nowrap;
}
.eng-btn:hover { opacity:.85; }
.eng-btn-p { background:var(--ea); color:#0D0D0D; }
.eng-btn-g { background:var(--g1); border:1px solid var(--gb); color:var(--t1); -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px); }
.eng-btn-r { background:var(--er-d); color:var(--er); }
/* vocab grid */
.eng-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(265px,1fr)); gap:12px; }
.eng-wcard {
  background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:18px;
  cursor:pointer; -webkit-backdrop-filter:blur(20px); backdrop-filter:blur(20px);
  transition:border-color .15s,transform .12s;
}
.eng-wcard:hover { border-color:var(--ea); transform:translateY(-1px); }
.eng-wword {
  font-family:'Playfair Display',Georgia,serif; font-size:1.4rem; font-weight:700;
  letter-spacing:-.01em; line-height:1.2; margin-bottom:7px; color:var(--t1);
}
.eng-wdef  { font-size:13px; color:var(--t2); line-height:1.55; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.eng-wex   { font-size:12px; color:var(--t3); font-style:italic; border-left:2px solid var(--gb); padding-left:10px; margin-bottom:12px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.eng-wfoot { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.eng-wsrc  { font-size:11px; color:var(--t3); font-family:'DM Mono',monospace; }
/* badges */
.eng-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:.05em; }
.eb-new      { background:var(--el-d); color:var(--el); }
.eb-learning { background:var(--ea-d); color:var(--ea); }
.eb-mastered { background:var(--eg-d); color:var(--eg); }
.eb-reading  { background:var(--el-d); color:var(--el); }
.eb-finished { background:var(--eg-d); color:var(--eg); }
.eb-dropped  { background:var(--er-d); color:var(--er); }
.eb-book     { background:var(--ea-d); color:var(--ea); }
.eb-article  { background:var(--el-d); color:var(--el); }
.eb-speaking { background:var(--el-d); color:var(--el); }
.eb-writing  { background:var(--ea-d); color:var(--ea); }
/* reading + practice lists */
.eng-list { display:flex; flex-direction:column; gap:10px; }
.eng-rc {
  background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:15px 17px;
  cursor:pointer; -webkit-backdrop-filter:blur(20px); backdrop-filter:blur(20px); transition:border-color .15s;
}
.eng-rc:hover { border-color:var(--el); }
.eng-rc-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:10px; }
.eng-rc-title { font-family:'Playfair Display',Georgia,serif; font-size:1.05rem; font-weight:600; line-height:1.3; color:var(--t1); }
.eng-rc-meta { display:flex; align-items:center; gap:7px; flex-shrink:0; }
.eng-pbar  { height:3px; background:rgba(255,255,255,.06); border-radius:2px; overflow:hidden; margin-bottom:7px; }
.eng-pfill { height:100%; border-radius:2px; background:var(--el); transition:width .3s; }
.eng-rc-foot { display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--t3); font-variant-numeric:tabular-nums; }
.eng-rc-notes { font-size:12px; color:var(--t3); margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.eng-pc {
  background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:14px 17px;
  cursor:pointer; -webkit-backdrop-filter:blur(20px); backdrop-filter:blur(20px);
  transition:border-color .15s; display:flex; align-items:flex-start; gap:13px;
}
.eng-pc:hover { border-color:var(--eg); }
.eng-pc-icon { width:37px; height:37px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.eng-pc-icon.speaking { background:var(--el-d); }
.eng-pc-icon.writing  { background:var(--ea-d); }
.eng-pc-body  { flex:1; min-width:0; }
.eng-pc-title { font-weight:600; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--t1); font-size:14px; }
.eng-pc-meta  { font-size:12px; color:var(--t3); display:flex; gap:10px; flex-wrap:wrap; }
.eng-pc-notes { font-size:12px; color:var(--t3); margin-top:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.eng-stars { color:var(--ea); }
/* empty */
.eng-empty { text-align:center; padding:52px 20px; color:var(--t3); }
.eng-empty .ei { font-size:2rem; margin-bottom:10px; opacity:.3; }
.eng-empty p   { font-size:13px; line-height:1.6; }
/* overlay + modal */
.eng-ov {
  -webkit-position:fixed; inset:0; background:rgba(0,0,0,.62); backdrop-filter:blur(6px);
  position:fixed; inset:0; background:rgba(0,0,0,.62); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center; padding:16px;
  z-index:380; opacity:0; pointer-events:none; transition:opacity .2s;
}
.eng-ov.vis { opacity:1; pointer-events:all; }
.eng-modal {
  background:#131723; border:1px solid rgba(255,255,255,.1);
  border-radius:20px; padding:26px 22px 28px;
  width:100%; max-width:520px; transform:translateY(14px) scale(.97);
  transition:transform .22s; max-height:90vh; overflow-y:auto;
}
.eng-ov.vis .eng-modal { transform:translateY(0) scale(1); }
.eng-mhdr   { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.eng-mtitle { font-family:'Playfair Display',Georgia,serif; font-size:1.15rem; font-weight:700; color:var(--t1); }
.eng-mx     { background:rgba(255,255,255,.07); border:none; width:30px; height:30px; border-radius:50%; color:var(--t2); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color .15s; }
.eng-mx:hover { color:var(--t1); }
.eng-fg { margin-bottom:12px; }
.eng-fg label { display:block; font-size:11px; font-weight:600; color:var(--t3); margin-bottom:5px; text-transform:uppercase; letter-spacing:.06em; }
.eng-fg input, .eng-fg textarea, .eng-fg select {
  width:100%; background:rgba(255,255,255,.04); border:1px solid var(--gb);
  border-radius:8px; color:var(--t1); font-family:'DM Sans',sans-serif;
  font-size:14px; padding:9px 12px; outline:none; transition:border-color .15s;
}
.eng-fg input:focus, .eng-fg textarea:focus, .eng-fg select:focus { border-color:var(--ea); }
.eng-fg textarea { resize:vertical; min-height:72px; }
.eng-fg select option { background:#131723; }
.eng-fr   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.eng-mfoot { display:flex; gap:8px; margin-top:16px; }
.eng-mfoot .eng-btn-p { flex:1; justify-content:center; }
/* status badge — tappable cycle */
.eng-sbadge {
  cursor:pointer; user-select:none; position:relative;
  transition:filter .12s, transform .1s;
}
.eng-sbadge:hover  { filter:brightness(1.35); transform:scale(1.06); }
.eng-sbadge:active { transform:scale(.93); }
.eng-sbadge::after {
  content:'↻'; font-size:9px; opacity:0;
  position:absolute; top:-1px; right:-13px;
  transition:opacity .15s;
}
.eng-sbadge:hover::after { opacity:.7; }

/* vocab preview "View All" link-style button */
.eng-btn-viewall {
  display:inline-flex; align-items:center; gap:5px; margin-top:14px;
  padding:8px 16px; border-radius:8px; font-family:'DM Sans',sans-serif;
  font-size:13px; font-weight:600; cursor:pointer;
  background:transparent; border:1px solid var(--gb); color:var(--ea);
  transition:border-color .15s,background .15s;
}
.eng-btn-viewall:hover { border-color:var(--ea); background:var(--ea-d); }

/* full-screen vocab page */
#eng-vocab-full {
  display:none; position:fixed; inset:0; z-index:350;
  background:var(--bg); overflow-y:auto; -webkit-overflow-scrolling:touch;
}
#eng-vocab-full.vis { display:block; }
.evf-bar {
  position:sticky; top:0; z-index:10; background:var(--bg);
  border-bottom:1px solid var(--gb); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px);
  display:flex; align-items:center; gap:14px; padding:14px 24px;
}
.evf-back {
  background:var(--g1); border:1px solid var(--gb); border-radius:8px;
  color:var(--t2); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
  padding:6px 13px; cursor:pointer; white-space:nowrap; transition:color .15s;
}
.evf-back:hover { color:var(--t1); }
.evf-title {
  font-family:'Playfair Display',Georgia,serif; font-size:1.3rem;
  font-weight:700; flex:1; color:var(--t1); letter-spacing:-.015em;
}
.evf-body { padding:22px 24px 80px; max-width:1040px; margin:0 auto; }
.evf-search {
  width:100%; background:var(--g1); border:1px solid var(--gb);
  border-radius:10px; color:var(--t1); font-family:'DM Sans',sans-serif;
  font-size:14px; padding:10px 14px; outline:none; margin-bottom:18px;
  transition:border-color .15s; box-sizing:border-box;
}
.evf-search:focus { border-color:var(--ea); }
.evf-frow  { display:flex; gap:22px; margin-bottom:20px; flex-wrap:wrap; }
.evf-fgrp  { display:flex; flex-direction:column; gap:7px; }
.evf-flbl  { font-size:10px; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:.07em; }
.evf-count { font-size:12px; color:var(--t3); font-family:'DM Mono',monospace; margin-bottom:14px; }

/* flashcard */
#eng-fc {
  position:fixed; inset:0; background:#06070E; z-index:400;
  display:none; flex-direction:column; align-items:center; justify-content:center; padding:24px;
}
#eng-fc.vis { display:flex; }
.eng-fc-prog { font-size:12px; color:var(--t3); margin-bottom:28px; font-family:'DM Mono',monospace; letter-spacing:.04em; }
.eng-fc-card {
  background:var(--g1); border:1px solid var(--gb); border-radius:20px;
  padding:40px 36px; max-width:460px; width:100%; text-align:center; cursor:pointer; user-select:none;
  min-height:220px; display:flex; flex-direction:column; align-items:center; justify-content:center;
  -webkit-backdrop-filter:blur(20px); backdrop-filter:blur(20px); transition:transform .12s;
}
.eng-fc-card:active { transform:scale(.98); }
.eng-fc-word { font-family:'Playfair Display',Georgia,serif; font-size:2.2rem; font-weight:700; letter-spacing:-.02em; margin-bottom:8px; color:var(--t1); }
.eng-fc-hint { font-size:12.5px; color:var(--t3); }
.eng-fc-def  { font-size:14px; color:var(--t2); line-height:1.6; margin-top:14px; display:none; }
.eng-fc-ex   { font-size:12.5px; color:var(--t3); font-style:italic; margin-top:10px; padding-top:10px; border-top:1px solid var(--gb); display:none; text-align:left; }
.eng-fc-card.shown .eng-fc-hint { display:none; }
.eng-fc-card.shown .eng-fc-def  { display:block; }
.eng-fc-card.shown .eng-fc-ex   { display:block; }
.eng-fc-btns  { display:flex; gap:10px; margin-top:22px; }
.eng-fc-close { position:absolute; top:20px; right:20px; }
@media (max-width:540px) {
  .eng-grid { grid-template-columns:1fr; }
  .eng-fr   { grid-template-columns:1fr; }
  .eng-fc-word { font-size:1.7rem; }
}

/* ─── RESPONSIVE ─── */
@media (max-width: 960px) {
  .kanban { grid-template-columns: repeat(2, 1fr); }
  .stats-inner { grid-template-columns: repeat(2, 1fr); }
  .pomo-layout { grid-template-columns: 1fr; }
}
@media (max-width: 540px) {
  .kanban { grid-template-columns: 1fr; }
  .hero-name { letter-spacing: -3px; }
  .filters { flex-wrap: wrap; }
  .pomo-stats { flex-direction: column; }
}

/* ─── FITNESS TRACKER ─── */
.fit-wrap { margin-top:28px; }
.fit-preview-stats { display:flex; gap:20px; margin-bottom:14px; flex-wrap:wrap; }
.fit-pstat { font-size:13px; color:var(--t2); }
.fit-pstat strong { color:var(--t1); font-family:'DM Mono',monospace; font-weight:500; }
.fit-open-btn {
  display:inline-flex; align-items:center; gap:5px; margin-top:14px;
  padding:8px 16px; border-radius:8px; font-family:'DM Sans',sans-serif;
  font-size:13px; font-weight:600; cursor:pointer;
  background:transparent; border:1px solid var(--gb); color:var(--fa);
  transition:border-color .15s,background .15s;
}
.fit-open-btn:hover { border-color:var(--fa); background:var(--fa-d); }
.fit-session-mini { background:var(--g1); border:1px solid var(--gb); border-radius:12px;
  -webkit-padding:12px 16px; margin-bottom:8px; display:flex; align-items:center; gap:12px; backdrop-filter:blur(20px); }
  padding:12px 16px; margin-bottom:8px; display:flex; align-items:center; gap:12px; backdrop-filter:blur(20px); }
.fit-session-mini-name { font-size:13px; font-weight:600; color:var(--t1); flex:1; }
.fit-session-mini-meta { font-size:11px; color:var(--t3); font-family:'DM Mono',monospace; }
#fit-page { display:none; position:fixed; inset:0; z-index:360; background:var(--bg); overflow-y:auto; -webkit-overflow-scrolling:touch; }
#fit-page.vis { display:block; }
-webkit-.fit-bar { position:sticky; top:0; z-index:10; background:var(--bg); border-bottom:1px solid var(--gb); backdrop-filter:blur(14px); display:flex; align-items:center; gap:14px; padding:14px 24px; }
.fit-bar { position:sticky; top:0; z-index:10; background:var(--bg); border-bottom:1px solid var(--gb); backdrop-filter:blur(14px); display:flex; align-items:center; gap:14px; padding:14px 24px; }
.fit-back { background:var(--g1); border:1px solid var(--gb); border-radius:8px; color:var(--t2); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:6px 13px; cursor:pointer; white-space:nowrap; transition:color .15s; }
.fit-back:hover { color:var(--t1); }
.fit-page-title { font-size:1.2rem; font-weight:800; flex:1; color:var(--t1); letter-spacing:-.03em; }
.fit-tabs { display:flex; border-bottom:1px solid var(--gb); padding:0 24px; background:var(--bg); position:sticky; top:53px; z-index:9; }
.fit-tab { padding:11px 16px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; background:transparent; border:none; border-bottom:2px solid transparent; color:var(--t2); cursor:pointer; transition:color .15s,border-color .15s; }
.fit-tab:hover { color:var(--t1); }
.fit-tab.on { color:var(--fa); border-bottom-color:var(--fa); }
.fit-body { padding:22px 24px 80px; max-width:1040px; margin:0 auto; }
.fit-panel { display:none; }
.fit-panel.show { display:block; }
.fit-ph { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
.fit-phstats { display:flex; gap:14px; flex-wrap:wrap; }
.fit-pstat2 { font-size:13px; color:var(--t2); }
.fit-pstat2 strong { color:var(--t1); font-family:'DM Mono',monospace; font-weight:500; }
.fit-log-list { display:flex; flex-direction:column; gap:10px; }
-webkit-.fit-session-card { background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:16px 18px; cursor:pointer; backdrop-filter:blur(20px); transition:border-color .15s; }
.fit-session-card { background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:16px 18px; cursor:pointer; backdrop-filter:blur(20px); transition:border-color .15s; }
.fit-session-card:hover { border-color:var(--fa); }
.fit-session-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
.fit-session-date { font-family:'DM Mono',monospace; font-size:11px; color:var(--t3); margin-bottom:3px; }
.fit-session-name { font-size:14px; font-weight:600; color:var(--t1); }
.fit-dur-badge { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; background:var(--fa-d); color:var(--fa); text-transform:uppercase; letter-spacing:.05em; white-space:nowrap; }
.fit-session-exlist { margin-top:10px; display:flex; flex-direction:column; gap:0; }
.fit-ex-row { display:flex; align-items:center; gap:10px; font-size:12px; color:var(--t2); padding:5px 0; border-bottom:1px solid rgba(255,255,255,.04); }
.fit-ex-row:last-child { border-bottom:none; }
.fit-ex-name { font-weight:600; color:var(--t1); min-width:100px; }
.fit-ex-sets { font-family:'DM Mono',monospace; font-size:11px; color:var(--t3); }
.fit-session-notes { font-size:12px; color:var(--t3); margin-top:8px; font-style:italic; }
.fit-skills-intro { font-size:13px; color:var(--t2); line-height:1.6; margin-bottom:18px; }
.fit-skills-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
-webkit-.fit-skill-card { background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:18px; backdrop-filter:blur(20px); }
.fit-skill-card { background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:18px; backdrop-filter:blur(20px); }
.fit-skill-name { font-size:14px; font-weight:700; color:var(--t1); margin-bottom:3px; }
.fit-skill-sub { font-size:11px; color:var(--t3); font-family:'DM Mono',monospace; margin-bottom:14px; }
.fit-skill-steps { display:flex; flex-direction:column; gap:4px; }
.fit-skill-step { display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:8px; cursor:pointer; transition:background .12s; border:1px solid transparent; }
.fit-skill-step:hover { background:rgba(255,255,255,.04); }
.fit-skill-step.f-done { opacity:.5; }
.fit-skill-step.f-current { background:var(--fa-d); border-color:rgba(34,197,94,.25); }
.fit-step-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; background:var(--t3); transition:background .12s; }
.fit-skill-step.f-done    .fit-step-dot { background:var(--fa); }
.fit-skill-step.f-current .fit-step-dot { background:var(--fa); }
.fit-step-name { font-size:13px; color:var(--t2); flex:1; }
.fit-skill-step.f-current .fit-step-name { color:var(--fa); font-weight:600; }
.fit-step-icon { font-size:11px; color:var(--fa); opacity:0; }
.fit-skill-step.f-done    .fit-step-icon { opacity:1; }
.fit-skill-step.f-current .fit-step-icon { opacity:1; }
.fit-nut-list { display:flex; flex-direction:column; gap:8px; }
-webkit-.fit-nut-card { background:var(--g1); border:1px solid var(--gb); border-radius:12px; padding:13px 16px; display:flex; align-items:flex-start; gap:12px; cursor:pointer; backdrop-filter:blur(20px); transition:border-color .15s; }
.fit-nut-card { background:var(--g1); border:1px solid var(--gb); border-radius:12px; padding:13px 16px; display:flex; align-items:flex-start; gap:12px; cursor:pointer; backdrop-filter:blur(20px); transition:border-color .15s; }
.fit-nut-card:hover { border-color:rgba(34,197,94,.3); }
.fit-nut-icon { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; background:var(--fa-d); }
.fit-nut-body { flex:1; min-width:0; }
.fit-nut-name { font-size:14px; font-weight:600; color:var(--t1); margin-bottom:3px; }
.fit-nut-meta { font-size:12px; color:var(--t3); display:flex; gap:10px; flex-wrap:wrap; font-family:'DM Mono',monospace; }
.fit-nut-days { display:flex; flex-direction:column; gap:8px; }
-webkit-.fit-nut-day-card { background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:14px 18px; cursor:pointer; backdrop-filter:blur(20px); transition:border-color .15s; display:flex; align-items:center; gap:14px; }
.fit-nut-day-card { background:var(--g1); border:1px solid var(--gb); border-radius:14px; padding:14px 18px; cursor:pointer; backdrop-filter:blur(20px); transition:border-color .15s; display:flex; align-items:center; gap:14px; }
.fit-nut-day-card:hover { border-color:rgba(34,197,94,.35); }
.fit-nut-day-date { font-size:14px; font-weight:700; color:var(--t1); min-width:120px; }
.fit-nut-day-date.fit-nut-day-today { color:var(--fa); }
.fit-nut-day-icons { display:flex; gap:5px; font-size:14px; flex:1; }
.fit-nut-day-cnt { font-size:10px; font-weight:700; padding:3px 9px; border-radius:20px; background:var(--fa-d); color:var(--fa); text-transform:uppercase; letter-spacing:.05em; white-space:nowrap; }
.fit-nut-more { width:100%; padding:9px; margin-top:2px; background:transparent; border:1px dashed var(--gb); border-radius:10px; color:var(--t3); font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; transition:color .15s,border-color .15s; }
.fit-nut-more:hover { color:var(--t1); border-color:var(--t2); }
-webkit-.fit-ov { position:fixed; inset:0; background:rgba(0,0,0,.62); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:16px; z-index:400; opacity:0; pointer-events:none; transition:opacity .2s; }
.fit-ov { position:fixed; inset:0; background:rgba(0,0,0,.62); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:16px; z-index:400; opacity:0; pointer-events:none; transition:opacity .2s; }
.fit-ov.vis { opacity:1; pointer-events:all; }
.fit-modal { background:#131723; border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:26px 22px 28px; width:100%; max-width:560px; transform:translateY(14px) scale(.97); transition:transform .22s; max-height:90vh; overflow-y:auto; }
.fit-ov.vis .fit-modal { transform:translateY(0) scale(1); }
.fit-mhdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.fit-mtitle { font-size:1.1rem; font-weight:800; color:var(--t1); letter-spacing:-.025em; }
.fit-mx { background:rgba(255,255,255,.07); border:none; width:30px; height:30px; border-radius:50%; color:var(--t2); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color .15s; }
.fit-mx:hover { color:var(--t1); }
.fit-fg { margin-bottom:12px; }
.fit-fg label { display:block; font-size:11px; font-weight:600; color:var(--t3); margin-bottom:5px; text-transform:uppercase; letter-spacing:.06em; }
.fit-fg input,.fit-fg textarea,.fit-fg select { width:100%; background:rgba(255,255,255,.04); border:1px solid var(--gb); border-radius:8px; color:var(--t1); font-family:'DM Sans',sans-serif; font-size:14px; padding:9px 12px; outline:none; transition:border-color .15s; }
.fit-fg input:focus,.fit-fg textarea:focus,.fit-fg select:focus { border-color:var(--fa); }
.fit-fg select option { background:#131723; }
.fit-fg textarea { resize:vertical; min-height:60px; }
.fit-fr { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.fit-mfoot { display:flex; gap:8px; margin-top:16px; }
.fit-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 15px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:opacity .15s; white-space:nowrap; }
.fit-btn:hover { opacity:.85; }
.fit-btn-p { background:var(--fa); color:#0D0D0D; }
.fit-mfoot .fit-btn-p { flex:1; justify-content:center; }
.fit-btn-r { background:rgba(224,85,85,.14); color:#E05555; }
.fit-btn-g { background:var(--g1); border:1px solid var(--gb); color:var(--t1); }
.fit-ex-builder { display:flex; flex-direction:column; gap:5px; margin-top:4px; }
.fit-ex-item { display:grid; grid-template-columns:1fr 55px 75px 26px; gap:5px; align-items:center; }
.fit-ex-input { width:100%; background:rgba(255,255,255,.04); border:1px solid var(--gb); border-radius:7px; color:var(--t1); font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 9px; outline:none; transition:border-color .15s; }
.fit-ex-input:focus { border-color:var(--fa); }
.fit-ex-rm { background:transparent; border:none; color:var(--t3); font-size:18px; cursor:pointer; padding:0; line-height:1; transition:color .12s; }
.fit-ex-rm:hover { color:#E05555; }
.fit-ex-add { width:100%; font-size:12px; color:var(--fa); background:transparent; border:1px dashed rgba(34,197,94,.3); border-radius:8px; padding:7px; cursor:pointer; text-align:center; transition:border-color .15s,background .15s; font-family:'DM Sans',sans-serif; font-weight:600; margin-top:4px; }
.fit-ex-add:hover { border-color:var(--fa); background:var(--fa-d); }
.fit-empty { text-align:center; padding:52px 20px; color:var(--t3); font-size:13px; line-height:1.6; }
.fit-skill-card { position:relative; }
.fit-sk-edit-btn { position:absolute; top:14px; right:14px; background:rgba(255,255,255,.06); border:1px solid var(--gb); border-radius:7px; color:var(--t3); font-size:11px; font-weight:600; padding:4px 9px; cursor:pointer; transition:color .12s,border-color .12s; font-family:'DM Sans',sans-serif; line-height:1; }
.fit-sk-edit-btn:hover { color:var(--t1); border-color:var(--gbh); }
.fit-step-builder { display:flex; flex-direction:column; gap:5px; margin-top:4px; }
.fit-step-item { display:grid; grid-template-columns:1fr 26px; gap:5px; align-items:center; }
@media (max-width:540px) {
  .fit-skills-grid { grid-template-columns:1fr; }
  .fit-ex-item { grid-template-columns:1fr 45px 80px 24px; }
}


.bp-ov {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.82);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  z-index: 955;
  opacity: 0;
  pointer-events: none;
  transition: opacity .25s;
  overflow-y: auto;
}
.bp-ov.vis { opacity: 1; pointer-events: all; }
.bp-ov-inner { max-width: 1000px; margin: 0 auto; padding: 24px 16px 60px; }
.bp-close-btn {
  position: sticky;
  top: 16px;
  float: right;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  color: #fff;
  font-size: 18px;
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
  transition: background .15s;
}
.bp-close-btn:hover { background: rgba(255,255,255,.18); }
.bp-ov .bp-hdr { padding: 0 0 16px; }
.bp-ov .bp-logo { font-family: var(--mono); font-size: 11px; color: var(--accent); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
.bp-ov .bp-title { font-size: 20px; font-weight: 800; color: var(--t1); }
.bp-ov .bp-sub { font-size: 12px; color: var(--t3); margin-top: 2px; padding-bottom: 16px; border-bottom: 1px solid var(--gb); }
.bp-ov .bp-section { margin-top: 26px; }
.bp-ov .bp-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--t3); margin-bottom: 14px; }
.bp-ov .bp-rules { display: flex; flex-direction: column; gap: 8px; }
.bp-ov .bp-rule { display: flex; gap: 12px; align-items: flex-start; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 10px; padding: 12px 14px; }
.bp-ov .bp-rule-n { font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--accent); flex-shrink: 0; width: 20px; }
.bp-ov .bp-rule-t { font-size: 13px; color: var(--t2); line-height: 1.5; }
.bp-ov .bp-rule-t strong { color: var(--t1); }
.bp-ov .bp-pyramid { display: flex; flex-direction: column; gap: 6px; align-items: center; }
.bp-ov .bp-tier { border-radius: 8px; padding: 12px 16px; text-align: center; font-size: 13px; font-weight: 700; box-sizing: border-box; }
.bp-ov .bp-formula { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 10px; padding: 18px; font-family: var(--mono); font-size: 12.5px; color: var(--t2); line-height: 2; text-align: center; }
.bp-ov .bp-formula strong { color: var(--accent); }
.bp-ov .bp-map-wrap { overflow-x: auto; }
.bp-ov .bp-map-table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: 12px; }
.bp-ov .bp-map-table th { text-align: left; color: var(--t3); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 10px; padding: 8px 10px; border-bottom: 1px solid var(--gb); }
.bp-ov .bp-map-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,.06); color: var(--t2); }
.bp-ov .bp-map-table tr:last-child td { border-bottom: none; }
.bp-ov .bp-os-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap: 10px; }
.bp-ov .bp-os-card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 10px; padding: 14px 16px; }
.bp-ov .bp-os-card h3 { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.bp-ov .bp-os-card ul { list-style: none; display: flex; flex-direction: column; gap: 5px; }
.bp-ov .bp-os-card li { font-size: 12px; color: var(--t3); display: flex; gap: 6px; line-height: 1.4; }
.bp-ov .bp-os-card li::before { content: '\\203A'; color: var(--accent); flex-shrink: 0; }
.bp-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.12);
  color: var(--t2);
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  font-family: var(--sans);
}
.bp-open-btn:hover { background: rgba(59,130,246,.15); border-color: rgba(59,130,246,.4); color: var(--accent); }


.cal-ov {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.82);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  z-index: 955;
  opacity: 0;
  pointer-events: none;
  transition: opacity .25s;
  overflow-y: auto;
}
.cal-ov.vis { opacity: 1; pointer-events: all; }
.cal-ov-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 60px;
}
.cal-close-btn {
  position: sticky;
  top: 16px;
  float: right;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.15);
  color: #fff;
  font-size: 18px;
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
  transition: background .15s;
}
.cal-close-btn:hover { background: rgba(255,255,255,.18); }

/* Calendar internal styles (scoped to .cal-ov) */
.cal-ov .cal-hdr { padding: 0 0 16px; }
.cal-ov .cal-logo { font-family: var(--mono); font-size: 11px; color: #00d9ff; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 6px; }
.cal-ov .cal-title { font-size: 20px; font-weight: 800; color: var(--t1); }
.cal-ov .cal-sub { font-size: 12px; color: var(--t3); margin-top: 2px; }
.cal-ov .cal-legend { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--gb); }
.cal-ov .leg-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--t3); }
.cal-ov .leg-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
.cal-ov .cal-scroll { overflow-x: auto; }
.cal-ov .cal-grid {
  display: grid;
  grid-template-columns: 52px repeat(7, 1fr);
  min-width: 760px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 12px;
  overflow: hidden;
}
.cal-ov .day-hdr {
  background: rgba(255,255,255,.05);
  border-bottom: 1px solid rgba(255,255,255,.09);
  padding: 10px 6px; text-align: center;
}
.cal-ov .day-hdr:first-child { background: rgba(255,255,255,.03); }
.cal-ov .day-nm { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
.cal-ov .day-lb { font-size: 10px; color: var(--t3); margin-top: 2px; }
.cal-ov .day-hdr.c-mon .day-nm { color: #00d9ff; }
.cal-ov .day-hdr.c-tue .day-nm { color: #8b5cf6; }
.cal-ov .day-hdr.c-wed .day-nm { color: #00d9ff; }
.cal-ov .day-hdr.c-thu .day-nm { color: #ef4444; }
.cal-ov .day-hdr.c-fri .day-nm { color: #00d9ff; }
.cal-ov .day-hdr.c-sat .day-nm { color: #22d3a0; }
.cal-ov .day-hdr.c-sun .day-nm { color: #fbbf24; }
.cal-ov .tcol { background: rgba(255,255,255,.02); border-right: 1px solid rgba(255,255,255,.09); position: relative; }
.cal-ov .tlabel { font-family: var(--mono); font-size: 9px; color: rgba(255,255,255,.25); padding: 0 4px; position: absolute; left:0; right:0; text-align: right; transform: translateY(-50%); line-height:1; }
.cal-ov .dcol { border-right: 1px solid rgba(255,255,255,.07); position: relative; background: var(--bg); }
.cal-ov .dcol:last-child { border-right: none; }
.cal-ov .gline { position: absolute; left:0; right:0; height:1px; background: rgba(255,255,255,.09); pointer-events:none; }
.cal-ov .gline.half { opacity:.4; }
.cal-ov .blk {
  position: absolute; left:2px; right:2px;
  border-radius: 5px; border-left: 2.5px solid;
  padding: 3px 5px; overflow: hidden; cursor: default;
  transition: transform .15s, box-shadow .15s;
}
.cal-ov .blk:hover { transform: scaleX(1.02); box-shadow: 0 2px 12px rgba(0,0,0,.5); z-index:10; }
.cal-ov .blk-label { font-size: 9.5px; font-weight: 600; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cal-ov .blk-time { font-family: var(--mono); font-size: 8px; opacity:.7; margin-top:1px; white-space:nowrap; }
.cal-ov .blk.sleep  { background:#312e81; border-color:#6366f1; color:#a5b4fc; }
.cal-ov .blk.class  { background:#1e3a5f; border-color:#3b82f6; color:#93c5fd; }
.cal-ov .blk.acad   { background:#14532d; border-color:#22d3a0; color:#6ee7b7; }
.cal-ov .blk.lifeos { background:#4c1d95; border-color:#8b5cf6; color:#c4b5fd; }
.cal-ov .blk.train  { background:#7c2d12; border-color:#f97316; color:#fdba74; }
.cal-ov .blk.meal   { background:#1c1917; border-color:#78716c; color:#a8a29e; }
.cal-ov .blk.flex   { background:#1a1a2e; border-color:#475569; color:#94a3b8; }
.cal-ov .blk.review { background:#134e4a; border-color:#14b8a6; color:#5eead4; }
.cal-ov .blk.free   { background:#0f172a; border-color:#1e293b; color:#475569; }
.cal-ov .stats-strip {
  display: grid; grid-template-columns: repeat(7,1fr); min-width: 760px;
  border-top: 1px solid rgba(255,255,255,.09);
  background: rgba(255,255,255,.03);
}
.cal-ov .stat-cell { padding:10px 8px; border-right:1px solid rgba(255,255,255,.09); font-size:10px; }
.cal-ov .stat-cell:last-child { border-right:none; }
.cal-ov .stat-row { display:flex; justify-content:space-between; margin-bottom:3px; }
.cal-ov .stat-k { color: var(--t3); }
.cal-ov .stat-v { font-weight:600; }
.cal-ov .cal-totals { margin-top: 20px; }
.cal-ov .cal-totals-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--t3); margin-bottom:12px; }
.cal-ov .totals-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:10px; }
.cal-ov .tc { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:10px; padding:14px 16px; display:flex; align-items:center; gap:12px; }
.cal-ov .tc-icon { font-size:20px; flex-shrink:0; }
.cal-ov .tc-lbl { font-size:11px; color:var(--t3); text-transform:uppercase; letter-spacing:1px; }
.cal-ov .tc-val { font-family:var(--mono); font-size:20px; font-weight:700; margin-top:2px; }
.cal-ov .tc-sub { font-size:10px; color:var(--t3); margin-top:2px; }
.cal-ov .notes-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:10px; margin-top:20px; }
.cal-ov .nc { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09); border-radius:10px; padding:14px 16px; }
.cal-ov .nc h3 { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
.cal-ov .nc ul { list-style:none; display:flex; flex-direction:column; gap:5px; }
.cal-ov .nc li { font-size:12px; color:var(--t3); display:flex; gap:6px; line-height:1.4; }
.cal-ov .nc li::before { content:'\\203A'; color:#00d9ff; flex-shrink:0; }
.cal-open-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.12);
  color: var(--t2);
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  font-family: var(--sans);
}
.cal-open-btn:hover { background: rgba(34,211,160,.15); border-color: rgba(34,211,160,.4); color: #22d3a0; }


.wt-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 20px; border-bottom: 1px solid var(--gb); padding-bottom: 12px; }
.wt-tab {
  background: var(--g1); border: 1px solid var(--gb); color: var(--t2);
  border-radius: 8px; padding: 7px 14px; font-family: var(--sans); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background .15s, border-color .15s, color .15s;
}
.wt-tab:hover { border-color: var(--gbh); color: var(--t1); }
.wt-tab.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.wt-pri-field { margin-bottom: 12px; }
.wt-pri-label { display: block; font-size: 11px; font-weight: 600; color: var(--t3); margin-bottom: 5px; text-transform: uppercase; letter-spacing: .06em; }
.wt-pri-inp {
  width: 100%; background: var(--g1); border: 1px solid var(--gb); border-radius: 8px;
  color: var(--t1); font-family: var(--sans); font-size: 13px; padding: 9px 12px; outline: none;
  transition: border-color .15s; box-sizing: border-box;
}
.wt-pri-inp:focus { border-color: var(--accent); }
.wt-reset-ov {
  -webkit-position: fixed; inset: 0; background: rgba(0,0,0,.65); backdrop-filter: blur(8px);
  position: fixed; inset: 0; background: rgba(0,0,0,.65); backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  z-index: 960; opacity: 0; pointer-events: none; transition: opacity .2s;
}
.wt-reset-ov.vis { opacity: 1; pointer-events: all; }
.wt-reset-modal {
  background: #131723; border: 1px solid rgba(255,255,255,.1); border-radius: 20px;
  padding: 26px 24px 24px; width: 100%; max-width: 420px; text-align: center;
}
.wt-reset-title { font-size: 1.05rem; font-weight: 800; color: var(--t1); margin-bottom: 8px; }
.wt-reset-sub { font-size: 12px; color: var(--t3); line-height: 1.5; margin-bottom: 20px; }
.wt-reset-btns { display: flex; flex-direction: column; gap: 8px; }
.wt-reset-btns button {
  border: none; border-radius: 10px; padding: 11px; font-family: var(--sans);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s;
}
.wt-reset-btns button:hover { opacity: .85; }
#wt-push-reset  { background: var(--accent); color: #fff; }
#wt-just-reset  { background: var(--g1); border: 1px solid var(--gb); color: var(--t1); }
#wt-keep        { background: none; color: var(--t3); }

/* .vis overlay toggle pattern */
.vis {
  opacity: 1 !important;
  pointer-events: all !important;
}

/* ─── GLOBAL COMPAT: backdrop-filter fallback ─── */
@supports not (backdrop-filter: blur(1px)) and not (-webkit-backdrop-filter: blur(1px)) {
  /* Increase opacity of glass surfaces so they're readable without blur */
  .card, .widget, .overlay-box, .hab-item, .rem-item,
  .bp-panel, .cal-modal, .kan-col, .pom-wrap {
    background: rgba(18, 22, 38, 0.92) !important;
    border-color: rgba(255,255,255,0.15) !important;
  }
}

/* ─── MOBILE PERF: reduce blur radius on small screens ─── */
@media (max-width: 768px) {
  .card, .widget, .overlay-box, .hab-item, .rem-item,
  .bp-panel, .cal-modal, .kan-col, .pom-wrap,
  .hero-pill, .eng-card {
    -webkit-backdrop-filter: blur(8px) !important;
    backdrop-filter: blur(8px) !important;
  }
}
`;

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
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
      <Script src="/life-os-main.js" strategy="afterInteractive" />
    </>
  );
}

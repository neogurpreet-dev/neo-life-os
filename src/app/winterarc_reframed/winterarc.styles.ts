// Winter Arc page styles. Inlined (no CSS import) to match the project's
// self-contained CSS approach. Tokens come from the Life OS design system.
export const WA_CSS = `
html:has(.wa),html:has(.wa) body{margin:0;background:#000}
.wa{
  --background:#000000;--bg-2:#0A0A0A;--bg-3:#111111;
  --surface:#161818;--surface-elevated:#1F1F1F;--surface-hover:#202323;
  --border:#2A2A2A;--border-subtle:#1D1D1D;--divider:#333333;--border-hover:#404040;--border-active:#666666;
  --text:#FFFFFF;--text-2:#B3B8BD;--muted:#808080;--disabled:#555555;
  --accent:#3B82F6;--accent-hover:#2563EB;--success:#22C55E;--warning:#F59E0B;--danger:#EF4444;
  --glass:rgba(15,15,15,0.75);--glass-border:rgba(255,255,255,0.07);
  --ease:cubic-bezier(0.22,1,0.36,1);
  position:relative;min-height:100vh;color:var(--text);
  font-family:"Inter",ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:16px;line-height:1.625;-webkit-font-smoothing:antialiased;
  background:radial-gradient(circle,rgba(255,255,255,0.045) 1px,transparent 1px) 0 0/40px 40px,#000;
}
.wa *,.wa *::before,.wa *::after{box-sizing:border-box}
.wa button,.wa input,.wa textarea{font-family:inherit}
.wa::before{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(720px 360px at 10% -6%,rgba(255,255,255,0.06),transparent 62%),
    radial-gradient(640px 340px at 94% 0%,rgba(59,130,246,0.08),transparent 62%);
}
.wa > *{position:relative;z-index:1}
.wa :focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px}

/* Type */
.wa-h1{font-size:clamp(36px,6vw,56px);line-height:1.1;font-weight:700;letter-spacing:-0.04em;margin:0}
.wa-h3{font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;margin:0}
.wa-title{font-size:15px;line-height:1.3;font-weight:600;letter-spacing:-0.01em;margin:0}
.wa-label{font-size:11px;line-height:1.45;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted)}
.wa-caption{font-size:14px;line-height:1.43;color:var(--text-2);margin:0}
.wa-muted{color:var(--muted)}
.wa-num{font-variant-numeric:tabular-nums}

/* Navbar (glass) */
.wa-nav{
  position:sticky;top:0;z-index:50;height:56px;display:flex;align-items:center;gap:12px;padding:0 20px;
  background:rgba(0,0,0,0.72);border-bottom:1px solid var(--glass-border);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
}
.wa-logo{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text)}
.wa-logo-mark{width:28px;height:28px;border-radius:7px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.wa-logo-word{font-size:15px;font-weight:700;letter-spacing:-0.02em}
.wa-crumb{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:8px}
.wa-crumb::before{content:"/";color:var(--border-hover)}
.wa-nav-actions{margin-left:auto;display:flex;align-items:center;gap:8px}
.wa-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#3B82F6,#2563EB);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;border:1.5px solid var(--border)}

/* Buttons */
.wa-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 14px;border-radius:10px;
  font-size:14px;font-weight:500;line-height:1;letter-spacing:-0.01em;border:1px solid transparent;cursor:pointer;white-space:nowrap;
  transition:background 150ms var(--ease),border-color 150ms var(--ease),color 150ms var(--ease),opacity 150ms var(--ease);
}
.wa-btn-primary{background:#fff;color:#000;border-color:#fff}
.wa-btn-primary:hover{background:#E5E5E5;border-color:#E5E5E5}
.wa-btn-secondary{background:#111;color:#fff;border-color:var(--border)}
.wa-btn-secondary:hover{background:#181818;border-color:var(--border-hover)}
.wa-btn-ghost{background:transparent;color:var(--text-2)}
.wa-btn-ghost:hover{background:#151515;color:#fff}
.wa-btn-sm{height:28px;padding:0 10px;font-size:13px}
.wa-btn[disabled]{opacity:.4;cursor:not-allowed;pointer-events:none}

/* Layout */
.wa-wrap{max-width:1280px;margin:0 auto;padding:32px 32px 96px}
.wa-stack{display:flex;flex-direction:column;gap:20px}
.wa-grid-today{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:20px;align-items:start}
.wa-side{position:sticky;top:76px;display:flex;flex-direction:column;gap:16px}
.wa-pillars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.wa-stats{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}
.wa-charts{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}
.wa-span-2{grid-column:span 2}.wa-span-4{grid-column:span 4}.wa-span-6{grid-column:span 6}
.wa-goals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.wa-fields{display:flex;flex-direction:column;gap:10px}
.wa-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}

/* Surfaces: black canvas, light glass */
.wa-card{
  padding:20px;border-radius:14px;border:1px solid var(--glass-border);
  background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012)),rgba(22,24,24,0.62);
  backdrop-filter:blur(14px) saturate(120%);-webkit-backdrop-filter:blur(14px) saturate(120%);
  box-shadow:0 10px 40px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.04);
}
.wa-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.wa-card-head .wa-title{display:flex;align-items:center;gap:8px}
.wa-card-head .wa-title svg{color:var(--muted)}
.wa-hero{
  padding:32px;border-radius:24px;border:1px solid var(--glass-border);
  background:radial-gradient(520px 220px at 0% 0%,rgba(59,130,246,0.10),transparent 70%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015)),rgba(15,15,15,0.7);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  box-shadow:0 0 40px rgba(255,255,255,0.05),0 20px 50px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06);
  display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;align-items:end;
}
.wa-hero-main{display:flex;flex-direction:column;gap:14px;min-width:0}
.wa-hero-stats{display:flex;gap:32px}
.wa-hero-stat{display:flex;flex-direction:column;gap:2px}
.wa-hero-stat strong{font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-0.02em}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .wa-card{background:#161818}.wa-hero{background:#111}.wa-nav{background:rgba(0,0,0,0.92)}
}

/* Tabs */
.wa-tabs{display:flex;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
.wa-tabs::-webkit-scrollbar{display:none}
.wa-tab{
  padding:0 18px 12px;margin-bottom:-1px;font-size:13px;font-weight:500;color:var(--muted);background:none;border:0;
  border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;transition:color 150ms var(--ease);
}
.wa-tab:hover{color:var(--text-2)}
.wa-tab[aria-selected="true"]{color:#fff;border-bottom-color:#fff}
.wa-pills{display:flex;gap:4px;background:#0D0D0D;border:1px solid var(--border);border-radius:12px;padding:3px;overflow-x:auto;scrollbar-width:none}
.wa-pills::-webkit-scrollbar{display:none}
.wa-pill{
  flex:1;min-width:max-content;text-align:center;padding:6px 12px;font-size:12px;font-weight:500;color:var(--muted);
  background:transparent;border:1px solid transparent;border-radius:10px;cursor:pointer;transition:all 150ms var(--ease);
}
.wa-pill:hover{color:var(--text-2)}
.wa-pill[aria-pressed="true"]{color:#fff;background:var(--surface-elevated);border-color:var(--border)}

/* Badges */
.wa-badge{
  display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:999px;border:1px solid;
  font-size:10px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;white-space:nowrap;line-height:1;
}
.wa-badge i{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.wa-b-neutral{background:#202020;border-color:#303030;color:#B3B8BD}.wa-b-neutral i{background:#808080}
.wa-b-blue{background:rgba(59,130,246,.10);border-color:rgba(59,130,246,.25);color:#93C5FD}.wa-b-blue i{background:#3B82F6}
.wa-b-success{background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.35);color:#86EFAC}.wa-b-success i{background:#22C55E}
.wa-b-warning{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.35);color:#FCD34D}.wa-b-warning i{background:#F59E0B}
.wa-b-danger{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.35);color:#FCA5A5}.wa-b-danger i{background:#EF4444}

/* Progress */
.wa-bar{display:flex;flex-direction:column;gap:7px}
.wa-bar-head{display:flex;justify-content:space-between;align-items:baseline;font-size:11px;color:var(--text-2)}
.wa-bar-head span:last-child{font-weight:500;color:var(--muted)}
.wa-track{height:6px;background:var(--surface-elevated);border-radius:999px;overflow:hidden}
.wa-track.sm{height:4px}
.wa-fill{height:100%;min-width:4px;border-radius:999px;background:#fff;transition:width 400ms var(--ease)}
.wa-fill.accent{background:var(--accent)}.wa-fill.success{background:var(--success)}

/* Inputs & toggles */
.wa-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.wa-field label{font-size:12px;font-weight:500;color:var(--text-2);display:flex;justify-content:space-between;gap:8px}
.wa-field label span{color:var(--muted);font-weight:400}
.wa-input{
  width:100%;height:42px;padding:0 12px;background:#101010;border:1px solid var(--border);border-radius:10px;
  font-size:14px;color:#fff;outline:none;transition:border-color 150ms var(--ease),box-shadow 150ms var(--ease);
}
textarea.wa-input{height:auto;min-height:96px;padding:10px 12px;resize:vertical;line-height:1.5}
.wa-input::placeholder{color:var(--muted)}
.wa-input:hover{border-color:var(--border-hover)}
.wa-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(59,130,246,0.10);outline:none}
.wa-tog{
  display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:44px;padding:8px 12px;text-align:left;
  background:#101010;border:1px solid var(--border);border-radius:10px;color:var(--text-2);cursor:pointer;
  transition:background 150ms var(--ease),border-color 150ms var(--ease),color 150ms var(--ease);
}
.wa-tog:hover{border-color:var(--border-hover)}
.wa-tog-text{display:flex;flex-direction:column;min-width:0}
.wa-tog-text b{font-size:14px;font-weight:500;line-height:1.3}
.wa-tog-text small{font-size:12px;color:var(--muted);line-height:1.3}
.wa-tog[aria-checked="true"]{border-color:rgba(34,197,94,.35);background:rgba(34,197,94,.06);color:#fff}
.wa-sw{width:32px;height:18px;border-radius:999px;background:#2A2A2A;position:relative;flex-shrink:0;transition:background 150ms var(--ease)}
.wa-sw::after{content:"";position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#808080;transition:transform 250ms var(--ease),background 150ms var(--ease)}
.wa-tog[aria-checked="true"] .wa-sw{background:var(--success)}
.wa-tog[aria-checked="true"] .wa-sw::after{transform:translateX(14px);background:#fff}

/* Day bar / week strip */
.wa-daybar{display:flex;flex-direction:column;gap:16px}
.wa-daybar-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.wa-daybar-title{display:flex;flex-direction:column;gap:2px;margin-right:auto}
.wa-daybar-title strong{font-size:20px;font-weight:600;letter-spacing:-0.025em;line-height:1.2}
.wa-icon-btn{width:36px;height:36px;padding:0}
.wa-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.wa-day{
  display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;min-height:56px;border-radius:10px;cursor:pointer;
  background:#101010;border:1px solid var(--border-subtle);color:var(--muted);transition:border-color 150ms var(--ease),background 150ms var(--ease);
}
.wa-day:hover{border-color:var(--border-hover)}
.wa-day[aria-pressed="true"]{background:var(--surface-elevated);border-color:var(--border-active);color:#fff}
.wa-day[disabled]{opacity:.35;cursor:default}
.wa-day small{font-size:11px;font-weight:500}
.wa-day b{font-size:14px;font-weight:600;color:var(--text-2)}
.wa-day[aria-pressed="true"] b{color:#fff}
.wa-dot{width:6px;height:6px;border-radius:50%;background:var(--border)}
.wa-dot.won{background:var(--success)}.wa-dot.miss{background:var(--danger)}

.wa-banner{
  display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 16px;border-radius:14px;
  border:1px solid rgba(245,158,11,.35);background:rgba(245,158,11,.07);
}
.wa-banner p{margin:0;font-size:14px;color:var(--text-2);flex:1;min-width:200px}

/* Score ring & rules */
.wa-ring-wrap{display:flex;align-items:center;gap:20px}
.wa-ring{position:relative;width:132px;height:132px;flex-shrink:0}
.wa-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.wa-ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.wa-ring-center strong{font-size:36px;font-weight:700;letter-spacing:-0.04em;line-height:1}
.wa-ring-center span{font-size:11px;color:var(--muted);margin-top:4px}
.wa-ring-meta{display:flex;flex-direction:column;gap:10px;min-width:0}
.wa-rules{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.wa-rule{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--text-2);padding:8px 0;border-bottom:1px solid var(--border-subtle)}
.wa-rule:last-child{border-bottom:0}
.wa-rule-mark{width:20px;height:20px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:transparent;flex-shrink:0}
.wa-rule.on{color:#fff}
.wa-rule.on .wa-rule-mark{background:rgba(34,197,94,.14);border-color:rgba(34,197,94,.45);color:var(--success)}

/* Stats */
.wa-stat{display:flex;flex-direction:column;gap:10px;padding:16px}
.wa-stat strong{font-size:28px;line-height:1.1;font-weight:600;letter-spacing:-0.02em;display:flex;align-items:baseline;gap:6px}
.wa-stat strong small{font-size:13px;font-weight:500;color:var(--muted);letter-spacing:0}

/* Heatmap */
.wa-heat-layout{display:grid;grid-template-columns:auto minmax(0,1fr);gap:48px;align-items:start}
.wa-heat-box{min-width:0}
.wa-heat-side{display:flex;flex-direction:column;gap:24px;min-width:0;max-width:420px}
.wa-heat{display:grid;grid-template-columns:repeat(14,minmax(0,34px));grid-template-rows:repeat(7,auto);grid-auto-flow:column;gap:4px}
.wa-cell{
  aspect-ratio:1;min-width:0;padding:0;border-radius:4px;border:1px solid var(--border-subtle);background:#101010;cursor:pointer;
  transition:transform 150ms var(--ease),border-color 150ms var(--ease);
}
.wa-cell:hover{border-color:var(--border-active)}
.wa-cell.future{background:transparent}
.wa-cell.miss{background:rgba(239,68,68,.40);border-color:rgba(239,68,68,.45)}
.wa-cell.won{border-color:rgba(34,197,94,.55)}
.wa-cell.today{box-shadow:0 0 0 1.5px #fff}
.wa-cell.sel{outline:2px solid var(--accent);outline-offset:2px}
.wa-heat-weeks{display:grid;grid-template-columns:repeat(14,minmax(0,34px));gap:4px;margin-top:8px}
.wa-heat-weeks span{font-size:10px;text-align:center;color:var(--muted)}
.wa-legend{display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--text-2)}
.wa-legend span{display:inline-flex;align-items:center;gap:6px}
.wa-legend i{width:12px;height:12px;border-radius:3px;border:1px solid var(--border-subtle);background:#101010}

/* Charts */
.wa-svg{display:block;width:100%;height:auto;overflow:visible}
.wa-svg text{fill:var(--muted);font-size:11px;font-family:inherit}
.wa-donut{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.wa-donut svg{width:128px;height:128px;flex-shrink:0}
.wa-donut-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px;flex:1;min-width:140px}
.wa-donut-legend div{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2)}
.wa-donut-legend i{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.wa-donut-legend b{margin-left:auto;color:#fff;font-weight:600}
.wa-chart-empty{padding:28px 0;text-align:center;font-size:14px;color:var(--muted)}

/* Plan */
.wa-goal{display:flex;flex-direction:column;gap:16px}
.wa-goal h4{margin:0;font-size:20px;line-height:1.25;font-weight:600;letter-spacing:-0.025em}
.wa-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px}
.wa-list li{display:flex;gap:10px;font-size:14px;color:var(--text-2);line-height:1.5}
.wa-list li::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--border-active);margin-top:8px;flex-shrink:0}
.wa-rule-box{padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:#101010;font-size:14px;color:#fff;line-height:1.5}
.wa-table{width:100%;border-collapse:collapse;font-size:14px}
.wa-table th{text-align:left;font-size:11px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted);padding:0 12px 10px 0}
.wa-table td{padding:12px 12px 12px 0;border-top:1px solid var(--border-subtle);color:var(--text-2);vertical-align:top}
.wa-table td:first-child{color:#fff;font-weight:500;white-space:nowrap}
.wa-table td.n{font-variant-numeric:tabular-nums;color:#fff;white-space:nowrap}
.wa-chips{display:flex;flex-wrap:wrap;gap:8px}
.wa-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:10px;border:1px solid var(--border);background:#101010;font-size:13px;color:var(--text-2)}
.wa-chip b{font-weight:700}

/* Empty state (card fan) */
.wa-empty{display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 16px 8px;text-align:center}
.wa-fan{position:relative;width:280px;height:200px;margin-bottom:14px}
.wa-mock{
  position:absolute;width:200px;height:160px;border-radius:14px;border:1px solid var(--border);overflow:hidden;transform-origin:bottom center;
  box-shadow:0 20px 60px rgba(0,0,0,.6),0 4px 16px rgba(0,0,0,.4);
  transition:transform 400ms var(--ease),box-shadow 400ms var(--ease);
}
.wa-mock.l{background:var(--surface);left:0;top:20px;transform:rotate(-12deg) translateX(10px);z-index:1}
.wa-mock.r{background:var(--surface);right:0;top:20px;transform:rotate(12deg) translateX(-10px);z-index:1}
.wa-mock.f{background:var(--surface-elevated);left:50%;top:0;transform:translateX(-50%);z-index:3}
.wa-fan:hover .wa-mock.l{transform:rotate(-18deg) translateX(-4px) translateY(4px)}
.wa-fan:hover .wa-mock.r{transform:rotate(18deg) translateX(4px) translateY(4px)}
.wa-fan:hover .wa-mock.f{transform:translateX(-50%) translateY(-6px)}
.wa-mock-top{height:28px;display:flex;align-items:center;padding:0 10px;border-bottom:1px solid var(--border-subtle);font-size:9px;font-weight:500;color:var(--muted);letter-spacing:.04em}
.wa-mock-body{padding:10px;display:flex;flex-direction:column;gap:7px}
.wa-mock-row{display:flex;align-items:center;gap:7px}
.wa-mock-row i{width:10px;height:10px;border-radius:3px;border:1px solid var(--border-hover);flex-shrink:0}
.wa-mock-row i.on{background:rgba(34,197,94,.4);border-color:rgba(34,197,94,.7)}
.wa-mock-row s{height:5px;border-radius:3px;background:#2A2A2A;flex:1;text-decoration:none}
.wa-mock-bar{height:5px;border-radius:3px;background:#2A2A2A;overflow:hidden}
.wa-mock-bar b{display:block;height:100%;background:#fff}
.wa-mock-cells{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.wa-mock-cells i{aspect-ratio:1;border-radius:2px;background:#202020}
.wa-mock-cells i.on{background:rgba(34,197,94,.55)}
.wa-empty h4{margin:0;font-size:20px;font-weight:600;letter-spacing:-0.025em}
.wa-empty h4 em{font-style:normal;text-decoration:underline;text-decoration-color:var(--accent);text-decoration-thickness:2px;text-underline-offset:3px}
.wa-empty p{margin:0;max-width:340px;font-size:14px;color:var(--muted)}
.wa-empty-actions{display:flex;align-items:center;gap:8px}

/* Toast & footer */
.wa-toast{
  position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:80;max-width:calc(100vw - 32px);
  padding:10px 16px;border-radius:10px;font-size:14px;color:#fff;background:rgba(15,15,15,.92);border:1px solid var(--border);
  box-shadow:0 20px 50px rgba(0,0,0,.55);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
}
.wa-toast.err{border-color:rgba(239,68,68,.5)}
.wa-foot{margin-top:40px;font-size:13px;color:var(--muted);display:flex;align-items:center;gap:8px}
.wa-foot i{width:6px;height:6px;border-radius:50%;background:var(--success)}
.wa-hidden{display:none}

/* Responsive */
@media (max-width:1024px){
  .wa-grid-today{grid-template-columns:minmax(0,1fr)}
  .wa-side{position:static;order:-1}
  .wa-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
  .wa-span-4,.wa-span-2{grid-column:span 6}
  .wa-hero{grid-template-columns:minmax(0,1fr)}
  .wa-heat-layout{grid-template-columns:minmax(0,1fr);gap:28px}
  .wa-heat-side{max-width:none}
}
@media (max-width:768px){
  .wa-card{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
  .wa-hero{backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
  .wa-wrap{padding:20px 16px 96px}
  .wa-hero{padding:24px 20px;border-radius:18px}
  .wa-hero-stats{gap:24px;flex-wrap:wrap}
  .wa-pillars,.wa-goals{grid-template-columns:minmax(0,1fr)}
  .wa-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .wa-crumb,.wa-logo-word{display:none}
  .wa-btn{min-height:44px}.wa-btn-sm{min-height:36px}
  .wa-icon-btn{width:44px;height:44px}
  .wa-nav{padding:0 12px}
}
@media (max-width:480px){
  .wa-ring-wrap{flex-direction:column;align-items:flex-start}
  .wa-two{grid-template-columns:minmax(0,1fr)}
}
@media (prefers-reduced-motion:reduce){
  .wa *,.wa *::before,.wa *::after{transition-duration:.001ms !important;animation-duration:.001ms !important}
}
`;

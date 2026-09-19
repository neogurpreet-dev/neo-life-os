/* ═══════════════════════════════════════════════════════════
   NEO LIFE OS — AUTH + CLOUD SYNC LAYER  v2
   · Sign-in / Sign-up / Email OTP verification
   · Per-user JWT → Supabase RLS
   · Profile: display name, institution, batch, avatar, accent
   · Every localStorage write mirrored to Supabase in background
═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Config ── */
  var SYNC_KEYS = [
    'kanban_tasks_v2','pomo_queue_v1','pomo_log_v2',
    'eng_vocab_v1','eng_reading_v1','eng_practice_v1',
    'fit_log_v1','fit_skills_v1','fit_nutrition_v2','fit_skill_trees_v1',
    'habits_v1','lifeos_reminders','wt_data_v1','wt_last_reset_v1',
    'user_profile_v1'
  ];
  var SYNC_KEY_SET = {};
  for (var i = 0; i < SYNC_KEYS.length; i++) SYNC_KEY_SET[SYNC_KEYS[i]] = true;

  var AUTH_KEY     = 'neo_auth_v1';
  var SESSION_FLAG = 'neo_cloud_synced_v1';
  var PROFILE_KEY  = 'user_profile_v1';
  var _pendingEmail = '';
  var _pendingName  = '';

  /* ── Token storage ── */
  function loadAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch (e) { return null; }
  }
  function saveAuth(data) {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
        expires_at:    Date.now() + (data.expires_in || 3600) * 1000
      }));
    } catch (e) {}
  }
  function clearAuth() { try { localStorage.removeItem(AUTH_KEY); } catch (e) {} }

  function getAccessToken() {
    var a = loadAuth();
    if (!a || !a.access_token) return null;
    if (Date.now() > a.expires_at - 60000) return null; // expired or < 1 min left
    return a.access_token;
  }

  function authHeaders(token) {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
  }

  function getAuthEmail() {
    var a = loadAuth();
    if (!a || !a.access_token) return '';
    try {
      var payload = JSON.parse(atob(a.access_token.split('.')[1]));
      return payload.email || '';
    } catch (e) { return ''; }
  }

  /* ── Token refresh ── */
  function refreshToken() {
    var a = loadAuth();
    if (!a || !a.refresh_token) return Promise.resolve(null);
    return fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: a.refresh_token })
    }).then(function (r) {
      if (!r.ok) { clearAuth(); return null; }
      return r.json().then(function (data) { saveAuth(data); return data.access_token || null; });
    }).catch(function () { return null; });
  }

  function getValidToken() {
    var t = getAccessToken();
    if (t) return Promise.resolve(t);
    return refreshToken();
  }

  /* ── Auth API calls ── */
  function doLogin(email, password) {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Login failed');
        saveAuth(data);
        return data.access_token;
      });
    });
  }

  function doSignup(name, email, password) {
    return fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name, email: email, password: password })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Sign-up failed');
        return data;
      });
    });
  }

  function doVerifyOtp(email, token) {
    return fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, token: token, type: 'signup' })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Verification failed');
        return data;
      });
    });
  }

  function doResendOtp(email) {
    return fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, resend: true })
    }).then(function (r) { return r.json(); }).catch(function () {});
  }

  /* ── Intercept localStorage writes → background POST to /api/sync ── */
  var _origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    _origSet.call(this, key, value);
    if (this === localStorage && SYNC_KEY_SET[key]) {
      var token = getAccessToken();
      if (!token) return;
      var parsed;
      try { parsed = JSON.parse(value); } catch (e) { parsed = value; }
      fetch('/api/sync', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ key: key, value: parsed })
      }).catch(function () {});
    }
  };

  /* ── Profile helpers ── */
  function loadProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch (e) { return {}; }
  }

  function applyProfile() {
    var p = loadProfile();

    // Accent color CSS variable
    if (p.themeColor && /^#[0-9a-fA-F]{6}$/.test(p.themeColor)) {
      document.documentElement.style.setProperty('--accent', p.themeColor);
    }

    // Hero name
    var heroName = document.getElementById('neo-hero-name');
    if (heroName && p.displayName) heroName.textContent = p.displayName;

    // Hero sub
    var heroSub = document.getElementById('neo-hero-sub');
    if (heroSub && (p.institution || p.batch)) {
      var parts = [];
      if (p.institution) parts.push(p.institution);
      if (p.batch) parts.push(p.batch);
      heroSub.innerHTML = parts.join(' &nbsp;&middot;&nbsp; ');
    }

    // Hero eyebrow
    var heroEb = document.getElementById('neo-hero-eyebrow');
    if (heroEb && p.institution) {
      heroEb.textContent = 'Life Operating System · ' + p.institution + (p.batch ? ' · ' + p.batch : '');
    }

    // Profile button initials / avatar
    _refreshProfileBtn(p);
  }

  function _refreshProfileBtn(p) {
    var btn = document.getElementById('neo-profile-btn');
    if (!btn) return;
    var initial = (p && p.displayName ? p.displayName[0] : 'U').toUpperCase();
    if (p && p.avatarUrl) {
      btn.innerHTML = '<img src="' + p.avatarUrl + '" alt="avatar" onerror="this.parentNode.innerHTML=\'' + initial + '\'">';
    } else {
      btn.textContent = initial;
    }
    // Large avatar in profile panel
    var avLg = document.getElementById('neo-profile-avatar-lg');
    if (!avLg) return;
    if (p && p.avatarUrl) {
      avLg.innerHTML = '<img src="' + p.avatarUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.parentNode.textContent=\'' + initial + '\'">';
    } else {
      avLg.textContent = initial;
      avLg.style.backgroundImage = '';
    }
  }

  /* ── View helpers ── */
  function showView(id) {
    var views = ['neo-view-signin', 'neo-view-signup', 'neo-view-verify'];
    for (var v = 0; v < views.length; v++) {
      var el = document.getElementById(views[v]);
      if (el) el.style.display = (views[v] === id) ? 'flex' : 'none';
    }
  }

  function setErr(errId, msg) {
    var el = document.getElementById(errId);
    if (!el) return;
    if (msg) { el.textContent = msg; el.style.display = 'block'; }
    else { el.style.display = 'none'; }
  }

  /* ── Login / Sign-up UI ── */
  function showLogin(errMsg) {
    document.documentElement.style.opacity = '';
    var overlay = document.getElementById('neo-login-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    showView('neo-view-signin');
    if (errMsg) setErr('neo-signin-err', errMsg);

    /* ─ Sign In ─ */
    var signinBtn   = document.getElementById('neo-signin-btn');
    var signinEmail = document.getElementById('neo-signin-email');
    var signinPass  = document.getElementById('neo-signin-pass');
    var goSignup    = document.getElementById('neo-go-signup');

    function attemptSignin() {
      setErr('neo-signin-err', '');
      if (!signinEmail.value.trim() || !signinPass.value) {
        setErr('neo-signin-err', 'Enter your email and password'); return;
      }
      signinBtn.textContent = 'Signing in…'; signinBtn.disabled = true;
      doLogin(signinEmail.value.trim(), signinPass.value)
        .then(function () {
          overlay.style.display = 'none';
          sessionStorage.removeItem(SESSION_FLAG);
          bootSync();
        })
        .catch(function (e) {
          signinBtn.textContent = 'Sign In'; signinBtn.disabled = false;
          setErr('neo-signin-err', e.message);
        });
    }

    if (signinBtn)   signinBtn.onclick = attemptSignin;
    if (signinPass)  signinPass.onkeydown = function (e) { if (e.key === 'Enter') attemptSignin(); };
    if (goSignup)    goSignup.onclick = function () { setErr('neo-signup-err', ''); showView('neo-view-signup'); };

    /* ─ Sign Up ─ */
    var signupBtn   = document.getElementById('neo-signup-btn');
    var signupName  = document.getElementById('neo-signup-name');
    var signupEmail = document.getElementById('neo-signup-email');
    var signupPass  = document.getElementById('neo-signup-pass');
    var signupPass2 = document.getElementById('neo-signup-pass2');
    var goSignin    = document.getElementById('neo-go-signin');

    function attemptSignup() {
      setErr('neo-signup-err', '');
      var name  = signupName  ? signupName.value.trim()  : '';
      var email = signupEmail ? signupEmail.value.trim() : '';
      var pass  = signupPass  ? signupPass.value         : '';
      var pass2 = signupPass2 ? signupPass2.value        : '';
      if (!name)            { setErr('neo-signup-err', 'Display name is required'); return; }
      if (!email)           { setErr('neo-signup-err', 'Email is required'); return; }
      if (pass.length < 8)  { setErr('neo-signup-err', 'Password must be at least 8 characters'); return; }
      if (pass !== pass2)   { setErr('neo-signup-err', 'Passwords do not match'); return; }
      signupBtn.textContent = 'Creating account…'; signupBtn.disabled = true;
      _pendingEmail = email;
      _pendingName  = name;
      doSignup(name, email, pass)
        .then(function (data) {
          signupBtn.textContent = 'Create Account'; signupBtn.disabled = false;
          if (data.confirmed) {
            saveAuth(data);
            _origSet.call(localStorage, PROFILE_KEY, JSON.stringify({ displayName: name }));
            overlay.style.display = 'none';
            sessionStorage.removeItem(SESSION_FLAG);
            bootSync();
          } else {
            var sub = document.getElementById('neo-verify-sub');
            if (sub) sub.textContent = 'We sent a confirmation link to ' + email + ' — click it to activate your account';
            setErr('neo-verify-err', '');
            showView('neo-view-verify');
          }
        })
        .catch(function (e) {
          signupBtn.textContent = 'Create Account'; signupBtn.disabled = false;
          setErr('neo-signup-err', e.message);
        });
    }

    if (signupBtn) signupBtn.onclick = attemptSignup;
    if (goSignin)  goSignin.onclick  = function () { setErr('neo-signin-err', ''); showView('neo-view-signin'); };

    /* ─ Verify (magic link) ─ */
    var verifyBtn = document.getElementById('neo-verify-btn');
    var resendBtn = document.getElementById('neo-resend-btn');

    if (verifyBtn) verifyBtn.onclick = function () {
      verifyBtn.textContent = 'Checking…'; verifyBtn.disabled = true;
      getValidToken().then(function (token) {
        if (token) {
          // If we stored a display name during signup, seed the profile now
          if (_pendingName) {
            _origSet.call(localStorage, PROFILE_KEY, JSON.stringify({ displayName: _pendingName }));
          }
          overlay.style.display = 'none';
          sessionStorage.removeItem(SESSION_FLAG);
          bootSync();
        } else {
          verifyBtn.textContent = "I\'ve confirmed — sign me in"; verifyBtn.disabled = false;
          setErr('neo-verify-err', 'Not verified yet — click the link in your email first, then come back here');
        }
      });
    };

    if (resendBtn) resendBtn.onclick = function () {
      resendBtn.textContent = 'Sending…'; resendBtn.disabled = true;
      doResendOtp(_pendingEmail).then(function () {
        resendBtn.textContent = 'Sent ✓';
        setTimeout(function () { resendBtn.textContent = 'Resend email'; resendBtn.disabled = false; }, 3000);
      }).catch(function () {
        resendBtn.textContent = 'Resend email'; resendBtn.disabled = false;
      });
    };

    // Auto-focus first field
    if (signinEmail) setTimeout(function () { signinEmail.focus(); }, 50);
  }

  /* ── Profile overlay ── */
  function wireProfile() {
    var profileBtn     = document.getElementById('neo-profile-btn');
    var profileOverlay = document.getElementById('neo-profile-overlay');
    var profileClose   = document.getElementById('neo-profile-close');
    var profileSave    = document.getElementById('neo-profile-save');
    var profileLogout  = document.getElementById('neo-profile-logout-btn');

    if (profileBtn && !profileBtn._wired) {
      profileBtn._wired = true;
      profileBtn.onclick = function () { fillProfileForm(); if (profileOverlay) profileOverlay.style.display = 'flex'; };
    }
    if (profileClose && !profileClose._wired) {
      profileClose._wired = true;
      profileClose.onclick = function () { if (profileOverlay) profileOverlay.style.display = 'none'; };
    }
    if (profileOverlay) {
      profileOverlay.onclick = function (e) { if (e.target === profileOverlay) profileOverlay.style.display = 'none'; };
    }
    if (profileSave && !profileSave._wired) {
      profileSave._wired = true;
      profileSave.onclick = function () {
        var g = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
        var profile = {
          displayName:  g('neo-pf-name'),
          institution:  g('neo-pf-institution'),
          batch:        g('neo-pf-batch'),
          avatarUrl:    g('neo-pf-avatar'),
          themeColor:   g('neo-pf-color') || '#3B82F6'
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); // triggers sync interceptor
        applyProfile();
        if (profileOverlay) profileOverlay.style.display = 'none';
        var orig = profileSave.textContent;
        profileSave.textContent = 'Saved ✓';
        setTimeout(function () { profileSave.textContent = orig; }, 1500);
      };
    }
    if (profileLogout && !profileLogout._wired) {
      profileLogout._wired = true;
      profileLogout.onclick = function () { window.neoLogout(); };
    }
  }

  function fillProfileForm() {
    var p     = loadProfile();
    var email = getAuthEmail();
    var g = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
    g('neo-pf-name',        p.displayName || '');
    g('neo-pf-institution', p.institution || '');
    g('neo-pf-batch',       p.batch || '');
    g('neo-pf-avatar',      p.avatarUrl || '');
    g('neo-pf-color',       p.themeColor || '#3B82F6');
    var nd = document.getElementById('neo-profile-name-display');
    var ed = document.getElementById('neo-profile-email-display');
    if (nd) nd.textContent = p.displayName || 'User';
    if (ed) ed.textContent = email;
    _refreshProfileBtn(p);
  }

  /* ── Boot sync ── */
  function bootSync() {
    getValidToken().then(function (token) {
      if (!token) { showLogin(); return; }

      // Apply profile & wire UI immediately (pre-sync)
      applyProfile();
      wireProfile();

      if (sessionStorage.getItem(SESSION_FLAG)) return;

      document.documentElement.style.opacity = '0';

      fetch('/api/sync/bulk', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ keys: SYNC_KEYS })
      })
        .then(function (r) {
          if (r.status === 401) {
            clearAuth();
            showLogin('Session expired — please sign in again.');
            return;
          }
          return r.json().then(function (data) {
            var items   = data.items || [];
            var updated = false;
            for (var j = 0; j < items.length; j++) {
              var item = items[j];
              if (item.value !== null) {
                var newVal = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
                if (localStorage.getItem(item.key) !== newVal) {
                  _origSet.call(localStorage, item.key, newVal);
                  updated = true;
                }
              }
            }
            sessionStorage.setItem(SESSION_FLAG, '1');
            if (updated) {
              window.location.reload();
            } else {
              document.documentElement.style.opacity = '';
              applyProfile();
            }
          });
        })
        .catch(function () {
          sessionStorage.setItem(SESSION_FLAG, '1');
          document.documentElement.style.opacity = '';
          applyProfile();
        });
    });
  }

  /* ── Expose globals ── */
  window.neoLogout = function () {
    clearAuth();
    sessionStorage.removeItem(SESSION_FLAG);
    window.location.reload();
  };

  window.neoShowProfile = function () {
    var overlay = document.getElementById('neo-profile-overlay');
    if (overlay) { fillProfileForm(); overlay.style.display = 'flex'; }
  };

  /* ── Start ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSync);
  } else {
    bootSync();
  }
})();

/* ─── CONSTANTS ─── */
const SUBJ = {
  'MAI-101': { fg:'#93C5FD', name:'Mathematics'    },
  'PHI-101': { fg:'#C4B5FD', name:'Physics'        },
  'MAC-101': { fg:'#6EE7B7', name:'C++'            },
  'CSE-101': { fg:'#FCA5A5', name:'DSA'            },
  'TMI-102': { fg:'#FCD34D', name:'Fine-tuning' },
};
const SCFG = {
  'Not Started': { color:'#52525B' },
  'In Progress': { color:'#3B82F6' },
  'Done':        { color:'#34D399' },
  'Submitted':   { color:'#A78BFA' },
};
const COL_ORDER = ['Not Started','In Progress','Done','Submitted'];
const MO    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TODAY = new Date('2026-09-13T00:00:00');
const KANBAN_KEY = 'kanban_tasks_v2';

/* ─── SEED DATA ─── */
const RAW = [
  ['Calculus Assignment 3',       'MAI-101','In Progress','2026-09-18',60],
  ['Algorithm Complexity Lab',    'CSE-101','Not Started','2026-09-22',0 ],
  ['Pointers & Memory Worksheet', 'MAC-101','In Progress','2026-09-16',45],
];

/* ─── TASK HELPERS ─── */
let _nextId = 1;

function hydrate(title, subject, status, due, progress) {
  const d = new Date(due + 'T00:00:00');
  return {
    id: _nextId++, title, subject, status, progress, due,
    days: Math.round((d - TODAY) / 86400000),
    dueStr: MO[d.getMonth()] + ' ' + d.getDate()
  };
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(KANBAN_KEY));
    if (saved && saved.length) {
      _nextId = Math.max(...saved.map(t => t.id || 0)) + 1;
      // re-compute days/dueStr in case today changed
      return saved.map(t => {
        const d = new Date((t.due || '2026-09-30') + 'T00:00:00');
        t.days   = Math.round((d - TODAY) / 86400000);
        t.dueStr = MO[d.getMonth()] + ' ' + d.getDate();
        if (!t.id) t.id = _nextId++;
        return t;
      });
    }
  } catch {}
  return RAW.map(r => hydrate(...r));
}

function saveTasks() {
  try { localStorage.setItem(KANBAN_KEY, JSON.stringify(all)); } catch {}
}

let all = loadTasks();

/* ─── STATS (recomputed on every change) ─── */
function updateStats() {
  const doneN  = all.filter(a => a.status === 'Done' || a.status === 'Submitted').length;
  const weekN  = all.filter(a => a.days >= 0 && a.days <= 7 && a.status !== 'Done' && a.status !== 'Submitted').length;
  document.getElementById('s-total').textContent = all.length;
  document.getElementById('s-done').textContent  = doneN;
  document.getElementById('s-week').textContent  = weekN;
  document.getElementById('hp-done').textContent = doneN + ' done';
  document.getElementById('hp-week').textContent = weekN + ' due this week';
}

/* ─── FILTER ─── */
let active = 'All';
const TABS = ['All','This Week','In Progress','Not Started'];

function getVisible() {
  if (active === 'This Week') return all.filter(a => a.days >= 0 && a.days <= 7);
  if (active === 'All') return all;
  return all.filter(a => a.status === active);
}

function renderTabs() {
  const el = document.getElementById('filters');
  el.innerHTML = '';
  TABS.forEach(t => {
    const b = document.createElement('button');
    b.className = 'ftab' + (t === active ? ' on' : '');
    b.textContent = t;
    b.onclick = () => { active = t; renderTabs(); renderKanban(); };
    el.appendChild(b);
  });
}

/* ─── KANBAN ─── */
function renderKanban() {
  const kb = document.getElementById('kanban');
  kb.innerHTML = '';
  const vis = getVisible();

  COL_ORDER.forEach(status => {
    const cfg   = SCFG[status];
    const cards = vis.filter(a => a.status === status);

    const col = document.createElement('div');
    col.className = 'k-col';
    col.style.borderTop = `2px solid ${cfg.color}55`;

    const head = document.createElement('div');
    head.className = 'k-head';
    head.innerHTML = `
      <div class="k-dot" style="background:${cfg.color};box-shadow:0 0 7px ${cfg.color}99"></div>
      <span class="k-hname">${status}</span>
      <span class="k-cnt">${cards.length}</span>`;
    const addBtn = document.createElement('button');
    addBtn.className = 'k-add';
    addBtn.textContent = '+';
    addBtn.title = 'Add task';
    addBtn.onclick = () => openModal(null, status);
    head.appendChild(addBtn);

    const body = document.createElement('div');
    body.className = 'k-body';

    col.appendChild(head);
    col.appendChild(body);
    kb.appendChild(col);

    if (!cards.length) {
      body.innerHTML = '<div class="k-empty">—</div>';
    }

    cards.forEach((a, idx) => {
      const sj     = SUBJ[a.subject] || { fg: '#8594AA' };
      const urgCls = (a.days <= 2 && a.days >= 0) ? 'urg' : (a.days <= 5 && a.days >= 0) ? 'soon' : '';
      const fillClr = (a.status === 'Done' || a.status === 'Submitted') ? '#34D399'
                    : a.progress >= 60 ? '#60A5FA' : '#818CF8';
      const delay = idx * 32;

      const card = document.createElement('div');
      card.className = 'k-card';
      card.innerHTML = `
        <button class="k-edit-btn" title="Edit">✎</button>
        <div class="k-top">
          <div class="k-tag">
            <div class="k-tag-dot" style="background:${sj.fg}"></div>
            <span style="color:${sj.fg}">${a.subject}</span>
          </div>
          <span class="k-due ${urgCls}">${a.dueStr}</span>
        </div>
        <div class="k-title">${a.title}</div>
        <div class="k-bar">
          <div class="k-fill" data-w="${a.progress}" style="background:${fillClr}"></div>
        </div>`;

      card.onclick = () => openModal(a);
      card.querySelector('.k-edit-btn').onclick = (e) => { e.stopPropagation(); openModal(a); };

      body.appendChild(card);

      setTimeout(() => {
        card.style.transitionDelay = delay + 'ms';
        card.classList.add('in');
        const fill = card.querySelector('.k-fill');
        fill.style.transition = `width 750ms cubic-bezier(.16,1,.3,1) ${delay + 150}ms`;
        fill.style.width = fill.dataset.w + '%';
      }, 30);
    });
  });
}

/* ─── PROGRESS RINGS ─── */
const R = 44, C = +(2 * Math.PI * R).toFixed(2); // 276.46

function renderRings() {
  const ringsEl = document.getElementById('rings');
  ringsEl.innerHTML = '';
  Object.entries(SUBJ).forEach(([code, info]) => {
    const items = all.filter(a => a.subject === code);
    const pct   = items.length ? Math.round(items.reduce((s, a) => s + a.progress, 0) / items.length) : 0;
    const offset = +(C * (1 - pct / 100)).toFixed(2);
    const div = document.createElement('div');
    div.className = 'ri';
    div.innerHTML = `
      <div class="ri-svgw">
        <svg class="ri-svg" viewBox="0 0 100 100">
          <circle class="ri-track" cx="50" cy="50" r="${R}"/>
          <circle class="ri-fill"
            cx="50" cy="50" r="${R}"
            stroke="${info.fg}"
            stroke-dasharray="${C}"
            stroke-dashoffset="${C}"
            data-target="${offset}"/>
        </svg>
        <div class="ri-center">
          <span class="ri-pct">${pct}%</span>
          <span class="ri-tasks">${items.length} tasks</span>
        </div>
      </div>
      <div class="ri-code" style="color:${info.fg}">${code}</div>
      <div class="ri-name">${info.name}</div>`;
    ringsEl.appendChild(div);
  });

  // animate
  const fills = ringsEl.querySelectorAll('.ri-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.style.strokeDashoffset = e.target.dataset.target;
    });
  }, { threshold: 0.3 });
  fills.forEach(f => observer.observe(f));
  // trigger immediately if already in view
  setTimeout(() => fills.forEach(f => {
    const rect = f.getBoundingClientRect();
    if (rect.top < window.innerHeight) f.style.strokeDashoffset = f.dataset.target;
  }), 100);
}

/* ─── MODAL ─── */
const overlay   = document.getElementById('km-overlay');
const fTitle    = document.getElementById('km-title');
const fSubject  = document.getElementById('km-subject');
const fStatus   = document.getElementById('km-status');
const fDue      = document.getElementById('km-due');
const fProg     = document.getElementById('km-prog');
const fProgVal  = document.getElementById('km-prog-val');
const btnSave   = document.getElementById('km-save');
const btnCancel = document.getElementById('km-cancel');
const btnDel    = document.getElementById('km-del');

let _editing = null; // task object being edited, null = new

fProg.addEventListener('input', () => { fProgVal.textContent = fProg.value + '%'; });

function openModal(task, defaultStatus) {
  _editing = task;
  document.getElementById('km-heading').textContent = task ? 'Edit Task' : 'New Task';
  fTitle.value   = task ? task.title    : '';
  fSubject.value = task ? task.subject  : 'MAI-101';
  fStatus.value  = task ? task.status   : (defaultStatus || 'Not Started');
  fDue.value     = task ? (task.due || '') : '';
  fProg.value    = task ? task.progress : 0;
  fProgVal.textContent = (task ? task.progress : 0) + '%';
  btnDel.style.display = task ? '' : 'none';
  overlay.classList.add('vis');
  setTimeout(() => fTitle.focus(), 60);
}

function closeModal() {
  overlay.classList.remove('vis');
  _editing = null;
}

function saveModal() {
  const title = fTitle.value.trim();
  if (!title) { fTitle.focus(); return; }
  const due      = fDue.value || '2026-12-31';
  const d        = new Date(due + 'T00:00:00');
  const days     = Math.round((d - TODAY) / 86400000);
  const dueStr   = MO[d.getMonth()] + ' ' + d.getDate();
  const progress = parseInt(fProg.value) || 0;

  if (_editing) {
    Object.assign(_editing, {
      title, subject: fSubject.value, status: fStatus.value,
      due, days, dueStr, progress
    });
  } else {
    all.push({
      id: _nextId++, title,
      subject: fSubject.value, status: fStatus.value,
      due, days, dueStr, progress
    });
  }
  saveTasks();
  closeModal();
  refresh();
}

function deleteTask() {
  if (!_editing) return;
  all = all.filter(t => t.id !== _editing.id);
  saveTasks();
  closeModal();
  refresh();
}

function refresh() {
  updateStats();
  renderTabs();
  renderKanban();
  renderRings();
}

btnSave.addEventListener('click', saveModal);
btnDel.addEventListener('click', deleteTask);
btnCancel.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Enter in title field saves
fTitle.addEventListener('keydown', e => { if (e.key === 'Enter') saveModal(); });

/* ─── RESET ─── */
document.getElementById('kb-reset').addEventListener('click', () => {
  if (!confirm('Reset all tasks to defaults? Your edits will be lost.')) return;
  localStorage.removeItem(KANBAN_KEY);
  _nextId = 1;
  all = RAW.map(r => hydrate(...r));
  refresh();
});

/* ─── BOOT ─── */
updateStats();
renderTabs();
renderKanban();
renderRings();



(function () {
  'use strict';

  /* ── ring math: r=88, offset=0 → ring full; offset=C → ring empty ── */
  const POMO_C = +(2 * Math.PI * 88).toFixed(2); // 552.92

  /* ── mode colours ── */
  const MC = { focus: '#3B82F6', short: '#34D399', long: '#A78BFA' };

  /* ── state ── */
  let pMode      = 'focus';
  let pDurs      = { focus: 25, short: 5, long: 15 };
  let pTotal     = 25 * 60;
  let pRemaining = pTotal;
  let pElapsed   = 0;      // focus-mode seconds only; skip adds nothing
  let pRunning   = false;
  let pInterval  = null;
  let pSessions  = 0;      // focus sessions completed
  const POMO_QUEUE_KEY = 'pomo_queue_v1';
  let pQueue        = (() => { try { return JSON.parse(localStorage.getItem(POMO_QUEUE_KEY)) || []; } catch { return []; } })();   // { id, name } — all tasks; NOT removed when selected
  let pActive       = null; // task currently being tracked { id, name }
  let pNextId       = pQueue.length ? Math.max(...pQueue.map(t => t.id)) + 1 : 1;
  let pSessionAccum = {};   // { [taskId]: { name, seconds } } — per-task time this session
  let pSegElapsed   = 0;    // seconds on pActive since last task-switch

  const STORE_KEY = 'pomo_log_v2';

  /* ── DOM refs ── */
  const card       = document.getElementById('pomo-card');
  const prog       = document.getElementById('pomo-prog');
  const timeEl     = document.getElementById('pomo-time');
  const lblEl      = document.getElementById('pomo-lbl');
  const elapsedEl  = document.getElementById('pomo-elapsed');
  const badgeWrap  = document.getElementById('pomo-badge');
  const badgeName  = document.getElementById('pomo-badge-name');
  const dotsEl     = document.getElementById('pomo-dots');
  const btnReset   = document.getElementById('pb-reset');
  const btnStart   = document.getElementById('pb-start');
  const btnDone    = document.getElementById('pb-done');
  const btnSkip    = document.getElementById('pb-skip');
  const pdFocus    = document.getElementById('pd-focus');
  const pdShort    = document.getElementById('pd-short');
  const pdLong     = document.getElementById('pd-long');
  const taskInp    = document.getElementById('pomo-task-inp');
  const addBtn     = document.getElementById('pomo-add');
  const queueList  = document.getElementById('pomo-queue');
  const breakEl    = document.getElementById('pomo-break');
  const statsEl    = document.getElementById('pomo-stats');
  const psTotal    = document.getElementById('ps-total');
  const psCount    = document.getElementById('ps-count');
  const psAvg      = document.getElementById('ps-avg');
  const logWrap    = document.getElementById('pomo-log-wrap');
  const logList    = document.getElementById('pomo-log-list');
  const btnClear   = document.getElementById('pb-clear-log');

  /* ── localStorage ── */
  function loadLog() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; }
  }
  function saveLog(arr) {
    // Keep only the 40 most-recent entries so the list never grows indefinitely
    const trimmed = arr.slice(-40);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(trimmed)); } catch {}
    return trimmed;
  }
  let pLog = loadLog();

  /* ── audio chime ── */
  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[523.25, 0], [659.25, 0.15], [783.99, 0.3]].forEach(([f, t]) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = f;
        g.gain.setValueAtTime(0.28, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.55);
        osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.6);
      });
    } catch {}
  }

  /* ── formatting ── */
  function fmt(s) {
    const m = Math.floor(s / 60), ss = s % 60;
    return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }
  function fmtMin(s) { return (s / 60).toFixed(1) + 'm'; }

  /* ── ring: offset=0→full, offset=POMO_C→empty; ring drains as time passes ── */
  function updateRing() {
    // how much of the ring to show = fraction remaining
    const offset = +(POMO_C * (1 - pRemaining / pTotal)).toFixed(2);
    prog.style.strokeDashoffset = offset;
  }

  function updateTime() {
    timeEl.textContent = fmt(pRemaining);
    if (pMode === 'focus' && pElapsed > 0) {
      elapsedEl.textContent = fmtMin(pElapsed) + ' focused';
      elapsedEl.classList.add('vis');
    }
  }

  function updateDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const d = document.createElement('div');
      d.className = 'pomo-dot' +
        (i < pSessions % 4 ? ' filled' : '') +
        (i === pSessions % 4 && pMode === 'focus' && pRunning ? ' cur' : '');
      dotsEl.appendChild(d);
    }
  }

  function updateBadge() {
    if (pActive) {
      badgeWrap.classList.remove('hidden');
      badgeName.textContent = pActive.name;
    } else if (pMode === 'focus' && pQueue.length) {
      badgeWrap.classList.remove('hidden');
      badgeName.textContent = 'Tap a task below to track it';
      badgeName.style.opacity = '0.5';
      return;
    } else {
      badgeWrap.classList.add('hidden');
    }
    badgeName.style.opacity = '';
  }

  /* ── stats + log ── */
  function updateStats() {
    const today = new Date().toDateString();
    const tDay  = pLog.filter(e => new Date(e.timestamp).toDateString() === today && e.mode === 'focus');
    const sec   = tDay.reduce((s, e) => s + e.elapsed, 0);
    const cnt   = tDay.length;
    psTotal.textContent = sec > 0 ? fmtMin(sec) : '0m';
    psCount.textContent = cnt;
    psAvg.textContent   = cnt > 0 ? (sec / 60 / cnt).toFixed(1) + 'm' : '—';
    statsEl.style.display = pLog.length ? 'flex' : 'none';
  }

  let pLogShowAll = false;

  function renderLog() {
    logList.innerHTML = '';
    if (!pLog.length) { logWrap.style.display = 'none'; return; }
    logWrap.style.display = 'block';

    const todayStr = new Date().toDateString();
    const all = [...pLog].reverse();
    const todayEntries = all.filter(e => new Date(e.timestamp).toDateString() === todayStr);
    const shown = pLogShowAll ? all : (todayEntries.length ? todayEntries : all.slice(0, 5));

    shown.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'pomo-log-item';
      const dot = document.createElement('div');
      dot.className = 'pomo-log-dot';
      dot.style.background = MC[entry.mode] || MC.focus;
      const task = document.createElement('span');
      task.className = 'pomo-log-task';
      task.textContent = entry.task || '(no task)';
      const time = document.createElement('span');
      time.className = 'pomo-log-time';
      time.textContent = fmtMin(entry.elapsed);
      const ago = document.createElement('span');
      ago.className = 'pomo-log-ago';
      const mins = Math.round((Date.now() - entry.timestamp) / 60000);
      ago.textContent = mins < 60 ? mins + 'm ago' : Math.round(mins/60) + 'h ago';
      div.append(dot, task, time, ago);
      logList.appendChild(div);
    });

    // Show toggle if there are older entries not shown
    if (!pLogShowAll && all.length > shown.length) {
      const toggle = document.createElement('button');
      toggle.className = 'pomo-log-more';
      toggle.textContent = `Show ${all.length - shown.length} older session${all.length - shown.length > 1 ? 's' : ''}`;
      toggle.onclick = () => { pLogShowAll = true; renderLog(); };
      logList.appendChild(toggle);
    } else if (pLogShowAll && all.length > todayEntries.length) {
      const toggle = document.createElement('button');
      toggle.className = 'pomo-log-more';
      toggle.textContent = 'Show today only';
      toggle.onclick = () => { pLogShowAll = false; renderLog(); };
      logList.appendChild(toggle);
    }
  }

  function logEntry() {
    if (pMode !== 'focus' || pElapsed < 1) return;

    // Flush the current active segment into the accumulator
    if (pActive && pSegElapsed > 0) {
      if (!pSessionAccum[pActive.id])
        pSessionAccum[pActive.id] = { name: pActive.name, seconds: 0 };
      pSessionAccum[pActive.id].seconds += pSegElapsed;
    }

    const now = Date.now();
    const accumulated = Object.values(pSessionAccum);

    if (accumulated.length > 0) {
      // Log each task separately with its accumulated time
      accumulated.forEach(t => {
        if (t.seconds >= 1)
          pLog.push({ task: t.name, elapsed: t.seconds, mode: 'focus', timestamp: now });
      });
    } else {
      // Timer ran but no task was selected — log as anonymous
      pLog.push({ task: '', elapsed: pElapsed, mode: 'focus', timestamp: now });
    }

    // Reset session accumulators so the next Done is a fresh slate
    pSessionAccum = {};
    pSegElapsed   = 0;

    pLog = saveLog(pLog);
    updateStats();
    renderLog();
  }

  /* ── task queue ── */
  /* Auto-select the first task (used when timer starts with nothing selected) */
  function pullNextTask() {
    if (!pActive && pQueue.length) selectTask(pQueue[0]);
  }

  /* Flush current segment → accumulator, then switch active task */
  function selectTask(task) {
    if (pActive && pSegElapsed > 0) {
      if (!pSessionAccum[pActive.id])
        pSessionAccum[pActive.id] = { name: pActive.name, seconds: 0 };
      pSessionAccum[pActive.id].seconds += pSegElapsed;
    }
    pSegElapsed = 0;
    pActive = task;
    updateBadge();
    renderQueue();
  }

  function addTask() {
    const name = taskInp.value.trim();
    if (!name) return;
    pQueue.push({ id: pNextId++, name });
    taskInp.value = '';
    renderQueue();
  }

  function renderQueue() {
    try { localStorage.setItem(POMO_QUEUE_KEY, JSON.stringify(pQueue)); } catch {}
    queueList.innerHTML = '';
    if (!pQueue.length) return;
    pQueue.forEach((item, i) => {
      const isActive = pActive && pActive.id === item.id;
      const div = document.createElement('div');
      div.className = 'pomo-qi' + (isActive ? ' pact' : '');
      div.title = isActive ? 'Currently tracking' : 'Click to track this task';

      const num = document.createElement('span');
      num.className = 'pq-num';
      num.textContent = isActive ? '▶' : String(i + 1);

      const nameEl = document.createElement('span');
      nameEl.className = 'pq-name';
      nameEl.textContent = item.name;

      // Show accumulated time for this task if any
      const taskSec = (pSessionAccum[item.id]?.seconds || 0) + (isActive ? pSegElapsed : 0);
      const timeEl = document.createElement('span');
      timeEl.className = 'pq-task-time';
      timeEl.textContent = taskSec >= 60 ? Math.floor(taskSec / 60) + 'm' : taskSec > 0 ? taskSec + 's' : '';

      const del = document.createElement('button');
      del.className = 'pq-del';
      del.textContent = '×';

      div.append(num, nameEl, timeEl, del);
      queueList.appendChild(div);

      // Click the row (not ×) to select this task
      div.addEventListener('click', e => {
        if (e.target === del) return;
        if (!isActive) selectTask(item);
      });

      // Double-click name to rename inline
      nameEl.addEventListener('dblclick', e => {
        e.stopPropagation();
        const inp = document.createElement('input');
        inp.style.cssText = 'flex:1;background:transparent;border:none;border-bottom:1px solid rgba(255,255,255,.2);color:var(--t1);font-size:11px;font-family:var(--sans);outline:none;padding:1px 2px;min-width:0';
        inp.value = item.name;
        nameEl.replaceWith(inp);
        inp.focus(); inp.select();
        function commit() {
          const v = inp.value.trim();
          if (v) {
            item.name = v;
            if (pActive && pActive.id === item.id) pActive.name = v;
            if (pSessionAccum[item.id]) pSessionAccum[item.id].name = v;
          }
          renderQueue(); updateBadge();
        }
        inp.addEventListener('blur', commit);
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') inp.blur();
          if (e.key === 'Escape') { inp.value = item.name; inp.blur(); }
        });
      });

      del.addEventListener('click', e => {
        e.stopPropagation();
        // If deleting the active task, flush its segment first, then clear active
        if (isActive) {
          if (pSegElapsed > 0) {
            if (!pSessionAccum[item.id])
              pSessionAccum[item.id] = { name: item.name, seconds: 0 };
            pSessionAccum[item.id].seconds += pSegElapsed;
            pSegElapsed = 0;
          }
          pActive = null;
          updateBadge();
        }
        pQueue = pQueue.filter(t => t.id !== item.id);
        renderQueue();
      });
    });
  }

  /* ── timer core ── */
  function setMode(m) {
    pMode = m;
    pDurs.focus = parseInt(pdFocus.value) || 25;
    pDurs.short = parseInt(pdShort.value) || 5;
    pDurs.long  = parseInt(pdLong.value)  || 15;
    pTotal     = pDurs[m] * 60;
    pRemaining = pTotal;
    pElapsed   = 0;
    card.style.setProperty('--pc', MC[m]);
    document.querySelectorAll('.pomo-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.pmode === m));
    lblEl.textContent = { focus: '🎯 Focus', short: '☕ Short Break', long: '🌙 Long Break' }[m];
    elapsedEl.classList.remove('vis');
    breakEl.style.display = 'none';
    updateRing();
    updateTime();
  }

  function tick() {
    if (pRemaining <= 0) { completeSession(true); return; }
    pRemaining--;
    if (pMode === 'focus') {
      pElapsed++;
      if (pActive) pSegElapsed++;
    }
    updateRing(); updateTime(); updateDots();
  }

  function startTimer() {
    if (pRunning) return;
    pRunning = true;
    if (!pActive) pullNextTask();
    btnStart.textContent = '⏸ Pause';
    btnDone.disabled = false;
    pInterval = setInterval(tick, 1000);
  }

  function pauseTimer() {
    pRunning = false;
    clearInterval(pInterval); pInterval = null;
    btnStart.textContent = '▶ Resume';
  }

  function resetTimer() {
    pauseTimer();
    pRemaining = pTotal; pElapsed = 0;
    pSessionAccum = {}; pSegElapsed = 0;
    updateRing(); updateTime();
    elapsedEl.classList.remove('vis');
    btnStart.textContent = '▶ Start';
    btnDone.disabled = true;
    updateDots();
    renderQueue(); // refresh time chips
  }

  function completeSession(auto) {
    pauseTimer();
    chime();
    // If we're on a break, just return to focus — don't log or count
    if (pMode !== 'focus') {
      setMode('focus'); pullNextTask();
      btnStart.textContent = '▶ Start'; btnDone.disabled = true;
      return;
    }
    logEntry();
    pSessions++;
    updateDots();

    if (pMode === 'focus' && pSessions > 0 && pSessions % 4 === 0) {
      // offer long break prompt
      breakEl.innerHTML = '';
      const txt = document.createElement('div');
      txt.innerHTML = '🎯 <strong>4 done.</strong> Long break?';
      const btns = document.createElement('div');
      btns.className = 'pomo-break-btns';
      const bSkip = document.createElement('button');
      bSkip.textContent = 'Skip';
      const bTake = document.createElement('button');
      bTake.textContent = 'Take it'; bTake.className = 'pacc';
      btns.append(bSkip, bTake);
      breakEl.append(txt, btns);
      breakEl.style.display = 'flex';
      bSkip.addEventListener('click', () => {
        breakEl.style.display = 'none'; setMode('short');
        btnStart.textContent = '▶ Start'; btnDone.disabled = true;
      });
      bTake.addEventListener('click', () => {
        breakEl.style.display = 'none'; setMode('long');
        btnStart.textContent = '▶ Start'; btnDone.disabled = true;
      });
    } else {
      const next = 'short'; // pMode is always 'focus' here (break path returns early above)
      setMode(next);
      if (auto) startTimer(); else { btnStart.textContent = '▶ Start'; btnDone.disabled = true; }
    }
  }

  /* ── events ── */
  btnStart.addEventListener('click', () => { if (pRunning) pauseTimer(); else startTimer(); });
  btnReset.addEventListener('click', resetTimer);
  btnDone.addEventListener('click', () => completeSession(false));
  btnSkip.addEventListener('click', () => {
    pauseTimer();
    if (pMode === 'focus') {
      // Skip the current focus block → short break (Done earns you the long break)
      setMode('short');
    } else {
      // Skip the break → back to focus
      setMode('focus'); pullNextTask();
    }
    btnStart.textContent = '▶ Start'; btnDone.disabled = true;
  });

  document.querySelectorAll('.pomo-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (pRunning) return;
      setMode(tab.dataset.pmode);
      btnStart.textContent = '▶ Start'; btnDone.disabled = true;
    });
  });

  [{ el: pdFocus, key: 'focus' }, { el: pdShort, key: 'short' }, { el: pdLong, key: 'long' }]
    .forEach(({ el, key }) => {
      el.addEventListener('change', () => {
        if (pRunning) return;
        pDurs[key] = Math.max(1, parseInt(el.value) || pDurs[key]);
        el.value = pDurs[key];
        if (key === pMode) {
          pTotal = pDurs[key] * 60; pRemaining = pTotal; pElapsed = 0;
          updateRing(); updateTime();
        }
      });
    });

  addBtn.addEventListener('click', addTask);
  taskInp.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  btnClear.addEventListener('click', () => {
    pLog = []; pLogShowAll = false; saveLog(pLog); updateStats(); renderLog();
  });

  /* ── boot ── */
  prog.style.strokeDasharray  = POMO_C;
  prog.style.strokeDashoffset = 0; // full ring at start
  setMode('focus');
  updateDots();
  updateStats();
  renderLog();
  renderQueue();
  btnDone.disabled = true;

})();



/* ── ENGLISH TRACKER (scoped IIFE) ── */
(function () {
  const VK = 'eng_vocab_v1', RK = 'eng_reading_v1', PK = 'eng_practice_v1';
  let _id = Date.now();
  const uid  = () => _id++;
  const ls   = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } };
  const ss   = (k,d) => { try { localStorage.setItem(k, JSON.stringify(d)); } catch {} };
  const $    = id => document.getElementById(id);
  const esc  = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  let vocab    = ls(VK);
  let readings = ls(RK);
  let practice = ls(PK);

  const TODAY = new Date().toISOString().slice(0,10);
  const MOS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function fmtDate(d) { if (!d) return ''; const dt = new Date(d+'T00:00:00'); return MOS[dt.getMonth()]+' '+dt.getDate(); }
  function stars(n)   { return '★'.repeat(n)+'☆'.repeat(5-n); }
  function shuffle(a) { for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];}return a; }

  const STATUS_CYCLE = { new:'learning', learning:'mastered', mastered:'new' };

  function wordCardHTML(w) {
    return `<div class="eng-wcard" data-id="${w.id}">
      <div class="eng-wword">${esc(w.word)}</div>
      <div class="eng-wdef">${esc(w.def)}</div>
      ${w.ex ? `<div class="eng-wex">${esc(w.ex)}</div>` : ''}
      <div class="eng-wfoot">
        <span class="eng-badge eb-${w.status} eng-sbadge" title="Tap to cycle status">${w.status}</span>
        <span class="eng-wsrc">${esc(w.src||'')}</span>
      </div>
    </div>`;
  }

  function cycleStatus(id) {
    const w = vocab.find(v => v.id == id);
    if (!w) return;
    w.status = STATUS_CYCLE[w.status] || 'new';
    ss(VK, vocab);
    refreshVocab();
  }

  function wireCards(container) {
    container.querySelectorAll('.eng-wcard').forEach(c => {
      c.querySelector('.eng-sbadge').addEventListener('click', e => {
        e.stopPropagation();
        cycleStatus(c.dataset.id);
      });
      c.addEventListener('click', () => openWord(vocab.find(w => w.id == c.dataset.id)));
    });
  }

  /* ── Seed ── */
  if (localStorage.getItem(VK) === null) {
    vocab = [
      { id:uid(), word:'Ephemeral', def:'Lasting for a very short time; transitory.', ex:'The ephemeral beauty of the northern lights left everyone speechless.', src:'Reading', status:'learning', date:TODAY },
      { id:uid(), word:'Verbose',   def:'Using more words than necessary; long-winded.', ex:'His verbose response confused rather than clarified the issue.', src:'', status:'new', date:TODAY },
      { id:uid(), word:'Lucid',     def:'Expressed clearly; easy to understand.', ex:'She gave a lucid explanation of the quantum mechanics concept.', src:'Lecture', status:'new', date:TODAY },
    ];
    ss(VK, vocab);
  }

  /* ── Tab switch ── */
  document.querySelectorAll('.eng-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.eng-tab').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      document.querySelectorAll('.eng-panel').forEach(p => p.classList.remove('show'));
      const panel = document.getElementById('e' + btn.dataset.etab + '-panel');
      if (panel) panel.classList.add('show');
    });
  });

  /* ── Filter helpers ── */
  function wireChips(containerId, onPick) {
    document.querySelectorAll('#' + containerId + ' .eng-chip').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelectorAll('#' + containerId + ' .eng-chip').forEach(x => x.classList.remove('on'));
        c.classList.add('on');
        onPick(c.dataset.ef);
      });
    });
  }

  let readF = 'all', practF = 'all';
  wireChips('e-rfilters', f => { readF  = f; renderReading();  });
  wireChips('e-pfilters', f => { practF = f; renderPractice(); });

  /* ── Vocab preview (last 3 added) ── */
  function renderVocab() {
    const mastered = vocab.filter(w => w.status === 'mastered').length;
    const today    = vocab.filter(w => w.date === TODAY).length;
    $('e-vstats').innerHTML =
      `<span class="eng-pstat"><strong>${vocab.length}</strong> words</span>
       <span class="eng-pstat"><strong>${mastered}</strong> mastered</span>
       <span class="eng-pstat"><strong>${today}</strong> today</span>`;

    const recent  = vocab.slice(0, 3); // newest first since we prepend on add
    const preview = $('e-vocab-preview');
    if (!vocab.length) {
      preview.innerHTML = `<div class="eng-empty" style="padding:28px 0"><p>No words yet. Add your first above.</p></div>`;
    } else {
      preview.innerHTML = `<div class="eng-grid" style="margin-bottom:0">${recent.map(wordCardHTML).join('')}</div>`;
      wireCards(preview);
    }
  }

  /* ── Full vocab page ── */
  const vocabFull = $('eng-vocab-full');
  let vfStatus = 'all', vfSort = 'newest', vfQuery = '';

  $('e-view-all').onclick = () => { renderVocabFull(); vocabFull.classList.add('vis'); };
  $('e-vf-back').onclick  = () => vocabFull.classList.remove('vis');
  $('e-vf-add').onclick   = () => openWord(null);

  $('e-vf-search').addEventListener('input', e => {
    vfQuery = e.target.value.toLowerCase().trim();
    renderVocabFull();
  });

  document.querySelectorAll('#e-vf-status .eng-chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#e-vf-status .eng-chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      vfStatus = c.dataset.evfs;
      renderVocabFull();
    });
  });

  document.querySelectorAll('#e-vf-sort .eng-chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#e-vf-sort .eng-chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      vfSort = c.dataset.evfsort;
      renderVocabFull();
    });
  });

  function renderVocabFull() {
    let list = vfStatus === 'all' ? [...vocab] : vocab.filter(w => w.status === vfStatus);
    if (vfQuery) list = list.filter(w =>
      w.word.toLowerCase().includes(vfQuery) ||
      (w.def||'').toLowerCase().includes(vfQuery) ||
      (w.src||'').toLowerCase().includes(vfQuery)
    );
    if      (vfSort === 'newest') list.sort((a,b) => b.id - a.id);
    else if (vfSort === 'oldest') list.sort((a,b) => a.id - b.id);
    else if (vfSort === 'az')     list.sort((a,b) => a.word.localeCompare(b.word));
    else if (vfSort === 'za')     list.sort((a,b) => b.word.localeCompare(a.word));

    $('e-vf-count').textContent = `${list.length} word${list.length !== 1 ? 's' : ''}`;
    const grid = $('e-vf-grid');
    if (!list.length) {
      grid.innerHTML = `<div class="eng-empty" style="grid-column:1/-1"><p>${vocab.length ? 'No words match — try a different filter.' : 'No words yet. Add your first above.'}</p></div>`;
    } else {
      grid.innerHTML = list.map(wordCardHTML).join('');
      wireCards(grid);
    }
  }

  function refreshVocab() {
    renderVocab();
    if (vocabFull.classList.contains('vis')) renderVocabFull();
  }

  /* ── Render Reading ── */
  function renderReading() {
    const filtered = readF === 'all' ? readings : readings.filter(r => readF === 'finished' ? r.status === 'finished' : r.type === readF);
    const finished = readings.filter(r => r.status === 'finished').length;
    const pages    = readings.reduce((s,r) => s + (r.pagesRead||0), 0);
    $('e-rstats').innerHTML =
      `<span class="eng-pstat"><strong>${readings.length}</strong> entries</span>
       <span class="eng-pstat"><strong>${finished}</strong> finished</span>
       <span class="eng-pstat"><strong>${pages}</strong> pages</span>`;

    const list = $('e-reading-list');
    if (!filtered.length) {
      list.innerHTML = `<div class="eng-empty"><div style="font-size:2rem;margin-bottom:10px">📚</div><p>Nothing tracked yet.<br>Add a book or article above.</p></div>`;
    } else {
      list.innerHTML = filtered.map(r => {
        const pct = r.pagesTotal ? Math.min(100, Math.round((r.pagesRead||0) / r.pagesTotal * 100)) : 0;
        return `<div class="eng-rc" data-id="${r.id}">
          <div class="eng-rc-top">
            <div class="eng-rc-title">${esc(r.title)}</div>
            <div class="eng-rc-meta">
              <span class="eng-badge eb-${r.type}">${r.type}</span>
              <span class="eng-badge eb-${r.status}">${r.status}</span>
            </div>
          </div>
          ${r.pagesTotal ? `<div class="eng-pbar"><div class="eng-pfill" style="width:${pct}%"></div></div>
          <div class="eng-rc-foot"><span>${r.pagesRead||0} / ${r.pagesTotal} pages</span><span>${pct}%</span></div>` : ''}
          ${r.notes ? `<div class="eng-rc-notes">${esc(r.notes)}</div>` : ''}
        </div>`;
      }).join('');
      list.querySelectorAll('.eng-rc').forEach(c => {
        c.addEventListener('click', () => openReading(readings.find(r => r.id == c.dataset.id)));
      });
    }
  }

  /* ── Render Practice ── */
  function renderPractice() {
    const filtered = practF === 'all' ? practice : practice.filter(p => p.type === practF);
    const wkSess   = practice.filter(p => (new Date() - new Date(p.date)) < 7*86400000).length;
    const totalMin = practice.reduce((s,p) => s + (p.duration||0), 0);
    $('e-pstats').innerHTML =
      `<span class="eng-pstat"><strong>${practice.length}</strong> sessions</span>
       <span class="eng-pstat"><strong>${wkSess}</strong> this week</span>
       <span class="eng-pstat"><strong>${Math.round(totalMin/60*10)/10}h</strong> total</span>`;

    const list = $('e-practice-list');
    if (!filtered.length) {
      list.innerHTML = `<div class="eng-empty"><div style="font-size:2rem;margin-bottom:10px">🎙️</div><p>No sessions yet.<br>Log your first practice above.</p></div>`;
    } else {
      list.innerHTML = filtered.map(p => `
        <div class="eng-pc" data-id="${p.id}">
          <div class="eng-pc-icon ${p.type}">${p.type==='speaking'?'🎙':'✍️'}</div>
          <div class="eng-pc-body">
            <div class="eng-pc-title">${esc(p.prompt||(p.type==='speaking'?'Speaking practice':'Writing practice'))}</div>
            <div class="eng-pc-meta">
              <span class="eng-badge eb-${p.type}">${p.type}</span>
              <span>${p.duration||0} min</span>
              <span>${fmtDate(p.date)}</span>
              <span class="eng-stars">${stars(p.rating||3)}</span>
            </div>
            ${p.notes ? `<div class="eng-pc-notes">${esc(p.notes)}</div>` : ''}
          </div>
        </div>`).join('');
      list.querySelectorAll('.eng-pc').forEach(c => {
        c.addEventListener('click', () => openPractice(practice.find(p => p.id == c.dataset.id)));
      });
    }
  }

  /* ── Word Modal ── */
  let editW = null;
  const wordOv = $('e-word-ov');
  function openWord(w) {
    editW = w || null;
    $('e-wm-title').textContent   = w ? 'Edit Word' : 'New Word';
    $('e-wm-word').value          = w ? w.word      : '';
    $('e-wm-def').value           = w ? w.def       : '';
    $('e-wm-ex').value            = w ? (w.ex||'')  : '';
    $('e-wm-src').value           = w ? (w.src||'') : '';
    $('e-wm-status').value        = w ? w.status    : 'new';
    $('e-wm-del').style.display   = w ? '' : 'none';
    wordOv.classList.add('vis');
    setTimeout(() => $('e-wm-word').focus(), 60);
  }
  const closeWordOv = () => wordOv.classList.remove('vis');
  $('e-wm-close').onclick = closeWordOv;
  wordOv.addEventListener('click', e => { if (e.target === wordOv) closeWordOv(); });
  $('e-wm-save').onclick = () => {
    const word = $('e-wm-word').value.trim();
    if (!word) { $('e-wm-word').focus(); return; }
    const entry = { id:editW?editW.id:uid(), word, def:$('e-wm-def').value.trim(),
      ex:$('e-wm-ex').value.trim(), src:$('e-wm-src').value.trim(),
      status:$('e-wm-status').value, date:editW?editW.date:TODAY };
    vocab = editW ? vocab.map(w => w.id===editW.id ? entry : w) : [entry,...vocab];
    ss(VK, vocab); closeWordOv(); refreshVocab();
  };
  $('e-wm-del').onclick = () => {
    if (!editW) return;
    vocab = vocab.filter(w => w.id !== editW.id);
    ss(VK, vocab); closeWordOv(); refreshVocab();
  };
  $('e-add-word').onclick = () => openWord(null);

  /* ── Reading Modal ── */
  let editR = null;
  const readOv = $('e-reading-ov');
  function openReading(r) {
    editR = r || null;
    $('e-rm-title').textContent    = r ? 'Edit Entry' : 'Add Entry';
    $('e-rm-title-in').value       = r ? r.title      : '';
    $('e-rm-type').value           = r ? r.type        : 'book';
    $('e-rm-status').value         = r ? r.status      : 'reading';
    $('e-rm-pread').value          = r ? (r.pagesRead||'')  : '';
    $('e-rm-ptotal').value         = r ? (r.pagesTotal||'') : '';
    $('e-rm-notes').value          = r ? (r.notes||'') : '';
    $('e-rm-del').style.display    = r ? '' : 'none';
    readOv.classList.add('vis');
    setTimeout(() => $('e-rm-title-in').focus(), 60);
  }
  const closeReadOv = () => readOv.classList.remove('vis');
  $('e-rm-close').onclick = closeReadOv;
  readOv.addEventListener('click', e => { if (e.target === readOv) closeReadOv(); });
  $('e-rm-save').onclick = () => {
    const title = $('e-rm-title-in').value.trim();
    if (!title) { $('e-rm-title-in').focus(); return; }
    const entry = { id:editR?editR.id:uid(), title, type:$('e-rm-type').value,
      status:$('e-rm-status').value,
      pagesRead:parseInt($('e-rm-pread').value)||0,
      pagesTotal:parseInt($('e-rm-ptotal').value)||0,
      notes:$('e-rm-notes').value.trim(), date:editR?editR.date:TODAY };
    readings = editR ? readings.map(r => r.id===editR.id ? entry : r) : [entry,...readings];
    ss(RK, readings); closeReadOv(); renderReading();
  };
  $('e-rm-del').onclick = () => {
    if (!editR) return;
    readings = readings.filter(r => r.id !== editR.id);
    ss(RK, readings); closeReadOv(); renderReading();
  };
  $('e-add-reading').onclick = () => openReading(null);

  /* ── Practice Modal ── */
  let editP = null;
  const practOv = $('e-practice-ov');
  function openPractice(p) {
    editP = p || null;
    $('e-pm-title').textContent  = p ? 'Edit Session' : 'Log Session';
    $('e-pm-type').value         = p ? p.type         : 'speaking';
    $('e-pm-dur').value          = p ? (p.duration||'') : '';
    $('e-pm-prompt').value       = p ? (p.prompt||'')   : '';
    $('e-pm-rating').value       = p ? (p.rating||3)    : '3';
    $('e-pm-notes').value        = p ? (p.notes||'')    : '';
    $('e-pm-del').style.display  = p ? '' : 'none';
    practOv.classList.add('vis');
    setTimeout(() => $('e-pm-prompt').focus(), 60);
  }
  const closePractOv = () => practOv.classList.remove('vis');
  $('e-pm-close').onclick = closePractOv;
  practOv.addEventListener('click', e => { if (e.target === practOv) closePractOv(); });
  $('e-pm-save').onclick = () => {
    const entry = { id:editP?editP.id:uid(), type:$('e-pm-type').value,
      duration:parseInt($('e-pm-dur').value)||0,
      prompt:$('e-pm-prompt').value.trim(),
      rating:parseInt($('e-pm-rating').value)||3,
      notes:$('e-pm-notes').value.trim(), date:editP?editP.date:TODAY };
    practice = editP ? practice.map(p => p.id===editP.id ? entry : p) : [entry,...practice];
    ss(PK, practice); closePractOv(); renderPractice();
  };
  $('e-pm-del').onclick = () => {
    if (!editP) return;
    practice = practice.filter(p => p.id !== editP.id);
    ss(PK, practice); closePractOv(); renderPractice();
  };
  $('e-add-practice').onclick = () => openPractice(null);

  /* ── Flashcard ── */
  let fcWords = [], fcIdx = 0;
  const fcScreen = $('eng-fc');

  $('e-review').onclick = () => {
    const pool = vocab.filter(w => w.status !== 'mastered');
    if (!pool.length) { alert('No unmastered words to review! Mark some words as "new" or "learning" first.'); return; }
    fcWords = shuffle([...pool]);
    fcIdx = 0; showFC();
    fcScreen.classList.add('vis');
  };
  $('e-fc-close').onclick = () => fcScreen.classList.remove('vis');
  $('e-fc-prev').onclick  = () => { if (fcIdx > 0) { fcIdx--; showFC(); } };
  $('e-fc-next').onclick  = () => {
    if (fcIdx < fcWords.length - 1) { fcIdx++; showFC(); }
    else fcScreen.classList.remove('vis');
  };
  $('e-fc-card').onclick = function () { this.classList.toggle('shown'); };

  function showFC() {
    const w = fcWords[fcIdx];
    $('e-fc-word').textContent = w.word;
    $('e-fc-def').textContent  = w.def;
    $('e-fc-ex').textContent   = w.ex || '';
    $('e-fc-ex').style.display = w.ex ? '' : 'none';
    $('e-fc-prog').textContent = `${fcIdx + 1} / ${fcWords.length}`;
    $('e-fc-card').classList.remove('shown');
    $('e-fc-next').textContent = fcIdx < fcWords.length - 1 ? 'Next →' : 'Finish';
  }

  /* ── Init ── */
  renderVocab();
  renderReading();
  renderPractice();
})();



;(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const FLK = 'fit_log_v1', FSK = 'fit_skills_v1', FNK = 'fit_nutrition_v2', FTK = 'fit_skill_trees_v1';
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function gs(k) { try { return JSON.parse(localStorage.getItem(k)) || null; } catch { return null; } }
  function ss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  function uid() { return Date.now() + Math.random().toString(36).slice(2,6); }
  function fmtDate(s) {
    if (!s) return '';
    const [,m,d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + (+d);
  }
  function todayStr() { return new Date().toISOString().slice(0,10); }

  const DEFAULT_TREES = [
    { id:'pull',    name:'Pull-ups',         category:'Pulling',
      steps:['Dead Hang (30s)','Scapular Pulls','Negative Pull-up','Pull-up (3×5)','Pull-up (3×10)','Weighted Pull-up','Archer Pull-up','Bar Muscle-up'] },
    { id:'push',    name:'Push-ups → HSPU',  category:'Pushing',
      steps:['Incline Push-up','Push-up (3×15)','Diamond Push-up','Pike Push-up','Elevated Pike Push-up','Wall HSPU','Freestanding HSPU'] },
    { id:'dips',    name:'Dips',             category:'Pushing',
      steps:['Bench Dips','Parallel Bar Dips (3×5)','Parallel Bar Dips (3×15)','Ring Support Hold','Ring Dips','Weighted Dips'] },
    { id:'core',    name:'Core → L-sit',     category:'Core',
      steps:['Hollow Body Hold','Knee Raises','Hanging Knee Raise','Parallel Bar L-sit','Hanging L-sit','V-sit'] },
    { id:'fl',      name:'Front Lever',      category:'Pulling',
      steps:['Tuck Front Lever','Advanced Tuck FL','One-Leg Front Lever','Straddle Front Lever','Full Front Lever'] },
    { id:'planche', name:'Planche',          category:'Pushing',
      steps:['Planche Lean','Tuck Planche (3s)','Tuck Planche (10s)','Straddle Planche','Full Planche'] },
  ];

  const NUT_SEEDS = [
    { id:'ns1', type:'protein',    amount:'30g',    date:todayStr(), time:'08:30', notes:'Whey isolate, post-workout' },
    { id:'ns2', type:'creatine',   amount:'5g',     date:todayStr(), time:'07:45', notes:'Mixed with water' },
    { id:'ns3', type:'preworkout', amount:'1 scoop',date:todayStr(), time:'07:30', notes:'' },
  ];

  const NUT_ICONS  = { protein:'🥤', creatine:'🧪', preworkout:'⚡', meal:'🍽️' };
  const NUT_LABELS = { protein:'Protein', creatine:'Creatine', preworkout:'Pre-workout', meal:'Meal Note' };

  let sessions  = gs(FLK) || [];
  let skillData = gs(FSK) || {};
  let nutrition = gs(FNK) || NUT_SEEDS;
  let trees     = gs(FTK) || DEFAULT_TREES.map(t => ({...t, steps:[...t.steps]}));

  /* ── Preview (main page) ── */
  function renderPreview() {
    const today = todayStr();
    const week = sessions.filter(s => { const d=(new Date(today)-new Date(s.date))/86400000; return d>=0&&d<7; });
    const totalMin = week.reduce((a,s) => a+(s.duration||0), 0);
    const el = $('fit-preview-stats');
    if (el) el.innerHTML =
      `<span class="fit-pstat"><strong>${week.length}</strong> sessions this week</span>
       <span class="fit-pstat"><strong>${totalMin}</strong> min this week</span>
       <span class="fit-pstat"><strong>${sessions.length}</strong> total</span>`;
    const prev = $('fit-today-preview');
    if (!prev) return;
    const tod = sessions.filter(s => s.date === today);
    prev.innerHTML = tod.length
      ? tod.map(s => `<div class="fit-session-mini">
          <span class="fit-session-mini-name">${esc(s.name||'Workout')}</span>
          <span class="fit-session-mini-meta">${s.duration||0} min · ${(s.exercises||[]).length} exercises</span>
        </div>`).join('')
      : `<div style="font-size:13px;color:var(--t3);padding:12px 0">No workout logged today.</div>`;
  }

  /* ── Log Panel ── */
  function renderLog() {
    const today = todayStr();
    const weekN = sessions.filter(s => { const d=(new Date(today)-new Date(s.date))/86400000; return d>=0&&d<7; }).length;
    const totalMin = sessions.reduce((a,s) => a+(s.duration||0), 0);
    const st = $('fit-log-stats');
    if (st) st.innerHTML =
      `<span class="fit-pstat2"><strong>${weekN}</strong> this week</span>
       <span class="fit-pstat2"><strong>${sessions.length}</strong> total sessions</span>
       <span class="fit-pstat2"><strong>${Math.round(totalMin/60*10)/10}h</strong> total</span>`;
    const list = $('fit-log-list');
    if (!list) return;
    if (!sessions.length) { list.innerHTML = `<div class="fit-empty">No sessions yet.<br>Log your first workout above.</div>`; return; }
    list.innerHTML = [...sessions].sort((a,b)=>String(b.id).localeCompare(String(a.id))).map(s => {
      const exes = s.exercises||[];
      return `<div class="fit-session-card" data-sid="${s.id}">
        <div class="fit-session-top">
          <div><div class="fit-session-date">${fmtDate(s.date)}</div><div class="fit-session-name">${esc(s.name||'Workout')}</div></div>
          <span class="fit-dur-badge">${s.duration||0} min</span>
        </div>
        ${exes.length ? `<div class="fit-session-exlist">${exes.map(e =>
          `<div class="fit-ex-row"><span class="fit-ex-name">${esc(e.name)}</span><span class="fit-ex-sets">${esc(e.sets||'')}×${esc(e.reps||'')}</span></div>`
        ).join('')}</div>` : ''}
        ${s.notes ? `<div class="fit-session-notes">${esc(s.notes)}</div>` : ''}
      </div>`;
    }).join('');
    list.querySelectorAll('.fit-session-card').forEach(c =>
      c.addEventListener('click', () => openSession(sessions.find(s => String(s.id) === c.dataset.sid)))
    );
  }

  /* ── Skills Panel ── */
  function renderSkills() {
    const grid = $('fit-skills-grid');
    if (!grid) return;
    grid.innerHTML = trees.map(tree => {
      const cur = skillData[tree.id] ?? -1;
      return `<div class="fit-skill-card">
        <button class="fit-sk-edit-btn" data-tid="${tree.id}">Edit</button>
        <div class="fit-skill-name">${esc(tree.name)}</div>
        <div class="fit-skill-sub">${esc(tree.category)} · ${cur >= 0 ? esc(tree.steps[cur]) : 'Not started'}</div>
        <div class="fit-skill-steps">${tree.steps.map((step,i) => {
          const cls = i < cur ? 'f-done' : i === cur ? 'f-current' : '';
          return `<div class="fit-skill-step ${cls}" data-tree="${tree.id}" data-idx="${i}">
            <div class="fit-step-dot"></div>
            <span class="fit-step-name">${esc(step)}</span>
            <span class="fit-step-icon">${i <= cur ? '✓' : ''}</span>
          </div>`;
        }).join('')}</div>
      </div>`;
    }).join('');
    grid.querySelectorAll('.fit-skill-step').forEach(el =>
      el.addEventListener('click', () => {
        const treeId = el.dataset.tree, idx = parseInt(el.dataset.idx);
        const cur = skillData[treeId] ?? -1;
        skillData[treeId] = cur === idx ? idx - 1 : idx;
        ss(FSK, skillData); renderSkills();
      })
    );
    grid.querySelectorAll('.fit-sk-edit-btn').forEach(btn =>
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openSkillEdit(trees.find(t => t.id === btn.dataset.tid));
      })
    );
  }

  /* ── Nutrition Panel ── */
  const NUT_DAY_PAGE = 10;
  let nutDaysShown = NUT_DAY_PAGE;
  let curNutDay = null; // date string while the day overlay is open

  function groupNutByDay() {
    const map = {};
    nutrition.forEach(n => { (map[n.date] = map[n.date] || []).push(n); });
    return Object.keys(map).sort((a,b) => b.localeCompare(a)).map(date => ({ date, entries: map[date] }));
  }

  function renderNutrition() {
    const today = todayStr();
    const weekN = nutrition.filter(n => { const d=(new Date(today)-new Date(n.date))/86400000; return d>=0&&d<7; }).length;
    const st = $('fit-nut-stats');
    if (st) st.innerHTML =
      `<span class="fit-pstat2"><strong>${weekN}</strong> this week</span>
       <span class="fit-pstat2"><strong>${nutrition.length}</strong> total entries</span>`;
    const box = $('fit-nut-days');
    if (!box) return;
    if (!nutrition.length) { box.innerHTML = `<div class="fit-empty">No entries yet.<br>Track your supplements and meals above.</div>`; return; }
    const days = groupNutByDay();
    const shown = days.slice(0, nutDaysShown);
    box.innerHTML = shown.map(d => {
      const icons = [...new Set(d.entries.map(n => NUT_ICONS[n.type]||'💊'))].join(' ');
      const isToday = d.date === today;
      return `<div class="fit-nut-day-card" data-date="${d.date}">
        <div class="fit-nut-day-date${isToday?' fit-nut-day-today':''}">${fmtDate(d.date)}${isToday?' · Today':''}</div>
        <div class="fit-nut-day-icons">${icons}</div>
        <span class="fit-nut-day-cnt">${d.entries.length} ${d.entries.length===1?'entry':'entries'}</span>
      </div>`;
    }).join('') + (days.length > shown.length
      ? `<button class="fit-nut-more" id="fit-nut-more">Show earlier days (${days.length - shown.length} more)</button>`
      : '');
    box.querySelectorAll('.fit-nut-day-card').forEach(c =>
      c.addEventListener('click', () => openNutritionDay(c.dataset.date))
    );
    const moreBtn = $('fit-nut-more');
    if (moreBtn) moreBtn.onclick = () => { nutDaysShown += NUT_DAY_PAGE; renderNutrition(); };
  }

  /* ── Nutrition Day Overlay ── */
  const nutDayOv = $('fit-nut-day-ov');

  function renderNutDayList() {
    const list = $('fit-nut-day-list');
    if (!list || !curNutDay) return;
    $('fit-nut-day-title').textContent = fmtDate(curNutDay) + (curNutDay === todayStr() ? ' · Today' : '');
    const entries = nutrition.filter(n => n.date === curNutDay)
      .sort((a,b) => (b.time||'').localeCompare(a.time||'') || String(b.id).localeCompare(String(a.id)));
    if (!entries.length) { list.innerHTML = `<div class="fit-empty">No entries for this day.</div>`; return; }
    list.innerHTML = entries.map(n =>
      `<div class="fit-nut-card" data-nid="${n.id}">
        <div class="fit-nut-icon">${NUT_ICONS[n.type]||'💊'}</div>
        <div class="fit-nut-body">
          <div class="fit-nut-name">${NUT_LABELS[n.type]||esc(n.type)}${n.amount?' — '+esc(n.amount):''}</div>
          <div class="fit-nut-meta">
            ${n.time?`<span>${esc(n.time)}</span>`:''}
            ${n.notes?`<span>${esc(n.notes)}</span>`:''}
          </div>
        </div>
      </div>`).join('');
    list.querySelectorAll('.fit-nut-card').forEach(c =>
      c.addEventListener('click', () => {
        closeNutDayOv(true);
        openNutrition(nutrition.find(n => String(n.id) === c.dataset.nid));
      })
    );
  }

  function openNutritionDay(date) {
    curNutDay = date;
    renderNutDayList();
    nutDayOv.classList.add('vis');
  }
  function closeNutDayOv(keepDay) {
    nutDayOv.classList.remove('vis');
    if (!keepDay) curNutDay = null;
  }
  $('fit-nut-day-close').onclick = () => closeNutDayOv(false);
  nutDayOv.addEventListener('click', e => { if (e.target === nutDayOv) closeNutDayOv(false); });
  $('fit-nut-day-add').onclick = () => { const d = curNutDay; closeNutDayOv(true); openNutrition(null, d); };

  /* ── Session Modal ── */
  let editS = null;
  const sessionOv = $('fit-session-ov');

  function addExRow(ex) {
    const builder = $('fit-ex-builder');
    const div = document.createElement('div');
    div.className = 'fit-ex-item';
    div.innerHTML = `
      <input class="fit-ex-input" type="text" placeholder="Exercise name" autocomplete="off">
      <input class="fit-ex-input" type="text" placeholder="3">
      <input class="fit-ex-input" type="text" placeholder="8 / 30s">
      <button class="fit-ex-rm" title="Remove">×</button>`;
    const inp = div.querySelectorAll('input');
    if (ex) { inp[0].value=ex.name||''; inp[1].value=ex.sets||''; inp[2].value=ex.reps||''; }
    div.querySelector('.fit-ex-rm').onclick = () => div.remove();
    builder.appendChild(div);
  }

  function openSession(s) {
    editS = s || null;
    $('fit-sm-title').textContent = s ? 'Edit Session' : 'Log Session';
    $('fit-sm-name').value  = s ? (s.name||'') : '';
    $('fit-sm-dur').value   = s ? (s.duration||'') : '';
    $('fit-sm-date').value  = s ? (s.date||todayStr()) : todayStr();
    $('fit-sm-notes').value = s ? (s.notes||'') : '';
    $('fit-sm-del').style.display = s ? '' : 'none';
    const builder = $('fit-ex-builder');
    builder.innerHTML = '';
    (s ? s.exercises||[] : []).forEach(ex => addExRow(ex));
    if (!s) addExRow(null);
    sessionOv.classList.add('vis');
    setTimeout(() => $('fit-sm-name').focus(), 60);
  }

  function closeSessionOv() { sessionOv.classList.remove('vis'); }

  function saveSession() {
    const name = $('fit-sm-name').value.trim() || 'Workout';
    const exercises = [];
    $('fit-ex-builder').querySelectorAll('.fit-ex-item').forEach(row => {
      const inp = row.querySelectorAll('input');
      const n = inp[0].value.trim();
      if (n) exercises.push({ name:n, sets:inp[1].value.trim(), reps:inp[2].value.trim() });
    });
    const entry = { id:editS?editS.id:uid(), name,
      duration:parseInt($('fit-sm-dur').value)||0,
      date:$('fit-sm-date').value||todayStr(), exercises,
      notes:$('fit-sm-notes').value.trim() };
    sessions = editS ? sessions.map(s => s.id===editS.id ? entry : s) : [entry,...sessions];
    ss(FLK, sessions); closeSessionOv(); renderLog(); renderPreview();
  }

  $('fit-sm-close').onclick = closeSessionOv;
  $('fit-sm-save').onclick  = saveSession;
  $('fit-sm-del').onclick   = () => {
    if (!editS) return;
    sessions = sessions.filter(s => s.id !== editS.id);
    ss(FLK, sessions); closeSessionOv(); renderLog(); renderPreview();
  };
  sessionOv.addEventListener('click', e => { if (e.target === sessionOv) closeSessionOv(); });
  $('fit-ex-add').onclick  = () => addExRow(null);
  $('fit-log-add').onclick = () => openSession(null);

  /* ── Nutrition Modal ── */
  let editN = null;
  const nutOv = $('fit-nut-ov');

  function openNutrition(n, presetDate) {
    editN = n || null;
    $('fit-nm-title').textContent = n ? 'Edit Entry' : 'Add Entry';
    $('fit-nm-type').value   = n ? (n.type||'protein') : 'protein';
    $('fit-nm-amount').value = n ? (n.amount||'') : '';
    $('fit-nm-date').value   = n ? (n.date||todayStr()) : (presetDate||todayStr());
    $('fit-nm-time').value   = n ? (n.time||'') : '';
    $('fit-nm-notes').value  = n ? (n.notes||'') : '';
    $('fit-nm-del').style.display = n ? '' : 'none';
    nutOv.classList.add('vis');
    setTimeout(() => $('fit-nm-amount').focus(), 60);
  }

  function closeNutOv() {
    nutOv.classList.remove('vis');
    if (curNutDay) { renderNutDayList(); nutDayOv.classList.add('vis'); }
  }

  function saveNutrition() {
    const entry = { id:editN?editN.id:uid(), type:$('fit-nm-type').value,
      amount:$('fit-nm-amount').value.trim(),
      date:$('fit-nm-date').value||todayStr(),
      time:$('fit-nm-time').value,
      notes:$('fit-nm-notes').value.trim() };
    nutrition = editN ? nutrition.map(n => n.id===editN.id ? entry : n) : [entry,...nutrition];
    ss(FNK, nutrition); closeNutOv(); renderNutrition();
  }

  $('fit-nm-close').onclick = closeNutOv;
  $('fit-nm-save').onclick  = saveNutrition;
  $('fit-nm-del').onclick   = () => {
    if (!editN) return;
    nutrition = nutrition.filter(n => n.id !== editN.id);
    ss(FNK, nutrition); closeNutOv(); renderNutrition();
  };
  nutOv.addEventListener('click', e => { if (e.target === nutOv) closeNutOv(); });
  $('fit-nut-add').onclick = () => openNutrition(null);

  /* ── Skill Edit Modal ── */
  let editSK = null;
  const skillOv = $('fit-skill-ov');

  function addStepRow(text) {
    const builder = $('fit-step-builder');
    const div = document.createElement('div');
    div.className = 'fit-step-item';
    div.innerHTML = `
      <input class="fit-ex-input" type="text" placeholder="Step name…" autocomplete="off">
      <button class="fit-ex-rm" title="Remove">×</button>`;
    if (text) div.querySelector('input').value = text;
    div.querySelector('.fit-ex-rm').onclick = () => div.remove();
    builder.appendChild(div);
  }

  function openSkillEdit(tree) {
    editSK = tree || null;
    $('fit-sk-title').textContent = tree ? 'Edit Skill Tree' : 'Add Skill Tree';
    $('fit-sk-name').value = tree ? tree.name : '';
    $('fit-sk-cat').value  = tree ? tree.category : '';
    $('fit-sk-del').style.display = tree ? '' : 'none';
    const builder = $('fit-step-builder');
    builder.innerHTML = '';
    (tree ? tree.steps : []).forEach(s => addStepRow(s));
    if (!tree) { addStepRow(null); addStepRow(null); }
    skillOv.classList.add('vis');
    setTimeout(() => $('fit-sk-name').focus(), 60);
  }

  function closeSkillOv() { skillOv.classList.remove('vis'); }

  function saveSkillEdit() {
    const name = $('fit-sk-name').value.trim();
    if (!name) { $('fit-sk-name').focus(); return; }
    const steps = [];
    $('fit-step-builder').querySelectorAll('.fit-step-item input').forEach(inp => {
      const v = inp.value.trim(); if (v) steps.push(v);
    });
    if (!steps.length) return;
    const entry = { id:editSK?editSK.id:uid(), name,
      category:$('fit-sk-cat').value.trim()||'General', steps };
    trees = editSK ? trees.map(t => t.id===editSK.id ? entry : t) : [...trees, entry];
    ss(FTK, trees); closeSkillOv(); renderSkills();
  }

  $('fit-sk-close').onclick = closeSkillOv;
  $('fit-sk-save').onclick  = saveSkillEdit;
  $('fit-sk-del').onclick   = () => {
    if (!editSK) return;
    trees = trees.filter(t => t.id !== editSK.id);
    delete skillData[editSK.id];
    ss(FTK, trees); ss(FSK, skillData); closeSkillOv(); renderSkills();
  };
  skillOv.addEventListener('click', e => { if (e.target === skillOv) closeSkillOv(); });
  $('fit-step-add').onclick = () => addStepRow(null);

  /* ── Page open/close + tabs ── */
  const fitPage = $('fit-page');
  $('fit-open-btn').onclick = () => { fitPage.classList.add('vis'); renderLog(); renderSkills(); renderNutrition(); };
  $('fit-back').onclick = () => fitPage.classList.remove('vis');

  document.querySelectorAll('.fit-tab').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fit-tab').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      document.querySelectorAll('.fit-panel').forEach(p => p.classList.remove('show'));
      $('fit-' + btn.dataset.ftab + '-panel').classList.add('show');
      const addBtn = $('fit-add-btn');
      const tab = btn.dataset.ftab;
      addBtn.textContent = tab === 'log' ? '+ Log Session' : tab === 'nut' ? '+ Add Entry' : '+ Add Skill';
      addBtn.style.display = '';
    })
  );

  $('fit-add-btn').onclick = () => {
    const tab = document.querySelector('.fit-tab.on')?.dataset.ftab;
    if (tab === 'log')       openSession(null);
    if (tab === 'nut')       openNutrition(null);
    if (tab === 'skills')    openSkillEdit(null);
  };

  /* ── Init ── */
  renderPreview();
})();



/* ── HABIT TRACKER (scoped IIFE) ── */
(function () {
  'use strict';
  const HABITS_KEY = 'habits_v1';      // [{ id, name, emoji, createdAt, archived }]
  const HLOGS_KEY  = 'habit_logs_v1';  // { "2026-09-14": ["id1","id2"], ... }
  const $ = id => document.getElementById(id);
  const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function gs(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
  function ss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  function uid() { return Date.now() + Math.random().toString(36).slice(2,6); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  /* Pure local-calendar arithmetic — never round-trips through toISOString(),
     which converts to UTC and silently shifts the date in any timezone ahead
     of UTC (e.g. addDays(d, 0) would return the PREVIOUS day). */
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function addDays(dateStr, delta) {
    const [y, m, day] = dateStr.split('-').map(Number);
    const d = new Date(y, m - 1, day);
    d.setDate(d.getDate() + delta);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  const DEFAULT_HABITS = () => [
    { id: uid(), name: 'Meditation', emoji: '🧘', createdAt: todayStr(), archived: false },
    { id: uid(), name: 'Deep Work',  emoji: '🧠', createdAt: todayStr(), archived: false },
  ];

  const storedHabits = gs(HABITS_KEY);
  let habits = storedHabits || DEFAULT_HABITS();
  if (!storedHabits) ss(HABITS_KEY, habits);
  let hlogs = gs(HLOGS_KEY) || {};

  const activeHabits   = () => habits.filter(h => !h.archived);
  const archivedHabits = () => habits.filter(h => h.archived);
  const isDone = (id, date) => (hlogs[date] || []).includes(id);

  /* Monday..today of the current week — 1 dot on Monday, growing to 7 by Sunday,
     then resets. Today is always the last (rightmost) dot, never a blank future one. */
  function currentWeekDays() {
    const dow = new Date().getDay(); // 0=Sun,1=Mon,...6=Sat
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = addDays(todayStr(), mondayOffset);
    const daysElapsed = dow === 0 ? 7 : dow; // Mon=1 ... Sun=7
    const days = [];
    for (let i = 0; i < daysElapsed; i++) days.push(addDays(monday, i));
    return days;
  }

  /* Consecutive days ending at today (if checked) or yesterday (if today not yet checked). */
  function computeStreak(id) {
    const today = todayStr();
    let cursor = isDone(id, today) ? today : addDays(today, -1);
    let streak = 0;
    while (isDone(id, cursor)) { streak++; cursor = addDays(cursor, -1); }
    return streak;
  }

  /* ── Render ── */
  let archivedOpen = false;
  let dragId = null;

  function renderHabits() {
    const active = activeHabits();
    const today = todayStr();
    const doneCount = active.filter(h => isDone(h.id, today)).length;
    $('hab-progress').textContent = `${doneCount} / ${active.length} done today`;

    const days = currentWeekDays();
    const list = $('hab-list');
    if (!active.length) {
      list.innerHTML = `<div class="hab-empty">No habits yet. Add your first above.</div>`;
    } else {
      list.innerHTML = active.map(h => renderHabitRowHTML(h, days, today)).join('');
    }
    wireRows();
    renderArchived();
  }

  function renderHabitRowHTML(h, days, today) {
    const streak = computeStreak(h.id);
    const doneToday = isDone(h.id, today);
    const dots = days.map(d =>
      `<span class="hab-dot${isDone(h.id, d) ? ' filled' : ''}${d === today ? ' today' : ''}" data-date="${d}"></span>`
    ).join('');
    return `<div class="hab-row" draggable="true" data-id="${h.id}">
      <span class="hab-drag" title="Drag to reorder">⠿</span>
      <span class="hab-emoji">${esc(h.emoji)}</span>
      <span class="hab-name">${esc(h.name)}</span>
      <span class="hab-dots">${dots}</span>
      <span class="hab-streak"${streak >= 2 ? '' : ' style="visibility:hidden"'}>🔥${streak}</span>
      <button class="hab-toggle${doneToday ? ' on' : ''}" data-id="${h.id}">${doneToday ? '✓ Done' : 'Done'}</button>
    </div>`;
  }

  function wireRows() {
    const list = $('hab-list');
    list.querySelectorAll('.hab-toggle').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); toggleToday(btn.dataset.id); });
    });
    list.querySelectorAll('.hab-row').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('.hab-toggle') || e.target.closest('.hab-drag')) return;
        openHabitEdit(habits.find(h => h.id === row.dataset.id));
      });
      row.addEventListener('dragstart', () => {
        dragId = row.dataset.id;
        row.classList.add('dragging');
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        dragId = null;
        commitOrder();
      });
      row.addEventListener('dragover', e => {
        e.preventDefault();
        const dragging = list.querySelector('.dragging');
        if (!dragging || dragging === row) return;
        const rect = row.getBoundingClientRect();
        const before = (e.clientY - rect.top) < rect.height / 2;
        list.insertBefore(dragging, before ? row : row.nextSibling);
      });
    });
  }

  function commitOrder() {
    const ids = [...$('hab-list').querySelectorAll('.hab-row')].map(r => r.dataset.id);
    const reorderedActive = ids.map(id => habits.find(h => h.id === id)).filter(Boolean);
    const archived = habits.filter(h => h.archived);
    habits = [...reorderedActive, ...archived];
    ss(HABITS_KEY, habits);
  }

  function toggleToday(id) {
    const today = todayStr();
    const day = hlogs[today] || [];
    const willBeDone = !day.includes(id);
    hlogs[today] = willBeDone ? [...day, id] : day.filter(x => x !== id);
    ss(HLOGS_KEY, hlogs);
    updateHabitRowDOM(id, willBeDone, today);
  }

  /* Patches only the affected row in place (instead of a full re-render) so the
     dot's fill/border transition actually has a "before" state to animate from. */
  function updateHabitRowDOM(id, doneToday, today) {
    const active = activeHabits();
    const doneCount = active.filter(h => isDone(h.id, today)).length;
    $('hab-progress').textContent = `${doneCount} / ${active.length} done today`;

    const row = $('hab-list').querySelector(`.hab-row[data-id="${id}"]`);
    if (!row) { renderHabits(); return; }

    const dot = row.querySelector(`.hab-dot[data-date="${today}"]`);
    if (dot) dot.classList.toggle('filled', doneToday);

    const streak = computeStreak(id);
    const streakEl = row.querySelector('.hab-streak');
    streakEl.textContent = `🔥${streak}`;
    streakEl.style.visibility = streak >= 2 ? 'visible' : 'hidden';

    const btn = row.querySelector('.hab-toggle');
    btn.classList.toggle('on', doneToday);
    btn.textContent = doneToday ? '✓ Done' : 'Done';
  }

  function renderArchived() {
    const archived = archivedHabits();
    const wrap = $('hab-archived-wrap');
    if (!archived.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    $('hab-archived-count').textContent = archived.length;
    const listEl = $('hab-archived-list');
    listEl.innerHTML = archived.map(h =>
      `<div class="hab-arow" data-id="${h.id}">
        <span class="hab-emoji">${esc(h.emoji)}</span>
        <span class="hab-name">${esc(h.name)}</span>
      </div>`).join('');
    listEl.querySelectorAll('.hab-arow').forEach(row =>
      row.addEventListener('click', () => openHabitEdit(habits.find(h => h.id === row.dataset.id)))
    );
    listEl.style.display = archivedOpen ? 'flex' : 'none';
  }

  $('hab-archived-toggle').onclick = () => {
    archivedOpen = !archivedOpen;
    $('hab-archived-list').style.display = archivedOpen ? 'flex' : 'none';
  };

  /* ── Add Habit (inline slide-down form) ── */
  $('hab-add-btn').onclick = () => {
    const form = $('hab-add-form');
    const showing = form.style.display !== 'none';
    form.style.display = showing ? 'none' : 'flex';
    if (!showing) {
      $('hab-emoji-inp').value = '';
      $('hab-name-inp').value = '';
      setTimeout(() => $('hab-name-inp').focus(), 50);
    }
  };
  $('hab-cancel-btn').onclick = () => { $('hab-add-form').style.display = 'none'; };
  $('hab-save-btn').onclick = addHabit;
  $('hab-name-inp').addEventListener('keydown', e => { if (e.key === 'Enter') addHabit(); });

  function addHabit() {
    const name = $('hab-name-inp').value.trim();
    if (!name) { $('hab-name-inp').focus(); return; }
    const emoji = $('hab-emoji-inp').value.trim() || '⭐';
    habits.push({ id: uid(), name, emoji, createdAt: todayStr(), archived: false });
    ss(HABITS_KEY, habits);
    $('hab-add-form').style.display = 'none';
    renderHabits();
  }

  /* ── Edit / Archive / Delete Modal ── */
  let editHab = null;
  const habOv = $('hab-ov');

  function openHabitEdit(h) {
    if (!h) return;
    editHab = h;
    $('hab-m-title').textContent = h.archived ? 'Archived Habit' : 'Edit Habit';
    $('hab-m-emoji').value = h.emoji;
    $('hab-m-name').value = h.name;
    $('hab-m-archive').textContent = h.archived ? 'Unarchive' : 'Archive';
    habOv.classList.add('vis');
    setTimeout(() => $('hab-m-name').focus(), 60);
  }
  function closeHabitEdit() { habOv.classList.remove('vis'); editHab = null; }
  $('hab-m-close').onclick = closeHabitEdit;
  habOv.addEventListener('click', e => { if (e.target === habOv) closeHabitEdit(); });

  $('hab-m-save').onclick = () => {
    if (!editHab) return;
    const name = $('hab-m-name').value.trim();
    if (!name) { $('hab-m-name').focus(); return; }
    editHab.name = name;
    editHab.emoji = $('hab-m-emoji').value.trim() || editHab.emoji;
    ss(HABITS_KEY, habits);
    closeHabitEdit();
    renderHabits();
  };

  $('hab-m-archive').onclick = () => {
    if (!editHab) return;
    editHab.archived = !editHab.archived;
    ss(HABITS_KEY, habits);
    closeHabitEdit();
    renderHabits();
  };

  $('hab-m-del').onclick = () => {
    if (!editHab) return;
    if (!confirm(`Delete "${editHab.name}"? This removes all its logged history.`)) return;
    const id = editHab.id;
    habits = habits.filter(h => h.id !== id);
    Object.keys(hlogs).forEach(date => { hlogs[date] = (hlogs[date] || []).filter(x => x !== id); });
    ss(HABITS_KEY, habits);
    ss(HLOGS_KEY, hlogs);
    closeHabitEdit();
    renderHabits();
  };

  /* ── Emoji Picker (full Unicode set, categorized) ── */
  const EMOJI_DATA = [{"cat":"Smileys","icon":"😀","items":[["😀","grinning face"],["😃","grinning face with big eyes"],["😄","grinning face with smiling eyes"],["😁","beaming face with smiling eyes"],["😆","grinning squinting face"],["😅","grinning face with sweat"],["🤣","rolling on the floor laughing"],["😂","face with tears of joy"],["🙂","slightly smiling face"],["🙃","upside-down face"],["🫠","melting face"],["😉","winking face"],["😊","smiling face with smiling eyes"],["😇","smiling face with halo"],["🥰","smiling face with hearts"],["😍","smiling face with heart-eyes"],["🤩","star-struck"],["😘","face blowing a kiss"],["😗","kissing face"],["☺","smiling face"],["😚","kissing face with closed eyes"],["😙","kissing face with smiling eyes"],["🥲","smiling face with tear"],["😋","face savoring food"],["😛","face with tongue"],["😜","winking face with tongue"],["🤪","zany face"],["😝","squinting face with tongue"],["🤑","money-mouth face"],["🤗","smiling face with open hands"],["🤭","face with hand over mouth"],["🫢","face with open eyes and hand over mouth"],["🫣","face with peeking eye"],["🤫","shushing face"],["🤔","thinking face"],["🫡","saluting face"],["🤐","zipper-mouth face"],["🤨","face with raised eyebrow"],["😐","neutral face"],["😑","expressionless face"],["😶","face without mouth"],["🫥","dotted line face"],["😶‍🌫️","face in clouds"],["😏","smirking face"],["😒","unamused face"],["🙄","face with rolling eyes"],["😬","grimacing face"],["😮‍💨","face exhaling"],["🤥","lying face"],["🫨","shaking face"],["🙂‍↔️","head shaking horizontally"],["🙂‍↕️","head shaking vertically"],["😌","relieved face"],["😔","pensive face"],["😪","sleepy face"],["🤤","drooling face"],["😴","sleeping face"],["🫩","face with bags under eyes"],["😷","face with medical mask"],["🤒","face with thermometer"],["🤕","face with head-bandage"],["🤢","nauseated face"],["🤮","face vomiting"],["🤧","sneezing face"],["🥵","hot face"],["🥶","cold face"],["🥴","woozy face"],["😵","face with crossed-out eyes"],["😵‍💫","face with spiral eyes"],["🤯","exploding head"],["🤠","cowboy hat face"],["🥳","partying face"],["🥸","disguised face"],["😎","smiling face with sunglasses"],["🤓","nerd face"],["🧐","face with monocle"],["😕","confused face"],["🫤","face with diagonal mouth"],["😟","worried face"],["🙁","slightly frowning face"],["☹","frowning face"],["😮","face with open mouth"],["😯","hushed face"],["😲","astonished face"],["😳","flushed face"],["🫪","⊛ distorted face"],["🥺","pleading face"],["🥹","face holding back tears"],["😦","frowning face with open mouth"],["😧","anguished face"],["😨","fearful face"],["😰","anxious face with sweat"],["😥","sad but relieved face"],["😢","crying face"],["😭","loudly crying face"],["😱","face screaming in fear"],["😖","confounded face"],["😣","persevering face"],["😞","disappointed face"],["😓","downcast face with sweat"],["😩","weary face"],["😫","tired face"],["🥱","yawning face"],["😤","face with steam from nose"],["😡","enraged face"],["😠","angry face"],["🤬","face with symbols on mouth"],["😈","smiling face with horns"],["👿","angry face with horns"],["💀","skull"],["☠","skull and crossbones"],["💩","pile of poo"],["🤡","clown face"],["👹","ogre"],["👺","goblin"],["👻","ghost"],["👽","alien"],["👾","alien monster"],["🤖","robot"],["😺","grinning cat"],["😸","grinning cat with smiling eyes"],["😹","cat with tears of joy"],["😻","smiling cat with heart-eyes"],["😼","cat with wry smile"],["😽","kissing cat"],["🙀","weary cat"],["😿","crying cat"],["😾","pouting cat"],["🙈","see-no-evil monkey"],["🙉","hear-no-evil monkey"],["🙊","speak-no-evil monkey"],["💌","love letter"],["💘","heart with arrow"],["💝","heart with ribbon"],["💖","sparkling heart"],["💗","growing heart"],["💓","beating heart"],["💞","revolving hearts"],["💕","two hearts"],["💟","heart decoration"],["❣","heart exclamation"],["💔","broken heart"],["❤️‍🔥","heart on fire"],["❤️‍🩹","mending heart"],["❤","red heart"],["🩷","pink heart"],["🧡","orange heart"],["💛","yellow heart"],["💚","green heart"],["💙","blue heart"],["🩵","light blue heart"],["💜","purple heart"],["🤎","brown heart"],["🖤","black heart"],["🩶","grey heart"],["🤍","white heart"],["💋","kiss mark"],["💯","hundred points"],["💢","anger symbol"],["🫯","⊛ fight cloud"],["💥","collision"],["💫","dizzy"],["💦","sweat droplets"],["💨","dashing away"],["🕳","hole"],["💬","speech balloon"],["👁️‍🗨️","eye in speech bubble"],["🗨","left speech bubble"],["🗯","right anger bubble"],["💭","thought balloon"],["💤","ZZZ"]]},{"cat":"People","icon":"🧑","items":[["👋","waving hand"],["🤚","raised back of hand"],["🖐","hand with fingers splayed"],["✋","raised hand"],["🖖","vulcan salute"],["🫱","rightwards hand"],["🫲","leftwards hand"],["🫳","palm down hand"],["🫴","palm up hand"],["🫷","leftwards pushing hand"],["🫸","rightwards pushing hand"],["👌","OK hand"],["🤌","pinched fingers"],["🤏","pinching hand"],["✌","victory hand"],["🤞","crossed fingers"],["🫰","hand with index finger and thumb crossed"],["🤟","love-you gesture"],["🤘","sign of the horns"],["🤙","call me hand"],["👈","backhand index pointing left"],["👉","backhand index pointing right"],["👆","backhand index pointing up"],["🖕","middle finger"],["👇","backhand index pointing down"],["☝","index pointing up"],["🫵","index pointing at the viewer"],["👍","thumbs up"],["👎","thumbs down"],["✊","raised fist"],["👊","oncoming fist"],["🤛","left-facing fist"],["🤜","right-facing fist"],["👏","clapping hands"],["🙌","raising hands"],["🫶","heart hands"],["👐","open hands"],["🤲","palms up together"],["🤝","handshake"],["🙏","folded hands"],["✍","writing hand"],["💅","nail polish"],["🤳","selfie"],["💪","flexed biceps"],["🦾","mechanical arm"],["🦿","mechanical leg"],["🦵","leg"],["🦶","foot"],["👂","ear"],["🦻","ear with hearing aid"],["👃","nose"],["🧠","brain"],["🫀","anatomical heart"],["🫁","lungs"],["🦷","tooth"],["🦴","bone"],["👀","eyes"],["👁","eye"],["👅","tongue"],["👄","mouth"],["🫦","biting lip"],["👶","baby"],["🧒","child"],["👦","boy"],["👧","girl"],["🧑","person"],["👱","person: blond hair"],["👨","man"],["🧔","person: beard"],["🧔‍♂️","man: beard"],["🧔‍♀️","woman: beard"],["👨‍🦰","man: red hair"],["👨‍🦱","man: curly hair"],["👨‍🦳","man: white hair"],["👨‍🦲","man: bald"],["👩","woman"],["👩‍🦰","woman: red hair"],["🧑‍🦰","person: red hair"],["👩‍🦱","woman: curly hair"],["🧑‍🦱","person: curly hair"],["👩‍🦳","woman: white hair"],["🧑‍🦳","person: white hair"],["👩‍🦲","woman: bald"],["🧑‍🦲","person: bald"],["👱‍♀️","woman: blond hair"],["👱‍♂️","man: blond hair"],["🧓","older person"],["👴","old man"],["👵","old woman"],["🙍","person frowning"],["🙍‍♂️","man frowning"],["🙍‍♀️","woman frowning"],["🙎","person pouting"],["🙎‍♂️","man pouting"],["🙎‍♀️","woman pouting"],["🙅","person gesturing NO"],["🙅‍♂️","man gesturing NO"],["🙅‍♀️","woman gesturing NO"],["🙆","person gesturing OK"],["🙆‍♂️","man gesturing OK"],["🙆‍♀️","woman gesturing OK"],["💁","person tipping hand"],["💁‍♂️","man tipping hand"],["💁‍♀️","woman tipping hand"],["🙋","person raising hand"],["🙋‍♂️","man raising hand"],["🙋‍♀️","woman raising hand"],["🧏","deaf person"],["🧏‍♂️","deaf man"],["🧏‍♀️","deaf woman"],["🙇","person bowing"],["🙇‍♂️","man bowing"],["🙇‍♀️","woman bowing"],["🤦","person facepalming"],["🤦‍♂️","man facepalming"],["🤦‍♀️","woman facepalming"],["🤷","person shrugging"],["🤷‍♂️","man shrugging"],["🤷‍♀️","woman shrugging"],["🧑‍⚕️","health worker"],["👨‍⚕️","man health worker"],["👩‍⚕️","woman health worker"],["🧑‍🎓","student"],["👨‍🎓","man student"],["👩‍🎓","woman student"],["🧑‍🏫","teacher"],["👨‍🏫","man teacher"],["👩‍🏫","woman teacher"],["🧑‍⚖️","judge"],["👨‍⚖️","man judge"],["👩‍⚖️","woman judge"],["🧑‍🌾","farmer"],["👨‍🌾","man farmer"],["👩‍🌾","woman farmer"],["🧑‍🍳","cook"],["👨‍🍳","man cook"],["👩‍🍳","woman cook"],["🧑‍🔧","mechanic"],["👨‍🔧","man mechanic"],["👩‍🔧","woman mechanic"],["🧑‍🏭","factory worker"],["👨‍🏭","man factory worker"],["👩‍🏭","woman factory worker"],["🧑‍💼","office worker"],["👨‍💼","man office worker"],["👩‍💼","woman office worker"],["🧑‍🔬","scientist"],["👨‍🔬","man scientist"],["👩‍🔬","woman scientist"],["🧑‍💻","technologist"],["👨‍💻","man technologist"],["👩‍💻","woman technologist"],["🧑‍🎤","singer"],["👨‍🎤","man singer"],["👩‍🎤","woman singer"],["🧑‍🎨","artist"],["👨‍🎨","man artist"],["👩‍🎨","woman artist"],["🧑‍✈️","pilot"],["👨‍✈️","man pilot"],["👩‍✈️","woman pilot"],["🧑‍🚀","astronaut"],["👨‍🚀","man astronaut"],["👩‍🚀","woman astronaut"],["🧑‍🚒","firefighter"],["👨‍🚒","man firefighter"],["👩‍🚒","woman firefighter"],["👮","police officer"],["👮‍♂️","man police officer"],["👮‍♀️","woman police officer"],["🕵","detective"],["🕵️‍♂️","man detective"],["🕵️‍♀️","woman detective"],["💂","guard"],["💂‍♂️","man guard"],["💂‍♀️","woman guard"],["🥷","ninja"],["👷","construction worker"],["👷‍♂️","man construction worker"],["👷‍♀️","woman construction worker"],["🫅","person with crown"],["🤴","prince"],["👸","princess"],["👳","person wearing turban"],["👳‍♂️","man wearing turban"],["👳‍♀️","woman wearing turban"],["👲","person with skullcap"],["🧕","woman with headscarf"],["🤵","person in tuxedo"],["🤵‍♂️","man in tuxedo"],["🤵‍♀️","woman in tuxedo"],["👰","person with veil"],["👰‍♂️","man with veil"],["👰‍♀️","woman with veil"],["🤰","pregnant woman"],["🫃","pregnant man"],["🫄","pregnant person"],["🤱","breast-feeding"],["👩‍🍼","woman feeding baby"],["👨‍🍼","man feeding baby"],["🧑‍🍼","person feeding baby"],["👼","baby angel"],["🎅","Santa Claus"],["🤶","Mrs. Claus"],["🧑‍🎄","Mx Claus"],["🦸","superhero"],["🦸‍♂️","man superhero"],["🦸‍♀️","woman superhero"],["🦹","supervillain"],["🦹‍♂️","man supervillain"],["🦹‍♀️","woman supervillain"],["🧙","mage"],["🧙‍♂️","man mage"],["🧙‍♀️","woman mage"],["🧚","fairy"],["🧚‍♂️","man fairy"],["🧚‍♀️","woman fairy"],["🧛","vampire"],["🧛‍♂️","man vampire"],["🧛‍♀️","woman vampire"],["🧜","merperson"],["🧜‍♂️","merman"],["🧜‍♀️","mermaid"],["🧝","elf"],["🧝‍♂️","man elf"],["🧝‍♀️","woman elf"],["🧞","genie"],["🧞‍♂️","man genie"],["🧞‍♀️","woman genie"],["🧟","zombie"],["🧟‍♂️","man zombie"],["🧟‍♀️","woman zombie"],["🧌","troll"],["🫈","⊛ hairy creature"],["💆","person getting massage"],["💆‍♂️","man getting massage"],["💆‍♀️","woman getting massage"],["💇","person getting haircut"],["💇‍♂️","man getting haircut"],["💇‍♀️","woman getting haircut"],["🚶","person walking"],["🚶‍♂️","man walking"],["🚶‍♀️","woman walking"],["🚶‍➡️","person walking: facing right"],["🚶‍♀️‍➡️","woman walking: facing right"],["🚶‍♂️‍➡️","man walking: facing right"],["🧍","person standing"],["🧍‍♂️","man standing"],["🧍‍♀️","woman standing"],["🧎","person kneeling"],["🧎‍♂️","man kneeling"],["🧎‍♀️","woman kneeling"],["🧎‍➡️","person kneeling: facing right"],["🧎‍♀️‍➡️","woman kneeling: facing right"],["🧎‍♂️‍➡️","man kneeling: facing right"],["🧑‍🦯","person with white cane"],["🧑‍🦯‍➡️","person with white cane: facing right"],["👨‍🦯","man with white cane"],["👨‍🦯‍➡️","man with white cane: facing right"],["👩‍🦯","woman with white cane"],["👩‍🦯‍➡️","woman with white cane: facing right"],["🧑‍🦼","person in motorized wheelchair"],["🧑‍🦼‍➡️","person in motorized wheelchair: facing right"],["👨‍🦼","man in motorized wheelchair"],["👨‍🦼‍➡️","man in motorized wheelchair: facing right"],["👩‍🦼","woman in motorized wheelchair"],["👩‍🦼‍➡️","woman in motorized wheelchair: facing right"],["🧑‍🦽","person in manual wheelchair"],["🧑‍🦽‍➡️","person in manual wheelchair: facing right"],["👨‍🦽","man in manual wheelchair"],["👨‍🦽‍➡️","man in manual wheelchair: facing right"],["👩‍🦽","woman in manual wheelchair"],["👩‍🦽‍➡️","woman in manual wheelchair: facing right"],["🏃","person running"],["🏃‍♂️","man running"],["🏃‍♀️","woman running"],["🏃‍➡️","person running: facing right"],["🏃‍♀️‍➡️","woman running: facing right"],["🏃‍♂️‍➡️","man running: facing right"],["🧑‍🩰","⊛ ballet dancer"],["💃","woman dancing"],["🕺","man dancing"],["🕴","person in suit levitating"],["👯","people with bunny ears"],["👯‍♂️","men with bunny ears"],["👯‍♀️","women with bunny ears"],["🧖","person in steamy room"],["🧖‍♂️","man in steamy room"],["🧖‍♀️","woman in steamy room"],["🧗","person climbing"],["🧗‍♂️","man climbing"],["🧗‍♀️","woman climbing"],["🤺","person fencing"],["🏇","horse racing"],["⛷","skier"],["🏂","snowboarder"],["🏌","person golfing"],["🏌️‍♂️","man golfing"],["🏌️‍♀️","woman golfing"],["🏄","person surfing"],["🏄‍♂️","man surfing"],["🏄‍♀️","woman surfing"],["🚣","person rowing boat"],["🚣‍♂️","man rowing boat"],["🚣‍♀️","woman rowing boat"],["🏊","person swimming"],["🏊‍♂️","man swimming"],["🏊‍♀️","woman swimming"],["⛹","person bouncing ball"],["⛹️‍♂️","man bouncing ball"],["⛹️‍♀️","woman bouncing ball"],["🏋","person lifting weights"],["🏋️‍♂️","man lifting weights"],["🏋️‍♀️","woman lifting weights"],["🚴","person biking"],["🚴‍♂️","man biking"],["🚴‍♀️","woman biking"],["🚵","person mountain biking"],["🚵‍♂️","man mountain biking"],["🚵‍♀️","woman mountain biking"],["🤸","person cartwheeling"],["🤸‍♂️","man cartwheeling"],["🤸‍♀️","woman cartwheeling"],["🤼","people wrestling"],["🤼‍♂️","men wrestling"],["🤼‍♀️","women wrestling"],["🤽","person playing water polo"],["🤽‍♂️","man playing water polo"],["🤽‍♀️","woman playing water polo"],["🤾","person playing handball"],["🤾‍♂️","man playing handball"],["🤾‍♀️","woman playing handball"],["🤹","person juggling"],["🤹‍♂️","man juggling"],["🤹‍♀️","woman juggling"],["🧘","person in lotus position"],["🧘‍♂️","man in lotus position"],["🧘‍♀️","woman in lotus position"],["🛀","person taking bath"],["🛌","person in bed"],["🧑‍🤝‍🧑","people holding hands"],["👭","women holding hands"],["👫","woman and man holding hands"],["👬","men holding hands"],["💏","kiss"],["👩‍❤️‍💋‍👨","kiss: woman, man"],["👨‍❤️‍💋‍👨","kiss: man, man"],["👩‍❤️‍💋‍👩","kiss: woman, woman"],["💑","couple with heart"],["👩‍❤️‍👨","couple with heart: woman, man"],["👨‍❤️‍👨","couple with heart: man, man"],["👩‍❤️‍👩","couple with heart: woman, woman"],["👨‍👩‍👦","family: man, woman, boy"],["👨‍👩‍👧","family: man, woman, girl"],["👨‍👩‍👧‍👦","family: man, woman, girl, boy"],["👨‍👩‍👦‍👦","family: man, woman, boy, boy"],["👨‍👩‍👧‍👧","family: man, woman, girl, girl"],["👨‍👨‍👦","family: man, man, boy"],["👨‍👨‍👧","family: man, man, girl"],["👨‍👨‍👧‍👦","family: man, man, girl, boy"],["👨‍👨‍👦‍👦","family: man, man, boy, boy"],["👨‍👨‍👧‍👧","family: man, man, girl, girl"],["👩‍👩‍👦","family: woman, woman, boy"],["👩‍👩‍👧","family: woman, woman, girl"],["👩‍👩‍👧‍👦","family: woman, woman, girl, boy"],["👩‍👩‍👦‍👦","family: woman, woman, boy, boy"],["👩‍👩‍👧‍👧","family: woman, woman, girl, girl"],["👨‍👦","family: man, boy"],["👨‍👦‍👦","family: man, boy, boy"],["👨‍👧","family: man, girl"],["👨‍👧‍👦","family: man, girl, boy"],["👨‍👧‍👧","family: man, girl, girl"],["👩‍👦","family: woman, boy"],["👩‍👦‍👦","family: woman, boy, boy"],["👩‍👧","family: woman, girl"],["👩‍👧‍👦","family: woman, girl, boy"],["👩‍👧‍👧","family: woman, girl, girl"],["🗣","speaking head"],["👤","bust in silhouette"],["👥","busts in silhouette"],["🫂","people hugging"],["👪","family"],["🧑‍🧑‍🧒","family: adult, adult, child"],["🧑‍🧑‍🧒‍🧒","family: adult, adult, child, child"],["🧑‍🧒","family: adult, child"],["🧑‍🧒‍🧒","family: adult, child, child"],["👣","footprints"],["🫆","fingerprint"],["🦰","red hair"],["🦱","curly hair"],["🦳","white hair"],["🦲","bald"]]},{"cat":"Animals","icon":"🐻","items":[["🐵","monkey face"],["🐒","monkey"],["🦍","gorilla"],["🦧","orangutan"],["🐶","dog face"],["🐕","dog"],["🦮","guide dog"],["🐕‍🦺","service dog"],["🐩","poodle"],["🐺","wolf"],["🦊","fox"],["🦝","raccoon"],["🐱","cat face"],["🐈","cat"],["🐈‍⬛","black cat"],["🦁","lion"],["🐯","tiger face"],["🐅","tiger"],["🐆","leopard"],["🐴","horse face"],["🫎","moose"],["🫏","donkey"],["🐎","horse"],["🦄","unicorn"],["🦓","zebra"],["🦌","deer"],["🦬","bison"],["🐮","cow face"],["🐂","ox"],["🐃","water buffalo"],["🐄","cow"],["🐷","pig face"],["🐖","pig"],["🐗","boar"],["🐽","pig nose"],["🐏","ram"],["🐑","ewe"],["🐐","goat"],["🐪","camel"],["🐫","two-hump camel"],["🦙","llama"],["🦒","giraffe"],["🐘","elephant"],["🦣","mammoth"],["🦏","rhinoceros"],["🦛","hippopotamus"],["🐭","mouse face"],["🐁","mouse"],["🐀","rat"],["🐹","hamster"],["🐰","rabbit face"],["🐇","rabbit"],["🐿","chipmunk"],["🦫","beaver"],["🦔","hedgehog"],["🦇","bat"],["🐻","bear"],["🐻‍❄️","polar bear"],["🐨","koala"],["🐼","panda"],["🦥","sloth"],["🦦","otter"],["🦨","skunk"],["🦘","kangaroo"],["🦡","badger"],["🐾","paw prints"],["🦃","turkey"],["🐔","chicken"],["🐓","rooster"],["🐣","hatching chick"],["🐤","baby chick"],["🐥","front-facing baby chick"],["🐦","bird"],["🐧","penguin"],["🕊","dove"],["🦅","eagle"],["🦆","duck"],["🦢","swan"],["🦉","owl"],["🦤","dodo"],["🪶","feather"],["🦩","flamingo"],["🦚","peacock"],["🦜","parrot"],["🪽","wing"],["🐦‍⬛","black bird"],["🪿","goose"],["🐦‍🔥","phoenix"],["🐸","frog"],["🐊","crocodile"],["🐢","turtle"],["🦎","lizard"],["🐍","snake"],["🐲","dragon face"],["🐉","dragon"],["🦕","sauropod"],["🦖","T-Rex"],["🐳","spouting whale"],["🐋","whale"],["🐬","dolphin"],["🫍","⊛ orca"],["🦭","seal"],["🐟","fish"],["🐠","tropical fish"],["🐡","blowfish"],["🦈","shark"],["🐙","octopus"],["🐚","spiral shell"],["🪸","coral"],["🪼","jellyfish"],["🦀","crab"],["🦞","lobster"],["🦐","shrimp"],["🦑","squid"],["🦪","oyster"],["🐌","snail"],["🦋","butterfly"],["🐛","bug"],["🐜","ant"],["🐝","honeybee"],["🪲","beetle"],["🐞","lady beetle"],["🦗","cricket"],["🪳","cockroach"],["🕷","spider"],["🕸","spider web"],["🦂","scorpion"],["🦟","mosquito"],["🪰","fly"],["🪱","worm"],["🦠","microbe"],["💐","bouquet"],["🌸","cherry blossom"],["💮","white flower"],["🪷","lotus"],["🏵","rosette"],["🌹","rose"],["🥀","wilted flower"],["🌺","hibiscus"],["🌻","sunflower"],["🌼","blossom"],["🌷","tulip"],["🪻","hyacinth"],["🌱","seedling"],["🪴","potted plant"],["🌲","evergreen tree"],["🌳","deciduous tree"],["🌴","palm tree"],["🌵","cactus"],["🌾","sheaf of rice"],["🌿","herb"],["☘","shamrock"],["🍀","four leaf clover"],["🍁","maple leaf"],["🍂","fallen leaf"],["🍃","leaf fluttering in wind"],["🪹","empty nest"],["🪺","nest with eggs"],["🍄","mushroom"],["🪾","leafless tree"]]},{"cat":"Food","icon":"🍔","items":[["🍇","grapes"],["🍈","melon"],["🍉","watermelon"],["🍊","tangerine"],["🍋","lemon"],["🍋‍🟩","lime"],["🍌","banana"],["🍍","pineapple"],["🥭","mango"],["🍎","red apple"],["🍏","green apple"],["🍐","pear"],["🍑","peach"],["🍒","cherries"],["🍓","strawberry"],["🫐","blueberries"],["🥝","kiwi fruit"],["🍅","tomato"],["🫒","olive"],["🥥","coconut"],["🥑","avocado"],["🍆","eggplant"],["🥔","potato"],["🥕","carrot"],["🌽","ear of corn"],["🌶","hot pepper"],["🫑","bell pepper"],["🥒","cucumber"],["🥬","leafy green"],["🥦","broccoli"],["🧄","garlic"],["🧅","onion"],["🥜","peanuts"],["🫘","beans"],["🌰","chestnut"],["🫚","ginger root"],["🫛","pea pod"],["🍄‍🟫","brown mushroom"],["🫜","root vegetable"],["🍞","bread"],["🥐","croissant"],["🥖","baguette bread"],["🫓","flatbread"],["🥨","pretzel"],["🥯","bagel"],["🥞","pancakes"],["🧇","waffle"],["🧀","cheese wedge"],["🍖","meat on bone"],["🍗","poultry leg"],["🥩","cut of meat"],["🥓","bacon"],["🍔","hamburger"],["🍟","french fries"],["🍕","pizza"],["🌭","hot dog"],["🥪","sandwich"],["🌮","taco"],["🌯","burrito"],["🫔","tamale"],["🥙","stuffed flatbread"],["🧆","falafel"],["🥚","egg"],["🍳","cooking"],["🥘","shallow pan of food"],["🍲","pot of food"],["🫕","fondue"],["🥣","bowl with spoon"],["🥗","green salad"],["🍿","popcorn"],["🧈","butter"],["🧂","salt"],["🥫","canned food"],["🍱","bento box"],["🍘","rice cracker"],["🍙","rice ball"],["🍚","cooked rice"],["🍛","curry rice"],["🍜","steaming bowl"],["🍝","spaghetti"],["🍠","roasted sweet potato"],["🍢","oden"],["🍣","sushi"],["🍤","fried shrimp"],["🍥","fish cake with swirl"],["🥮","moon cake"],["🍡","dango"],["🥟","dumpling"],["🥠","fortune cookie"],["🥡","takeout box"],["🍦","soft ice cream"],["🍧","shaved ice"],["🍨","ice cream"],["🍩","doughnut"],["🍪","cookie"],["🎂","birthday cake"],["🍰","shortcake"],["🧁","cupcake"],["🥧","pie"],["🍫","chocolate bar"],["🍬","candy"],["🍭","lollipop"],["🍮","custard"],["🍯","honey pot"],["🍼","baby bottle"],["🥛","glass of milk"],["☕","hot beverage"],["🫖","teapot"],["🍵","teacup without handle"],["🍶","sake"],["🍾","bottle with popping cork"],["🍷","wine glass"],["🍸","cocktail glass"],["🍹","tropical drink"],["🍺","beer mug"],["🍻","clinking beer mugs"],["🥂","clinking glasses"],["🥃","tumbler glass"],["🫗","pouring liquid"],["🥤","cup with straw"],["🧋","bubble tea"],["🧃","beverage box"],["🧉","mate"],["🧊","ice"],["🥢","chopsticks"],["🍽","fork and knife with plate"],["🍴","fork and knife"],["🥄","spoon"],["🔪","kitchen knife"],["🫙","jar"],["🏺","amphora"]]},{"cat":"Travel","icon":"🚗","items":[["🌍","globe showing Europe-Africa"],["🌎","globe showing Americas"],["🌏","globe showing Asia-Australia"],["🌐","globe with meridians"],["🗺","world map"],["🗾","map of Japan"],["🧭","compass"],["🏔","snow-capped mountain"],["⛰","mountain"],["🛘","⊛ landslide"],["🌋","volcano"],["🗻","mount fuji"],["🏕","camping"],["🏖","beach with umbrella"],["🏜","desert"],["🏝","desert island"],["🏞","national park"],["🏟","stadium"],["🏛","classical building"],["🏗","building construction"],["🧱","brick"],["🪨","rock"],["🪵","wood"],["🛖","hut"],["🏘","houses"],["🏚","derelict house"],["🏠","house"],["🏡","house with garden"],["🏢","office building"],["🏣","Japanese post office"],["🏤","post office"],["🏥","hospital"],["🏦","bank"],["🏨","hotel"],["🏩","love hotel"],["🏪","convenience store"],["🏫","school"],["🏬","department store"],["🏭","factory"],["🏯","Japanese castle"],["🏰","castle"],["💒","wedding"],["🗼","Tokyo tower"],["🗽","Statue of Liberty"],["⛪","church"],["🕌","mosque"],["🛕","hindu temple"],["🕍","synagogue"],["⛩","shinto shrine"],["🕋","kaaba"],["⛲","fountain"],["⛺","tent"],["🌁","foggy"],["🌃","night with stars"],["🏙","cityscape"],["🌄","sunrise over mountains"],["🌅","sunrise"],["🌆","cityscape at dusk"],["🌇","sunset"],["🌉","bridge at night"],["♨","hot springs"],["🎠","carousel horse"],["🛝","playground slide"],["🎡","ferris wheel"],["🎢","roller coaster"],["💈","barber pole"],["🎪","circus tent"],["🚂","locomotive"],["🚃","railway car"],["🚄","high-speed train"],["🚅","bullet train"],["🚆","train"],["🚇","metro"],["🚈","light rail"],["🚉","station"],["🚊","tram"],["🚝","monorail"],["🚞","mountain railway"],["🚋","tram car"],["🚌","bus"],["🚍","oncoming bus"],["🚎","trolleybus"],["🚐","minibus"],["🚑","ambulance"],["🚒","fire engine"],["🚓","police car"],["🚔","oncoming police car"],["🚕","taxi"],["🚖","oncoming taxi"],["🚗","automobile"],["🚘","oncoming automobile"],["🚙","sport utility vehicle"],["🛻","pickup truck"],["🚚","delivery truck"],["🚛","articulated lorry"],["🚜","tractor"],["🏎","racing car"],["🏍","motorcycle"],["🛵","motor scooter"],["🦽","manual wheelchair"],["🦼","motorized wheelchair"],["🛺","auto rickshaw"],["🚲","bicycle"],["🛴","kick scooter"],["🛹","skateboard"],["🛼","roller skate"],["🚏","bus stop"],["🛣","motorway"],["🛤","railway track"],["🛢","oil drum"],["⛽","fuel pump"],["🛞","wheel"],["🚨","police car light"],["🚥","horizontal traffic light"],["🚦","vertical traffic light"],["🛑","stop sign"],["🚧","construction"],["⚓","anchor"],["🛟","ring buoy"],["⛵","sailboat"],["🛶","canoe"],["🚤","speedboat"],["🛳","passenger ship"],["⛴","ferry"],["🛥","motor boat"],["🚢","ship"],["✈","airplane"],["🛩","small airplane"],["🛫","airplane departure"],["🛬","airplane arrival"],["🪂","parachute"],["💺","seat"],["🚁","helicopter"],["🚟","suspension railway"],["🚠","mountain cableway"],["🚡","aerial tramway"],["🛰","satellite"],["🚀","rocket"],["🛸","flying saucer"],["🛎","bellhop bell"],["🧳","luggage"],["⌛","hourglass done"],["⏳","hourglass not done"],["⌚","watch"],["⏰","alarm clock"],["⏱","stopwatch"],["⏲","timer clock"],["🕰","mantelpiece clock"],["🕛","twelve o’clock"],["🕧","twelve-thirty"],["🕐","one o’clock"],["🕜","one-thirty"],["🕑","two o’clock"],["🕝","two-thirty"],["🕒","three o’clock"],["🕞","three-thirty"],["🕓","four o’clock"],["🕟","four-thirty"],["🕔","five o’clock"],["🕠","five-thirty"],["🕕","six o’clock"],["🕡","six-thirty"],["🕖","seven o’clock"],["🕢","seven-thirty"],["🕗","eight o’clock"],["🕣","eight-thirty"],["🕘","nine o’clock"],["🕤","nine-thirty"],["🕙","ten o’clock"],["🕥","ten-thirty"],["🕚","eleven o’clock"],["🕦","eleven-thirty"],["🌑","new moon"],["🌒","waxing crescent moon"],["🌓","first quarter moon"],["🌔","waxing gibbous moon"],["🌕","full moon"],["🌖","waning gibbous moon"],["🌗","last quarter moon"],["🌘","waning crescent moon"],["🌙","crescent moon"],["🌚","new moon face"],["🌛","first quarter moon face"],["🌜","last quarter moon face"],["🌡","thermometer"],["☀","sun"],["🌝","full moon face"],["🌞","sun with face"],["🪐","ringed planet"],["⭐","star"],["🌟","glowing star"],["🌠","shooting star"],["🌌","milky way"],["☁","cloud"],["⛅","sun behind cloud"],["⛈","cloud with lightning and rain"],["🌤","sun behind small cloud"],["🌥","sun behind large cloud"],["🌦","sun behind rain cloud"],["🌧","cloud with rain"],["🌨","cloud with snow"],["🌩","cloud with lightning"],["🌪","tornado"],["🌫","fog"],["🌬","wind face"],["🌀","cyclone"],["🌈","rainbow"],["🌂","closed umbrella"],["☂","umbrella"],["☔","umbrella with rain drops"],["⛱","umbrella on ground"],["⚡","high voltage"],["❄","snowflake"],["☃","snowman"],["⛄","snowman without snow"],["☄","comet"],["🔥","fire"],["💧","droplet"],["🌊","water wave"]]},{"cat":"Activities","icon":"⚽","items":[["🎃","jack-o-lantern"],["🎄","Christmas tree"],["🎆","fireworks"],["🎇","sparkler"],["🧨","firecracker"],["✨","sparkles"],["🎈","balloon"],["🎉","party popper"],["🎊","confetti ball"],["🎋","tanabata tree"],["🎍","pine decoration"],["🎎","Japanese dolls"],["🎏","carp streamer"],["🎐","wind chime"],["🎑","moon viewing ceremony"],["🧧","red envelope"],["🎀","ribbon"],["🎁","wrapped gift"],["🎗","reminder ribbon"],["🎟","admission tickets"],["🎫","ticket"],["🎖","military medal"],["🏆","trophy"],["🏅","sports medal"],["🥇","1st place medal"],["🥈","2nd place medal"],["🥉","3rd place medal"],["⚽","soccer ball"],["⚾","baseball"],["🥎","softball"],["🏀","basketball"],["🏐","volleyball"],["🏈","american football"],["🏉","rugby football"],["🎾","tennis"],["🥏","flying disc"],["🎳","bowling"],["🏏","cricket game"],["🏑","field hockey"],["🏒","ice hockey"],["🥍","lacrosse"],["🏓","ping pong"],["🏸","badminton"],["🥊","boxing glove"],["🥋","martial arts uniform"],["🥅","goal net"],["⛳","flag in hole"],["⛸","ice skate"],["🎣","fishing pole"],["🤿","diving mask"],["🎽","running shirt"],["🎿","skis"],["🛷","sled"],["🥌","curling stone"],["🎯","bullseye"],["🪀","yo-yo"],["🪁","kite"],["🔫","water pistol"],["🎱","pool 8 ball"],["🔮","crystal ball"],["🪄","magic wand"],["🎮","video game"],["🕹","joystick"],["🎰","slot machine"],["🎲","game die"],["🧩","puzzle piece"],["🧸","teddy bear"],["🪅","piñata"],["🪩","mirror ball"],["🪆","nesting dolls"],["♠","spade suit"],["♥","heart suit"],["♦","diamond suit"],["♣","club suit"],["♟","chess pawn"],["🃏","joker"],["🀄","mahjong red dragon"],["🎴","flower playing cards"],["🎭","performing arts"],["🖼","framed picture"],["🎨","artist palette"],["🧵","thread"],["🪡","sewing needle"],["🧶","yarn"],["🪢","knot"]]},{"cat":"Objects","icon":"💡","items":[["👓","glasses"],["🕶","sunglasses"],["🥽","goggles"],["🥼","lab coat"],["🦺","safety vest"],["👔","necktie"],["👕","t-shirt"],["👖","jeans"],["🧣","scarf"],["🧤","gloves"],["🧥","coat"],["🧦","socks"],["👗","dress"],["👘","kimono"],["🥻","sari"],["🩱","one-piece swimsuit"],["🩲","briefs"],["🩳","shorts"],["👙","bikini"],["👚","woman’s clothes"],["🪭","folding hand fan"],["👛","purse"],["👜","handbag"],["👝","clutch bag"],["🛍","shopping bags"],["🎒","backpack"],["🩴","thong sandal"],["👞","man’s shoe"],["👟","running shoe"],["🥾","hiking boot"],["🥿","flat shoe"],["👠","high-heeled shoe"],["👡","woman’s sandal"],["🩰","ballet shoes"],["👢","woman’s boot"],["🪮","hair pick"],["👑","crown"],["👒","woman’s hat"],["🎩","top hat"],["🎓","graduation cap"],["🧢","billed cap"],["🪖","military helmet"],["⛑","rescue worker’s helmet"],["📿","prayer beads"],["💄","lipstick"],["💍","ring"],["💎","gem stone"],["🔇","muted speaker"],["🔈","speaker low volume"],["🔉","speaker medium volume"],["🔊","speaker high volume"],["📢","loudspeaker"],["📣","megaphone"],["📯","postal horn"],["🔔","bell"],["🔕","bell with slash"],["🎼","musical score"],["🎵","musical note"],["🎶","musical notes"],["🎙","studio microphone"],["🎚","level slider"],["🎛","control knobs"],["🎤","microphone"],["🎧","headphone"],["📻","radio"],["🎷","saxophone"],["🎺","trumpet"],["🪊","⊛ trombone"],["🪗","accordion"],["🎸","guitar"],["🎹","musical keyboard"],["🎻","violin"],["🪕","banjo"],["🥁","drum"],["🪘","long drum"],["🪇","maracas"],["🪈","flute"],["🪉","harp"],["📱","mobile phone"],["📲","mobile phone with arrow"],["☎","telephone"],["📞","telephone receiver"],["📟","pager"],["📠","fax machine"],["🔋","battery"],["🪫","low battery"],["🔌","electric plug"],["💻","laptop"],["🖥","desktop computer"],["🖨","printer"],["⌨","keyboard"],["🖱","computer mouse"],["🖲","trackball"],["💽","computer disk"],["💾","floppy disk"],["💿","optical disk"],["📀","dvd"],["🧮","abacus"],["🎥","movie camera"],["🎞","film frames"],["📽","film projector"],["🎬","clapper board"],["📺","television"],["📷","camera"],["📸","camera with flash"],["📹","video camera"],["📼","videocassette"],["🔍","magnifying glass tilted left"],["🔎","magnifying glass tilted right"],["🕯","candle"],["💡","light bulb"],["🔦","flashlight"],["🏮","red paper lantern"],["🪔","diya lamp"],["📔","notebook with decorative cover"],["📕","closed book"],["📖","open book"],["📗","green book"],["📘","blue book"],["📙","orange book"],["📚","books"],["📓","notebook"],["📒","ledger"],["📃","page with curl"],["📜","scroll"],["📄","page facing up"],["📰","newspaper"],["🗞","rolled-up newspaper"],["📑","bookmark tabs"],["🔖","bookmark"],["🏷","label"],["🪙","coin"],["💰","money bag"],["🪎","⊛ treasure chest"],["💴","yen banknote"],["💵","dollar banknote"],["💶","euro banknote"],["💷","pound banknote"],["💸","money with wings"],["💳","credit card"],["🧾","receipt"],["💹","chart increasing with yen"],["✉","envelope"],["📧","e-mail"],["📨","incoming envelope"],["📩","envelope with arrow"],["📤","outbox tray"],["📥","inbox tray"],["📦","package"],["📫","closed mailbox with raised flag"],["📪","closed mailbox with lowered flag"],["📬","open mailbox with raised flag"],["📭","open mailbox with lowered flag"],["📮","postbox"],["🗳","ballot box with ballot"],["✏","pencil"],["✒","black nib"],["🖋","fountain pen"],["🖊","pen"],["🖌","paintbrush"],["🖍","crayon"],["📝","memo"],["💼","briefcase"],["📁","file folder"],["📂","open file folder"],["🗂","card index dividers"],["📅","calendar"],["📆","tear-off calendar"],["🗒","spiral notepad"],["🗓","spiral calendar"],["📇","card index"],["📈","chart increasing"],["📉","chart decreasing"],["📊","bar chart"],["📋","clipboard"],["📌","pushpin"],["📍","round pushpin"],["📎","paperclip"],["🖇","linked paperclips"],["📏","straight ruler"],["📐","triangular ruler"],["✂","scissors"],["🗃","card file box"],["🗄","file cabinet"],["🗑","wastebasket"],["🔒","locked"],["🔓","unlocked"],["🔏","locked with pen"],["🔐","locked with key"],["🔑","key"],["🗝","old key"],["🔨","hammer"],["🪓","axe"],["⛏","pick"],["⚒","hammer and pick"],["🛠","hammer and wrench"],["🗡","dagger"],["⚔","crossed swords"],["💣","bomb"],["🪃","boomerang"],["🏹","bow and arrow"],["🛡","shield"],["🪚","carpentry saw"],["🔧","wrench"],["🪛","screwdriver"],["🔩","nut and bolt"],["⚙","gear"],["🗜","clamp"],["⚖","balance scale"],["🦯","white cane"],["🔗","link"],["⛓️‍💥","broken chain"],["⛓","chains"],["🪝","hook"],["🧰","toolbox"],["🧲","magnet"],["🪜","ladder"],["🪏","shovel"],["⚗","alembic"],["🧪","test tube"],["🧫","petri dish"],["🧬","dna"],["🔬","microscope"],["🔭","telescope"],["📡","satellite antenna"],["💉","syringe"],["🩸","drop of blood"],["💊","pill"],["🩹","adhesive bandage"],["🩼","crutch"],["🩺","stethoscope"],["🩻","x-ray"],["🚪","door"],["🛗","elevator"],["🪞","mirror"],["🪟","window"],["🛏","bed"],["🛋","couch and lamp"],["🪑","chair"],["🚽","toilet"],["🪠","plunger"],["🚿","shower"],["🛁","bathtub"],["🪤","mouse trap"],["🪒","razor"],["🧴","lotion bottle"],["🧷","safety pin"],["🧹","broom"],["🧺","basket"],["🧻","roll of paper"],["🪣","bucket"],["🧼","soap"],["🫧","bubbles"],["🪥","toothbrush"],["🧽","sponge"],["🧯","fire extinguisher"],["🛒","shopping cart"],["🚬","cigarette"],["⚰","coffin"],["🪦","headstone"],["⚱","funeral urn"],["🧿","nazar amulet"],["🪬","hamsa"],["🗿","moai"],["🪧","placard"],["🪪","identification card"]]},{"cat":"Symbols","icon":"❤️","items":[["🏧","ATM sign"],["🚮","litter in bin sign"],["🚰","potable water"],["♿","wheelchair symbol"],["🚹","men’s room"],["🚺","women’s room"],["🚻","restroom"],["🚼","baby symbol"],["🚾","water closet"],["🛂","passport control"],["🛃","customs"],["🛄","baggage claim"],["🛅","left luggage"],["⚠","warning"],["🚸","children crossing"],["⛔","no entry"],["🚫","prohibited"],["🚳","no bicycles"],["🚭","no smoking"],["🚯","no littering"],["🚱","non-potable water"],["🚷","no pedestrians"],["📵","no mobile phones"],["🔞","no one under eighteen"],["☢","radioactive"],["☣","biohazard"],["⬆","up arrow"],["↗","up-right arrow"],["➡","right arrow"],["↘","down-right arrow"],["⬇","down arrow"],["↙","down-left arrow"],["⬅","left arrow"],["↖","up-left arrow"],["↕","up-down arrow"],["↔","left-right arrow"],["↩","right arrow curving left"],["↪","left arrow curving right"],["⤴","right arrow curving up"],["⤵","right arrow curving down"],["🔃","clockwise vertical arrows"],["🔄","counterclockwise arrows button"],["🔙","BACK arrow"],["🔚","END arrow"],["🔛","ON! arrow"],["🔜","SOON arrow"],["🔝","TOP arrow"],["🛐","place of worship"],["⚛","atom symbol"],["🕉","om"],["✡","star of David"],["☸","wheel of dharma"],["☯","yin yang"],["✝","latin cross"],["☦","orthodox cross"],["☪","star and crescent"],["☮","peace symbol"],["🕎","menorah"],["🔯","dotted six-pointed star"],["🪯","khanda"],["♈","Aries"],["♉","Taurus"],["♊","Gemini"],["♋","Cancer"],["♌","Leo"],["♍","Virgo"],["♎","Libra"],["♏","Scorpio"],["♐","Sagittarius"],["♑","Capricorn"],["♒","Aquarius"],["♓","Pisces"],["⛎","Ophiuchus"],["🔀","shuffle tracks button"],["🔁","repeat button"],["🔂","repeat single button"],["▶","play button"],["⏩","fast-forward button"],["⏭","next track button"],["⏯","play or pause button"],["◀","reverse button"],["⏪","fast reverse button"],["⏮","last track button"],["🔼","upwards button"],["⏫","fast up button"],["🔽","downwards button"],["⏬","fast down button"],["⏸","pause button"],["⏹","stop button"],["⏺","record button"],["⏏","eject button"],["🎦","cinema"],["🔅","dim button"],["🔆","bright button"],["📶","antenna bars"],["🛜","wireless"],["📳","vibration mode"],["📴","mobile phone off"],["♀","female sign"],["♂","male sign"],["⚧","transgender symbol"],["✖","multiply"],["➕","plus"],["➖","minus"],["➗","divide"],["🟰","heavy equals sign"],["♾","infinity"],["‼","double exclamation mark"],["⁉","exclamation question mark"],["❓","red question mark"],["❔","white question mark"],["❕","white exclamation mark"],["❗","red exclamation mark"],["〰","wavy dash"],["💱","currency exchange"],["💲","heavy dollar sign"],["⚕","medical symbol"],["♻","recycling symbol"],["⚜","fleur-de-lis"],["🔱","trident emblem"],["📛","name badge"],["🔰","Japanese symbol for beginner"],["⭕","hollow red circle"],["✅","check mark button"],["☑","check box with check"],["✔","check mark"],["❌","cross mark"],["❎","cross mark button"],["➰","curly loop"],["➿","double curly loop"],["〽","part alternation mark"],["✳","eight-spoked asterisk"],["✴","eight-pointed star"],["❇","sparkle"],["©","copyright"],["®","registered"],["™","trade mark"],["🫟","splatter"],["#️⃣","keycap: #"],["*️⃣","keycap: *"],["0️⃣","keycap: 0"],["1️⃣","keycap: 1"],["2️⃣","keycap: 2"],["3️⃣","keycap: 3"],["4️⃣","keycap: 4"],["5️⃣","keycap: 5"],["6️⃣","keycap: 6"],["7️⃣","keycap: 7"],["8️⃣","keycap: 8"],["9️⃣","keycap: 9"],["🔟","keycap: 10"],["🔠","input latin uppercase"],["🔡","input latin lowercase"],["🔢","input numbers"],["🔣","input symbols"],["🔤","input latin letters"],["🅰","A button (blood type)"],["🆎","AB button (blood type)"],["🅱","B button (blood type)"],["🆑","CL button"],["🆒","COOL button"],["🆓","FREE button"],["ℹ","information"],["🆔","ID button"],["Ⓜ","circled M"],["🆕","NEW button"],["🆖","NG button"],["🅾","O button (blood type)"],["🆗","OK button"],["🅿","P button"],["🆘","SOS button"],["🆙","UP! button"],["🆚","VS button"],["🈁","Japanese “here” button"],["🈂","Japanese “service charge” button"],["🈷","Japanese “monthly amount” button"],["🈶","Japanese “not free of charge” button"],["🈯","Japanese “reserved” button"],["🉐","Japanese “bargain” button"],["🈹","Japanese “discount” button"],["🈚","Japanese “free of charge” button"],["🈲","Japanese “prohibited” button"],["🉑","Japanese “acceptable” button"],["🈸","Japanese “application” button"],["🈴","Japanese “passing grade” button"],["🈳","Japanese “vacancy” button"],["㊗","Japanese “congratulations” button"],["㊙","Japanese “secret” button"],["🈺","Japanese “open for business” button"],["🈵","Japanese “no vacancy” button"],["🔴","red circle"],["🟠","orange circle"],["🟡","yellow circle"],["🟢","green circle"],["🔵","blue circle"],["🟣","purple circle"],["🟤","brown circle"],["⚫","black circle"],["⚪","white circle"],["🟥","red square"],["🟧","orange square"],["🟨","yellow square"],["🟩","green square"],["🟦","blue square"],["🟪","purple square"],["🟫","brown square"],["⬛","black large square"],["⬜","white large square"],["◼","black medium square"],["◻","white medium square"],["◾","black medium-small square"],["◽","white medium-small square"],["▪","black small square"],["▫","white small square"],["🔶","large orange diamond"],["🔷","large blue diamond"],["🔸","small orange diamond"],["🔹","small blue diamond"],["🔺","red triangle pointed up"],["🔻","red triangle pointed down"],["💠","diamond with a dot"],["🔘","radio button"],["🔳","white square button"],["🔲","black square button"]]},{"cat":"Flags","icon":"🏳️","items":[["🏁","chequered flag"],["🚩","triangular flag"],["🎌","crossed flags"],["🏴","black flag"],["🏳","white flag"],["🏳️‍🌈","rainbow flag"],["🏳️‍⚧️","transgender flag"],["🏴‍☠️","pirate flag"],["🇦🇨","flag: Ascension Island"],["🇦🇩","flag: Andorra"],["🇦🇪","flag: United Arab Emirates"],["🇦🇫","flag: Afghanistan"],["🇦🇬","flag: Antigua & Barbuda"],["🇦🇮","flag: Anguilla"],["🇦🇱","flag: Albania"],["🇦🇲","flag: Armenia"],["🇦🇴","flag: Angola"],["🇦🇶","flag: Antarctica"],["🇦🇷","flag: Argentina"],["🇦🇸","flag: American Samoa"],["🇦🇹","flag: Austria"],["🇦🇺","flag: Australia"],["🇦🇼","flag: Aruba"],["🇦🇽","flag: Åland Islands"],["🇦🇿","flag: Azerbaijan"],["🇧🇦","flag: Bosnia & Herzegovina"],["🇧🇧","flag: Barbados"],["🇧🇩","flag: Bangladesh"],["🇧🇪","flag: Belgium"],["🇧🇫","flag: Burkina Faso"],["🇧🇬","flag: Bulgaria"],["🇧🇭","flag: Bahrain"],["🇧🇮","flag: Burundi"],["🇧🇯","flag: Benin"],["🇧🇱","flag: St. Barthélemy"],["🇧🇲","flag: Bermuda"],["🇧🇳","flag: Brunei"],["🇧🇴","flag: Bolivia"],["🇧🇶","flag: Caribbean Netherlands"],["🇧🇷","flag: Brazil"],["🇧🇸","flag: Bahamas"],["🇧🇹","flag: Bhutan"],["🇧🇻","flag: Bouvet Island"],["🇧🇼","flag: Botswana"],["🇧🇾","flag: Belarus"],["🇧🇿","flag: Belize"],["🇨🇦","flag: Canada"],["🇨🇨","flag: Cocos (Keeling) Islands"],["🇨🇩","flag: Congo - Kinshasa"],["🇨🇫","flag: Central African Republic"],["🇨🇬","flag: Congo - Brazzaville"],["🇨🇭","flag: Switzerland"],["🇨🇮","flag: Côte d’Ivoire"],["🇨🇰","flag: Cook Islands"],["🇨🇱","flag: Chile"],["🇨🇲","flag: Cameroon"],["🇨🇳","flag: China"],["🇨🇴","flag: Colombia"],["🇨🇵","flag: Clipperton Island"],["🇨🇶","flag: Sark"],["🇨🇷","flag: Costa Rica"],["🇨🇺","flag: Cuba"],["🇨🇻","flag: Cape Verde"],["🇨🇼","flag: Curaçao"],["🇨🇽","flag: Christmas Island"],["🇨🇾","flag: Cyprus"],["🇨🇿","flag: Czechia"],["🇩🇪","flag: Germany"],["🇩🇬","flag: Diego Garcia"],["🇩🇯","flag: Djibouti"],["🇩🇰","flag: Denmark"],["🇩🇲","flag: Dominica"],["🇩🇴","flag: Dominican Republic"],["🇩🇿","flag: Algeria"],["🇪🇦","flag: Ceuta & Melilla"],["🇪🇨","flag: Ecuador"],["🇪🇪","flag: Estonia"],["🇪🇬","flag: Egypt"],["🇪🇭","flag: Western Sahara"],["🇪🇷","flag: Eritrea"],["🇪🇸","flag: Spain"],["🇪🇹","flag: Ethiopia"],["🇪🇺","flag: European Union"],["🇫🇮","flag: Finland"],["🇫🇯","flag: Fiji"],["🇫🇰","flag: Falkland Islands"],["🇫🇲","flag: Micronesia"],["🇫🇴","flag: Faroe Islands"],["🇫🇷","flag: France"],["🇬🇦","flag: Gabon"],["🇬🇧","flag: United Kingdom"],["🇬🇩","flag: Grenada"],["🇬🇪","flag: Georgia"],["🇬🇫","flag: French Guiana"],["🇬🇬","flag: Guernsey"],["🇬🇭","flag: Ghana"],["🇬🇮","flag: Gibraltar"],["🇬🇱","flag: Greenland"],["🇬🇲","flag: Gambia"],["🇬🇳","flag: Guinea"],["🇬🇵","flag: Guadeloupe"],["🇬🇶","flag: Equatorial Guinea"],["🇬🇷","flag: Greece"],["🇬🇸","flag: South Georgia & South Sandwich Islands"],["🇬🇹","flag: Guatemala"],["🇬🇺","flag: Guam"],["🇬🇼","flag: Guinea-Bissau"],["🇬🇾","flag: Guyana"],["🇭🇰","flag: Hong Kong SAR China"],["🇭🇲","flag: Heard & McDonald Islands"],["🇭🇳","flag: Honduras"],["🇭🇷","flag: Croatia"],["🇭🇹","flag: Haiti"],["🇭🇺","flag: Hungary"],["🇮🇨","flag: Canary Islands"],["🇮🇩","flag: Indonesia"],["🇮🇪","flag: Ireland"],["🇮🇱","flag: Israel"],["🇮🇲","flag: Isle of Man"],["🇮🇳","flag: India"],["🇮🇴","flag: British Indian Ocean Territory"],["🇮🇶","flag: Iraq"],["🇮🇷","flag: Iran"],["🇮🇸","flag: Iceland"],["🇮🇹","flag: Italy"],["🇯🇪","flag: Jersey"],["🇯🇲","flag: Jamaica"],["🇯🇴","flag: Jordan"],["🇯🇵","flag: Japan"],["🇰🇪","flag: Kenya"],["🇰🇬","flag: Kyrgyzstan"],["🇰🇭","flag: Cambodia"],["🇰🇮","flag: Kiribati"],["🇰🇲","flag: Comoros"],["🇰🇳","flag: St. Kitts & Nevis"],["🇰🇵","flag: North Korea"],["🇰🇷","flag: South Korea"],["🇰🇼","flag: Kuwait"],["🇰🇾","flag: Cayman Islands"],["🇰🇿","flag: Kazakhstan"],["🇱🇦","flag: Laos"],["🇱🇧","flag: Lebanon"],["🇱🇨","flag: St. Lucia"],["🇱🇮","flag: Liechtenstein"],["🇱🇰","flag: Sri Lanka"],["🇱🇷","flag: Liberia"],["🇱🇸","flag: Lesotho"],["🇱🇹","flag: Lithuania"],["🇱🇺","flag: Luxembourg"],["🇱🇻","flag: Latvia"],["🇱🇾","flag: Libya"],["🇲🇦","flag: Morocco"],["🇲🇨","flag: Monaco"],["🇲🇩","flag: Moldova"],["🇲🇪","flag: Montenegro"],["🇲🇫","flag: St. Martin"],["🇲🇬","flag: Madagascar"],["🇲🇭","flag: Marshall Islands"],["🇲🇰","flag: North Macedonia"],["🇲🇱","flag: Mali"],["🇲🇲","flag: Myanmar (Burma)"],["🇲🇳","flag: Mongolia"],["🇲🇴","flag: Macao SAR China"],["🇲🇵","flag: Northern Mariana Islands"],["🇲🇶","flag: Martinique"],["🇲🇷","flag: Mauritania"],["🇲🇸","flag: Montserrat"],["🇲🇹","flag: Malta"],["🇲🇺","flag: Mauritius"],["🇲🇻","flag: Maldives"],["🇲🇼","flag: Malawi"],["🇲🇽","flag: Mexico"],["🇲🇾","flag: Malaysia"],["🇲🇿","flag: Mozambique"],["🇳🇦","flag: Namibia"],["🇳🇨","flag: New Caledonia"],["🇳🇪","flag: Niger"],["🇳🇫","flag: Norfolk Island"],["🇳🇬","flag: Nigeria"],["🇳🇮","flag: Nicaragua"],["🇳🇱","flag: Netherlands"],["🇳🇴","flag: Norway"],["🇳🇵","flag: Nepal"],["🇳🇷","flag: Nauru"],["🇳🇺","flag: Niue"],["🇳🇿","flag: New Zealand"],["🇴🇲","flag: Oman"],["🇵🇦","flag: Panama"],["🇵🇪","flag: Peru"],["🇵🇫","flag: French Polynesia"],["🇵🇬","flag: Papua New Guinea"],["🇵🇭","flag: Philippines"],["🇵🇰","flag: Pakistan"],["🇵🇱","flag: Poland"],["🇵🇲","flag: St. Pierre & Miquelon"],["🇵🇳","flag: Pitcairn Islands"],["🇵🇷","flag: Puerto Rico"],["🇵🇸","flag: Palestinian Territories"],["🇵🇹","flag: Portugal"],["🇵🇼","flag: Palau"],["🇵🇾","flag: Paraguay"],["🇶🇦","flag: Qatar"],["🇷🇪","flag: Réunion"],["🇷🇴","flag: Romania"],["🇷🇸","flag: Serbia"],["🇷🇺","flag: Russia"],["🇷🇼","flag: Rwanda"],["🇸🇦","flag: Saudi Arabia"],["🇸🇧","flag: Solomon Islands"],["🇸🇨","flag: Seychelles"],["🇸🇩","flag: Sudan"],["🇸🇪","flag: Sweden"],["🇸🇬","flag: Singapore"],["🇸🇭","flag: St. Helena"],["🇸🇮","flag: Slovenia"],["🇸🇯","flag: Svalbard & Jan Mayen"],["🇸🇰","flag: Slovakia"],["🇸🇱","flag: Sierra Leone"],["🇸🇲","flag: San Marino"],["🇸🇳","flag: Senegal"],["🇸🇴","flag: Somalia"],["🇸🇷","flag: Suriname"],["🇸🇸","flag: South Sudan"],["🇸🇹","flag: São Tomé & Príncipe"],["🇸🇻","flag: El Salvador"],["🇸🇽","flag: Sint Maarten"],["🇸🇾","flag: Syria"],["🇸🇿","flag: Eswatini"],["🇹🇦","flag: Tristan da Cunha"],["🇹🇨","flag: Turks & Caicos Islands"],["🇹🇩","flag: Chad"],["🇹🇫","flag: French Southern Territories"],["🇹🇬","flag: Togo"],["🇹🇭","flag: Thailand"],["🇹🇯","flag: Tajikistan"],["🇹🇰","flag: Tokelau"],["🇹🇱","flag: Timor-Leste"],["🇹🇲","flag: Turkmenistan"],["🇹🇳","flag: Tunisia"],["🇹🇴","flag: Tonga"],["🇹🇷","flag: Türkiye"],["🇹🇹","flag: Trinidad & Tobago"],["🇹🇻","flag: Tuvalu"],["🇹🇼","flag: Taiwan"],["🇹🇿","flag: Tanzania"],["🇺🇦","flag: Ukraine"],["🇺🇬","flag: Uganda"],["🇺🇲","flag: U.S. Outlying Islands"],["🇺🇳","flag: United Nations"],["🇺🇸","flag: United States"],["🇺🇾","flag: Uruguay"],["🇺🇿","flag: Uzbekistan"],["🇻🇦","flag: Vatican City"],["🇻🇨","flag: St. Vincent & Grenadines"],["🇻🇪","flag: Venezuela"],["🇻🇬","flag: British Virgin Islands"],["🇻🇮","flag: U.S. Virgin Islands"],["🇻🇳","flag: Vietnam"],["🇻🇺","flag: Vanuatu"],["🇼🇫","flag: Wallis & Futuna"],["🇼🇸","flag: Samoa"],["🇽🇰","flag: Kosovo"],["🇾🇪","flag: Yemen"],["🇾🇹","flag: Mayotte"],["🇿🇦","flag: South Africa"],["🇿🇲","flag: Zambia"],["🇿🇼","flag: Zimbabwe"],["🏴󠁧󠁢󠁥󠁮󠁧󠁿","flag: England"],["🏴󠁧󠁢󠁳󠁣󠁴󠁿","flag: Scotland"],["🏴󠁧󠁢󠁷󠁬󠁳󠁿","flag: Wales"]]}];

  const emojiPop = document.createElement('div');
  emojiPop.className = 'hab-emoji-pop';
  emojiPop.innerHTML = `
    <input class="hab-emoji-search" id="hab-emoji-search" type="text" placeholder="Search emoji…" autocomplete="off">
    <div class="hab-emoji-tabs" id="hab-emoji-tabs"></div>
    <div class="hab-emoji-grid" id="hab-emoji-grid"></div>`;
  document.body.appendChild(emojiPop);

  const emojiTabsEl   = emojiPop.querySelector('#hab-emoji-tabs');
  const emojiGridEl   = emojiPop.querySelector('#hab-emoji-grid');
  const emojiSearchEl = emojiPop.querySelector('#hab-emoji-search');

  emojiTabsEl.innerHTML = EMOJI_DATA.map((c, i) =>
    `<button type="button" data-i="${i}" title="${esc(c.cat)}">${c.icon}</button>`
  ).join('');
  let emojiCatIdx = 0;
  let emojiTarget = null;

  function renderEmojiGrid() {
    const q = emojiSearchEl.value.trim().toLowerCase();
    let items;
    if (q) {
      items = [];
      EMOJI_DATA.forEach(c => c.items.forEach(it => { if (it[1].includes(q)) items.push(it); }));
    } else {
      items = EMOJI_DATA[emojiCatIdx].items;
    }
    emojiGridEl.innerHTML = items.length
      ? items.map(it => `<button type="button" data-e="${it[0]}" title="${esc(it[1])}">${it[0]}</button>`).join('')
      : `<div class="hab-emoji-empty">No matches</div>`;
  }

  emojiTabsEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      emojiCatIdx = parseInt(btn.dataset.i);
      emojiTabsEl.querySelectorAll('button').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      emojiSearchEl.value = '';
      renderEmojiGrid();
    });
  });
  emojiSearchEl.addEventListener('input', renderEmojiGrid);
  emojiSearchEl.addEventListener('click', e => e.stopPropagation());
  emojiSearchEl.addEventListener('mousedown', e => e.stopPropagation());

  function openEmojiPicker(inputEl) {
    emojiTarget = inputEl;
    const rect = inputEl.getBoundingClientRect();
    const top = Math.min(rect.bottom + 6, window.innerHeight - 376);
    const left = Math.min(rect.left, window.innerWidth - 332);
    emojiPop.style.top = Math.max(8, top) + 'px';
    emojiPop.style.left = Math.max(8, left) + 'px';
    emojiSearchEl.value = '';
    emojiTabsEl.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === emojiCatIdx));
    renderEmojiGrid();
    emojiPop.classList.add('vis');
  }
  function closeEmojiPicker() { emojiPop.classList.remove('vis'); emojiTarget = null; }

  emojiPop.addEventListener('mousedown', e => { if (e.target !== emojiSearchEl) e.preventDefault(); });
  emojiGridEl.addEventListener('click', e => {
    const btn = e.target.closest('button[data-e]');
    if (!btn || !emojiTarget) return;
    emojiTarget.value = btn.dataset.e;
    closeEmojiPicker();
  });
  document.addEventListener('click', e => {
    if (!emojiPop.classList.contains('vis')) return;
    if (emojiPop.contains(e.target) || e.target === emojiTarget) return;
    closeEmojiPicker();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeEmojiPicker(); });

  [$('hab-emoji-inp'), $('hab-m-emoji')].forEach(inp => {
    inp.addEventListener('click', e => { e.stopPropagation(); openEmojiPicker(inp); });
    inp.addEventListener('focus', () => openEmojiPicker(inp));
  });

  /* ── Init ── */
  renderHabits();
})();



/* ── REMINDERS (scoped IIFE) ── */
(function () {
  'use strict';
  const REM_KEY = 'lifeos_reminders'; // [{ id, title, datetime (ISO), message, created, calSynced }]
  const $ = id => document.getElementById(id);
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function gs(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function ss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function uid() { return Date.now() + Math.random().toString(36).slice(2, 6); }
  function pad2(n) { return String(n).padStart(2, '0'); }

  let reminders = gs(REM_KEY) || [];
  function saveReminders() { ss(REM_KEY, reminders); }

  function fmtWhen(iso) {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function fmtRel(iso) {
    const diff = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diff);
    const min = Math.round(abs / 60000);
    const hr = Math.round(abs / 3600000);
    const day = Math.round(abs / 86400000);
    let txt;
    if (min < 1) return 'now';
    else if (min < 60) txt = min + 'm';
    else if (hr < 24) txt = hr + 'h';
    else txt = day + 'd';
    return diff < 0 ? txt + ' ago' : 'in ' + txt;
  }
  function urgency(iso) {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return 'overdue';
    if (diff <= 3600000) return 'soon';
    return 'upcoming';
  }

  const listEl = $('rem-list');

  function render() {
    const sorted = reminders.slice().sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    if (!sorted.length) {
      listEl.innerHTML = '<div class="rem-empty">no reminders — you\'re free</div>';
    } else {
      listEl.innerHTML = sorted.map(r => {
        const u = urgency(r.datetime);
        return '<div class="rem-card' + (u === 'overdue' ? ' overdue' : '') + '" data-id="' + r.id + '">' +
          '<span class="rem-dot ' + u + '"></span>' +
          '<div class="rem-body">' +
            '<div class="rem-top-row"><span class="rem-title">' + esc(r.title) + '</span><span class="rem-rel">' + fmtRel(r.datetime) + '</span></div>' +
            '<div class="rem-when">' + fmtWhen(r.datetime) + '</div>' +
            (r.message ? '<div class="rem-msg">' + esc(r.message) + '</div>' : '') +
          '</div>' +
          '<div class="rem-actions">' +
            (r.calSynced
              ? '<span class="rem-cal-chip">✓ Cal</span>'
              : '<button class="rem-cal-btn" data-cal="' + r.id + '" title="Send to Google Calendar">📅</button>') +
            '<button class="rem-done-btn" data-done="' + r.id + '">✓ Done</button>' +
            '<button class="rem-trash-btn" data-trash="' + r.id + '" title="Delete">🗑</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    wireList();
    updateStat();
  }

  function updateStat() {
    const upcoming = reminders.filter(r => urgency(r.datetime) !== 'overdue').length;
    const statEl = $('s-rem');
    if (statEl) statEl.textContent = upcoming;
  }

  function refreshUrgencyOnly() {
    listEl.querySelectorAll('.rem-card').forEach(card => {
      const r = reminders.find(x => x.id === card.dataset.id);
      if (!r) return;
      const u = urgency(r.datetime);
      card.classList.toggle('overdue', u === 'overdue');
      const dot = card.querySelector('.rem-dot');
      if (dot) dot.className = 'rem-dot ' + u;
      const rel = card.querySelector('.rem-rel');
      if (rel) rel.textContent = fmtRel(r.datetime);
    });
    updateStat();
  }

  function wireList() {
    listEl.querySelectorAll('.rem-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.rem-cal-btn') || e.target.closest('.rem-done-btn') || e.target.closest('.rem-trash-btn')) return;
        openEdit(reminders.find(r => r.id === card.dataset.id));
      });
    });
    listEl.querySelectorAll('[data-done]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); removeReminder(btn.dataset.done); });
    });
    listEl.querySelectorAll('[data-trash]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); removeReminder(btn.dataset.trash); });
    });
    listEl.querySelectorAll('[data-cal]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); sendToCalendar(btn.dataset.cal, btn); });
    });
  }

  function removeReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    saveReminders();
    render();
  }

  /* ── Quick add ── */
  const qTitle = $('rem-q-title');
  const qDt = $('rem-q-dt');
  const qSet = $('rem-q-set');

  function addFromQuickbar() {
    const title = qTitle.value.trim();
    const dtVal = qDt.value;
    if (!title || !dtVal) { (title ? qDt : qTitle).focus(); return; }
    reminders.push({
      id: uid(), title, datetime: new Date(dtVal).toISOString(),
      message: '', created: new Date().toISOString(),
    });
    saveReminders();
    qTitle.value = '';
    qDt.value = '';
    render();
  }
  qSet.addEventListener('click', addFromQuickbar);
  qTitle.addEventListener('keydown', e => { if (e.key === 'Enter') addFromQuickbar(); });
  $('rem-add-btn').addEventListener('click', () => qTitle.focus());

  /* ── Edit modal ── */
  let editRem = null;
  const ov = $('rem-ov');
  const mTitle = $('rem-m-title');
  const mDt = $('rem-m-dt');
  const mMsg = $('rem-m-msg');

  function toLocalInputValue(iso) {
    const d = new Date(iso);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
      'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function openEdit(r) {
    if (!r) return;
    editRem = r;
    mTitle.value = r.title;
    mDt.value = toLocalInputValue(r.datetime);
    mMsg.value = r.message || '';
    ov.classList.add('vis');
    setTimeout(() => mTitle.focus(), 60);
  }
  function closeEdit() { ov.classList.remove('vis'); editRem = null; }

  $('rem-m-close').addEventListener('click', closeEdit);
  $('rem-m-cancel').addEventListener('click', closeEdit);
  ov.addEventListener('click', e => { if (e.target === ov) closeEdit(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('vis')) closeEdit();
  });

  $('rem-m-save').addEventListener('click', () => {
    if (!editRem) return;
    const title = mTitle.value.trim();
    if (!title) { mTitle.focus(); return; }
    if (!mDt.value) { mDt.focus(); return; }
    editRem.title = title;
    editRem.datetime = new Date(mDt.value).toISOString();
    editRem.message = mMsg.value.trim();
    saveReminders();
    closeEdit();
    render();
  });
  $('rem-m-del').addEventListener('click', () => {
    if (!editRem) return;
    removeReminder(editRem.id);
    closeEdit();
  });

  /* ── Google Calendar push ── */
  function friendlyCalError(e) {
    const code = e && e.code;
    if (code === 'not_granted' || code === 'capability_disabled') return 'Calendar access isn’t available in this view.';
    if (code === 'needs_reauth') return 'Reconnect Google Calendar in claude.ai Settings → Connectors.';
    if (code === 'server_not_connected') return 'Add Google Calendar in claude.ai Settings → Connectors.';
    if (code === 'consent_required') return 'Allow Google Calendar for this page, then try again.';
    if (code === 'blocked_by_policy' || code === 'approval_required') return 'Your workspace policy blocks this action.';
    if (code === 'tool_error') return 'Google Calendar rejected the request' + (e.message ? ': ' + e.message : '.');
    if (code === 'server_unavailable' || code === 'upstream_error') return 'Google Calendar is temporarily unreachable.';
    return (e && e.message) || 'Something went wrong.';
  }

  function sendToCalendar(id, btn) {
    const r = reminders.find(x => x.id === id);
    if (!r || !window.claude || !window.claude.use) return;
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = '…';
    window.claude.use('mcp').then(mcp => {
      if (!mcp) { const err = new Error('not available'); err.code = 'not_granted'; throw err; }
      return mcp.server('Google Calendar');
    }).then(cal => {
      const start = new Date(r.datetime);
      const end = new Date(start.getTime() + 30 * 60000);
      return cal['create_event']({
        summary: r.title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        description: r.message || undefined,
      });
    }).then(() => {
      r.calSynced = true;
      saveReminders();
      render();
    }).catch(e => {
      btn.disabled = false;
      btn.textContent = original;
      btn.title = friendlyCalError(e);
    });
  }

  /* ── Init ── */
  render();
  setInterval(refreshUrgencyOnly, 30000);
})();



/* -- NOTION PUSH (scoped IIFE) -- */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const HUB_KEY = 'notion_hub_id_v1'; // per-browser: each viewer points this at their own Notion page
  function getHubId() {
    const raw = localStorage.getItem(HUB_KEY);
    return raw ? urlToId(raw) : null;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[\\*~`$\[\]<>{}|^]/g, c => '\\' + c);
  }
  function gs(k, fallback) {
    try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function addDays(dateStr, delta) {
    const [y, m, day] = dateStr.split('-').map(Number);
    const d = new Date(y, m - 1, day);
    d.setDate(d.getDate() + delta);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function nowTime() { return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function monthTitle(d) { return d.toLocaleString('en-US', { month: 'long' }) + ' ' + d.getFullYear(); }
  function dateTitle(d) {
    return d.toLocaleString('en-US', { month: 'short' }) + ' ' + d.getDate() + ' · ' + d.toLocaleString('en-US', { weekday: 'short' });
  }
  function urlToId(url) {
    const s = String(url || '').trim();
    const m = s.match(/([0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12})/);
    return (m ? m[1] : s).replace(/-/g, '');
  }

  const CATS = [
    { key: 'habits', emoji: '🟣', label: 'Habit Tracker', heading: '🟣 Habit Tracker',
      preview: function () {
        const habits = gs('habits_v1', []).filter(h => !h.archived);
        if (!habits.length) return null;
        const done = (gs('habit_logs_v1', {})[todayStr()] || []).length;
        return done + ' / ' + habits.length + ' done today';
      },
      build: function () {
        const habits = gs('habits_v1', []).filter(h => !h.archived);
        if (!habits.length) return [];
        const logs = gs('habit_logs_v1', {});
        const today = todayStr();
        const doneToday = logs[today] || [];
        const lines = ['\t*Pushed ' + nowTime() + '*'];
        habits.forEach(h => {
          const done = doneToday.indexOf(h.id) !== -1;
          let streak = 0, cursor = done ? today : addDays(today, -1);
          while ((logs[cursor] || []).indexOf(h.id) !== -1) { streak++; cursor = addDays(cursor, -1); }
          const streakTxt = streak >= 2 ? ' — 🔥' + streak : '';
          lines.push('\t- [' + (done ? 'x' : ' ') + '] ' + h.emoji + ' ' + esc(h.name) + streakTxt);
        });
        return lines;
      } },
    { key: 'kanban', emoji: '🔵', label: 'Kanban Board', heading: '🔵 Kanban Board',
      preview: function () {
        const tasks = gs('kanban_tasks_v2', []);
        return tasks.length ? (tasks.length + ' tasks') : null;
      },
      build: function () {
        const tasks = gs('kanban_tasks_v2', []);
        if (!tasks.length) return [];
        const SUBJ_NAME = { 'MAI-101': 'Mathematics', 'PHI-101': 'Physics', 'MAC-101': 'C++', 'CSE-101': 'DSA', 'TMI-102': 'Fine-tuning' };
        const STATUS_BG = { 'Not Started': 'gray_bg', 'In Progress': 'blue_bg', 'Done': 'green_bg', 'Submitted': 'purple_bg' };
        const order = ['Not Started', 'In Progress', 'Done', 'Submitted'];
        const sorted = tasks.slice().sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
        const rows = sorted.map(t =>
          '<tr color="' + (STATUS_BG[t.status] || 'gray_bg') + '"><td>' + esc(t.status) + '</td><td>' + esc(SUBJ_NAME[t.subject] || t.subject) + '</td><td>' + esc(t.title) + '</td><td>' + esc(t.dueStr || t.due || '') + '</td><td>' + (t.progress || 0) + '%</td></tr>'
        );
        return [
          '\t*Pushed ' + nowTime() + '*',
          '\t<table header-row="true">',
          '<tr><td>Status</td><td>Subject</td><td>Task</td><td>Due</td><td>Progress</td></tr>',
        ].concat(rows).concat(['</table>']);
      } },
    { key: 'pomodoro', emoji: '🎯', label: 'Pomodoro', heading: '🎯 Pomodoro',
      preview: function () {
        const log = gs('pomo_log_v2', []);
        const queue = gs('pomo_queue_v1', []);
        const today = new Date().toDateString();
        const done = log.filter(e => e.mode === 'focus' && new Date(e.timestamp).toDateString() === today);
        if (!done.length && !queue.length) return null;
        const min = Math.round(done.reduce((s, e) => s + e.elapsed, 0) / 60);
        return done.length + ' done · ' + min + 'm focused · ' + queue.length + ' queued';
      },
      build: function () {
        const log = gs('pomo_log_v2', []);
        const queue = gs('pomo_queue_v1', []);
        const today = new Date().toDateString();
        const done = log.filter(e => e.mode === 'focus' && new Date(e.timestamp).toDateString() === today);
        if (!done.length && !queue.length) return [];
        const min = Math.round(done.reduce((s, e) => s + e.elapsed, 0) / 60);
        const lines = ['\t*Pushed ' + nowTime() + '*', '\t**' + done.length + ' session' + (done.length === 1 ? '' : 's') + ' · ' + min + 'm focused today**'];
        done.forEach(e => lines.push('\t- ✅ ' + esc(e.task || '(no task)') + ' — ' + Math.round(e.elapsed / 60) + 'm'));
        queue.forEach(q => lines.push('\t- ⏳ ' + esc(q.name) + ' (queued)'));
        return lines;
      } },
    { key: 'english', emoji: '🟢', label: 'Language Development', heading: '🟢 Language Development',
      preview: function () {
        const v = gs('eng_vocab_v1', []), r = gs('eng_reading_v1', []), p = gs('eng_practice_v1', []);
        if (!v.length && !r.length && !p.length) return null;
        return v.length + ' words · ' + r.filter(x => x.status === 'reading').length + ' reading · ' + p.length + ' practice logs';
      },
      build: function () {
        const vocab = gs('eng_vocab_v1', []), reading = gs('eng_reading_v1', []), practice = gs('eng_practice_v1', []);
        if (!vocab.length && !reading.length && !practice.length) return [];
        const lines = ['\t*Pushed ' + nowTime() + '*'];
        if (vocab.length) {
          const mastered = vocab.filter(w => w.status === 'mastered').length;
          const learning = vocab.filter(w => w.status === 'learning').length;
          const neu = vocab.filter(w => w.status === 'new').length;
          lines.push('\t**Vocabulary:** ' + vocab.length + ' words — ' + mastered + ' mastered, ' + learning + ' learning, ' + neu + ' new');
        }
        const active = reading.filter(r => r.status === 'reading');
        if (active.length) {
          lines.push('\t**Currently reading:**');
          active.forEach(r => {
            const pct = r.pagesTotal ? Math.round((r.pagesRead || 0) / r.pagesTotal * 100) : 0;
            lines.push('\t- ' + esc(r.title) + ' — ' + (r.pagesRead || 0) + '/' + (r.pagesTotal || '?') + ' pages (' + pct + '%)');
          });
        }
        if (practice.length) {
          lines.push('\t**Recent practice:**');
          practice.slice(0, 3).forEach(p => {
            const rating = p.rating || 3;
            lines.push('\t- ' + (p.type === 'speaking' ? '🎙' : '✍️') + ' ' + esc(p.prompt || p.type) + ' — ' + '★'.repeat(rating) + '☆'.repeat(5 - rating));
          });
        }
        return lines;
      } },
    { key: 'fitlog', emoji: '💪', label: 'Fitness — Log', heading: '💪 Fitness — Log',
      preview: function () {
        const s = gs('fit_log_v1', []).filter(x => x.date === todayStr());
        return s.length ? (s.length + ' session' + (s.length === 1 ? '' : 's') + ' today') : null;
      },
      build: function () {
        const sessions = gs('fit_log_v1', []).filter(s => s.date === todayStr());
        if (!sessions.length) return [];
        const lines = ['\t*Pushed ' + nowTime() + '*'];
        sessions.forEach(s => {
          lines.push('\t**' + esc(s.name || 'Workout') + '** — ' + (s.duration || 0) + ' min');
          (s.exercises || []).forEach(ex => lines.push('\t- ' + esc(ex.name) + ': ' + esc(ex.sets || '') + '×' + esc(ex.reps || '')));
          if (s.notes) lines.push('\t_' + esc(s.notes) + '_');
        });
        return lines;
      } },
    { key: 'fitskill', emoji: '🏆', label: 'Fitness — Skills', heading: '🏆 Fitness — Skills',
      preview: function () {
        const trees = gs('fit_skill_trees_v1', []);
        return trees.length ? (trees.length + ' skill trees') : null;
      },
      build: function () {
        const trees = gs('fit_skill_trees_v1', []);
        if (!trees.length) return [];
        const skillData = gs('fit_skills_v1', {});
        const lines = ['\t*Pushed ' + nowTime() + '*'];
        trees.forEach(t => {
          const cur = skillData[t.id] != null ? skillData[t.id] : -1;
          lines.push('\t- ' + esc(t.name) + ': ' + (cur >= 0 ? esc(t.steps[cur]) : 'Not started'));
        });
        return lines;
      } },
    { key: 'fitnut', emoji: '🥤', label: 'Fitness — Nutrition', heading: '🥤 Fitness — Nutrition',
      preview: function () {
        const n = gs('fit_nutrition_v2', []).filter(x => x.date === todayStr());
        return n.length ? (n.length + ' entries today') : null;
      },
      build: function () {
        const nut = gs('fit_nutrition_v2', []).filter(n => n.date === todayStr());
        if (!nut.length) return [];
        const LABELS = { protein: 'Protein', creatine: 'Creatine', preworkout: 'Pre-workout', meal: 'Meal' };
        const lines = ['\t*Pushed ' + nowTime() + '*'];
        nut.slice().sort((a, b) => (a.time || '').localeCompare(b.time || '')).forEach(n => {
          lines.push('\t- ' + (n.time ? esc(n.time) + ' — ' : '') + (LABELS[n.type] || n.type) + (n.amount ? ' — ' + esc(n.amount) : '') + (n.notes ? ' _(' + esc(n.notes) + ')_' : ''));
        });
        return lines;
      } },
  ];

  function friendlyError(e) {
    const code = e && e.code;
    if (code === 'not_granted' || code === 'capability_disabled' || code === 'capability_removed')
      return 'Notion access isn’t available in this view.';
    if (code === 'needs_reauth') return 'Reconnect Notion in claude.ai Settings → Connectors.';
    if (code === 'server_not_connected') return 'Add Notion in claude.ai Settings → Connectors.';
    if (code === 'selection_required') return 'Choose a Notion connector for this page.';
    if (code === 'consent_required') return 'Allow Notion for this page, then try again.';
    if (code === 'blocked_by_policy' || code === 'approval_required') return 'Your workspace policy blocks this action.';
    if (code === 'tool_error') return 'Notion rejected the request' + (e.message ? ': ' + e.message : '.');
    if (code === 'server_unavailable' || code === 'upstream_error') return 'Notion is temporarily unreachable — try again.';
    return (e && e.message) || 'Something went wrong.';
  }

  function getNotion() {
    if (!window.claude || !window.claude.use) { const err = new Error('not available'); err.code = 'not_granted'; return Promise.reject(err); }
    return window.claude.use('mcp').then(mcp => {
      if (!mcp) { const err = new Error('not available'); err.code = 'not_granted'; throw err; }
      return mcp.server('Notion');
    });
  }

  function findChildPageId(notion, parentId, title) {
    return notion['notion-fetch']({ id: parentId }).then(res => {
      const text = (res && res.text) || '';
      const re = new RegExp('<page url="([^"]+)">' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</page>');
      const m = text.match(re);
      return m ? urlToId(m[1]) : null;
    });
  }

  function ensureChildPage(notion, parentId, title, icon) {
    return findChildPageId(notion, parentId, title).then(existing => {
      if (existing) return existing;
      return notion['notion-create-pages']({
        parent: { type: 'page_id', page_id: parentId },
        pages: [{ properties: { title: title }, icon: icon, content: '<empty-block/>' }],
      }).then(res => urlToId(res.pages[0].url));
    });
  }

  function pushCategory(notion, datePageId, cat) {
    const newLines = cat.build();
    if (!newLines.length) return Promise.resolve('skip');

    return notion['notion-fetch']({ id: datePageId }).then(fetched => {
      const content = (fetched && fetched.text) || '';
      const headingLine = '## ' + cat.heading + ' {toggle="true"}';
      const idx = content.indexOf(headingLine);

      if (idx === -1) {
        const block = [headingLine].concat(newLines).concat(['---']).join('\n');
        return notion['notion-update-page']({ page_id: datePageId, command: 'insert_content', position: { type: 'end' }, content: block })
          .then(() => 'created');
      }

      const lines = content.slice(idx).split('\n');
      let i = 1;
      while (i < lines.length && lines[i].indexOf('\t') === 0) i++;
      const lastChildLine = lines[i - 1];
      const oldStrShort = lastChildLine;
      const newStrShort = lastChildLine + '\n\t<empty-block/>\n' + newLines.join('\n');
      return notion['notion-update-page']({ page_id: datePageId, command: 'update_content', content_updates: [{ old_str: oldStrShort, new_str: newStrShort }] })
        .then(() => 'appended')
        .catch(() => {
          const wholeOld = lines.slice(0, i).join('\n');
          const wholeNew = wholeOld + '\n\t<empty-block/>\n' + newLines.join('\n');
          return notion['notion-update-page']({ page_id: datePageId, command: 'update_content', content_updates: [{ old_str: wholeOld, new_str: wholeNew }] })
            .then(() => 'appended');
        });
    });
  }

  const ov = $('ntn-ov');
  const mainEl = $('ntn-main');
  const settingsEl = $('ntn-settings');
  const gearBtn = $('ntn-gear');
  const hubInp = $('ntn-hub-inp');
  const hubSaveBtn = $('ntn-hub-save');
  const hubCancelBtn = $('ntn-hub-cancel');
  const hubStatus = $('ntn-hub-status');
  const listEl = $('ntn-list');
  const pushBtn = $('ntn-push-btn');
  const statusEl = $('ntn-status-line');
  let selected = {};

  function showSettings(isFirstRun) {
    mainEl.style.display = 'none';
    settingsEl.style.display = 'block';
    hubCancelBtn.style.display = isFirstRun ? 'none' : 'inline-flex';
    hubInp.value = localStorage.getItem(HUB_KEY) || '';
    hubStatus.textContent = '';
    hubStatus.className = 'ntn-status-line';
    setTimeout(() => hubInp.focus(), 50);
  }
  function showMain() {
    settingsEl.style.display = 'none';
    mainEl.style.display = 'block';
  }

  gearBtn.addEventListener('click', () => showSettings(!getHubId()));
  hubCancelBtn.addEventListener('click', showMain);
  hubSaveBtn.addEventListener('click', () => {
    const val = hubInp.value.trim();
    if (!val) {
      hubStatus.textContent = 'Paste a Notion page link or ID first.';
      hubStatus.className = 'ntn-status-line err';
      return;
    }
    const id = urlToId(val);
    if (!/^[0-9a-fA-F]{32}$/.test(id)) {
      hubStatus.textContent = 'That doesn’t look like a valid Notion page link.';
      hubStatus.className = 'ntn-status-line err';
      return;
    }
    localStorage.setItem(HUB_KEY, id);
    hubStatus.textContent = '✅ Saved.';
    hubStatus.className = 'ntn-status-line ok';
    setTimeout(() => { showMain(); renderList(); }, 400);
  });

  function renderList() {
    listEl.innerHTML = '';
    selected = {};
    CATS.forEach(cat => {
      const preview = cat.preview();
      const row = document.createElement('label');
      row.className = 'ntn-row';
      if (!preview) row.style.opacity = '.45';
      row.innerHTML =
        '<input type="checkbox" data-key="' + cat.key + '"' + (preview ? '' : ' disabled') + '>' +
        '<div style="flex:1;min-width:0">' +
        '<div class="ntn-row-label">' + cat.emoji + ' ' + cat.label + '</div>' +
        '<div class="ntn-row-sub">' + (preview || 'Nothing to push yet') + '</div>' +
        '</div>' +
        '<span class="ntn-row-status" data-status="' + cat.key + '"></span>';
      listEl.appendChild(row);
      const box = row.querySelector('input');
      box.addEventListener('change', () => {
        if (box.checked) selected[cat.key] = true; else delete selected[cat.key];
        pushBtn.disabled = Object.keys(selected).length === 0;
      });
    });
    pushBtn.disabled = true;
    statusEl.textContent = '';
    statusEl.className = 'ntn-status-line';
  }

  function openModal() {
    if (!getHubId()) { showSettings(true); }
    else { showMain(); renderList(); }
    ov.classList.add('vis');
  }
  function closeModal() { ov.classList.remove('vis'); }

  $('ntn-fab').addEventListener('click', openModal);
  $('ntn-mx').addEventListener('click', closeModal);
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });

  pushBtn.addEventListener('click', () => {
    const keys = Object.keys(selected);
    if (!keys.length) return;
    const hubId = getHubId();
    if (!hubId) { showSettings(true); return; }
    pushBtn.disabled = true;
    statusEl.className = 'ntn-status-line';
    statusEl.textContent = 'Connecting to Notion…';

    getNotion().then(notion => {
      const now = new Date();
      statusEl.textContent = 'Finding this month’s page…';
      return ensureChildPage(notion, hubId, monthTitle(now), '📆').then(monthId => {
        statusEl.textContent = 'Finding today’s page…';
        return ensureChildPage(notion, monthId, dateTitle(now), '📄');
      }).then(dateId => {
        let okCount = 0, errCount = 0;
        let chain = Promise.resolve();
        keys.forEach(key => {
          chain = chain.then(() => {
            const cat = CATS.filter(c => c.key === key)[0];
            const statusIcon = listEl.querySelector('[data-status="' + key + '"]');
            statusEl.textContent = 'Pushing ' + cat.label + '…';
            return pushCategory(notion, dateId, cat).then(result => {
              if (statusIcon) statusIcon.textContent = result === 'skip' ? '—' : '✅';
              if (result !== 'skip') okCount++;
            }).catch(e => {
              if (statusIcon) statusIcon.textContent = '❌';
              errCount++;
              statusEl.textContent = '❌ ' + cat.label + ': ' + friendlyError(e);
              statusEl.className = 'ntn-status-line err';
            });
          });
        });
        return chain.then(() => {
          if (!errCount) {
            statusEl.textContent = '✅ Pushed ' + okCount + ' section' + (okCount === 1 ? '' : 's') + ' to Notion.';
            statusEl.className = 'ntn-status-line ok';
          }
        });
      });
    }).catch(e => {
      statusEl.textContent = '❌ ' + friendlyError(e);
      statusEl.className = 'ntn-status-line err';
    }).then(() => {
      pushBtn.disabled = false;
    });
  });
})();



/* ── LOCK-IN MODE (scoped IIFE) ── */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  let lockInActive = false;

  const overlay = document.createElement('div');
  overlay.className = 'lockin-overlay';
  overlay.id = 'lockin-overlay';
  document.body.appendChild(overlay);

  const banner = document.createElement('div');
  banner.className = 'lockin-banner';
  banner.id = 'lockin-banner';
  banner.innerHTML =
    '<span class="lockin-banner-text">🔒 Lock-in mode — focus on your tasks and WORK.</span>' +
    '<button class="lockin-exit-btn" id="lockin-exit-btn">Exit</button>';
  document.body.appendChild(banner);

  const pomoSection = $('pomo-section');
  const triggerBtn = $('lockin-btn');
  const exitBtn = $('lockin-exit-btn');

  function enterLockIn() {
    lockInActive = true;
    overlay.classList.add('vis');
    banner.classList.add('vis');
    if (pomoSection) pomoSection.classList.add('lockin-focus');
  }
  function exitLockIn() {
    lockInActive = false;
    overlay.classList.remove('vis');
    banner.classList.remove('vis');
    if (pomoSection) pomoSection.classList.remove('lockin-focus');
  }

  if (triggerBtn) triggerBtn.addEventListener('click', enterLockIn);
  exitBtn.addEventListener('click', exitLockIn);

  /* Only ever reacts to bare Escape — every other key (including every
     Ctrl/Cmd combo, Tab, Space, F5, F11) passes through completely untouched
     so native shortcuts and the Pomodoro's own Space-to-start keep working. */
  document.addEventListener('keydown', e => {
    if (!lockInActive) return;
    if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      exitLockIn();
    }
  });
})();



(function () {
  'use strict';
  const ov  = document.getElementById('bp-ov');
  const btn = document.getElementById('bp-open-btn');
  const cls = document.getElementById('bp-close');
  if (!ov || !btn || !cls) return;
  btn.addEventListener('click', () => ov.classList.add('vis'));
  cls.addEventListener('click', () => ov.classList.remove('vis'));
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('vis'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('vis')) ov.classList.remove('vis');
  });
})();



(function () {
  'use strict';
  const ov  = document.getElementById('cal-ov');
  const btn = document.getElementById('cal-open-btn');
  const cls = document.getElementById('cal-close');
  if (!ov || !btn || !cls) return;

  let built = false;

  const LEGEND = [
    { bg:'#312e81', bd:'#6366f1', lbl:'Sleep' },
    { bg:'#1e3a5f', bd:'#3b82f6', lbl:'Classes' },
    { bg:'#14532d', bd:'#22d3a0', lbl:'Academics' },
    { bg:'#4c1d95', bd:'#8b5cf6', lbl:'Life OS' },
    { bg:'#7c2d12', bd:'#f97316', lbl:'Training' },
    { bg:'#1c1917', bd:'#78716c', lbl:'Meals/Shake' },
    { bg:'#134e4a', bd:'#14b8a6', lbl:'Weekly Review' },
    { bg:'#1a1a2e', bd:'#475569', lbl:'Flex/Buffer' },
  ];

  const START_H = 5.5, END_H = 25;
  const TOTAL_MIN = (END_H - START_H) * 60;
  const PPM = 1.25;
  const TOTAL_H = TOTAL_MIN * PPM;

  function toY(h, m) { return Math.round((h * 60 + m - START_H * 60) * PPM); }
  function spanH(sh, sm, eh, em) { return Math.round(((eh*60+em)-(sh*60+sm))*PPM); }
  function blk(type, label, sh, sm, eh, em, extra) { return {type,label,sh,sm,eh,em,extra:extra||''}; }

  const SCHED = [
    { id:'mon', nm:'MON', lb:'Morning-heavy',
      blocks:[blk('sleep','SLEEP \u2190',0,0,7,0,'\u2192 11:45PM prev'),blk('acad','ACADEMIC',8,0,13,30,'5.5h'),blk('meal','Lunch',13,30,14,0,''),blk('class','CLASSES',14,0,17,0,'3h'),blk('meal','Shake',17,45,18,0,'protein'),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('free','Buffer',19,30,21,30,''),blk('lifeos','LIFE OS',21,30,23,0,'1.5h'),blk('free','Wind-down',23,0,23,45,''),blk('sleep','SLEEP',23,45,25,0,'\u2192 7AM \u00b7 7h15m')] },
    { id:'tue', nm:'TUE', lb:'6AM start',
      blocks:[blk('sleep','SLEEP \u2190',0,0,6,0,'\u2192 11PM prev'),blk('class','CLASS',8,0,9,0,'1h'),blk('acad','ACADEMIC',9,0,13,30,'4.5h'),blk('meal','Lunch',13,30,14,0,''),blk('class','CLASSES',14,0,17,0,'3h'),blk('meal','Shake',17,45,18,0,'protein'),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('free','Light Review',19,30,23,0,'no Life OS'),blk('sleep','SLEEP',23,0,25,0,'\u2192 6AM \u00b7 7h')] },
    { id:'wed', nm:'WED', lb:'Morning-heavy',
      blocks:[blk('sleep','SLEEP \u2190',0,0,7,0,'\u2192 11:45PM prev'),blk('acad','ACADEMIC',8,0,10,45,'2.75h'),blk('class','CLASS',11,0,13,0,'2h'),blk('meal','Lunch',13,0,14,0,''),blk('class','CLASS',14,0,16,30,'2.5h'),blk('meal','Shake',17,30,17,45,'protein'),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('free','Buffer',19,30,21,30,''),blk('lifeos','LIFE OS',21,30,23,0,'1.5h'),blk('free','Wind-down',23,0,23,45,''),blk('sleep','SLEEP',23,45,25,0,'\u2192 7AM \u00b7 7h15m')] },
    { id:'thu', nm:'THU', lb:'\u26a0 HIGH LOAD',
      blocks:[blk('sleep','SLEEP \u2190',0,0,6,0,'\u2192 11PM prev'),blk('class','CLASS 1',8,0,9,0,''),blk('flex','Gap',9,0,10,0,''),blk('class','CLASS 2',10,0,13,0,'3h'),blk('meal','Lunch',13,0,14,0,''),blk('class','CLASS 3',14,0,18,0,'4h \u00b7 Thu longest'),blk('meal','Shake',17,45,18,0,''),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('free','LIGHT REVIEW ONLY',19,30,23,0,'no Life OS'),blk('sleep','SLEEP',23,0,25,0,'\u2192 6AM \u00b7 7h')] },
    { id:'fri', nm:'FRI', lb:'Morning-heavy',
      blocks:[blk('sleep','SLEEP \u2190',0,0,7,0,'\u2192 11:45PM prev'),blk('acad','ACADEMIC',8,0,13,30,'5.5h'),blk('meal','Shake 10:30AM',10,30,10,45,'early'),blk('meal','Lunch',13,30,14,0,''),blk('class','CLASSES',14,0,18,0,'4h ends 6PM'),blk('flex','Rest',18,0,18,15,'15-20min'),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('lifeos','LIFE OS',19,30,23,0,'~3.5h'),blk('free','Wind-down',23,0,23,45,''),blk('sleep','SLEEP',23,45,25,0,'\u2192 7AM \u00b7 7h15m')] },
    { id:'sat', nm:'SAT', lb:'Power Day',
      blocks:[blk('sleep','SLEEP \u2190',0,0,7,0,'\u2192 11:45PM prev'),blk('acad','ACADEMIC',8,0,13,30,'5.5h'),blk('meal','Lunch',13,30,14,0,''),blk('flex','Transition',14,0,14,30,''),blk('lifeos','LIFE OS',14,30,18,0,'3.5h'),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('lifeos','LIFE OS',20,30,22,30,'2h evening'),blk('free','Wind-down',22,30,23,45,''),blk('sleep','SLEEP',23,45,25,0,'\u2192 7AM \u00b7 7h15m')] },
    { id:'sun', nm:'SUN', lb:'Review Day',
      blocks:[blk('sleep','SLEEP \u2190',0,0,7,0,'\u2192 11:45PM prev'),blk('acad','ACADEMIC',8,0,13,30,'5.5h'),blk('meal','Lunch',13,30,14,0,''),blk('flex','Flex Block',14,30,18,0,'overflow/admin'),blk('train','TRAINING',18,30,19,30,'6:30PM'),blk('flex','Buffer',19,30,21,0,''),blk('review','WEEKLY REVIEW',21,0,22,0,'\ud83d\udd12 9\u201310PM'),blk('free','Wind-down',22,0,23,45,''),blk('sleep','SLEEP',23,45,25,0,'\u2192 7AM \u00b7 7h15m')] },
  ];

  const STATS = [
    {acad:'5.5h',los:'1.5h',trn:'1h',slp:'7h15m',load:'HIGH',   col:'#00d9ff'},
    {acad:'4.5h',los:'\u2014',   trn:'1h',slp:'7h',    load:'MED',    col:'#8b5cf6'},
    {acad:'2.75h',los:'1.5h',trn:'1h',slp:'7h15m',load:'HIGH',  col:'#00d9ff'},
    {acad:'~0.5h',los:'\u2014',  trn:'1h',slp:'7h',    load:'\u26a0 MAX', col:'#ef4444'},
    {acad:'5.5h',los:'3.5h',trn:'1h',slp:'7h15m',load:'HIGH',   col:'#00d9ff'},
    {acad:'5.5h',los:'5.5h',trn:'1h',slp:'7h15m',load:'MAX',    col:'#22d3a0'},
    {acad:'5.5h',los:'2.5h',trn:'1h',slp:'7h15m',load:'MAX',    col:'#fbbf24'},
  ];

  function buildCalendar() {
    /* Legend */
    const leg = document.getElementById('cal-legend');
    if (leg) leg.innerHTML = LEGEND.map(l =>
      `<div class="leg-item"><div class="leg-dot" style="background:${l.bg};border:1px solid ${l.bd}"></div>${l.lbl}</div>`
    ).join('');

    const grid = document.getElementById('cal-grid');
    const statsEl = document.getElementById('cal-stats');
    if (!grid || !statsEl) return;

    /* Time header cell */
    const th = document.createElement('div');
    th.className = 'day-hdr';
    th.style.background = 'rgba(255,255,255,.03)';
    grid.appendChild(th);

    /* Day headers */
    SCHED.forEach(d => {
      const el = document.createElement('div');
      el.className = `day-hdr c-${d.id}`;
      el.innerHTML = `<div class="day-nm">${d.nm}</div><div class="day-lb">${d.lb}</div>`;
      grid.appendChild(el);
    });

    /* Time column */
    const tcol = document.createElement('div');
    tcol.className = 'tcol';
    tcol.style.height = `${TOTAL_H}px`;
    for (let h = 6; h <= 24; h++) {
      const y = toY(h, 0);
      if (y < 0 || y > TOTAL_H) continue;
      const lbl = h < 12 ? `${h}AM` : h === 12 ? '12PM' : h < 24 ? `${h-12}PM` : '12AM';
      const el = document.createElement('div');
      el.className = 'tlabel';
      el.style.top = `${y}px`;
      el.textContent = lbl;
      tcol.appendChild(el);
    }
    grid.appendChild(tcol);

    /* Day columns */
    SCHED.forEach(d => {
      const col = document.createElement('div');
      col.className = 'dcol';
      col.style.height = `${TOTAL_H}px`;
      /* Grid lines */
      for (let h = 6; h <= 24; h++) {
        const y = toY(h, 0);
        if (y < 0 || y > TOTAL_H) continue;
        const gl = document.createElement('div');
        gl.className = 'gline';
        gl.style.top = `${y}px`;
        col.appendChild(gl);
        const y2 = toY(h, 30);
        if (y2 > 0 && y2 < TOTAL_H) {
          const gl2 = document.createElement('div');
          gl2.className = 'gline half';
          gl2.style.top = `${y2}px`;
          col.appendChild(gl2);
        }
      }
      /* Blocks */
      d.blocks.forEach(b => {
        let topY = toY(b.sh, b.sm);
        let ht = spanH(b.sh, b.sm, b.eh, b.em);
        /* Clip blocks that start before the visible window (e.g. "SLEEP <-"
           segments running from midnight) instead of letting them render
           with a negative top and get cut off above the grid. */
        if (topY < 0) { ht += topY; topY = 0; }
        if (topY + ht > TOTAL_H) ht = TOTAL_H - topY;
        if (ht < 2) return;
        const el = document.createElement('div');
        el.className = `blk ${b.type}`;
        el.style.cssText = `top:${topY}px;height:${ht}px`;
        const ts = `${String(b.sh%24).padStart(2,'0')}:${String(b.sm).padStart(2,'0')}\u2013${String(b.eh%24).padStart(2,'0')}:${String(b.em).padStart(2,'0')}`;
        el.innerHTML = `<div class="blk-label">${b.label}</div>${ht > 22 ? `<div class="blk-time">${ts}${b.extra ? ' \u00b7 '+b.extra : ''}</div>` : ''}`;
        el.title = `${b.label}\n${ts}${b.extra ? '\n'+b.extra : ''}`;
        col.appendChild(el);
      });
      grid.appendChild(col);
    });

    /* Stats strip */
    STATS.forEach(s => {
      const cell = document.createElement('div');
      cell.className = 'stat-cell';
      cell.innerHTML = `
        <div class="stat-row"><span class="stat-k">Acad</span><span class="stat-v" style="color:#22d3a0">${s.acad}</span></div>
        <div class="stat-row"><span class="stat-k">Life OS</span><span class="stat-v" style="color:#8b5cf6">${s.los}</span></div>
        <div class="stat-row"><span class="stat-k">Train</span><span class="stat-v" style="color:#f97316">${s.trn}</span></div>
        <div class="stat-row"><span class="stat-k">Sleep</span><span class="stat-v" style="color:#a5b4fc">${s.slp}</span></div>
        <div class="stat-row"><span class="stat-k">Load</span><span class="stat-v" style="color:${s.col}">${s.load}</span></div>
      `;
      statsEl.appendChild(cell);
    });
  }

  btn.addEventListener('click', () => {
    ov.classList.add('vis');
    if (!built) { buildCalendar(); built = true; }
  });
  cls.addEventListener('click', () => ov.classList.remove('vis'));
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('vis'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && ov.classList.contains('vis')) ov.classList.remove('vis');
  });
})();



(function () {
  'use strict';

  function gs(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function ss(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  const WT_KEY   = 'wt_data_v1';
  const WT_RESET = 'wt_last_reset_v1';

  const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
  const DAY_META = {
    mon: { label:'Monday',    sub:'Day 1',            wake:'7:00 AM', sleep:'11:45 PM', block:'Morning block: 5.5h' },
    tue: { label:'Tuesday',   sub:'Day 2 \u00b7 6AM wake', wake:'6:00 AM', sleep:'11:00 PM', block:'Morning block: 4.5h (post 8\u20139 class)' },
    wed: { label:'Wednesday', sub:'Day 3',            wake:'7:00 AM', sleep:'11:45 PM', block:'Morning block: 2.75h' },
    thu: { label:'Thursday',  sub:'Day 4 \u26a1 HIGH',    wake:'6:00 AM', sleep:'11:00 PM', block:'High load \u2014 classes 8\u20136PM' },
    fri: { label:'Friday',    sub:'Day 5',            wake:'7:00 AM', sleep:'11:45 PM', block:'Morning block: 5.5h' },
    sat: { label:'Saturday',  sub:'Weekend \ud83d\udd25',       wake:'7:00 AM', sleep:'11:45 PM', block:'Deep work: 8+ focused hours' },
    sun: { label:'Sunday',    sub:'Weekend \ud83d\udd25',       wake:'7:00 AM', sleep:'11:45 PM', block:'Deep work + Weekly Review 9PM' }
  };
  const ANCHORS = {
    mon:['Wake 7:00','Morning Pages','Cold shower','Training','Study block 9\u201312','Study block 2\u20135','Night review 11PM'],
    tue:['Wake 6:00','Morning Pages','Cold shower','Training','Class 8\u20139','Study block 10\u201312','Study block 2\u20135','Night review 11PM'],
    wed:['Wake 7:00','Morning Pages','Cold shower','Training','Class 12\u20131','Study block 2\u20135','Night review 11PM'],
    thu:['Wake 6:00','Morning Pages','Cold shower','Training','Classes 8AM\u20136PM','Night review 11PM'],
    fri:['Wake 7:00','Morning Pages','Cold shower','Training','Study block 9\u201312','Study block 2\u20135','Night review 11PM'],
    sat:['Wake 7:00','Morning Pages','Cold shower','Training','Deep work 9\u20131','Deep work 2\u20136','Evening wind-down'],
    sun:['Wake 7:00','Morning Pages','Cold shower','Training','Deep work 9\u20131','Deep work 2\u20135','Weekly Review 9PM']
  };
  const CHECKS = [
    { id:'academic', label:'Academic Tasks', color:'#00d9ff' },
    { id:'life_os',  label:'Life OS Tasks',  color:'#f97316' },
    { id:'training', label:'Training',       color:'#22d3a0' },
    { id:'personal', label:'Personal',       color:'#a78bfa' }
  ];
  const SCORE_CELLS = [
    { id:'sleep',    emoji:'\ud83d\ude34', label:'Sleep'    },
    { id:'classes',  emoji:'\ud83c\udfdb\ufe0f', label:'Classes'  },
    { id:'academic', emoji:'\ud83d\udcda', label:'Academics'},
    { id:'life_os',  emoji:'\u2699\ufe0f', label:'Life OS'  },
    { id:'training', emoji:'\ud83c\udfcb\ufe0f', label:'Training' }
  ];
  const SCORE_CYCLE = ['\u2013','\u2713','~','\u2717'];
  const SCORE_CLS   = ['','sc-g','sc-y','sc-r'];

  const SNAP_CHIPS = DAYS.map(d => {
    const m = DAY_META[d];
    return `<div class="wt-snap-chip" id="wt-snap-${d}" data-day="${d}" title="${m.label}: click to jump">
      <span class="wt-snap-day">${d.toUpperCase()}</span>
      <span class="wt-snap-score" id="wt-snap-score-${d}">\u2013/5</span>
    </div>`;
  }).join('');

  function getData() {
    const d = gs(WT_KEY) || {};
    DAYS.forEach(day => {
      if (!d[day]) d[day] = {};
      if (!d[day].anchors) d[day].anchors = {};
      if (!d[day].checks)  d[day].checks  = {};
      if (!d[day].scores)  d[day].scores  = {};
      if (!d[day].notes)   d[day].notes   = '';
      CHECKS.forEach(c => { if (!d[day].checks[c.id]) d[day].checks[c.id] = []; });
    });
    if (!d.priorities) d.priorities = { acad:'', life:'', fit:'', win:'' };
    return d;
  }
  function saveData(d) { ss(WT_KEY, d); }

  function renderDay(day) {
    const page = document.getElementById(`wt-page-${day}`);
    if (!page) return;
    if (page.dataset.rendered) { restoreDay(day); return; }
    page.dataset.rendered = '1';
    const m = DAY_META[day];
    const dd = getData()[day];
    let html = `<div class="wt-card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
        <div><div style="font-size:18px;font-weight:800;color:var(--t1)">${m.label}</div>
          <div style="font-size:12px;color:var(--t3);margin-top:2px">${m.sub} \u00b7 ${m.block}</div></div>
        <div style="text-align:right;font-size:12px;color:var(--t3)">
          <div>Wake <span style="color:var(--t2)">${m.wake}</span></div>
          <div>Sleep <span style="color:var(--t2)">${m.sleep}</span></div>
        </div>
      </div>
      <div class="wt-card-title">Fixed Anchors</div>
      <div class="wt-check-list" id="wt-anchors-${day}">`;
    (ANCHORS[day]||[]).forEach((a,i) => {
      html += `<label class="wt-check-row"><input type="checkbox" class="wt-anchor-cb" data-day="${day}" data-idx="${i}" ${dd.anchors[i]?'checked':''}><span class="wt-check-label">${a}</span></label>`;
    });
    html += `</div></div>`;
    CHECKS.forEach(c => {
      const items = dd.checks[c.id]||[];
      html += `<div class="wt-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="wt-card-title" style="color:${c.color};margin-bottom:0">${c.label}</div>
          <button class="wt-add-btn" data-day="${day}" data-group="${c.id}" style="border-color:${c.color}40;color:${c.color}">+ Add</button>
        </div>
        <div class="wt-check-list" id="wt-checks-${day}-${c.id}">`;
      items.forEach((item,i) => {
        html += `<label class="wt-check-row"><input type="checkbox" class="wt-dyn-cb" data-day="${day}" data-group="${c.id}" data-idx="${i}" ${item.done?'checked':''}><span class="wt-check-label">${item.text}</span><button class="wt-del-btn" data-day="${day}" data-group="${c.id}" data-idx="${i}">\u00d7</button></label>`;
      });
      html += `</div></div>`;
    });
    html += `<div class="wt-card"><div class="wt-card-title">Notes &amp; Reflections</div>
      <textarea class="wt-notes-ta" id="wt-notes-${day}" rows="4" placeholder="What happened today? Wins, struggles, lessons\u2026">${dd.notes||''}</textarea></div>`;
    html += `<div class="wt-card"><div class="wt-card-title">Daily Score</div>
      <div class="wt-score-grid" id="wt-scores-${day}">`;
    SCORE_CELLS.forEach(sc => {
      const cur = dd.scores[sc.id]||0;
      html += `<div class="wt-score-cell ${SCORE_CLS[cur]}" data-day="${day}" data-sc="${sc.id}" data-val="${cur}">
        <div class="wt-sc-emoji">${sc.emoji}</div><div class="wt-sc-label">${sc.label}</div><div class="wt-sval">${SCORE_CYCLE[cur]}</div></div>`;
    });
    html += `</div></div>`;
    page.innerHTML = html;
    page.querySelectorAll('.wt-anchor-cb').forEach(cb => {
      cb.addEventListener('change', () => { const d2=getData(); d2[cb.dataset.day].anchors[cb.dataset.idx]=cb.checked; saveData(d2); updateSnap(); });
    });
    page.querySelectorAll('.wt-dyn-cb').forEach(cb => {
      cb.addEventListener('change', () => { const d2=getData(); d2[cb.dataset.day].checks[cb.dataset.group][cb.dataset.idx].done=cb.checked; saveData(d2); updateSnap(); });
    });
    page.querySelectorAll('.wt-del-btn').forEach(b2 => {
      b2.addEventListener('click', () => { const d2=getData(); d2[b2.dataset.day].checks[b2.dataset.group].splice(+b2.dataset.idx,1); saveData(d2); page.dataset.rendered=''; renderDay(day); });
    });
    page.querySelectorAll('.wt-add-btn').forEach(b2 => {
      b2.addEventListener('click', () => { const t=prompt('Task:'); if(!t||!t.trim())return; const d2=getData(); d2[b2.dataset.day].checks[b2.dataset.group].push({text:t.trim(),done:false}); saveData(d2); page.dataset.rendered=''; renderDay(day); });
    });
    const notesTa = page.querySelector(`#wt-notes-${day}`);
    if (notesTa) notesTa.addEventListener('input', () => { const d2=getData(); d2[day].notes=notesTa.value; saveData(d2); });
    page.querySelectorAll('.wt-score-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const d2=getData(); const cur=+cell.dataset.val; const nxt=(cur+1)%SCORE_CYCLE.length;
        d2[cell.dataset.day].scores[cell.dataset.sc]=nxt; saveData(d2);
        cell.dataset.val=nxt; cell.className=`wt-score-cell ${SCORE_CLS[nxt]}`; cell.querySelector('.wt-sval').textContent=SCORE_CYCLE[nxt]; updateSnap();
      });
    });
  }

  function restoreDay(day) {
    const dd = getData()[day];
    document.querySelectorAll(`.wt-anchor-cb[data-day="${day}"]`).forEach(cb => { cb.checked=!!dd.anchors[cb.dataset.idx]; });
    document.querySelectorAll(`.wt-dyn-cb[data-day="${day}"]`).forEach(cb => { const item=(dd.checks[cb.dataset.group]||[])[cb.dataset.idx]; if(item)cb.checked=item.done; });
    const nt = document.getElementById(`wt-notes-${day}`); if(nt)nt.value=dd.notes||'';
    document.querySelectorAll(`.wt-score-cell[data-day="${day}"]`).forEach(cell => {
      const v=dd.scores[cell.dataset.sc]||0; cell.dataset.val=v; cell.className=`wt-score-cell ${SCORE_CLS[v]}`; cell.querySelector('.wt-sval').textContent=SCORE_CYCLE[v];
    });
  }

  function renderOverviewSnap() {
    const snap = document.getElementById('wt-snap');
    if (!snap) return;
    snap.innerHTML = `<div class="wt-snap-row">${SNAP_CHIPS}</div>`;
    snap.querySelectorAll('.wt-snap-chip').forEach(chip => { chip.addEventListener('click', () => switchTab(chip.dataset.day)); });
    updateSnap();
  }
  function updateSnap() {
    const data = getData();
    DAYS.forEach(day => {
      const sc = document.getElementById(`wt-snap-score-${day}`); if(!sc)return;
      const done = Object.values(data[day].scores||{}).filter(v=>v===1).length;
      sc.textContent = `${done}/5`;
      const chip = document.getElementById(`wt-snap-${day}`);
      if(chip) chip.style.borderColor = done===5?'#22d3a0':done>=3?'#f97316':'var(--gb)';
    });
  }

  function switchTab(id) {
    document.querySelectorAll('.wt-tab').forEach(t => t.classList.toggle('on', t.dataset.wt===id));
    document.querySelectorAll('.wt-page').forEach(p => p.classList.toggle('on', p.id===`wt-page-${id}`));
    if (id !== 'overview') renderDay(id); else renderOverviewSnap();
  }
  function initTabs() {
    document.querySelectorAll('.wt-tab').forEach(tab => { tab.addEventListener('click', () => switchTab(tab.dataset.wt)); });
  }
  function initPriorities() {
    const data = getData();
    const map = {'wt-pri-acad':'acad','wt-pri-life':'life','wt-pri-fit':'fit','wt-pri-win':'win'};
    Object.entries(map).forEach(([id,key]) => {
      const el = document.getElementById(id); if(!el)return;
      el.value = data.priorities[key]||'';
      el.addEventListener('input', () => { const d2=getData(); d2.priorities[key]=el.value; saveData(d2); });
    });
  }
  function getThisMonday() {
    const now=new Date(); const day=now.getDay(); const diff=(day===0?-6:1-day);
    const mon=new Date(now); mon.setDate(now.getDate()+diff); return mon.toDateString();
  }
  function checkMondayReset() {
    if (new Date().getDay()!==1) return;
    if (gs(WT_RESET)===getThisMonday()) return;
    const ov=document.getElementById('wt-reset-ov'); if(ov)ov.classList.add('vis');
  }
  function doReset() {
    ss(WT_KEY, null); ss(WT_RESET, getThisMonday());
    document.querySelectorAll('.wt-page').forEach(p => { delete p.dataset.rendered; });
    renderOverviewSnap(); initPriorities();
  }
  function buildNotionContent() {
    const data=getData(); const week=getThisMonday();
    let txt=`# Weekly Tracker \u2014 ${week}\n\n**Priorities**\n- Academic: ${data.priorities.acad||'\u2014'}\n- Life OS: ${data.priorities.life||'\u2014'}\n- Training: ${data.priorities.fit||'\u2014'}\n- Win Condition: ${data.priorities.win||'\u2014'}\n\n`;
    DAYS.forEach(day => {
      const dd=data[day]; const m=DAY_META[day];
      const scores=SCORE_CELLS.map(sc=>`${sc.emoji}${SCORE_CYCLE[dd.scores[sc.id]||0]}`).join(' ');
      txt+=`## ${m.label}\nScores: ${scores}\n`; if(dd.notes)txt+=`Notes: ${dd.notes}\n`; txt+='\n';
    });
    return txt;
  }
  async function pushAndReset() {
    try {
      const content=buildNotionContent();
      if (window.claude && window.claude.use) {
        const mcp=await window.claude.use('mcp');
        if (mcp) {
          const notion=await mcp.server('Notion');
          const hubId=localStorage.getItem('notion_hub_id_v1');
          if (notion && hubId) {
            await notion['notion-create-pages']({
              parent:{type:'page_id',page_id:hubId},
              pages:[{properties:{title:`Weekly Tracker \u2014 ${getThisMonday()}`},icon:'\ud83d\uddd3\ufe0f',content}]
            });
          }
        }
      }
    } catch(err) { console.warn('Notion push failed:',err); }
    doReset();
  }
  function initResetModal() {
    const btnPush=document.getElementById('wt-push-reset');
    const btnReset=document.getElementById('wt-just-reset');
    const btnKeep=document.getElementById('wt-keep');
    const hideReset=()=>{ const o=document.getElementById('wt-reset-ov'); if(o)o.classList.remove('vis'); };
    if(btnPush)  btnPush.addEventListener('click',  ()=>{ hideReset(); pushAndReset(); });
    if(btnReset) btnReset.addEventListener('click', ()=>{ hideReset(); doReset(); });
    if(btnKeep)  btnKeep.addEventListener('click',  ()=>{ hideReset(); ss(WT_RESET,getThisMonday()); });
  }

  /* Dynamic CSS for day-page elements */
  const dynStyle = document.createElement('style');
  dynStyle.textContent = `
    .wt-page{display:none}.wt-page.on{display:block}
    .wt-card{background:var(--g1);border:1px solid var(--gb);border-radius:12px;padding:20px;margin-bottom:16px}
    .wt-card-title{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:var(--t3);font-weight:700;margin-bottom:12px}
    .wt-check-list{display:flex;flex-direction:column;gap:6px}
    .wt-check-row{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:6px;cursor:pointer}
    .wt-check-row:hover{background:var(--g2)}
    .wt-check-row input[type=checkbox]{width:16px;height:16px;accent-color:var(--accent);flex-shrink:0;cursor:pointer}
    .wt-check-label{flex:1;font-size:13px;color:var(--t2)}
    .wt-check-row input:checked+.wt-check-label{text-decoration:line-through;color:var(--t3)}
    .wt-del-btn{background:none;border:none;color:var(--t3);font-size:16px;cursor:pointer;padding:0 4px;opacity:0;transition:opacity .15s}
    .wt-check-row:hover .wt-del-btn{opacity:1}
    .wt-add-btn{background:none;border:1px solid var(--gb);border-radius:6px;color:var(--t3);font-size:12px;padding:4px 10px;cursor:pointer;transition:all .15s}
    .wt-add-btn:hover{background:var(--g2)}
    .wt-notes-ta{width:100%;background:var(--g1);border:1px solid var(--gb);border-radius:8px;color:var(--t1);font-family:var(--sans);font-size:13px;padding:10px 12px;resize:vertical;box-sizing:border-box}
    .wt-score-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
    .wt-score-cell{background:var(--g1);border:1px solid var(--gb);border-radius:10px;padding:12px 6px;text-align:center;cursor:pointer;transition:all .15s;user-select:none}
    .wt-score-cell:hover{background:var(--g2)}
    .wt-sc-emoji{font-size:20px}.wt-sc-label{font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin:4px 0 2px}
    .wt-sval{font-size:16px;font-weight:700;color:var(--t2)}
    .wt-score-cell.sc-g .wt-sval{color:#22d3a0}.wt-score-cell.sc-y .wt-sval{color:#eab308}.wt-score-cell.sc-r .wt-sval{color:#ef4444}
    .wt-snap-row{display:flex;gap:8px;flex-wrap:wrap}
    .wt-snap-chip{flex:1;min-width:80px;background:var(--g1);border:1px solid var(--gb);border-radius:10px;padding:12px 8px;text-align:center;cursor:pointer;transition:all .15s}
    .wt-snap-chip:hover{background:var(--g2)}
    .wt-snap-day{display:block;font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:1px}
    .wt-snap-score{display:block;font-size:16px;font-weight:800;color:var(--t1);margin-top:4px}
    .wt-ov-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    @media(max-width:540px){.wt-score-grid{grid-template-columns:repeat(3,1fr)}.wt-ov-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(dynStyle);

  initTabs();
  initPriorities();
  renderOverviewSnap();
  initResetModal();
  checkMondayReset();
})();

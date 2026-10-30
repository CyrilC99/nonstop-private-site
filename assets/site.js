/* NONSTOP PRIVATE — site scripts */
(function () {
  /* ---------- Mobile menu ---------- */
  window.npMenu = function (open) {
    var m = document.getElementById('np-menu');
    if (!m) return;
    if (open) { m.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; }
    else { m.setAttribute('hidden', ''); document.body.style.overflow = ''; }
    document.querySelectorAll('.np-burger').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { npMenu(false); closeAllPickers(); } });

  /* ---------- Two-choice toggles (Villa / Hotel, Driver / Security) ---------- */
  var ON = 'background: #CDB07A; color: #000000; border: 1px solid #CDB07A';
  var OFF = 'background: transparent; color: #EDEAE4; border: 1px solid #5A5853';
  document.querySelectorAll('[data-np-toggle]').forEach(function (group) {
    var input = group.querySelector('input[type=hidden]');
    var btns = group.querySelectorAll('button[data-value]');
    function select(v) {
      btns.forEach(function (b) {
        var on = b.getAttribute('data-value') === v;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.cssText = b.getAttribute('data-base') + (on ? ON : OFF);
      });
      if (input) input.value = v || '';
      var scope = group.closest('form') || document;
      scope.querySelectorAll('[data-kind]').forEach(function (el) {
        if (el.getAttribute('data-kind') === v) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
        el.querySelectorAll('input, textarea').forEach(function (i) { i.disabled = el.hasAttribute('hidden'); });
      });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { select(b.getAttribute('data-value')); }); });
    select(group.getAttribute('data-default') || null);
  });

  /* ---------- Date picker ---------- */
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var MS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function key(y, m, d) { return y * 10000 + (m + 1) * 100 + d; }
  function fmt(k, withYear) { if (k == null) return ''; var y = Math.floor(k / 10000), m = Math.floor(k / 100) % 100, d = k % 100; return d + ' ' + MS[m - 1] + (withYear ? ' ' + y : ''); }
  function todayKey() { var n = new Date(); return key(n.getFullYear(), n.getMonth(), n.getDate()); }
  var pickers = [];
  function closeAllPickers(except) { pickers.forEach(function (p) { if (p !== except) p.close(); }); }
  window.closeAllPickers = closeAllPickers;

  function Picker(root) {
    var self = this, mode = root.getAttribute('data-mode') || 'range', ph = root.getAttribute('data-placeholder') || 'Select your dates';
    var s = { start: null, end: null, time: null, open: false, vy: new Date().getFullYear(), vm: new Date().getMonth() };
    root.style.position = 'relative';
    root.innerHTML = '';
    var hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = root.getAttribute('data-name') || 'Dates'; root.appendChild(hidden);
    var field = document.createElement('button'); field.type = 'button'; field.className = 'np-field'; field.setAttribute('aria-haspopup', 'dialog');
    var label = document.createElement('span'); label.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap';
    field.appendChild(label);
    field.insertAdjacentHTML('beforeend', '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CDB07A" stroke-width="1.5" stroke-linecap="round" style="flex: 0 0 auto"><rect x="3.5" y="5" width="17" height="15.5" rx="1"></rect><path d="M3.5 9.5h17M8 3v4M16 3v4"></path></svg>');
    root.appendChild(field);
    var pop = document.createElement('div'); pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', mode === 'range' ? 'Choose your dates' : 'Choose a date');
    pop.style.cssText = 'position: absolute; top: calc(100% + 10px); left: 0; z-index: 60; width: 360px; max-width: 86vw; box-sizing: border-box; background: #0E0D0B; border: 1px solid #3A3936; box-shadow: 0 24px 60px rgba(0,0,0,.65); padding: 20px; display: none; flex-direction: column; gap: 14px; font-family: Cinzel, serif; color: #FFFFFF';
    root.appendChild(pop);
    field.addEventListener('click', function (e) { e.stopPropagation(); if (s.open) self.close(); else { closeAllPickers(self); if (s.start != null) { s.vy = Math.floor(s.start / 10000); s.vm = Math.floor(s.start / 100) % 100 - 1; } s.open = true; render(); } });
    pop.addEventListener('click', function (e) { e.stopPropagation(); });
    this.close = function () { if (s.open) { s.open = false; render(); } };
    function navBtn(txt, aria, disabled, fn) { var b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.setAttribute('aria-label', aria); b.disabled = disabled; b.style.cssText = 'width: 44px; height: 44px; background: transparent; border: none; font-family: Cinzel, serif; font-size: 24px; line-height: 1; color: ' + (disabled ? '#3A3936' : '#CDB07A') + '; cursor: ' + (disabled ? 'default' : 'pointer'); b.addEventListener('click', fn); return b; }
    function pick(k) {
      if (mode === 'date') { s.start = k; s.end = null; s.open = false; }
      else if (mode === 'datetime') { s.start = k; }
      else if (s.start == null || s.end != null || k < s.start) { s.start = k; s.end = null; }
      else if (k !== s.start) { s.end = k; s.open = false; }
      render();
    }
    function render() {
      var has = s.start != null, display;
      if (!has) display = ph;
      else if (mode === 'range') display = s.end != null ? fmt(s.start, Math.floor(s.start / 10000) !== Math.floor(s.end / 10000)) + ' to ' + fmt(s.end, true) : fmt(s.start, true) + ' to …';
      else if (mode === 'datetime') display = fmt(s.start, true) + (s.time ? '  ·  ' + s.time : '  ·  …');
      else display = fmt(s.start, true);
      label.textContent = display;
      hidden.value = has ? display : '';
      field.setAttribute('aria-expanded', s.open ? 'true' : 'false');
      field.style.cssText = 'width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: transparent; border: none; border-bottom: 1px solid ' + (s.open ? '#CDB07A' : '#5A5853') + '; padding: 12px 0; min-height: 47px; box-sizing: border-box; cursor: pointer; text-align: left; font-family: "Cormorant Garamond", Georgia, serif; font-weight: 500; font-size: 19px; letter-spacing: .01em; color: ' + (has ? '#FFFFFF' : '#8E8A82');
      pop.style.display = s.open ? 'flex' : 'none';
      if (!s.open) return;
      pop.innerHTML = '';
      var now = new Date(), today = todayKey();
      var prevDis = s.vy * 12 + s.vm <= now.getFullYear() * 12 + now.getMonth();
      var head = document.createElement('div'); head.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 8px';
      head.appendChild(navBtn('‹', 'Previous month', prevDis, function () { if (!prevDis) { var i = s.vy * 12 + s.vm - 1; s.vy = Math.floor(i / 12); s.vm = i % 12; render(); } }));
      var ml = document.createElement('span'); ml.style.cssText = 'font-size: 16px; letter-spacing: .12em; color: #CDB07A'; ml.textContent = MONTHS[s.vm] + ' ' + s.vy; head.appendChild(ml);
      head.appendChild(navBtn('›', 'Next month', false, function () { var i = s.vy * 12 + s.vm + 1; s.vy = Math.floor(i / 12); s.vm = i % 12; render(); }));
      pop.appendChild(head);
      var grid = document.createElement('div'); grid.style.cssText = 'display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px';
      ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(function (w) { var sp = document.createElement('span'); sp.textContent = w; sp.style.cssText = 'text-align: center; font-size: 11px; letter-spacing: .08em; color: #8E8A82; padding: 4px 0'; grid.appendChild(sp); });
      var offset = (new Date(s.vy, s.vm, 1).getDay() + 6) % 7, dim = new Date(s.vy, s.vm + 1, 0).getDate(), i;
      for (i = 0; i < offset; i++) grid.appendChild(document.createElement('span'));
      for (i = 1; i <= dim; i++) (function (d) {
        var k = key(s.vy, s.vm, d), dis = k < today, sel = k === s.start || k === s.end;
        var inR = mode === 'range' && s.start != null && s.end != null && k > s.start && k < s.end;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'np-day'; b.textContent = d; b.disabled = dis; b.setAttribute('aria-label', fmt(k, true)); b.setAttribute('aria-pressed', sel ? 'true' : 'false');
        var look = dis ? 'background: transparent; color: #4A4843; cursor: default' : sel ? 'background: #CDB07A; color: #000000; font-weight: 500; cursor: pointer' : inR ? 'background: rgba(205,176,122,.16); color: #FFFFFF; cursor: pointer' : k === today ? 'background: transparent; color: #CDB07A; box-shadow: inset 0 0 0 1px #CDB07A; cursor: pointer' : 'background: transparent; color: #EDEAE4; cursor: pointer';
        b.style.cssText = 'width: 100%; height: 44px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 0; padding: 0; font-family: Cinzel, serif; font-size: 14px; letter-spacing: .02em; ' + look;
        b.addEventListener('click', function () { if (!dis) pick(k); });
        grid.appendChild(b);
      })(i);
      pop.appendChild(grid);
      if (mode === 'datetime' && has) {
        var tw = document.createElement('div'); tw.style.cssText = 'display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #262522; padding-top: 14px';
        tw.innerHTML = '<span style="font-size: 12px; letter-spacing: .16em; color: #CDB07A">Time</span>';
        var tg = document.createElement('div'); tg.style.cssText = 'display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; max-height: 152px; overflow-y: auto; padding-right: 4px';
        var order = []; for (i = 16; i < 48; i++) order.push(i); for (i = 0; i < 16; i++) order.push(i);
        order.forEach(function (h2) {
          var t = (h2 < 20 ? '0' : '') + Math.floor(h2 / 2) + ':' + (h2 % 2 ? '30' : '00'), on = s.time === t;
          var b = document.createElement('button'); b.type = 'button'; b.className = 'np-day'; b.textContent = t; b.setAttribute('aria-pressed', on ? 'true' : 'false');
          b.style.cssText = 'height: 44px; border: 1px solid ' + (on ? '#CDB07A' : '#262522') + '; background: ' + (on ? '#CDB07A' : 'transparent') + '; color: ' + (on ? '#000000' : '#EDEAE4') + '; font-family: Cinzel, serif; font-size: 13px; letter-spacing: .04em; cursor: pointer; padding: 0';
          b.addEventListener('click', function () { s.time = t; s.open = false; render(); });
          tg.appendChild(b);
        });
        tw.appendChild(tg); pop.appendChild(tw);
      }
      var foot = document.createElement('div'); foot.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid #262522; padding-top: 14px';
      var clr = document.createElement('button'); clr.type = 'button'; clr.textContent = 'Clear'; clr.style.cssText = 'background: transparent; border: none; min-height: 44px; padding: 0 4px; color: #8E8A82; font-family: Cinzel, serif; font-size: 13px; letter-spacing: .12em; cursor: pointer';
      clr.addEventListener('click', function () { s.start = s.end = s.time = null; render(); });
      var done = document.createElement('button'); done.type = 'button'; done.textContent = 'Done'; done.style.cssText = 'background: #CDB07A; border: none; min-height: 44px; padding: 0 22px; color: #000000; font-family: Cinzel, serif; font-size: 13px; letter-spacing: .12em; font-weight: 500; cursor: pointer';
      done.addEventListener('click', function () { self.close(); });
      foot.appendChild(clr); foot.appendChild(done); pop.appendChild(foot);
    }
    render();
  }
  document.querySelectorAll('.np-dp').forEach(function (el) { pickers.push(new Picker(el)); });
  document.addEventListener('click', function () { closeAllPickers(); });

  /* ---------- Prefill destination from ?destination= ---------- */
  try {
    var dest = new URLSearchParams(location.search).get('destination');
    if (dest) {
      document.querySelectorAll('input[name="Destination"]').forEach(function (i) { if (!i.value) i.value = dest; });
      document.querySelectorAll('form.np-form').forEach(function (f) { f.setAttribute('data-subject', (f.getAttribute('data-subject') || 'Request') + ' (' + dest + ')'); });
    }
  } catch (e) {}

  /* ---------- Forms ---------- */
  var ENDPOINT = window.NP_FORM_ENDPOINT || '';
  document.querySelectorAll('form.np-form').forEach(function (f) {
    var btn = f.querySelector('button.np-send');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!ENDPOINT) {
        var lines = [];
        f.querySelectorAll('input[name], textarea[name]').forEach(function (i) { if (!i.disabled && i.value) lines.push(i.name + ': ' + i.value); });
        window.location.href = 'mailto:contact@nonstop-private.com?subject=' + encodeURIComponent(f.getAttribute('data-subject') || 'Request') + '&body=' + encodeURIComponent(lines.join('\n'));
        return;
      }
      var data = new FormData(f);
      data.append('_subject', f.getAttribute('data-subject') || 'New request');
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; f.innerHTML = '<p style="grid-column: 1 / -1; margin: 0; font-family: Cinzel, serif; font-size: 22px; letter-spacing: .04em; color: #CDB07A">Thank you. We will be in touch very shortly.</p>'; })
        .catch(function () { btn.disabled = false; btn.textContent = 'Try again'; });
    });
  });
})();

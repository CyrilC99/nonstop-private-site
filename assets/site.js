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
  var ENDPOINT = window.NP_FORM_ENDPOINT || 'https://formsubmit.co/ajax/contact@nonstop-private.com';
  document.querySelectorAll('form.np-form').forEach(function (f) {
    var btn = f.querySelector('button.np-send');
    if (!btn) return;
    btn.setAttribute('data-label', btn.textContent);
    btn.addEventListener('click', function () {
      if (!ENDPOINT) {
        var lines = [];
        f.querySelectorAll('input[name], textarea[name]').forEach(function (i) { if (!i.disabled && i.value) lines.push(i.name + ': ' + i.value); });
        window.location.href = 'mailto:contact@nonstop-private.com?subject=' + encodeURIComponent(f.getAttribute('data-subject') || 'Request') + '&body=' + encodeURIComponent(lines.join('\n'));
        return;
      }
      var filled = 0;
      f.querySelectorAll('input[name], textarea[name]').forEach(function (i) { if (!i.disabled && i.value && i.type !== 'hidden') filled++; });
      if (!filled) { btn.textContent = 'Please fill in the form'; setTimeout(function () { btn.textContent = btn.getAttribute('data-label'); }, 2500); return; }
      var data = new FormData(f);
      f.querySelectorAll('input:disabled, textarea:disabled').forEach(function (i) { data.delete(i.name); });
      data.append('_subject', f.getAttribute('data-subject') || 'New request');
      data.append('_template', 'table');
      data.append('_captcha', 'false');
      data.append('Page', location.href);
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw 0;
          var wl = ['Hello NONSTOP PRIVATE, I just sent a request on your website.'];
          f.querySelectorAll('input[name], textarea[name]').forEach(function (i) { if (i.disabled || !i.value) return; if (i.type === 'hidden' && !(i.name === 'Dates' || i.hasAttribute('data-np-keep'))) return; wl.push(i.name + ': ' + i.value); });
          var wa = 'https://wa.me/33766909971?text=' + encodeURIComponent(wl.join('\n'));
          var ico = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex:0 0 auto"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.1c-.24.68-1.42 1.3-1.95 1.35-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.83 0-1.34.7-2 .95-2.28.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.46.24.55.79 1.9.86 2.04.07.13.11.3.02.48-.09.18-.13.29-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.07.11.07.66-.17 1.33z"/></svg>';
          f.innerHTML = '<div style="grid-column: 1 / -1; display: flex; flex-direction: column; gap: 22px; align-items: flex-start">'
            + '<p style="margin: 0; font-family: Cinzel, serif; font-size: 22px; letter-spacing: .04em; color: #CDB07A">Thank you. We will be in touch very shortly.</p>'
            + '<p style="margin: 0; font-size: 19px; line-height: 1.6; color: #BDB9B1">For a faster answer, send your request on WhatsApp too. It is already written for you.</p>'
            + '<a href="' + wa + '" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 12px; background: #CDB07A; color: #000; padding: 16px 26px; min-height: 44px; box-sizing: border-box; font-family: Cinzel, serif; font-size: 14px; letter-spacing: .12em; font-weight: 500; text-decoration: none">' + ico + 'Send on WhatsApp</a>'
            + '</div>';
        })
        .catch(function () { btn.disabled = false; btn.textContent = 'Try again'; });
    });
  });
})();

/* Contact field: choose WhatsApp (with country code) or email */
(function () {
  var CC = [["AF","Afghanistan",93],["AL","Albania",355],["DZ","Algeria",213],["AS","American Samoa",1],["AD","Andorra",376],["AO","Angola",244],["AI","Anguilla",1],["AG","Antigua and Barbuda",1],["AR","Argentina",54],["AM","Armenia",374],["AW","Aruba",297],["AU","Australia",61],["AT","Austria",43],["AZ","Azerbaijan",994],["BS","Bahamas",1],["BH","Bahrain",973],["BD","Bangladesh",880],["BB","Barbados",1],["BY","Belarus",375],["BE","Belgium",32],["BZ","Belize",501],["BJ","Benin",229],["BM","Bermuda",1],["BT","Bhutan",975],["BO","Bolivia",591],["BQ","Bonaire",599],["BA","Bosnia and Herzegovina",387],["BW","Botswana",267],["BR","Brazil",55],["IO","British Indian Ocean Territory",246],["BN","Brunei Darussalam",673],["BG","Bulgaria",359],["BF","Burkina Faso",226],["BI","Burundi",257],["CV","Cabo Verde",238],["KH","Cambodia",855],["CM","Cameroon",237],["CA","Canada",1],["KY","Cayman Islands",1],["CF","Central African Republic",236],["TD","Chad",235],["CL","Chile",56],["CN","China",86],["CX","Christmas Island",61],["CC","Cocos (Keeling) Islands",61],["CO","Colombia",57],["KM","Comoros",269],["CD","Congo",243],["CG","Congo",242],["CK","Cook Islands",682],["CR","Costa Rica",506],["HR","Croatia",385],["CU","Cuba",53],["CW","Curaçao",599],["CY","Cyprus",357],["CZ","Czechia",420],["CI","Côte d'Ivoire",225],["DK","Denmark",45],["DJ","Djibouti",253],["DM","Dominica",1],["DO","Dominican Republic",1],["EC","Ecuador",593],["EG","Egypt",20],["SV","El Salvador",503],["GQ","Equatorial Guinea",240],["ER","Eritrea",291],["EE","Estonia",372],["SZ","Eswatini",268],["ET","Ethiopia",251],["FK","Falkland Islands (Malvinas)",500],["FO","Faroe Islands",298],["FJ","Fiji",679],["FI","Finland",358],["FR","France",33],["GF","French Guiana",594],["PF","French Polynesia",689],["GA","Gabon",241],["GM","Gambia",220],["GE","Georgia",995],["DE","Germany",49],["GH","Ghana",233],["GI","Gibraltar",350],["GR","Greece",30],["GL","Greenland",299],["GD","Grenada",1],["GP","Guadeloupe",590],["GU","Guam",1],["GT","Guatemala",502],["GG","Guernsey",44],["GN","Guinea",224],["GW","Guinea-Bissau",245],["GY","Guyana",592],["HT","Haiti",509],["VA","Holy See (Vatican City State)",39],["HN","Honduras",504],["HK","Hong Kong",852],["HU","Hungary",36],["IS","Iceland",354],["IN","India",91],["ID","Indonesia",62],["IR","Iran",98],["IQ","Iraq",964],["IE","Ireland",353],["IM","Isle of Man",44],["IL","Israel",972],["IT","Italy",39],["JM","Jamaica",1],["JP","Japan",81],["JE","Jersey",44],["JO","Jordan",962],["KZ","Kazakhstan",7],["KE","Kenya",254],["KI","Kiribati",686],["KW","Kuwait",965],["KG","Kyrgyzstan",996],["LA","Laos",856],["LV","Latvia",371],["LB","Lebanon",961],["LS","Lesotho",266],["LR","Liberia",231],["LY","Libya",218],["LI","Liechtenstein",423],["LT","Lithuania",370],["LU","Luxembourg",352],["MO","Macao",853],["MG","Madagascar",261],["MW","Malawi",265],["MY","Malaysia",60],["MV","Maldives",960],["ML","Mali",223],["MT","Malta",356],["MH","Marshall Islands",692],["MQ","Martinique",596],["MR","Mauritania",222],["MU","Mauritius",230],["YT","Mayotte",262],["MX","Mexico",52],["FM","Micronesia",691],["MD","Moldova",373],["MC","Monaco",377],["MN","Mongolia",976],["ME","Montenegro",382],["MS","Montserrat",1],["MA","Morocco",212],["MZ","Mozambique",258],["MM","Myanmar",95],["NA","Namibia",264],["NR","Nauru",674],["NP","Nepal",977],["NL","Netherlands",31],["NC","New Caledonia",687],["NZ","New Zealand",64],["NI","Nicaragua",505],["NE","Niger",227],["NG","Nigeria",234],["NU","Niue",683],["NF","Norfolk Island",672],["KP","North Korea",850],["MK","North Macedonia",389],["MP","Northern Mariana Islands",1],["NO","Norway",47],["OM","Oman",968],["PK","Pakistan",92],["PW","Palau",680],["PS","Palestine",970],["PA","Panama",507],["PG","Papua New Guinea",675],["PY","Paraguay",595],["PE","Peru",51],["PH","Philippines",63],["PL","Poland",48],["PT","Portugal",351],["PR","Puerto Rico",1],["QA","Qatar",974],["RO","Romania",40],["RU","Russian Federation",7],["RW","Rwanda",250],["RE","Réunion",262],["BL","Saint Barthélemy",590],["SH","Saint Helena",290],["KN","Saint Kitts and Nevis",1],["LC","Saint Lucia",1],["MF","Saint Martin (French part)",590],["PM","Saint Pierre and Miquelon",508],["VC","Saint Vincent and the Grenadines",1],["WS","Samoa",685],["SM","San Marino",378],["ST","Sao Tome and Principe",239],["SA","Saudi Arabia",966],["SN","Senegal",221],["RS","Serbia",381],["SC","Seychelles",248],["SL","Sierra Leone",232],["SG","Singapore",65],["SX","Sint Maarten (Dutch part)",1],["SK","Slovakia",421],["SI","Slovenia",386],["SB","Solomon Islands",677],["SO","Somalia",252],["ZA","South Africa",27],["KR","South Korea",82],["SS","South Sudan",211],["ES","Spain",34],["LK","Sri Lanka",94],["SD","Sudan",249],["SR","Suriname",597],["SJ","Svalbard and Jan Mayen",47],["SE","Sweden",46],["CH","Switzerland",41],["SY","Syria",963],["TW","Taiwan",886],["TJ","Tajikistan",992],["TZ","Tanzania",255],["TH","Thailand",66],["TL","Timor-Leste",670],["TG","Togo",228],["TK","Tokelau",690],["TO","Tonga",676],["TT","Trinidad and Tobago",1],["TN","Tunisia",216],["TM","Turkmenistan",993],["TC","Turks and Caicos Islands",1],["TV","Tuvalu",688],["TR","Türkiye",90],["UG","Uganda",256],["UA","Ukraine",380],["AE","United Arab Emirates",971],["GB","United Kingdom",44],["US","United States",1],["UY","Uruguay",598],["UZ","Uzbekistan",998],["VU","Vanuatu",678],["VE","Venezuela",58],["VN","Vietnam",84],["VG","Virgin Islands",1],["VI","Virgin Islands",1],["WF","Wallis and Futuna",681],["EH","Western Sahara",212],["YE","Yemen",967],["ZM","Zambia",260],["ZW","Zimbabwe",263],["AX","Åland Islands",358]];
  function flag(r) { try { return String.fromCodePoint(127397 + r.charCodeAt(0), 127397 + r.charCodeAt(1)); } catch (e) { return ''; } }
  function guess() {
    var l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    var m = l.match(/[-_]([A-Za-z]{2})$/); var r = m ? m[1].toUpperCase() : '';
    if (!r) r = ({ fr: 'FR', en: 'GB', ar: 'AE', de: 'DE', it: 'IT', es: 'ES', el: 'GR', ru: 'RU', nl: 'NL', pt: 'PT' })[l.slice(0, 2).toLowerCase()] || 'AE';
    return CC.some(function (c) { return c[0] === r; }) ? r : 'AE';
  }
  var GOLD = '#CDB07A';
  document.querySelectorAll('form.np-form input[name="WhatsApp or email"], form.np-form input[name="Your contact"], form.np-form input[name="WhatsApp or phone"]').forEach(function (inp) {
    var phoneOnly = inp.name === 'WhatsApp or phone';
    var fieldStyle = inp.getAttribute('style') || '';
    var lab = inp.closest('label');
    var title = phoneOnly ? 'WhatsApp or phone' : 'Your contact';
    var box = document.createElement('div');
    box.setAttribute('style', (lab && lab.getAttribute('style')) || 'display:flex;flex-direction:column;gap:10px');
    box.className = 'np-contact';
    var t = document.createElement('span'); t.textContent = title; box.appendChild(t);

    var hidPref = document.createElement('input'); hidPref.type = 'hidden'; hidPref.name = 'Preferred contact'; hidPref.setAttribute('data-np-keep', '');
    var hidWa = document.createElement('input'); hidWa.type = 'hidden'; hidWa.name = phoneOnly ? 'WhatsApp or phone' : 'WhatsApp'; hidWa.setAttribute('data-np-keep', '');
    var email = document.createElement('input'); email.type = 'email'; email.name = 'Email'; email.placeholder = 'you@email.com'; email.autocomplete = 'email'; email.setAttribute('style', fieldStyle);

    var toggle = document.createElement('div');
    toggle.setAttribute('style', 'display:flex;gap:0;margin-top:2px');
    function tbtn(label, val) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.setAttribute('data-v', val);
      b.setAttribute('style', 'flex:0 0 auto;min-height:40px;padding:8px 18px;border:1px solid #5A5853;background:transparent;color:#BDB9B1;font-family:Cinzel,serif;font-size:12px;letter-spacing:.14em;cursor:pointer');
      return b;
    }
    var bWa = tbtn('WhatsApp', 'wa'), bEm = tbtn('Email', 'em'); bEm.style.borderLeft = 'none';
    toggle.appendChild(bWa); toggle.appendChild(bEm);

    var row = document.createElement('div'); row.setAttribute('style', 'display:flex;align-items:flex-end;gap:14px;min-width:0');
    var pick = document.createElement('div'); pick.setAttribute('style', 'position:relative;flex:0 0 auto;border-bottom:1px solid #5A5853;min-height:44px;display:flex;align-items:center;padding:12px 4px 12px 0;box-sizing:border-box;color:#FFFFFF;font-size:19px;letter-spacing:.01em;text-transform:none;font-family:inherit;white-space:nowrap');
    var shown = document.createElement('span'); pick.appendChild(shown);
    var caret = document.createElement('span'); caret.textContent = ' ▾'; caret.style.color = GOLD; caret.style.fontSize = '14px'; pick.appendChild(caret);
    var sel = document.createElement('select'); sel.setAttribute('aria-label', 'Country code');
    sel.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:16px');
    var g = guess();
    CC.forEach(function (c) { var o = document.createElement('option'); o.value = c[0]; o.textContent = flag(c[0]) + '  ' + c[1] + '  +' + c[2]; if (c[0] === g) o.selected = true; sel.appendChild(o); });
    pick.appendChild(sel);
    var tel = document.createElement('input'); tel.type = 'tel'; tel.inputMode = 'tel'; tel.autocomplete = 'tel-national'; tel.placeholder = 'Phone number'; tel.setAttribute('aria-label', 'Phone number');
    tel.setAttribute('style', fieldStyle + ';flex:1 1 auto;min-width:0;width:100%');
    row.appendChild(pick); row.appendChild(tel);

    function code() { var c = CC.filter(function (x) { return x[0] === sel.value; })[0]; return c ? c[2] : ''; }
    function sync() {
      shown.textContent = flag(sel.value) + ' +' + code();
      var n = tel.value.replace(/[^\d]/g, '').replace(/^0+/, '');
      hidWa.value = n ? '+' + code() + ' ' + n : '';
    }
    var mode = 'wa';
    function setMode(m) {
      mode = m;
      [bWa, bEm].forEach(function (b) { var on = b.getAttribute('data-v') === m; b.style.background = on ? GOLD : 'transparent'; b.style.color = on ? '#000' : '#BDB9B1'; b.style.borderColor = on ? GOLD : '#5A5853'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      row.style.display = m === 'wa' ? 'flex' : 'none';
      email.style.display = m === 'em' ? '' : 'none';
      hidWa.disabled = m !== 'wa'; email.disabled = m !== 'em';
      hidPref.value = m === 'wa' ? 'WhatsApp' : 'Email';
    }
    bWa.addEventListener('click', function () { setMode('wa'); tel.focus(); });
    bEm.addEventListener('click', function () { setMode('em'); email.focus(); });
    sel.addEventListener('change', sync); tel.addEventListener('input', sync);

    if (!phoneOnly) box.appendChild(toggle);
    box.appendChild(row);
    if (!phoneOnly) box.appendChild(email);
    box.appendChild(hidWa);
    if (!phoneOnly) box.appendChild(hidPref);
    (lab || inp).replaceWith(box);
    sync(); setMode('wa');

    var form = box.closest('form'); var send = form && form.querySelector('button.np-send');
    if (form && send) form.addEventListener('click', function (ev) {
      if (!ev.target.closest || ev.target.closest('button.np-send') !== send) return;
      sync();
      var ok = mode === 'wa' ? tel.value.replace(/[^\d]/g, '').length >= 6 : /.+@.+\..+/.test(email.value);
      if (!ok) {
        ev.stopImmediatePropagation();
        var f = mode === 'wa' ? tel : email; f.style.borderBottomColor = GOLD; f.focus();
        var old = send.textContent; send.textContent = mode === 'wa' ? 'Please add your WhatsApp number' : 'Please add your email';
        setTimeout(function () { send.textContent = old; }, 2500);
      }
    }, true);
  });
})();

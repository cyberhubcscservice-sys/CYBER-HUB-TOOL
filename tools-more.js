/* CYBER HUB - more tools: student / teacher / employee / cyber cafe / sarkari services */
(function () {
  const T = window.CyberTools, R = window.TOOL_REGISTRY;
  T.extraTools = T.extraTools || {};
  const add = (id, name, category, icon, desc, tags, fn) => {
    R.push({ id, name, category, icon, badge: 'New', desc, tags, keywords: tags });
    T.extraTools[id] = fn;
  };
  const n2 = x => Number(x).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const opts = a => a.map(k => `<option>${k}</option>`).join('');
  const toast = (m, t) => window.CyberApp && CyberApp.showToast(m, t || 'info');
  const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const box = c => {
    c.innerHTML = '<div style="max-width:560px;margin:0 auto;background:var(--surface);padding:22px;border-radius:12px;border:1px solid var(--border);"><div class="mb"></div><div class="mo" style="margin-top:14px;font-weight:600;line-height:1.8;"></div></div>';
    return [c.querySelector('.mb'), c.querySelector('.mo')];
  };
  const fld = (id, label, val, type) => type === 'textarea'
    ? `<div class="form-group"><label class="form-label">${label}</label><textarea id="f_${id}" rows="4" class="form-control">${val}</textarea></div>`
    : `<div class="form-group"><label class="form-label">${label}</label><input id="f_${id}" type="${type || 'number'}" class="form-control" value="${val}"></div>`;
  // generic calculator: fields = [id,label,default,type]
  const calc = (id, name, cat, icon, desc, tags, fields, fn) => add(id, name, cat, icon, desc, tags, c => {
    const [b, o] = box(c);
    b.innerHTML = fields.map(f => fld(...f)).join('');
    const run = () => {
      const v = {};
      fields.forEach(f => { const e = c.querySelector('#f_' + f[0]); v[f[0]] = f[3] ? e.value : (parseFloat(e.value) || 0); });
      try { o.innerHTML = fn(v); } catch (e) { o.textContent = 'Input सही करें'; }
    };
    b.oninput = b.onchange = run; run();
  });

  // ---------- Number to words ----------
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  const three = n => (n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' : '') : '') + (n % 100 ? two(n % 100) : '');
  T.numToWords = n => {
    n = Math.floor(n); if (!n) return 'Zero';
    let s = '';
    for (const [d, nm] of [[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']]) {
      const q = Math.floor(n / d); if (q) { s += three(q) + ' ' + nm + ' '; n %= d; }
    }
    return (s + (n ? three(n) : '')).trim();
  };
  calc('number-to-words', 'Amount in Words (₹)', 'calculator', 'fa-spell-check', 'Rupees ko English words me likhein - cheque, receipt aur bill ke liye.', ['amount', 'words', 'cheque', 'rupees', 'number'], [['a', 'Amount (₹)', 125000.5]], v => {
    const r = Math.floor(v.a), p = Math.round((v.a - r) * 100);
    return `${T.numToWords(r)} Rupees${p ? ' and ' + T.numToWords(p) + ' Paise' : ''} Only`;
  });

  // ---------- Student ----------
  calc('attendance-calculator', 'Attendance Calculator', 'calculator', 'fa-user-check', 'Attendance % aur 75% ke liye kitni class chahiye.', ['attendance', 'student', '75', 'class'], [['t', 'Total classes', 100], ['p', 'Present classes', 70]], v => {
    if (!v.t) return 'Total classes डालें';
    const pc = v.p / v.t * 100, need = Math.max(0, Math.ceil(3 * v.t - 4 * v.p)), skip = Math.max(0, Math.floor(v.p / 0.75 - v.t));
    return `Attendance: ${pc.toFixed(2)}%<br>` + (pc >= 75 ? `✅ आप ${skip} class छोड़ सकते हैं (75% बनाए रखते हुए)` : `⚠️ 75% के लिए लगातार ${need} class और attend करनी होंगी`);
  });
  calc('marks-analyzer', 'Marks Total & Analyzer', 'calculator', 'fa-chart-column', 'Subject-wise marks se total, percentage, highest/lowest aur pass count.', ['marks', 'total', 'result', 'teacher', 'student'], [['m', 'Marks (comma se alag karein)', '78, 65, 90, 45, 32', 'textarea'], ['x', 'Max marks per subject', 100]], v => {
    const a = v.m.split(/[,\s]+/).map(Number).filter(x => !isNaN(x) && x !== ''); const mx = parseFloat(v.x) || 100;
    if (!a.length) return 'Marks डालें';
    const tot = a.reduce((s, x) => s + x, 0);
    return `Total: ${n2(tot)} / ${n2(mx * a.length)}<br>Percentage: ${(tot / (mx * a.length) * 100).toFixed(2)}%<br>Average: ${n2(tot / a.length)}<br>Highest: ${Math.max(...a)} | Lowest: ${Math.min(...a)}<br>Pass (33%+): ${a.filter(x => x >= mx * 0.33).length}/${a.length}`;
  });

  // ---------- Employee / money ----------
  calc('salary-calculator', 'Salary Calculator', 'calculator', 'fa-money-check-dollar', 'Basic, HRA, allowance, PF se gross aur in-hand salary.', ['salary', 'pf', 'hra', 'employee', 'in hand'], [['b', 'Basic salary (₹)', 15000], ['h', 'HRA (% of basic)', 10], ['o', 'Other allowance (₹)', 1000], ['pf', 'PF (% of basic)', 12], ['d', 'Other deduction (₹)', 0]], v => {
    const g = v.b + v.b * v.h / 100 + v.o, pf = v.b * v.pf / 100, net = g - pf - v.d;
    return `Gross: ₹${n2(g)}<br>PF कटौती: ₹${n2(pf)}<br>In-hand: ₹${n2(net)}<br>Yearly: ₹${n2(net * 12)}`;
  });
  calc('wage-calculator', 'Daily / Hourly Wage & Overtime', 'calculator', 'fa-clock', 'Mazdoori, hourly rate aur overtime ka hisab.', ['wage', 'overtime', 'hourly', 'daily', 'employee'], [['r', 'Rate per hour (₹)', 60], ['h', 'Hours per day', 8], ['d', 'Days worked', 26], ['ot', 'Overtime hours (total)', 10], ['m', 'Overtime multiplier', 2]], v => {
    const base = v.r * v.h * v.d, ot = v.r * v.ot * v.m;
    return `Regular: ₹${n2(base)}<br>Overtime: ₹${n2(ot)}<br>कुल: ₹${n2(base + ot)}`;
  });
  const today = new Date().toISOString().slice(0, 10);
  calc('leave-days', 'Leave / Working Days Counter', 'calculator', 'fa-calendar-check', 'Do dates ke beech total din, Sunday aur working days.', ['leave', 'working days', 'sunday', 'employee', 'chhutti'], [['a', 'From', today, 'date'], ['b', 'To', today, 'date']], v => {
    const a = new Date(v.a), b = new Date(v.b); if (isNaN(a) || isNaN(b) || b < a) return 'To date, From से बाद की डालें';
    let s = 0, d = Math.round((b - a) / 864e5) + 1;
    for (let i = 0; i < d; i++) if (new Date(a.getTime() + i * 864e5).getDay() === 0) s++;
    return `कुल दिन: ${d}<br>रविवार: ${s}<br>Working days (रविवार छोड़कर): ${d - s}`;
  });
  calc('sip-calculator', 'SIP Calculator', 'calculator', 'fa-seedling', 'Monthly SIP se future value (estimate).', ['sip', 'mutual fund', 'investment', 'saving'], [['p', 'Monthly investment (₹)', 1000], ['r', 'Expected return (% per year)', 12], ['y', 'Years', 10]], v => {
    const i = v.r / 1200, n = v.y * 12, fv = i ? v.p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : v.p * n, inv = v.p * n;
    return `Invest: ₹${n2(inv)}<br>Return: ₹${n2(fv - inv)}<br>कुल value: ₹${n2(fv)}`;
  });
  calc('compound-interest', 'Compound Interest / FD Calculator', 'calculator', 'fa-piggy-bank', 'FD ya loan par compound interest aur maturity amount.', ['compound', 'fd', 'interest', 'maturity', 'bank'], [['p', 'Principal (₹)', 100000], ['r', 'Rate (% per year)', 7], ['y', 'Years', 5], ['n', 'Compounding per year', 4]], v => {
    const A = v.p * Math.pow(1 + v.r / 100 / v.n, v.n * v.y);
    return `Maturity: ₹${n2(A)}<br>Interest: ₹${n2(A - v.p)}`;
  });
  calc('profit-loss', 'Profit / Loss Calculator', 'calculator', 'fa-scale-balanced', 'Kharid aur bikri se profit, loss aur margin.', ['profit', 'loss', 'margin', 'business', 'dukan'], [['c', 'Cost price (₹)', 500], ['s', 'Selling price (₹)', 650]], v => {
    const d = v.s - v.c; if (!v.c) return 'Cost डालें';
    return (d >= 0 ? '✅ Profit' : '❌ Loss') + `: ₹${n2(Math.abs(d))}<br>${(Math.abs(d) / v.c * 100).toFixed(2)}% (cost पर)<br>Margin: ${v.s ? (Math.abs(d) / v.s * 100).toFixed(2) : 0}% (sale पर)`;
  });

  // ---------- Unit converter ----------
  const G = { Length: { Meter: 1, Kilometer: 1000, Centimeter: .01, Millimeter: .001, Inch: .0254, Foot: .3048, Yard: .9144, Mile: 1609.344 }, Weight: { Kilogram: 1, Gram: .001, Quintal: 100, Ton: 1000, Pound: .45359237, Ounce: .028349523 }, Area: { 'Sq Meter': 1, 'Sq Foot': .09290304, 'Sq Yard': .83612736, Acre: 4046.8564224, Hectare: 10000, 'Sq Km': 1e6 }, Volume: { Litre: 1, ML: .001, Gallon: 3.785411784 } };
  add('unit-converter', 'Unit Converter', 'calculator', 'fa-ruler-combined', 'Length, weight, area aur volume ek unit se dusre me.', ['unit', 'convert', 'length', 'weight', 'area', 'acre', 'kg'], c => {
    const [b, o] = box(c);
    b.innerHTML = fld('v', 'Value', 1) + `<div class="form-group"><label class="form-label">Type</label><select id="g" class="form-control">${opts(Object.keys(G))}</select></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"><select id="a" class="form-control"></select><select id="z" class="form-control"></select></div>`;
    const q = s => b.querySelector(s);
    const fill = () => { const k = Object.keys(G[q('#g').value]); q('#a').innerHTML = opts(k); q('#z').innerHTML = opts(k); q('#z').selectedIndex = 1; run(); };
    const run = () => { const g = G[q('#g').value], v = parseFloat(q('#f_v').value) || 0; o.textContent = `${n2(v)} ${q('#a').value} = ${n2(v * g[q('#a').value] / g[q('#z').value])} ${q('#z').value}`; };
    q('#g').onchange = fill; b.oninput = run; b.onchange = e => { if (e.target.id !== 'g') run(); }; fill();
  });

  // ---------- Cyber cafe utilities ----------
  calc('whatsapp-link', 'WhatsApp Link Generator', 'internet', 'fa-comments', 'Number aur message se direct WhatsApp chat link.', ['whatsapp', 'link', 'wa.me', 'message'], [['n', 'Mobile number', '', 'text'], ['m', 'Message', 'Namaste', 'text']], v => {
    let d = v.n.replace(/\D/g, ''); if (d.length === 10) d = '91' + d; if (d.length < 11) return 'सही mobile number डालें';
    const u = `https://wa.me/${d}?text=${encodeURIComponent(v.m)}`;
    return `<a class="btn btn-primary" href="${u}" target="_blank" rel="noopener">WhatsApp खोलें</a><div style="font-size:12px;font-weight:400;word-break:break-all;margin-top:8px;">${u}</div>`;
  });
  add('upi-qr', 'UPI Payment QR Maker', 'business', 'fa-qrcode', 'Apni UPI ID se payment QR code banayein.', ['upi', 'qr', 'payment', 'phonepe', 'gpay', 'paytm'], c => {
    const [b, o] = box(c);
    b.innerHTML = fld('u', 'UPI ID (e.g. name@bank)', '', 'text') + fld('n', 'Name', '', 'text') + fld('a', 'Amount ₹ (optional)', '') + '<button class="btn btn-primary go" style="width:100%">QR बनाएँ</button>';
    b.querySelector('.go').onclick = () => {
      const g = i => b.querySelector('#f_' + i).value.trim();
      if (!g('u').includes('@')) return toast('सही UPI ID डालें', 'error');
      o.innerHTML = '<div class="qr" style="display:flex;justify-content:center;background:#fff;padding:12px;border-radius:8px;"></div><p style="text-align:center;font-weight:400;font-size:12px;">QR पर long-press / right-click करके save करें</p>';
      new QRCode(o.querySelector('.qr'), { text: `upi://pay?pa=${encodeURIComponent(g('u'))}&pn=${encodeURIComponent(g('n'))}${g('a') ? '&am=' + encodeURIComponent(g('a')) : ''}&cu=INR`, width: 220, height: 220 });
    };
  });
  add('token-counter', 'Customer Token Counter', 'business', 'fa-ticket', 'Counter par customer ka token number - Next dabate hi +1.', ['token', 'queue', 'number', 'counter', 'customer'], c => {
    const [b, o] = box(c), k = 'ch_token';
    const show = () => o.innerHTML = `<div style="font-size:72px;text-align:center;color:var(--primary);">${LS.get(k, 0)}</div>`;
    b.innerHTML = '<button class="btn btn-primary nx" style="width:100%;margin-bottom:8px;">Next Token +1</button><button class="btn btn-secondary rs" style="width:100%;">Reset (0)</button>';
    b.querySelector('.nx').onclick = () => { LS.set(k, LS.get(k, 0) + 1); show(); };
    b.querySelector('.rs').onclick = () => { LS.set(k, 0); show(); };
    show();
  });
  add('daily-tasks', 'Daily Task / To-Do List', 'business', 'fa-list-check', 'Rozana ke kaam likhein aur complete mark karein (browser me save).', ['todo', 'task', 'work', 'list', 'employee', 'kaam'], c => {
    const [b, o] = box(c), k = 'ch_tasks';
    b.innerHTML = '<input class="form-control ti" placeholder="नया काम लिखें और Enter दबाएँ">';
    const draw = () => {
      const l = LS.get(k, []);
      o.innerHTML = l.map((t, i) => `<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-weight:500;"><input type="checkbox" data-i="${i}" ${t.d ? 'checked' : ''}><span style="flex:1;${t.d ? 'text-decoration:line-through;opacity:.5;' : ''}">${t.t.replace(/</g, '&lt;')}</span><button data-x="${i}" class="btn btn-secondary btn-sm">✕</button></div>`).join('') || 'कोई काम नहीं';
    };
    b.querySelector('.ti').onkeydown = e => { if (e.key === 'Enter' && e.target.value.trim()) { const l = LS.get(k, []); l.push({ t: e.target.value.trim(), d: 0 }); LS.set(k, l); e.target.value = ''; draw(); } };
    o.onclick = e => { const l = LS.get(k, []); if (e.target.dataset.i !== undefined) l[e.target.dataset.i].d = e.target.checked ? 1 : 0; else if (e.target.dataset.x !== undefined) l.splice(e.target.dataset.x, 1); else return; LS.set(k, l); draw(); };
    draw();
  });

  // ---------- Text / teacher ----------
  add('line-tools', 'Text Line Tools', 'text', 'fa-arrow-down-a-z', 'Lines sort, duplicate hatana, reverse, khali line hatana.', ['sort', 'duplicate', 'lines', 'reverse', 'remove'], c => {
    const [b, o] = box(c);
    b.innerHTML = fld('t', 'Text (हर line अलग)', '', 'textarea') + '<div style="display:flex;flex-wrap:wrap;gap:6px;">' + [['sort', 'A-Z Sort'], ['dedupe', 'Duplicate हटाएँ'], ['rev', 'Reverse'], ['blank', 'खाली line हटाएँ'], ['copy', 'Copy']].map(a => `<button class="btn btn-secondary btn-sm" data-a="${a[0]}">${a[1]}</button>`).join('') + '</div>';
    const ta = b.querySelector('#f_t');
    b.onclick = e => {
      const a = e.target.dataset.a; if (!a) return; let l = ta.value.split('\n');
      if (a === 'sort') l.sort((x, y) => x.localeCompare(y)); else if (a === 'dedupe') l = [...new Set(l)]; else if (a === 'rev') l.reverse(); else if (a === 'blank') l = l.filter(x => x.trim());
      else if (a === 'copy') { navigator.clipboard && navigator.clipboard.writeText(ta.value); return toast('Copy हो गया', 'success'); }
      ta.value = l.join('\n'); o.textContent = l.length + ' lines';
    };
  });
  add('random-picker', 'Random Name Picker (Teacher)', 'text', 'fa-shuffle', 'Class ke naam me se random student chunein ya list shuffle karein.', ['random', 'name', 'picker', 'teacher', 'roll', 'shuffle', 'student'], c => {
    const [b, o] = box(c);
    b.innerHTML = fld('t', 'Names (हर line में एक)', '', 'textarea') + '<button class="btn btn-primary pk">🎲 एक नाम चुनें</button> <button class="btn btn-secondary sh">Shuffle सूची</button>';
    const names = () => b.querySelector('#f_t').value.split('\n').map(s => s.trim()).filter(Boolean);
    b.querySelector('.pk').onclick = () => { const l = names(); o.innerHTML = l.length ? `<div style="font-size:28px;text-align:center;color:var(--primary);">${l[Math.floor(Math.random() * l.length)].replace(/</g, '&lt;')}</div>` : 'नाम डालें'; };
    b.querySelector('.sh').onclick = () => { const l = names(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } o.innerHTML = l.map((x, i) => `${i + 1}. ${x.replace(/</g, '&lt;')}`).join('<br>'); };
  });
  add('password-generator', 'Strong Password Generator', 'internet', 'fa-key', 'Surakshit random password banayein.', ['password', 'generator', 'secure', 'random'], c => {
    const [b, o] = box(c);
    b.innerHTML = fld('l', 'Length', 12) + '<button class="btn btn-primary go" style="width:100%">Generate</button>';
    b.querySelector('.go').onclick = () => {
      const L = Math.min(64, Math.max(6, parseInt(b.querySelector('#f_l').value) || 12)), S = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#$%&*!', r = new Uint32Array(L);
      crypto.getRandomValues(r); o.innerHTML = `<div style="font-family:monospace;font-size:18px;word-break:break-all;">${Array.from(r, x => S[x % S.length]).join('')}</div>`;
    };
  });
  add('typing-test', 'Typing Speed Test', 'text', 'fa-keyboard', 'English typing speed (WPM) aur accuracy check karein.', ['typing', 'speed', 'wpm', 'test', 'practice', 'student'], c => {
    const [b, o] = box(c), S = 'The quick brown fox jumps over the lazy dog. Digital India brings government services to every village through cyber cafes.';
    b.innerHTML = `<p style="font-weight:400;background:var(--bg);padding:10px;border-radius:8px;">${S}</p><textarea rows="4" class="form-control tt" placeholder="यहाँ टाइप करना शुरू करें..."></textarea><button class="btn btn-secondary tr" style="margin-top:8px;">Restart</button>`;
    let t0 = 0; const ta = b.querySelector('.tt');
    ta.oninput = () => {
      if (!t0) t0 = Date.now(); const v = ta.value; let ok = 0; for (let i = 0; i < v.length; i++) if (v[i] === S[i]) ok++;
      const m = Math.max((Date.now() - t0) / 60000, 0.05);
      o.innerHTML = `Speed: ${Math.round(v.length / 5 / m)} WPM<br>Accuracy: ${v.length ? Math.round(ok / v.length * 100) : 100}%${v.length >= S.length ? '<br>✅ पूरा हुआ' : ''}`;
    };
    b.querySelector('.tr').onclick = () => { ta.value = ''; t0 = 0; o.textContent = ''; };
  });

  // ---------- Sarkari service document checklist ----------
  const SV = {
    'Aadhaar नया / Update': 'पहचान प्रमाण (POI)|पता प्रमाण (POA)|जन्म तिथि प्रमाण|मोबाइल नंबर (OTP के लिए)',
    'PAN Card (नया)': 'Aadhaar कार्ड|फोटो|हस्ताक्षर|मोबाइल व ईमेल',
    'Voter ID': 'फोटो|आयु प्रमाण|पता प्रमाण|Aadhaar|मोबाइल',
    'Passport': 'Aadhaar|10वीं मार्कशीट / जन्म प्रमाण|पता प्रमाण|फोटो|मोबाइल व ईमेल',
    'Driving Licence (Learner)': 'Aadhaar|आयु प्रमाण|पता प्रमाण|फोटो व हस्ताक्षर|मेडिकल फॉर्म (जहाँ ज़रूरी)|मोबाइल',
    'आय प्रमाण पत्र': 'Aadhaar|राशन कार्ड|फोटो|स्व-घोषणा पत्र|मोबाइल',
    'जाति प्रमाण पत्र': 'Aadhaar|राशन कार्ड|पिता / परिवार का जाति प्रमाण|स्व-घोषणा|फोटो|मोबाइल',
    'निवास प्रमाण पत्र': 'Aadhaar|राशन कार्ड / Voter ID|स्कूल प्रमाण|स्व-घोषणा|फोटो|मोबाइल',
    'राशन कार्ड': 'सभी सदस्यों का Aadhaar|फोटो|बैंक पासबुक|आय / निवास प्रमाण|मोबाइल',
    'जन्म / मृत्यु प्रमाण पत्र': 'अस्पताल पर्ची / पंचायत रिपोर्ट|माता-पिता का Aadhaar|पता प्रमाण|मोबाइल',
    'PM Kisan': 'Aadhaar|बैंक पासबुक|ज़मीन के कागज़|मोबाइल (Aadhaar से लिंक)',
    'Ayushman Bharat कार्ड': 'Aadhaar|राशन कार्ड|मोबाइल|फोटो',
    'e-Shram कार्ड': 'Aadhaar|बैंक पासबुक|मोबाइल (Aadhaar से लिंक)',
    'Udyam Registration': 'Aadhaar|PAN|बैंक खाता|व्यवसाय का पता|मोबाइल व ईमेल',
    'GST Registration': 'PAN|Aadhaar|फोटो|बैंक खाता|व्यवसाय पता प्रमाण|मोबाइल व ईमेल',
    'Scholarship (छात्रवृत्ति)': 'Aadhaar|बैंक पासबुक|आय व जाति प्रमाण|पिछली मार्कशीट|स्कूल / कॉलेज प्रमाण|फोटो|मोबाइल',
    'सरकारी नौकरी फॉर्म': 'Aadhaar|फोटो व हस्ताक्षर (स्कैन)|10वीं / 12वीं / डिग्री मार्कशीट|जाति / आय प्रमाण (यदि लागू)|ईमेल व मोबाइल',
    'ITR Filing': 'PAN|Aadhaar|Form 16 / आय विवरण|बैंक स्टेटमेंट|निवेश प्रमाण',
    'Bank खाता (Jan Dhan)': 'Aadhaar|फोटो|मोबाइल|पता प्रमाण'
  };
  add('service-checklist', 'Sarkari Service Document List', 'documents', 'fa-clipboard-list', 'Aadhaar, PAN, certificates, scholarship, yojana - kaunse documents chahiye.', ['aadhaar', 'pan', 'certificate', 'documents', 'service', 'sarkari', 'yojana', 'scholarship', 'form'], c => {
    const [b, o] = box(c);
    b.innerHTML = `<div class="form-group"><label class="form-label">Service चुनें</label><select class="form-control sv">${opts(Object.keys(SV))}</select></div>`;
    const show = () => { const k = b.querySelector('.sv').value; o.innerHTML = '<ul style="padding-left:18px;font-weight:500;">' + SV[k].split('|').map(x => `<li>☐ ${x}</li>`).join('') + '</ul><p style="font-size:12px;font-weight:400;color:var(--muted);">नोट: नियम / दस्तावेज़ राज्य व समय के अनुसार बदल सकते हैं - आवेदन से पहले आधिकारिक पोर्टल देखें।</p>'; };
    b.querySelector('.sv').onchange = show; show();
  });
})();

/* CYBER HUB - final pack: new categories, remaining tools */
(function () {
  const T = window.CyberTools, R = window.TOOL_REGISTRY;
  T.extraTools = T.extraTools || {};
  const cat = (c, ids) => ids.forEach(id => { const t = R.find(x => x.id === id); if (t) t.category = c; });
  cat('student', ['attendance-calculator', 'marks-analyzer', 'typing-test', 'random-picker', 'cgpa-calculator', 'percentage-calculator', 'age-calculator', 'date-difference']);
  cat('employee', ['salary-calculator', 'wage-calculator', 'leave-days', 'daily-tasks', 'income-expense', 'sip-calculator', 'compound-interest']);
  cat('cafe', ['upi-qr', 'token-counter', 'whatsapp-link', 'password-generator', 'qr-generator', 'number-to-words', 'unit-converter', 'profit-loss']);
  // PDF password/unlock cannot be done reliably in the browser -> remove instead of showing a broken tool
  ['pdf-password', 'pdf-unlock'].forEach(id => { const i = R.findIndex(t => t.id === id); if (i > -1) R.splice(i, 1); });

  const add = (id, fn) => { T.extraTools[id] = fn; };
  const toast = (m, t) => window.CyberApp && CyberApp.showToast(m, t || 'info');
  const shell = (c, html) => { c.innerHTML = `<div style="max-width:620px;margin:0 auto;background:var(--surface);padding:22px;border-radius:12px;border:1px solid var(--border);">${html}<div class="mo" style="margin-top:12px;"></div></div>`; return s => c.querySelector(s); };
  const fld = (id, label, val, type) => `<div class="form-group"><label class="form-label">${label}</label><input id="f_${id}" type="${type || 'text'}" class="form-control" value="${val || ''}"></div>`;
  const file = (id, label) => `<div class="form-group"><label class="form-label">${label}</label><input id="${id}" type="file" accept="image/*" class="form-control"></div>`;
  const load = f => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = URL.createObjectURL(f); });
  const save = (canvas, name, type, q) => canvas.toBlob(b => b ? T._download(b, name) : toast('Save नहीं हो सका', 'error'), type, q);
  const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

  // ---- Image Cropper ----
  add('image-cropper', c => {
    const $ = shell(c, file('im', 'Image चुनें') + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">' + [['l', 'Left %'], ['t', 'Top %'], ['r', 'Right %'], ['b', 'Bottom %']].map(a => fld(a[0], a[1], 0, 'number')).join('') + '</div><canvas class="cv" style="max-width:100%;border:1px solid var(--border);border-radius:8px;margin:10px 0;display:none;"></canvas><button class="btn btn-primary go" style="width:100%;" disabled>Crop & Download</button>');
    let img = null; const cv = $('.cv');
    const draw = () => {
      if (!img) return; const g = k => Math.min(90, Math.max(0, parseFloat($('#f_' + k).value) || 0)) / 100, W = img.naturalWidth, H = img.naturalHeight;
      const x = W * g('l'), y = H * g('t'), w = W * (1 - g('l') - g('r')), h = H * (1 - g('t') - g('b'));
      if (w < 5 || h < 5) return; cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
    };
    $('#im').onchange = async e => { if (!e.target.files[0]) return; img = await load(e.target.files[0]); cv.style.display = 'block'; $('.go').disabled = false; draw(); };
    c.oninput = draw; $('.go').onclick = () => save(cv, 'cropped-cyberhub.png', 'image/png');
  });

  // ---- Photo Enhancer ----
  add('photo-enhancer', c => {
    const sl = (id, l, v, mn, mx) => `<div class="form-group"><label class="form-label">${l}</label><input id="f_${id}" type="range" min="${mn}" max="${mx}" value="${v}" style="width:100%;"></div>`;
    const $ = shell(c, file('im', 'Photo चुनें') + sl('b', 'Brightness', 100, 50, 180) + sl('c', 'Contrast', 100, 50, 180) + sl('s', 'Colour (saturation)', 100, 0, 200) + '<canvas class="cv" style="max-width:100%;border-radius:8px;display:none;margin-bottom:10px;"></canvas><button class="btn btn-primary go" style="width:100%;" disabled>Download</button>');
    let img = null; const cv = $('.cv');
    const draw = () => { if (!img) return; cv.width = img.naturalWidth; cv.height = img.naturalHeight; const x = cv.getContext('2d'); x.filter = `brightness(${$('#f_b').value}%) contrast(${$('#f_c').value}%) saturate(${$('#f_s').value}%)`; x.drawImage(img, 0, 0); };
    $('#im').onchange = async e => { if (!e.target.files[0]) return; img = await load(e.target.files[0]); cv.style.display = 'block'; $('.go').disabled = false; draw(); };
    c.oninput = draw; $('.go').onclick = () => save(cv, 'enhanced-cyberhub.jpg', 'image/jpeg', 0.92);
  });

  // ---- Photo + Signature Joiner ----
  add('photo-signature-joiner', c => {
    const $ = shell(c, file('a', 'Photo') + file('b', 'Signature') + fld('w', 'Width (px)', 400, 'number') + '<canvas class="cv" style="max-width:100%;border:1px solid var(--border);display:none;margin-bottom:10px;"></canvas><button class="btn btn-primary go" style="width:100%;">Join & Download</button>');
    $('.go').onclick = async () => {
      const fa = $('#a').files[0], fb = $('#b').files[0]; if (!fa || !fb) return toast('दोनों फ़ाइलें चुनें', 'error');
      const [a, b] = await Promise.all([load(fa), load(fb)]), W = Math.max(100, parseInt($('#f_w').value) || 400);
      const ha = Math.round(a.naturalHeight * W / a.naturalWidth), hb = Math.round(b.naturalHeight * W / b.naturalWidth), cv = $('.cv');
      cv.width = W; cv.height = ha + hb; const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, ha + hb); x.drawImage(a, 0, 0, W, ha); x.drawImage(b, 0, ha, W, hb);
      cv.style.display = 'block'; save(cv, 'photo-signature-cyberhub.jpg', 'image/jpeg', 0.92);
    };
  });

  // ---- PDF to JPG (pdf.js) ----
  add('pdf-to-jpg', c => {
    const $ = shell(c, '<div class="form-group"><label class="form-label">PDF चुनें</label><input id="pf" type="file" accept="application/pdf" class="form-control"></div><button class="btn btn-primary go" style="width:100%;">JPG बनाएँ</button>');
    $('.go').onclick = async () => {
      const f = $('#pf').files[0]; if (!f) return toast('PDF चुनें', 'error');
      if (!window.pdfjsLib) return toast('PDF engine load नहीं हुआ - internet जाँचें', 'error');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const o = $('.mo'); o.textContent = 'बन रहा है...';
      try {
        const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise; o.innerHTML = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const p = await pdf.getPage(i), v = p.getViewport({ scale: 2 }), cv = document.createElement('canvas'); cv.width = v.width; cv.height = v.height;
          await p.render({ canvasContext: cv.getContext('2d'), viewport: v }).promise;
          const d = document.createElement('div'); d.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);';
          d.innerHTML = `<span>Page ${i}</span>`; const bt = document.createElement('button'); bt.className = 'btn btn-secondary btn-sm'; bt.textContent = 'Download JPG'; bt.onclick = () => save(cv, `page-${i}.jpg`, 'image/jpeg', 0.92); d.appendChild(bt); o.appendChild(d);
        }
      } catch (e) { o.textContent = 'PDF खुल नहीं सका (password वाला हो सकता है)'; }
    };
  });

  // ---- ID Card ----
  add('id-card-generator', c => {
    const $ = shell(c, fld('o', 'Organisation / School', 'CYBER HUB') + fld('n', 'Name') + fld('d', 'Designation / Class') + fld('i', 'ID No.') + fld('p', 'Phone') + file('im', 'Photo') + '<canvas class="cv" width="640" height="400" style="max-width:100%;border:1px solid var(--border);border-radius:8px;margin-bottom:10px;"></canvas><button class="btn btn-primary go" style="width:100%;">Card बनाएँ & Download</button>');
    $('.go').onclick = async () => {
      const g = k => $('#f_' + k).value, cv = $('.cv'), x = cv.getContext('2d'), f = $('#im').files[0];
      x.fillStyle = '#fff'; x.fillRect(0, 0, 640, 400); x.fillStyle = '#1d4ed8'; x.fillRect(0, 0, 640, 84);
      x.fillStyle = '#fff'; x.font = 'bold 30px sans-serif'; x.fillText(g('o'), 24, 54);
      if (f) { const im = await load(f); x.drawImage(im, 24, 112, 170, 210); } else { x.strokeStyle = '#999'; x.strokeRect(24, 112, 170, 210); }
      x.fillStyle = '#111'; x.font = 'bold 30px sans-serif'; x.fillText(g('n'), 220, 150); x.font = '22px sans-serif'; x.fillText(g('d'), 220, 190); x.fillText('ID: ' + g('i'), 220, 230); x.fillText('Ph: ' + g('p'), 220, 270);
      x.fillStyle = '#1d4ed8'; x.fillRect(0, 372, 640, 28); save(cv, 'idcard-cyberhub.png', 'image/png');
    };
  });

  // ---- Marriage Biodata (print) ----
  add('biodata-marriage', c => {
    const F = [['n', 'नाम'], ['f', 'पिता का नाम'], ['m', 'माता का नाम'], ['dob', 'जन्म तिथि'], ['h', 'ऊँचाई'], ['e', 'शिक्षा'], ['j', 'व्यवसाय / नौकरी'], ['r', 'धर्म / जाति'], ['a', 'पता'], ['c', 'संपर्क नंबर']];
    const $ = shell(c, F.map(a => fld(a[0], a[1])).join('') + '<button class="btn btn-primary go" style="width:100%;">Biodata Print / PDF</button>');
    $('.go').onclick = () => {
      const w = window.open('', '_blank'); if (!w) return toast('Popup allow करें', 'error');
      w.document.write(`<html><head><meta charset="utf-8"><title>Biodata</title><style>body{font-family:sans-serif;padding:40px;max-width:700px;margin:auto}h1{text-align:center;color:#b45309}td{padding:8px 10px;border-bottom:1px solid #ddd;font-size:18px}td:first-child{font-weight:bold;width:38%}</style></head><body><h1>|| बायोडाटा ||</h1><table style="width:100%;border-collapse:collapse">${F.map(a => `<tr><td>${a[1]}</td><td>${esc($('#f_' + a[0]).value)}</td></tr>`).join('')}</table></body></html>`);
      w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
    };
  });
})();

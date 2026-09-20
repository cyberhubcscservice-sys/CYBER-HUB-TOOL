/**
 * CYBER HUB - Extra tools (image convert/resize, PDF split/page-number/metadata, date diff, discount)
 * Extends window.CyberTools. Unknown tools show a "coming soon" card instead of opening the wrong tool.
 */
Object.assign(window.CyberTools, {
  _download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },

  _toast(msg, type) {
    if (window.CyberApp && CyberApp.showToast) CyberApp.showToast(msg, type || 'info');
  },

  renderExtra(container, tool) {
    const map = {
      'jpg-to-png': () => this.renderImageConvert(container, 'image/png'),
      'png-to-jpg': () => this.renderImageConvert(container, 'image/jpeg'),
      'webp-converter': () => this.renderImageConvert(container, 'image/webp'),
      'image-resizer': () => this.renderImageConvert(container, 'image/jpeg', true),
      'pdf-split': () => this.renderPdfSplit(container),
      'pdf-page-number': () => this.renderPdfPageNumber(container),
      'pdf-metadata-cleaner': () => this.renderPdfMetaClean(container),
      'date-difference': () => this.renderDateDiff(container),
      'discount-calculator': () => this.renderDiscount(container)
    };
    if (this.extraTools && this.extraTools[tool.id]) return this.extraTools[tool.id](container);
    if (map[tool.id]) return map[tool.id]();
    container.innerHTML = `
      <div style="max-width:520px;margin:30px auto;text-align:center;padding:28px;background:var(--surface);border:1px solid var(--border);border-radius:12px;">
        <i class="fa-solid fa-screwdriver-wrench" style="font-size:34px;color:var(--primary);margin-bottom:12px;"></i>
        <h3 style="margin-bottom:8px;">${tool.name}</h3>
        <p style="color:var(--muted);font-size:14px;">यह टूल जल्द आ रहा है (Coming soon). अभी के लिए WhatsApp पर Rahul ji से संपर्क करें।</p>
      </div>`;
  },

  // ---- Image converter / resizer ----
  renderImageConvert(container, defaultType, showResize) {
    container.innerHTML = `
      <div style="max-width:650px;margin:0 auto;background:var(--surface);padding:22px;border-radius:12px;border:1px solid var(--border);">
        <div class="dropzone" id="ic-drop" style="margin-bottom:14px;">
          <i class="fa-solid fa-cloud-arrow-up" style="font-size:30px;color:var(--primary);margin-bottom:6px;"></i>
          <p style="font-weight:600;">Click to select image</p>
          <input type="file" id="ic-file" accept="image/*" style="display:none;">
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
          <div class="form-group"><label class="form-label">Output format</label>
            <select id="ic-type" class="form-control">
              <option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WEBP</option>
            </select></div>
          <div class="form-group"><label class="form-label">Width (px)</label><input id="ic-w" type="number" min="1" class="form-control" placeholder="auto"></div>
          <div class="form-group"><label class="form-label">Height (px)</label><input id="ic-h" type="number" min="1" class="form-control" placeholder="auto"></div>
          <div class="form-group"><label class="form-label">Quality (%)</label><input id="ic-q" type="number" min="10" max="100" value="90" class="form-control"></div>
        </div>
        <div id="ic-info" style="font-size:12px;color:var(--muted);margin:6px 0 12px;"></div>
        <img id="ic-prev" style="max-width:100%;max-height:260px;display:none;margin:0 auto 12px;border-radius:8px;">
        <button id="ic-go" class="btn btn-primary" style="width:100%;" disabled><i class="fa-solid fa-download"></i> Convert & Download</button>
      </div>`;
    const $ = s => container.querySelector(s);
    $('#ic-type').value = defaultType;
    let img = null, fname = 'image';
    $('#ic-drop').onclick = () => $('#ic-file').click();
    $('#ic-file').onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      fname = f.name.replace(/\.[^.]+$/, '');
      const url = URL.createObjectURL(f);
      const im = new Image();
      im.onload = () => {
        img = im;
        $('#ic-prev').src = url;
        $('#ic-prev').style.display = 'block';
        $('#ic-info').textContent = `Original: ${im.naturalWidth}×${im.naturalHeight}px, ${(f.size / 1024).toFixed(1)} KB`;
        $('#ic-go').disabled = false;
      };
      im.onerror = () => this._toast('Image पढ़ नहीं सका', 'error');
      im.src = url;
    };
    $('#ic-go').onclick = () => {
      if (!img) return;
      let w = parseInt($('#ic-w').value) || 0, h = parseInt($('#ic-h').value) || 0;
      if (w && !h) h = Math.round(img.naturalHeight * w / img.naturalWidth);
      else if (h && !w) w = Math.round(img.naturalWidth * h / img.naturalHeight);
      else if (!w && !h) { w = img.naturalWidth; h = img.naturalHeight; }
      const type = $('#ic-type').value;
      const q = Math.min(100, Math.max(10, parseInt($('#ic-q').value) || 90)) / 100;
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      if (type === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.drawImage(img, 0, 0, w, h);
      c.toBlob(b => {
        if (!b) return this._toast('Convert नहीं हो सका', 'error');
        const ext = type === 'image/jpeg' ? 'jpg' : type.split('/')[1];
        this._download(b, `${fname}-cyberhub.${ext}`);
        this._toast(`Done: ${(b.size / 1024).toFixed(1)} KB`, 'success');
      }, type, q);
    };
  },

  // ---- helpers for PDF tools ----
  _pdfShell(container, btnLabel, extraHtml) {
    container.innerHTML = `
      <div style="max-width:600px;margin:0 auto;background:var(--surface);padding:22px;border-radius:12px;border:1px solid var(--border);">
        <div class="dropzone" id="px-drop" style="margin-bottom:14px;">
          <i class="fa-solid fa-file-pdf" style="font-size:30px;color:var(--primary);margin-bottom:6px;"></i>
          <p style="font-weight:600;">Click to select PDF</p>
          <input type="file" id="px-file" accept="application/pdf" style="display:none;">
        </div>
        <div id="px-info" style="font-size:12px;color:var(--muted);margin-bottom:10px;"></div>
        ${extraHtml || ''}
        <button id="px-go" class="btn btn-primary" style="width:100%;" disabled><i class="fa-solid fa-download"></i> ${btnLabel}</button>
      </div>`;
    const st = { file: null, doc: null };
    const $ = s => container.querySelector(s);
    $('#px-drop').onclick = () => $('#px-file').click();
    $('#px-file').onchange = async e => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const bytes = await f.arrayBuffer();
        st.doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        st.file = f;
        $('#px-info').textContent = `${f.name} — ${st.doc.getPageCount()} pages, ${(f.size / 1024).toFixed(1)} KB`;
        $('#px-go').disabled = false;
      } catch (err) {
        this._toast('PDF खुल नहीं सका (password/corrupt हो सकता है)', 'error');
      }
    };
    return { st, $ };
  },

  _parseRanges(text, max) {
    const out = [];
    for (const part of text.split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) return null;
      const a = parseInt(m[1]), b = m[2] ? parseInt(m[2]) : a;
      if (a < 1 || b < a || b > max) return null;
      for (let i = a; i <= b; i++) out.push(i - 1);
    }
    return out.length ? out : null;
  },

  renderPdfSplit(container) {
    const { st, $ } = this._pdfShell(container, 'Extract & Download',
      `<div class="form-group"><label class="form-label">Pages (e.g. 1-3,5,8)</label><input id="px-range" class="form-control" placeholder="1-3,5"></div>`);
    $('#px-go').onclick = async () => {
      const idx = this._parseRanges($('#px-range').value, st.doc.getPageCount());
      if (!idx) return this._toast('Page range सही नहीं है', 'error');
      const out = await PDFLib.PDFDocument.create();
      (await out.copyPages(st.doc, idx)).forEach(p => out.addPage(p));
      this._download(new Blob([await out.save()], { type: 'application/pdf' }), 'split-cyberhub.pdf');
      this._toast('PDF तैयार', 'success');
    };
  },

  renderPdfPageNumber(container) {
    const { st, $ } = this._pdfShell(container, 'Add Page Numbers & Download',
      `<div class="form-group"><label class="form-label">Position</label>
        <select id="px-pos" class="form-control"><option value="c">Bottom center</option><option value="r">Bottom right</option><option value="l">Bottom left</option></select></div>`);
    $('#px-go').onclick = async () => {
      const font = await st.doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const pages = st.doc.getPages(), n = pages.length, pos = $('#px-pos').value;
      pages.forEach((p, i) => {
        const { width } = p.getSize();
        const t = `${i + 1} / ${n}`, tw = font.widthOfTextAtSize(t, 10);
        const x = pos === 'c' ? (width - tw) / 2 : pos === 'r' ? width - tw - 30 : 30;
        p.drawText(t, { x, y: 20, size: 10, font });
      });
      this._download(new Blob([await st.doc.save()], { type: 'application/pdf' }), 'numbered-cyberhub.pdf');
      this._toast('Page numbers जुड़ गए', 'success');
    };
  },

  renderPdfMetaClean(container) {
    const { st, $ } = this._pdfShell(container, 'Clean Metadata & Download');
    $('#px-go').onclick = async () => {
      const d = st.doc;
      d.setTitle(''); d.setAuthor(''); d.setSubject(''); d.setKeywords([]);
      d.setProducer(''); d.setCreator('');
      this._download(new Blob([await d.save()], { type: 'application/pdf' }), 'clean-cyberhub.pdf');
      this._toast('Metadata साफ़ हो गया', 'success');
    };
  },

  // ---- Simple calculators ----
  renderDateDiff(container) {
    const today = new Date().toISOString().slice(0, 10);
    container.innerHTML = `
      <div style="max-width:480px;margin:0 auto;background:var(--surface);padding:22px;border-radius:12px;border:1px solid var(--border);">
        <div class="form-group"><label class="form-label">From date</label><input id="dd-a" type="date" class="form-control" value="${today}"></div>
        <div class="form-group"><label class="form-label">To date</label><input id="dd-b" type="date" class="form-control" value="${today}"></div>
        <div id="dd-out" style="margin-top:12px;font-weight:600;"></div>
      </div>`;
    const $ = s => container.querySelector(s);
    const calc = () => {
      let a = new Date($('#dd-a').value), b = new Date($('#dd-b').value);
      if (isNaN(a) || isNaN(b)) return;
      if (a > b) [a, b] = [b, a];
      let y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
      if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      const days = Math.round((b - a) / 86400000);
      $('#dd-out').innerHTML = `${y} साल, ${m} महीने, ${d} दिन<br><span style="font-weight:400;color:var(--muted);">कुल ${days} दिन (${Math.floor(days / 7)} हफ्ते)</span>`;
    };
    $('#dd-a').oninput = $('#dd-b').oninput = calc;
    calc();
  },

  renderDiscount(container) {
    container.innerHTML = `
      <div style="max-width:480px;margin:0 auto;background:var(--surface);padding:22px;border-radius:12px;border:1px solid var(--border);">
        <div class="form-group"><label class="form-label">Original price (₹)</label><input id="ds-p" type="number" min="0" class="form-control" value="1000"></div>
        <div class="form-group"><label class="form-label">Discount (%)</label><input id="ds-d" type="number" min="0" max="100" class="form-control" value="10"></div>
        <div id="ds-out" style="margin-top:12px;font-weight:600;"></div>
      </div>`;
    const $ = s => container.querySelector(s);
    const calc = () => {
      const p = parseFloat($('#ds-p').value) || 0, d = parseFloat($('#ds-d').value) || 0;
      const save = p * d / 100;
      $('#ds-out').innerHTML = `Final price: ₹${(p - save).toFixed(2)}<br><span style="font-weight:400;color:var(--muted);">आपकी बचत: ₹${save.toFixed(2)}</span>`;
    };
    $('#ds-p').oninput = $('#ds-d').oninput = calc;
    calc();
  }
});

/**
 * CYBER HUB - Tools Engine & Functional Implementations
 * Real client-side implementations using HTML5 Canvas, PDF-Lib, QRCode.js, jsPDF.
 */

window.CyberTools = {
  // 1. PASSPORT PHOTO MAKER
  renderPassportPhoto(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div style="background: var(--surface); padding: 18px; border-radius: 12px; border: 1px solid var(--border);">
          <h3 style="font-size: 16px; margin-bottom: 12px;"><i class="fa-solid fa-camera"></i> 1. Upload & Settings</h3>
          <div class="dropzone" id="pp-dropzone" style="margin-bottom: 14px;">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 28px; color: var(--primary); margin-bottom: 6px;"></i>
            <p style="font-size: 13px; font-weight: 600;">Click or Drag Photo here</p>
            <p style="font-size: 11px; color: var(--muted);">Supports JPG, PNG, WEBP</p>
            <input type="file" id="pp-file" accept="image/*" style="display: none;">
          </div>
          
          <div class="form-group">
            <label class="form-label">Photo Size Standard</label>
            <select id="pp-size" class="form-control">
              <option value="passport">Indian Passport (3.5 × 4.5 cm / 35×45 mm)</option>
              <option value="visa">US / International Visa (2 × 2 inch / 51×51 mm)</option>
              <option value="stamp">Stamp Size (2.5 × 3.0 cm)</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Number of Copies</label>
              <select id="pp-copies" class="form-control">
                <option value="1">1 Copy</option>
                <option value="2">2 Copies</option>
                <option value="4">4 Copies</option>
                <option value="6">6 Copies</option>
                <option value="8" selected>8 Copies (Standard)</option>
                <option value="12">12 Copies</option>
                <option value="16">16 Copies</option>
                <option value="32">32 Copies (Full Sheet)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Paper Size</label>
              <select id="pp-paper" class="form-control">
                <option value="4x6" selected>4 × 6 inch (Photo Paper)</option>
                <option value="a4">A4 Sheet (210 × 297 mm)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Cutting Border</label>
              <select id="pp-border" class="form-control">
                <option value="black">Thin Black Line</option>
                <option value="white">White Border</option>
                <option value="none">No Border</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Brightness/Contrast</label>
              <input type="range" id="pp-brightness" min="80" max="130" value="100" class="form-control" style="padding: 2px;">
            </div>
          </div>

          <button id="pp-generate-btn" class="btn btn-primary" style="width: 100%; margin-top: 8px;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Print Sheet
          </button>
        </div>

        <div style="background: var(--surface); padding: 18px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px;"><i class="fa-solid fa-eye"></i> 2. Preview & Print</h3>
            <span id="pp-status" style="font-size: 12px; color: var(--muted);">Ready for upload</span>
          </div>
          
          <div style="flex: 1; min-height: 280px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: auto; padding: 10px;" id="pp-canvas-wrapper">
            <canvas id="pp-canvas" style="max-width: 100%; height: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.15); background: white;"></canvas>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px;">
            <button id="pp-download-jpg" class="btn btn-secondary" style="flex: 1;">
              <i class="fa-solid fa-download"></i> Download JPG
            </button>
            <button id="pp-print-btn" class="btn btn-primary" style="flex: 1;">
              <i class="fa-solid fa-print"></i> Print Sheet
            </button>
          </div>
        </div>
      </div>
    `;

    let userImg = null;
    const dropzone = container.querySelector('#pp-dropzone');
    const fileInput = container.querySelector('#pp-file');
    const canvas = container.querySelector('#pp-canvas');
    const ctx = canvas.getContext('2d');

    // Default placeholder
    const drawPlaceholder = () => {
      canvas.width = 400;
      canvas.height = 280;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a photo to generate passport sheet', canvas.width / 2, canvas.height / 2);
    };
    drawPlaceholder();

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
    });

    function loadFile(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          userImg = img;
          container.querySelector('#pp-status').textContent = 'Photo loaded: ' + file.name;
          CyberApp.showToast('Photo uploaded successfully', 'success');
          generatePassportSheet();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    function generatePassportSheet() {
      if (!userImg) {
        CyberApp.showToast('Please upload a photo first', 'error');
        return;
      }
      const sizeType = container.querySelector('#pp-size').value;
      const copies = parseInt(container.querySelector('#pp-copies').value, 10);
      const paperType = container.querySelector('#pp-paper').value;
      const borderType = container.querySelector('#pp-border').value;
      const brightness = container.querySelector('#pp-brightness').value;

      // 300 DPI calculations
      // 4x6 inch = 1200 x 1800 px
      // A4 = 2480 x 3508 px
      const paperW = paperType === '4x6' ? 1800 : 2480;
      const paperH = paperType === '4x6' ? 1200 : 3508;

      canvas.width = paperW;
      canvas.height = paperH;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, paperW, paperH);

      // Photo size in px at 300 DPI:
      // Passport: 3.5cm x 4.5cm ≈ 413 x 531 px
      // Visa: 2x2 inch = 600 x 600 px
      // Stamp: 2.5cm x 3.0cm ≈ 295 x 354 px
      let photoW = 413, photoH = 531;
      if (sizeType === 'visa') { photoW = 600; photoH = 600; }
      else if (sizeType === 'stamp') { photoW = 295; photoH = 354; }

      // Temporary canvas for cropped and adjusted single photo
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = photoW;
      tempCanvas.height = photoH;
      const tctx = tempCanvas.getContext('2d');

      // Aspect fill crop
      const imgRatio = userImg.width / userImg.height;
      const targetRatio = photoW / photoH;
      let sx = 0, sy = 0, sWidth = userImg.width, sHeight = userImg.height;

      if (imgRatio > targetRatio) {
        sWidth = userImg.height * targetRatio;
        sx = (userImg.width - sWidth) / 2;
      } else {
        sHeight = userImg.width / targetRatio;
        sy = (userImg.height - sHeight) / 2;
      }

      tctx.filter = `brightness(${brightness}%)`;
      tctx.drawImage(userImg, sx, sy, sWidth, sHeight, 0, 0, photoW, photoH);
      tctx.filter = 'none';

      // Border on photo
      if (borderType === 'black') {
        tctx.strokeStyle = '#333333';
        tctx.lineWidth = 4;
        tctx.strokeRect(0, 0, photoW, photoH);
      } else if (borderType === 'white') {
        tctx.strokeStyle = '#ffffff';
        tctx.lineWidth = 12;
        tctx.strokeRect(0, 0, photoW, photoH);
      }

      // Calculate grid columns and rows
      const marginX = 80;
      const marginY = 80;
      const gapX = 40;
      const gapY = 40;

      const cols = Math.floor((paperW - 2 * marginX + gapX) / (photoW + gapX));
      
      for (let i = 0; i < copies; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const posX = marginX + col * (photoW + gapX);
        const posY = marginY + row * (photoH + gapY);

        if (posY + photoH > paperH) break; // stay on sheet

        ctx.drawImage(tempCanvas, posX, posY);

        // Draw light dotted cutting guidelines
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(posX - 4, posY - 4, photoW + 8, photoH + 8);
        ctx.setLineDash([]);
      }

      // Stamp cyber hub branding on margin
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('CYBER HUB • Sikti, Araria, Bihar (+91 73690 87808)', paperW - 80, paperH - 40);

      CyberApp.showToast(`Generated ${copies} photo(s) sheet!`, 'success');
    }

    container.querySelector('#pp-generate-btn').addEventListener('click', generatePassportSheet);

    container.querySelector('#pp-download-jpg').addEventListener('click', () => {
      if (!userImg) return CyberApp.showToast('Please upload a photo first', 'error');
      const link = document.createElement('a');
      link.download = `CyberHub_Passport_Photos_${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      CyberApp.showToast('Downloaded photo sheet!', 'success');
    });

    container.querySelector('#pp-print-btn').addEventListener('click', () => {
      if (!userImg) return CyberApp.showToast('Please upload a photo first', 'error');
      const win = window.open('');
      win.document.write(`
        <html>
          <head>
            <title>Print Photos - CYBER HUB</title>
            <style>
              @page { margin: 0; size: auto; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body onload="window.print();window.close();">
            <img src="${canvas.toDataURL('image/jpeg', 0.95)}" />
          </body>
        </html>
      `);
      win.document.close();
    });
  },

  // 2. IMAGE COMPRESSOR
  renderImageCompressor(container) {
    container.innerHTML = `
      <div style="max-width: 700px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="dropzone" id="ic-dropzone" style="margin-bottom: 18px;">
          <i class="fa-solid fa-compress" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Click or Drag Image to Compress</p>
          <p style="font-size: 12px; color: var(--muted);">JPG, PNG, WebP for SSC, Railway, BPSC portals</p>
          <input type="file" id="ic-file" accept="image/*" style="display: none;">
        </div>

        <div id="ic-controls" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <div style="padding: 12px; border-radius: 8px; background: var(--background); border: 1px solid var(--border);">
              <span style="font-size: 12px; color: var(--muted);">Original Size:</span>
              <p id="ic-orig-size" style="font-size: 18px; font-weight: 700; color: var(--text);">-</p>
            </div>
            <div style="padding: 12px; border-radius: 8px; background: var(--primary-light); border: 1px solid rgba(37,99,235,0.2);">
              <span style="font-size: 12px; color: var(--primary);">Estimated Compressed:</span>
              <p id="ic-comp-size" style="font-size: 18px; font-weight: 700; color: var(--primary);">-</p>
            </div>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <label class="form-label" style="margin: 0;">Quality Level</label>
              <span id="ic-quality-val" style="font-size: 13px; font-weight: 700; color: var(--primary);">75%</span>
            </div>
            <input type="range" id="ic-quality" min="10" max="95" value="75" class="form-control" style="padding: 2px;">
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 16px;">
            <button class="btn btn-secondary btn-sm ic-preset" data-val="90">High (90%)</button>
            <button class="btn btn-secondary btn-sm ic-preset" data-val="70">Form Std (70%)</button>
            <button class="btn btn-secondary btn-sm ic-preset" data-val="40">Under 50 KB</button>
            <button class="btn btn-secondary btn-sm ic-preset" data-val="20">Under 20 KB</button>
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="ic-download-btn" class="btn btn-primary" style="flex: 1;">
              <i class="fa-solid fa-download"></i> Download Compressed Image
            </button>
          </div>
        </div>
      </div>
    `;

    let originalFile = null;
    let loadedImg = null;
    const dropzone = container.querySelector('#ic-dropzone');
    const fileInput = container.querySelector('#ic-file');
    const controls = container.querySelector('#ic-controls');
    const qualitySlider = container.querySelector('#ic-quality');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleImg(e.target.files[0]);
    });

    function handleImg(file) {
      originalFile = file;
      container.querySelector('#ic-orig-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          loadedImg = img;
          controls.style.display = 'block';
          updateCompression();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function updateCompression() {
      if (!loadedImg) return;
      const q = qualitySlider.value / 100;
      container.querySelector('#ic-quality-val').textContent = qualitySlider.value + '%';

      const canvas = document.createElement('canvas');
      canvas.width = loadedImg.width;
      canvas.height = loadedImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loadedImg, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const kb = (blob.size / 1024).toFixed(1);
          container.querySelector('#ic-comp-size').textContent = kb + ' KB';
        }
      }, 'image/jpeg', q);
    }

    qualitySlider.addEventListener('input', updateCompression);

    container.querySelectorAll('.ic-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        qualitySlider.value = btn.dataset.val;
        updateCompression();
      });
    });

    container.querySelector('#ic-download-btn').addEventListener('click', () => {
      if (!loadedImg) return;
      const canvas = document.createElement('canvas');
      canvas.width = loadedImg.width;
      canvas.height = loadedImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loadedImg, 0, 0);
      const q = qualitySlider.value / 100;
      const link = document.createElement('a');
      link.download = `CyberHub_Compressed_${originalFile.name}`;
      link.href = canvas.toDataURL('image/jpeg', q);
      link.click();
      CyberApp.showToast('Downloaded compressed image!', 'success');
    });
  },

  // 3. SIGNATURE RESIZER (140x60, 10-20KB)
  renderSignatureResizer(container) {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <p style="font-size: 13.5px; color: var(--muted); margin-bottom: 16px;">
          Standard sizing for <strong>SSC, UPSC, Railway, BPSC, IBPS</strong> application forms (typically 140×60 pixels, 10 KB to 20 KB).
        </p>

        <div class="dropzone" id="sig-dropzone" style="margin-bottom: 16px;">
          <i class="fa-solid fa-signature" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Upload Candidate Signature</p>
          <input type="file" id="sig-file" accept="image/*" style="display: none;">
        </div>

        <div id="sig-controls" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label">Width (px)</label>
              <input type="number" id="sig-w" value="140" class="form-control">
            </div>
            <div class="form-group">
              <label class="form-label">Height (px)</label>
              <input type="number" id="sig-h" value="60" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Ink Enhancement (Black & White Boost)</label>
            <select id="sig-filter" class="form-control">
              <option value="high-contrast">High Contrast (Dark Ink, White Paper)</option>
              <option value="grayscale">Clean Grayscale</option>
              <option value="original">Original Color</option>
            </select>
          </div>

          <div style="background: #e2e8f0; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 16px;">
            <canvas id="sig-canvas" style="box-shadow: 0 2px 6px rgba(0,0,0,0.1); background: white; max-width: 100%;"></canvas>
            <p id="sig-size-tag" style="font-size: 12px; font-weight: 700; color: #0f172a; margin-top: 6px;">Size: ~12 KB</p>
          </div>

          <button id="sig-download-btn" class="btn btn-primary" style="width: 100%;">
            <i class="fa-solid fa-download"></i> Download Signature (Sarkari Ready)
          </button>
        </div>
      </div>
    `;

    let sigImg = null;
    const dropzone = container.querySelector('#sig-dropzone');
    const fileInput = container.querySelector('#sig-file');
    const controls = container.querySelector('#sig-controls');
    const canvas = container.querySelector('#sig-canvas');
    const ctx = canvas.getContext('2d');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            sigImg = img;
            controls.style.display = 'block';
            renderSig();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

    function renderSig() {
      if (!sigImg) return;
      const w = parseInt(container.querySelector('#sig-w').value, 10) || 140;
      const h = parseInt(container.querySelector('#sig-h').value, 10) || 60;
      const filter = container.querySelector('#sig-filter').value;

      canvas.width = w;
      canvas.height = h;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      if (filter === 'high-contrast') {
        ctx.filter = 'contrast(200%) brightness(110%) grayscale(100%)';
      } else if (filter === 'grayscale') {
        ctx.filter = 'grayscale(100%)';
      } else {
        ctx.filter = 'none';
      }

      ctx.drawImage(sigImg, 0, 0, w, h);
      ctx.filter = 'none';

      canvas.toBlob((blob) => {
        if (blob) {
          container.querySelector('#sig-size-tag').textContent = `Dimensions: ${w}×${h}px | File Size: ${(blob.size / 1024).toFixed(1)} KB`;
        }
      }, 'image/jpeg', 0.85);
    }

    container.querySelector('#sig-w').addEventListener('input', renderSig);
    container.querySelector('#sig-h').addEventListener('input', renderSig);
    container.querySelector('#sig-filter').addEventListener('change', renderSig);

    container.querySelector('#sig-download-btn').addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `Signature_Sarkari_${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.85);
      link.click();
      CyberApp.showToast('Signature downloaded successfully!', 'success');
    });
  },

  // 4. QR CODE GENERATOR
  renderQrGenerator(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        <div style="background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
          <div style="display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px;">
            <button class="btn btn-sm btn-primary qr-tab" data-type="upi">UPI / Payment</button>
            <button class="btn btn-sm btn-secondary qr-tab" data-type="whatsapp">WhatsApp</button>
            <button class="btn btn-sm btn-secondary qr-tab" data-type="url">Website / URL</button>
            <button class="btn btn-sm btn-secondary qr-tab" data-type="wifi">Wi-Fi</button>
            <button class="btn btn-sm btn-secondary qr-tab" data-type="text">Plain Text</button>
          </div>

          <div id="qr-inputs">
            <!-- UPI Default -->
            <div id="qr-input-upi">
              <div class="form-group">
                <label class="form-label">UPI ID (VPA)</label>
                <input type="text" id="qr-upi-id" class="form-control" value="7369087808@upi" placeholder="e.g. 7369087808@upi">
              </div>
              <div class="form-group">
                <label class="form-label">Payee Name</label>
                <input type="text" id="qr-upi-name" class="form-control" value="CYBER HUB (Rahul Rrony)">
              </div>
              <div class="form-group">
                <label class="form-label">Amount (₹ Optional)</label>
                <input type="number" id="qr-upi-amt" class="form-control" placeholder="Leave blank for customer input">
              </div>
            </div>

            <!-- WhatsApp -->
            <div id="qr-input-whatsapp" style="display: none;">
              <div class="form-group">
                <label class="form-label">Mobile Number (with country code)</label>
                <input type="text" id="qr-wa-num" class="form-control" value="+917369087808">
              </div>
              <div class="form-group">
                <label class="form-label">Prefilled Message</label>
                <input type="text" id="qr-wa-msg" class="form-control" value="Hello CYBER HUB Sikti, I need help with digital services.">
              </div>
            </div>

            <!-- URL -->
            <div id="qr-input-url" style="display: none;">
              <div class="form-group">
                <label class="form-label">Website URL</label>
                <input type="url" id="qr-url-val" class="form-control" value="https://cyberhub-sikti.bihar.gov" placeholder="https://example.com">
              </div>
            </div>

            <!-- Wi-Fi -->
            <div id="qr-input-wifi" style="display: none;">
              <div class="form-group">
                <label class="form-label">Wi-Fi Network Name (SSID)</label>
                <input type="text" id="qr-wifi-ssid" class="form-control" value="CYBER_HUB_5G">
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="text" id="qr-wifi-pass" class="form-control" value="cyberhub1234">
              </div>
            </div>

            <!-- Plain Text -->
            <div id="qr-input-text" style="display: none;">
              <div class="form-group">
                <label class="form-label">Enter Any Text</label>
                <textarea id="qr-text-val" class="form-control" rows="3">CYBER HUB Sikti Araria Bihar - Rahul Rrony</textarea>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div class="form-group">
              <label class="form-label">QR Size</label>
              <select id="qr-size" class="form-control">
                <option value="180">Small (180px)</option>
                <option value="256" selected>Medium (256px)</option>
                <option value="360">Large (360px)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Error Correction</label>
              <select id="qr-level" class="form-control">
                <option value="M">Medium (15%)</option>
                <option value="H" selected>High (30% - Best for Print)</option>
              </select>
            </div>
          </div>

          <button id="qr-generate-btn" class="btn btn-primary" style="width: 100%; margin-top: 12px;">
            <i class="fa-solid fa-qrcode"></i> Generate QR Code
          </button>
        </div>

        <div style="background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div id="qr-display-card" style="padding: 24px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); width: 100%; max-width: 320px;">
            <div style="font-weight: 800; font-size: 16px; color: #0f172a; margin-bottom: 2px;">CYBER HUB</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 14px;">Sikti, Araria, Bihar • Rahul Rrony</div>
            <div id="qrcode-box" style="display: flex; justify-content: center; margin: 0 auto; min-height: 200px; align-items: center;"></div>
            <div id="qr-caption" style="font-size: 12px; font-weight: 600; color: #2563eb; margin-top: 12px;">Scan & Pay / Connect</div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 20px; width: 100%; max-width: 320px;">
            <button id="qr-download-png" class="btn btn-secondary" style="flex: 1;">
              <i class="fa-solid fa-download"></i> Download
            </button>
            <button id="qr-print-btn" class="btn btn-primary" style="flex: 1;">
              <i class="fa-solid fa-print"></i> Print Standee
            </button>
          </div>
        </div>
      </div>
    `;

    let activeTab = 'upi';
    const tabs = container.querySelectorAll('.qr-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('btn-primary'); t.classList.add('btn-secondary'); });
        tab.classList.remove('btn-secondary');
        tab.classList.add('btn-primary');
        activeTab = tab.dataset.type;

        container.querySelectorAll('#qr-inputs > div').forEach(div => div.style.display = 'none');
        container.querySelector(`#qr-input-${activeTab}`).style.display = 'block';
        generateQR();
      });
    });

    function generateQR() {
      const qrcodeBox = container.querySelector('#qrcode-box');
      qrcodeBox.innerHTML = '';

      let text = '';
      let caption = '';

      if (activeTab === 'upi') {
        const vpa = container.querySelector('#qr-upi-id').value.trim();
        const name = container.querySelector('#qr-upi-name').value.trim();
        const amt = container.querySelector('#qr-upi-amt').value.trim();
        text = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}${amt ? `&am=${amt}&cu=INR` : ''}`;
        caption = amt ? `Scan to Pay ₹${amt}` : 'Scan & Pay with any UPI App';
      } else if (activeTab === 'whatsapp') {
        const num = container.querySelector('#qr-wa-num').value.replace(/[^0-9]/g, '');
        const msg = container.querySelector('#qr-wa-msg').value;
        text = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
        caption = 'Scan to Chat on WhatsApp';
      } else if (activeTab === 'url') {
        text = container.querySelector('#qr-url-val').value.trim();
        caption = 'Scan to Visit Website';
      } else if (activeTab === 'wifi') {
        const ssid = container.querySelector('#qr-wifi-ssid').value;
        const pass = container.querySelector('#qr-wifi-pass').value;
        text = `WIFI:T:WPA;S:${ssid};P:${pass};;`;
        caption = `Wi-Fi: ${ssid}`;
      } else {
        text = container.querySelector('#qr-text-val').value.trim();
        caption = 'Scan to Read';
      }

      container.querySelector('#qr-caption').textContent = caption;
      const size = parseInt(container.querySelector('#qr-size').value, 10);

      // Using CDN QRCode
      if (window.QRCode) {
        new QRCode(qrcodeBox, {
          text: text,
          width: size,
          height: size,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel[container.querySelector('#qr-level').value] || QRCode.CorrectLevel.H
        });
      } else {
        qrcodeBox.innerHTML = `<p style="color: red; font-size: 12px;">QR library loading... Please wait.</p>`;
      }
    }

    container.querySelector('#qr-generate-btn').addEventListener('click', generateQR);

    container.querySelector('#qr-download-png').addEventListener('click', () => {
      const img = container.querySelector('#qrcode-box img');
      if (img && img.src) {
        const link = document.createElement('a');
        link.download = `CyberHub_QR_${activeTab}.png`;
        link.href = img.src;
        link.click();
        CyberApp.showToast('Downloaded QR Code image', 'success');
      } else {
        CyberApp.showToast('Please generate QR first', 'error');
      }
    });

    container.querySelector('#qr-print-btn').addEventListener('click', () => {
      const card = container.querySelector('#qr-display-card');
      const win = window.open('');
      win.document.write(`
        <html>
          <head>
            <title>CYBER HUB Standee Print</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; background: #f8fafc; }
              .card { border: 2px solid #2563eb; padding: 30px; border-radius: 20px; background: white; text-align: center; width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
              img { margin: 15px auto; display: block; }
            </style>
          </head>
          <body onload="window.print();window.close();">
            <div class="card">${card.innerHTML}</div>
          </body>
        </html>
      `);
      win.document.close();
    });

    setTimeout(generateQR, 200);
  },

  // 5. AGE CALCULATOR
  renderAgeCalculator(container) {
    const today = new Date().toISOString().split('T')[0];
    container.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border);">
        <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">
          Calculate exact age for Sarkari job eligibility cut-offs (Years, Months, Days).
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label">Date of Birth (DOB)</label>
            <input type="date" id="age-dob" class="form-control" value="2000-01-15">
          </div>
          <div class="form-group">
            <label class="form-label">Age as on Date (Cut-off)</label>
            <input type="date" id="age-as-on" class="form-control" value="${today}">
          </div>
        </div>

        <button id="calc-age-btn" class="btn btn-primary" style="width: 100%; margin-bottom: 20px;">
          <i class="fa-solid fa-cake-candles"></i> Calculate Exact Age
        </button>

        <div id="age-result-box" style="display: none; background: var(--primary-light); padding: 18px; border-radius: 10px; border: 1px solid rgba(37,99,235,0.2);">
          <div style="text-align: center; margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--primary); text-transform: uppercase;">Exact Age</div>
            <div id="age-years-str" style="font-size: 26px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">
              0 Years, 0 Months, 0 Days
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; border-top: 1px solid rgba(37,99,235,0.2); padding-top: 12px;">
            <div>
              <span style="font-size: 11px; color: var(--muted);">Total Months</span>
              <p id="age-total-months" style="font-weight: 700; font-size: 15px;">-</p>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--muted);">Total Days</span>
              <p id="age-total-days" style="font-weight: 700; font-size: 15px;">-</p>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--muted);">Next Birthday in</span>
              <p id="age-next-bday" style="font-weight: 700; font-size: 15px; color: #16a34a;">-</p>
            </div>
          </div>
        </div>
      </div>
    `;

    function calculateAge() {
      const dobVal = container.querySelector('#age-dob').value;
      const asOnVal = container.querySelector('#age-as-on').value;
      if (!dobVal || !asOnVal) return;

      const dob = new Date(dobVal);
      const asOn = new Date(asOnVal);

      if (dob > asOn) {
        CyberApp.showToast('DOB cannot be in the future of target date!', 'error');
        return;
      }

      let years = asOn.getFullYear() - dob.getFullYear();
      let months = asOn.getMonth() - dob.getMonth();
      let days = asOn.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(asOn.getFullYear(), asOn.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      const diffTime = Math.abs(asOn - dob);
      const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalMonths = years * 12 + months;

      // Next Birthday
      let nextBday = new Date(asOn.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBday < asOn) {
        nextBday.setFullYear(asOn.getFullYear() + 1);
      }
      const daysToNext = Math.ceil((nextBday - asOn) / (1000 * 60 * 60 * 24));

      container.querySelector('#age-years-str').textContent = `${years} Years, ${months} Months, ${days} Days`;
      container.querySelector('#age-total-months').textContent = totalMonths + ' Months';
      container.querySelector('#age-total-days').textContent = totalDays.toLocaleString('en-IN') + ' Days';
      container.querySelector('#age-next-bday').textContent = `${daysToNext} Days`;

      container.querySelector('#age-result-box').style.display = 'block';
    }

    container.querySelector('#calc-age-btn').addEventListener('click', calculateAge);
    calculateAge();
  },

  // 6. EMI CALCULATOR
  renderEmiCalculator(container) {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border);">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div class="form-group">
            <label class="form-label">Loan Amount (₹)</label>
            <input type="number" id="emi-amount" class="form-control" value="100000" step="5000">
          </div>
          <div class="form-group">
            <label class="form-label">Interest Rate (% p.a.)</label>
            <input type="number" id="emi-rate" class="form-control" value="10.5" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label">Tenure (Years)</label>
            <input type="number" id="emi-tenure" class="form-control" value="2" step="0.5">
          </div>
        </div>

        <button id="emi-calc-btn" class="btn btn-primary" style="width: 100%; margin-bottom: 20px;">
          <i class="fa-solid fa-calculator"></i> Calculate Monthly EMI
        </button>

        <div id="emi-results" style="background: var(--background); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
          <div style="text-align: center; margin-bottom: 16px;">
            <span style="font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase;">Monthly EMI Payable</span>
            <div id="emi-monthly-val" style="font-size: 32px; font-weight: 800; color: var(--primary); font-family: var(--font-heading);">
              ₹ 0
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
            <div style="background: var(--surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
              <span style="font-size: 11px; color: var(--muted);">Total Interest</span>
              <p id="emi-total-interest" style="font-size: 16px; font-weight: 700; color: #ef4444;">₹ 0</p>
            </div>
            <div style="background: var(--surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
              <span style="font-size: 11px; color: var(--muted);">Total Payment (P + I)</span>
              <p id="emi-total-payment" style="font-size: 16px; font-weight: 700; color: var(--text);">₹ 0</p>
            </div>
          </div>

          <!-- Visual Bar Breakdown -->
          <div style="margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
              <span style="color: var(--primary);">Principal: <span id="emi-p-percent">0%</span></span>
              <span style="color: #ef4444;">Interest: <span id="emi-i-percent">0%</span></span>
            </div>
            <div style="height: 12px; width: 100%; border-radius: 6px; background: #ef4444; overflow: hidden; display: flex;">
              <div id="emi-progress-bar" style="background: var(--primary); width: 70%; height: 100%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    function computeEmi() {
      const p = parseFloat(container.querySelector('#emi-amount').value) || 0;
      const rAnnual = parseFloat(container.querySelector('#emi-rate').value) || 0;
      const tYears = parseFloat(container.querySelector('#emi-tenure').value) || 0;

      if (p <= 0 || rAnnual <= 0 || tYears <= 0) return;

      const rMonthly = (rAnnual / 12) / 100;
      const nMonths = tYears * 12;

      // EMI formula = [P x R x (1+R)^N]/[(1+R)^N-1]
      const emi = (p * rMonthly * Math.pow(1 + rMonthly, nMonths)) / (Math.pow(1 + rMonthly, nMonths) - 1);
      const totalPayment = emi * nMonths;
      const totalInterest = totalPayment - p;

      const pPercent = Math.round((p / totalPayment) * 100);
      const iPercent = 100 - pPercent;

      container.querySelector('#emi-monthly-val').textContent = '₹ ' + Math.round(emi).toLocaleString('en-IN');
      container.querySelector('#emi-total-interest').textContent = '₹ ' + Math.round(totalInterest).toLocaleString('en-IN');
      container.querySelector('#emi-total-payment').textContent = '₹ ' + Math.round(totalPayment).toLocaleString('en-IN');

      container.querySelector('#emi-p-percent').textContent = pPercent + '%';
      container.querySelector('#emi-i-percent').textContent = iPercent + '%';
      container.querySelector('#emi-progress-bar').style.width = pPercent + '%';
    }

    container.querySelector('#emi-calc-btn').addEventListener('click', computeEmi);
    computeEmi();
  },

  // 7. BIHAR LAND MEASUREMENT CONVERTER (Special for Sikti, Araria)
  renderBiharLandConverter(container) {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border);">
        <p style="font-size: 13.5px; color: var(--muted); margin-bottom: 16px;">
          Standard agricultural and residential land conversion factors used in <strong>Araria, Purnia & Bihar</strong> registry offices (Lagi 6.5 haath standard).
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
          <div class="form-group">
            <label class="form-label">Input Value</label>
            <input type="number" id="land-val" class="form-control" value="1" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label">From Unit</label>
            <select id="land-unit" class="form-control">
              <option value="katha" selected>Katha (कट्ठा)</option>
              <option value="bigha">Bigha (बीघा = 20 Katha)</option>
              <option value="dhur">Dhur (धूर = 1/20 Katha)</option>
              <option value="decimal">Decimal / Dismil (डिसमिल)</option>
              <option value="sqft">Square Feet (वर्ग फुट)</option>
              <option value="gaj">Gaj (वर्ग गज)</option>
              <option value="acre">Acre (एकड़)</option>
            </select>
          </div>
        </div>

        <div style="background: var(--background); padding: 18px; border-radius: 10px; border: 1px solid var(--border);">
          <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--primary);">Equivalent Values in Araria/Bihar:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;" id="land-grid">
            <!-- Results dynamically filled -->
          </div>
        </div>
      </div>
    `;

    // 1 Katha in Bihar (Standard 6.5 haath lagi ≈ 1361.25 sq ft)
    // 1 Bigha = 20 Katha ≈ 27,225 sq ft
    // 1 Dhur = 1/20 Katha ≈ 68.06 sq ft
    // 1 Decimal = 435.6 sq ft (1 Acre = 100 Decimal = 43,560 sq ft)
    // 1 Gaj = 9 sq ft
    const sqftPerUnit = {
      sqft: 1,
      katha: 1361.25,
      bigha: 27225,
      dhur: 68.0625,
      decimal: 435.6,
      gaj: 9,
      acre: 43560
    };

    function updateLand() {
      const val = parseFloat(container.querySelector('#land-val').value) || 0;
      const unit = container.querySelector('#land-unit').value;
      const totalSqft = val * sqftPerUnit[unit];

      const grid = container.querySelector('#land-grid');
      const units = [
        { label: 'Katha (कट्ठा)', val: (totalSqft / sqftPerUnit.katha).toFixed(3) },
        { label: 'Bigha (बीघा)', val: (totalSqft / sqftPerUnit.bigha).toFixed(3) },
        { label: 'Dhur (धूर)', val: (totalSqft / sqftPerUnit.dhur).toFixed(2) },
        { label: 'Decimal / Dismil', val: (totalSqft / sqftPerUnit.decimal).toFixed(3) },
        { label: 'Square Feet (Sq. Ft.)', val: totalSqft.toLocaleString('en-IN', { maximumFractionDigits: 2 }) },
        { label: 'Gaj (वर्ग गज)', val: (totalSqft / sqftPerUnit.gaj).toFixed(2) },
        { label: 'Acre (एकड़)', val: (totalSqft / sqftPerUnit.acre).toFixed(4) }
      ];

      grid.innerHTML = units.map(u => `
        <div style="padding: 10px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border);">
          <div style="font-size: 11.5px; color: var(--muted);">${u.label}</div>
          <div style="font-size: 16px; font-weight: 700; color: var(--text);">${u.val}</div>
        </div>
      `).join('');
    }

    container.querySelector('#land-val').addEventListener('input', updateLand);
    container.querySelector('#land-unit').addEventListener('change', updateLand);
    updateLand();
  },

  // 8. SARKARI APPLICATION MAKER
  renderApplicationMaker(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div style="background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
          <h3 style="font-size: 16px; margin-bottom: 14px;"><i class="fa-solid fa-file-lines"></i> 1. Select Template & Details</h3>
          
          <div class="form-group">
            <label class="form-label">Application Type</label>
            <select id="app-type" class="form-control">
              <option value="bank-atm">Bank: New ATM / Debit Card Request</option>
              <option value="bank-mobile">Bank: Mobile Number Link / Change</option>
              <option value="bank-passbook">Bank: Duplicate Passbook Request</option>
              <option value="school-leave">School / College: Sick / Emergency Leave</option>
              <option value="college-tc">School / College: Transfer Certificate (TC / SLC)</option>
              <option value="police-lost">Police: Lost Documents / Mobile Complaint</option>
              <option value="general-leave">Office / Work: Formal Leave Letter</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Language</label>
            <select id="app-lang" class="form-control">
              <option value="hindi" selected>Hindi (हिंदी)</option>
              <option value="english">English</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Applicant Name</label>
              <input type="text" id="app-name" class="form-control" value="Rahul Kumar">
            </div>
            <div class="form-group">
              <label class="form-label">Father's Name</label>
              <input type="text" id="app-father" class="form-control" value="Shri Rameshwar Singh">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Village / Town & District</label>
              <input type="text" id="app-address" class="form-control" value="Sikti, Araria, Bihar">
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="text" id="app-phone" class="form-control" value="+91 73690 87808">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Account No. / Roll No. / Ref ID</label>
            <input type="text" id="app-ref-num" class="form-control" value="384920194829">
          </div>

          <div class="form-group">
            <label class="form-label">Recipient Officer & Institution</label>
            <input type="text" id="app-recipient" class="form-control" value="शाखा प्रबंधक महोदय, भारतीय स्टेट बैंक (SBI), शाखा सिकटी, अररिया">
          </div>

          <button id="app-generate-btn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
            <i class="fa-solid fa-pen-nib"></i> Generate Formatted Letter
          </button>
        </div>

        <div style="background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px;"><i class="fa-solid fa-file-invoice"></i> 2. Formatted Application</h3>
            <div style="display: flex; gap: 6px;">
              <button id="app-copy-btn" class="btn btn-secondary btn-sm"><i class="fa-solid fa-copy"></i> Copy</button>
              <button id="app-print-btn" class="btn btn-primary btn-sm"><i class="fa-solid fa-print"></i> Print</button>
            </div>
          </div>

          <div id="app-preview-box" class="printable-area" style="flex: 1; min-height: 380px; padding: 24px; background: white; border: 1px solid var(--border); border-radius: 8px; font-family: 'Times New Roman', serif; font-size: 15px; line-height: 1.8; color: #000; overflow-y: auto; white-space: pre-wrap;">
          </div>
        </div>
      </div>
    `;

    function buildLetter() {
      const type = container.querySelector('#app-type').value;
      const lang = container.querySelector('#app-lang').value;
      const name = container.querySelector('#app-name').value;
      const father = container.querySelector('#app-father').value;
      const address = container.querySelector('#app-address').value;
      const phone = container.querySelector('#app-phone').value;
      const refNum = container.querySelector('#app-ref-num').value;
      const recipient = container.querySelector('#app-recipient').value;
      const today = new Date().toLocaleDateString('hi-IN');

      let text = '';

      if (lang === 'hindi') {
        if (type.startsWith('bank')) {
          let subject = 'नया एटीएम कार्ड जारी करने के संबंध में';
          let bodySpecific = `मेरा खाता संख्या ${refNum} आपकी शाखा में संचालित है। मेरा पुराना एटीएम कार्ड खो गया है / मुझे ऑनलाइन लेन-देन हेतु नए एटीएम कार्ड की सख्त आवश्यकता है।`;
          if (type === 'bank-mobile') {
            subject = 'बैंक खाते में मोबाइल नंबर लिंक / बदलने के संबंध में';
            bodySpecific = `मेरा खाता संख्या ${refNum} आपकी शाखा में संचालित है। मैं अपने खाते में नया मोबाइल नंबर (${phone}) पंजीकृत कराना चाहता हूँ ताकि मुझे एसएमएस अलर्ट प्राप्त हो सके।`;
          } else if (type === 'bank-passbook') {
            subject = 'नई पासबुक (Duplicate Passbook) जारी करने हेतु आवेदन पत्र';
            bodySpecific = `मेरा खाता संख्या ${refNum} आपकी शाखा में है। मेरी पुरानी पासबुक पूरी तरह भर चुकी है / खो गई है। अतः मुझे नई पासबुक प्रदान करने की कृपा करें।`;
          }

          text = `सेवा में,
${recipient}

दिनांक: ${today}

विषय: ${subject}

महोदय,
    सविनय निवेदन है कि मैं ${name}, पिता- ${father}, ग्राम/मोहल्ला- ${address} का स्थायी निवासी हूँ। ${bodySpecific}

    अतः श्रीमान से विनम्र प्रार्थना है कि मेरे इस आवेदन पर त्वरित संज्ञान लेते हुए आवश्यक कार्रवाई करने की कृपा करें। इसके लिए मैं सदा आपका आभारी रहूँगा।

संलग्न दस्तावेज:
1. आधार कार्ड की छायाप्रति
2. पैन कार्ड की छायाप्रति
3. बैंक पासबुक की छायाप्रति

भवदीय / विश्वासी
हस्ताक्षर: ........................
नाम: ${name}
खाता संख्या: ${refNum}
मोबाइल नंबर: ${phone}
पता: ${address}
`;
        } else if (type === 'school-leave' || type === 'general-leave') {
          text = `सेवा में,
प्रधानाचार्य / अधिकारी महोदय,
${recipient}

दिनांक: ${today}

विषय: 3 दिनों के आकस्मिक अवकाश हेतु आवेदन पत्र।

महोदय,
    सविनय निवेदन है कि मैं ${name}, पिता- ${father}, आपके संस्थान/विद्यालय का छात्र/कर्मचारी हूँ (रोल नंबर/आईडी: ${refNum})। मुझे कल रात से तेज बुखार एवं स्वास्थ्य खराब होने के कारण चिकित्सक ने आराम करने की सलाह दी है। 

    अतः मैं दिनांक ......... से ......... तक उपस्थित होने में असमर्थ हूँ।

    कृपा कर मुझे 3 दिनों का अवकाश स्वीकृत करने की कृपा करें।

आपका आज्ञाकारी
नाम: ${name}
अनुक्रमांक / आईडी: ${refNum}
मोबाइल: ${phone}
`;
        } else {
          text = `सेवा में,
थाना प्रभारी महोदय,
थाना: सिकटी, जिला: अररिया, बिहार

दिनांक: ${today}

विषय: आवश्यक दस्तावेज / मोबाइल खो जाने की सूचना दर्ज करने बाबत।

महोदय,
    सविनय निवेदन है कि मैं ${name}, पिता- ${father}, निवासी- ${address} का हूँ। दिनांक ......... को सिकटी बाजार आते समय मेरा महत्वपूर्ण बैग/मोबाइल खो गया, जिसमें मेरा आधार कार्ड, पैन कार्ड तथा अन्य दस्तावेज थे।

    काफी खोजबीन के पश्चात भी इसका कोई पता नहीं चल सका। 

    अतः श्रीमान से अनुरोध है कि मेरी इस गुमशुदगी की सनहा/सनहा रिपोर्ट दर्ज करने की कृपा करें।

भवदीय
हस्ताक्षर: ......................
नाम: ${name}
मोबाइल: ${phone}
पता: ${address}
`;
        }
      } else {
        text = `To,
The Branch Manager / Officer In-Charge,
${recipient}

Date: ${new Date().toLocaleDateString('en-GB')}

Subject: Formal Application regarding service request

Respected Sir/Madam,
    I beg to state that I, ${name}, S/o ${father}, resident of ${address}, hold Account / Reference ID No: ${refNum} with your esteemed institution.

    I kindly request you to process my application for the above subject at the earliest.

    Thanking you in anticipation.

Yours faithfully,
Signature: ....................
Name: ${name}
Contact No: ${phone}
Address: ${address}
`;
      }

      container.querySelector('#app-preview-box').textContent = text;
    }

    container.querySelector('#app-generate-btn').addEventListener('click', buildLetter);
    container.querySelector('#app-type').addEventListener('change', buildLetter);
    container.querySelector('#app-lang').addEventListener('change', buildLetter);

    container.querySelector('#app-copy-btn').addEventListener('click', () => {
      const txt = container.querySelector('#app-preview-box').textContent;
      navigator.clipboard.writeText(txt).then(() => {
        CyberApp.showToast('Application text copied to clipboard!', 'success');
      });
    });

    container.querySelector('#app-print-btn').addEventListener('click', () => {
      const txt = container.querySelector('#app-preview-box').innerHTML;
      const win = window.open('');
      win.document.write(`
        <html>
          <head>
            <title>Print Application - CYBER HUB</title>
            <style>
              body { font-family: "Times New Roman", serif; font-size: 16px; line-height: 1.8; padding: 40px; margin: 0; }
              @page { margin: 20mm; }
            </style>
          </head>
          <body onload="window.print();window.close();">
            <pre style="white-space: pre-wrap; font-family: inherit;">${txt}</pre>
          </body>
        </html>
      `);
      win.document.close();
    });

    buildLetter();
  },

  // 9. RESUME BUILDER (Modern, Live Preview, Print Ready)
  renderResumeMaker(container) {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div style="background: var(--surface); padding: 18px; border-radius: 12px; border: 1px solid var(--border); max-height: 80vh; overflow-y: auto;">
          <h3 style="font-size: 16px; margin-bottom: 12px;"><i class="fa-solid fa-user-pen"></i> Candidate Information</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="res-name" class="form-control" value="Rahul Kumar">
            </div>
            <div class="form-group">
              <label class="form-label">Target Role / Title</label>
              <input type="text" id="res-role" class="form-control" value="Computer Operator / Cyber Assistant">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" id="res-phone" class="form-control" value="+91 73690 87808">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="res-email" class="form-control" value="rahul.sikti@gmail.com">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Full Address</label>
            <input type="text" id="res-address" class="form-control" value="At+PO: Sikti, Dist: Araria, Bihar - 854333">
          </div>

          <div class="form-group">
            <label class="form-label">Career Objective</label>
            <textarea id="res-obj" class="form-control" rows="3">Dedicated and skilled computer professional seeking an opportunity to leverage expertise in MS Office, digital services, customer management, and online portals to contribute efficiently to the organization.</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Education (10th / 12th / Graduation)</label>
            <textarea id="res-edu" class="form-control" rows="3">B.A. (History Hons) - Purnea University, 2023 (68%)
Intermediate (10+2 Science) - BSEB Patna, 2020 (72%)
Matriculation (10th) - High School Sikti, BSEB, 2018 (76%)</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Technical Skills (Comma separated)</label>
            <input type="text" id="res-skills" class="form-control" value="MS Office, Excel, Hindi & English Typing, Photoshop, CSC & Sarkari Portals, Internet Operations, Billing">
          </div>

          <div class="form-group">
            <label class="form-label">Work Experience</label>
            <textarea id="res-exp" class="form-control" rows="3">Computer Operator at CYBER HUB Sikti (2022 - Present):
- Managed customer registration, online exam form filling, and Aadhaar banking.
- Prepared government documentation, photo printing, and financial accounts.</textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Languages Known</label>
            <input type="text" id="res-lang" class="form-control" value="Hindi, English, Maithili, Bhojpuri">
          </div>

          <button id="res-update-btn" class="btn btn-primary" style="width: 100%;">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh Preview
          </button>
        </div>

        <div style="background: var(--surface); padding: 18px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px;"><i class="fa-solid fa-eye"></i> Live CV Preview</h3>
            <button id="res-print-btn" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-print"></i> Print / Save PDF
            </button>
          </div>

          <div id="res-preview-box" class="printable-area" style="flex: 1; min-height: 480px; background: white; border: 1px solid var(--border); border-radius: 8px; padding: 28px; color: #1e293b; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; line-height: 1.5; overflow-y: auto;">
          </div>
        </div>
      </div>
    `;

    function renderResumeHtml() {
      const name = container.querySelector('#res-name').value;
      const role = container.querySelector('#res-role').value;
      const phone = container.querySelector('#res-phone').value;
      const email = container.querySelector('#res-email').value;
      const address = container.querySelector('#res-address').value;
      const obj = container.querySelector('#res-obj').value;
      const edu = container.querySelector('#res-edu').value;
      const skills = container.querySelector('#res-skills').value.split(',').map(s => s.trim()).filter(Boolean);
      const exp = container.querySelector('#res-exp').value;
      const lang = container.querySelector('#res-lang').value;

      const html = `
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${name}</h1>
            <p style="font-size: 14px; font-weight: 600; color: #2563eb; margin-bottom: 6px;">${role}</p>
            <div style="font-size: 12px; color: #64748b; display: flex; flex-wrap: wrap; gap: 12px;">
              <span><i class="fa-solid fa-phone"></i> ${phone}</span>
              <span><i class="fa-solid fa-envelope"></i> ${email}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${address}</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            Career Objective
          </h4>
          <p style="color: #334155; font-size: 12.5px;">${obj}</p>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            Education & Qualifications
          </h4>
          <pre style="font-family: inherit; font-size: 12.5px; color: #334155; white-space: pre-wrap;">${edu}</pre>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            Technical & Professional Skills
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${skills.map(s => `<span style="background: #f1f5f9; color: #0f172a; padding: 3px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 600; border: 1px solid #e2e8f0;">${s}</span>`).join('')}
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            Work Experience
          </h4>
          <pre style="font-family: inherit; font-size: 12.5px; color: #334155; white-space: pre-wrap;">${exp}</pre>
        </div>

        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 13px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            Personal Details
          </h4>
          <div style="font-size: 12.5px; color: #334155;">
            <p><strong>Languages Known:</strong> ${lang}</p>
            <p><strong>Declaration:</strong> I hereby declare that all the information provided above is true and authentic to the best of my knowledge.</p>
          </div>
        </div>

        <div style="margin-top: 24px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b;">
          <div>Date: ......................<br>Place: Sikti, Araria</div>
          <div style="text-align: right;">Signature: ................................<br>(${name})</div>
        </div>
      `;

      container.querySelector('#res-preview-box').innerHTML = html;
    }

    container.querySelector('#res-update-btn').addEventListener('click', renderResumeHtml);
    container.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', renderResumeHtml));

    container.querySelector('#res-print-btn').addEventListener('click', () => {
      const content = container.querySelector('#res-preview-box').innerHTML;
      const win = window.open('');
      win.document.write(`
        <html>
          <head>
            <title>Print Resume - CYBER HUB</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
            <style>
              body { font-family: "Plus Jakarta Sans", system-ui, sans-serif; margin: 0; padding: 25px; color: #0f172a; }
              @page { margin: 15mm; }
            </style>
          </head>
          <body onload="window.print();window.close();">
            ${content}
          </body>
        </html>
      `);
      win.document.close();
    });

    renderResumeHtml();
  },

  // 10. PRINT COST CALCULATOR (Cyber Cafe Operator billing helper)
  renderPrintCalculator(container) {
    const rates = CyberApp.getPrintRates();
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <p style="font-size: 13.5px; color: var(--muted); margin-bottom: 16px;">
          Calculate customer bill for photocopies, printouts, photo printing, and lamination instantly.
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;" id="pc-items">
          ${[
            { id: 'bw_single', label: 'B&W Print (Single Side)', rate: rates.bw_single },
            { id: 'bw_double', label: 'B&W Print (Both Sides)', rate: rates.bw_double },
            { id: 'color_a4', label: 'Color Print (A4 Normal)', rate: rates.color_a4 },
            { id: 'photo_4x6', label: 'Photo Print (4×6 Glossy Paper)', rate: rates.photo_4x6 },
            { id: 'passport_copies', label: 'Passport Photo (Set of 8)', rate: rates.passport_copies },
            { id: 'lamination', label: 'A4 Lamination (Military grade)', rate: rates.lamination },
            { id: 'scan_page', label: 'Document Scanning (per page)', rate: rates.scan_page },
            { id: 'form_fill', label: 'Online Sarkari Form Filling', rate: rates.form_fill }
          ].map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; background: var(--background); border: 1px solid var(--border);">
              <div>
                <div style="font-weight: 600; font-size: 13.5px;">${item.label}</div>
                <div style="font-size: 11.5px; color: var(--muted);">Rate: ₹${item.rate} / unit</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="number" min="0" value="0" class="form-control pc-qty" data-id="${item.id}" data-rate="${item.rate}" style="width: 70px; text-align: center;">
                <span class="pc-row-total" style="font-size: 13.5px; font-weight: 700; width: 60px; text-align: right;">₹ 0</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background: var(--primary-light); padding: 18px; border-radius: 10px; border: 1px solid rgba(37,99,235,0.2); display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; font-weight: 600; color: var(--primary); text-transform: uppercase;">Total Bill Amount</div>
            <div id="pc-grand-total" style="font-size: 28px; font-weight: 800; color: #0f172a; font-family: var(--font-heading);">
              ₹ 0
            </div>
          </div>
          <button id="pc-invoice-btn" class="btn btn-primary">
            <i class="fa-solid fa-receipt"></i> Create Receipt
          </button>
        </div>
      </div>
    `;

    function updateTotals() {
      let grandTotal = 0;
      container.querySelectorAll('.pc-qty').forEach(input => {
        const qty = parseInt(input.value, 10) || 0;
        const rate = parseFloat(input.dataset.rate) || 0;
        const rowTotal = qty * rate;
        input.parentElement.querySelector('.pc-row-total').textContent = `₹ ${rowTotal}`;
        grandTotal += rowTotal;
      });
      container.querySelector('#pc-grand-total').textContent = `₹ ${grandTotal}`;
    }

    container.querySelectorAll('.pc-qty').forEach(input => {
      input.addEventListener('input', updateTotals);
    });

    container.querySelector('#pc-invoice-btn').addEventListener('click', () => {
      CyberApp.openTool('invoice-receipt');
    });
  }
};

/**
 * CYBER HUB - PDF, Business & Text Engines
 * Real client-side implementations using PDF-Lib, LocalStorage, Canvas.
 */

// Extend window.CyberTools
Object.assign(window.CyberTools, {

  // 11. PDF MERGE
  renderPdfMerge(container) {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="dropzone" id="pm-dropzone" style="margin-bottom: 16px;">
          <i class="fa-solid fa-file-circle-plus" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Select 2 or more PDF files to Merge</p>
          <input type="file" id="pm-file" accept="application/pdf" multiple style="display: none;">
        </div>

        <div id="pm-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;"></div>

        <button id="pm-merge-btn" class="btn btn-primary" style="width: 100%; display: none;">
          <i class="fa-solid fa-object-group"></i> Combine & Download Merged PDF
        </button>
      </div>
    `;

    const dropzone = container.querySelector('#pm-dropzone');
    const fileInput = container.querySelector('#pm-file');
    const list = container.querySelector('#pm-list');
    const mergeBtn = container.querySelector('#pm-merge-btn');
    let selectedFiles = [];

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        selectedFiles = Array.from(e.target.files);
        renderFileList();
      }
    });

    function renderFileList() {
      list.innerHTML = selectedFiles.map((f, i) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 8px; background: var(--background); border: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <span style="font-size: 11px; font-weight: 700; background: var(--surface); border: 1px solid var(--border); padding: 2px 6px; border-radius: 4px;">#${i + 1}</span>
            <span style="font-size: 13px; font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${f.name}</span>
            <span style="font-size: 11px; color: var(--muted);">(${(f.size / 1024).toFixed(0)} KB)</span>
          </div>
          <button class="btn btn-sm btn-secondary pm-remove" data-idx="${i}"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `).join('');

      list.querySelectorAll('.pm-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          selectedFiles.splice(idx, 1);
          renderFileList();
        });
      });

      mergeBtn.style.display = selectedFiles.length >= 2 ? 'block' : 'none';
    }

    mergeBtn.addEventListener('click', async () => {
      if (selectedFiles.length < 2) return CyberApp.showToast('Please select at least 2 PDF files', 'error');
      if (!window.PDFLib) return CyberApp.showToast('PDF library loading... Please wait.', 'error');

      try {
        mergeBtn.disabled = true;
        mergeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Merging PDFs...';

        const mergedPdf = await PDFLib.PDFDocument.create();
        for (const file of selectedFiles) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `CyberHub_Merged_${Date.now()}.pdf`;
        link.click();
        CyberApp.showToast('PDFs merged successfully!', 'success');
      } catch (err) {
        console.error(err);
        CyberApp.showToast('Failed to merge PDFs. Please check file format.', 'error');
      } finally {
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = '<i class="fa-solid fa-object-group"></i> Combine & Download Merged PDF';
      }
    });
  },

  // 12. JPG TO PDF CONVERTER
  renderJpgToPdf(container) {
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="dropzone" id="jtp-dropzone" style="margin-bottom: 16px;">
          <i class="fa-solid fa-images" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Select Images to Convert to PDF</p>
          <p style="font-size: 12px; color: var(--muted);">Supports scanned documents, marksheets, certificates</p>
          <input type="file" id="jtp-file" accept="image/*" multiple style="display: none;">
        </div>

        <div id="jtp-preview-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-bottom: 16px;"></div>

        <div class="form-group">
          <label class="form-label">Page Orientation & Size</label>
          <select id="jtp-page-format" class="form-control">
            <option value="a4-portrait">A4 Portrait (Standard Documents)</option>
            <option value="a4-landscape">A4 Landscape</option>
            <option value="fit">Fit Image Exact Size</option>
          </select>
        </div>

        <button id="jtp-convert-btn" class="btn btn-primary" style="width: 100%; display: none;">
          <i class="fa-solid fa-file-pdf"></i> Convert & Download PDF
        </button>
      </div>
    `;

    const dropzone = container.querySelector('#jtp-dropzone');
    const fileInput = container.querySelector('#jtp-file');
    const grid = container.querySelector('#jtp-preview-grid');
    const convertBtn = container.querySelector('#jtp-convert-btn');
    let imageFiles = [];

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files) {
        imageFiles = Array.from(e.target.files);
        renderThumbs();
      }
    });

    function renderThumbs() {
      grid.innerHTML = '';
      imageFiles.forEach((f, i) => {
        const url = URL.createObjectURL(f);
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; height: 110px; border: 1px solid var(--border);';
        div.innerHTML = `
          <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; bottom: 2px; left: 2px; background: rgba(0,0,0,0.6); color: white; font-size: 10px; padding: 1px 4px; border-radius: 3px;">P.${i+1}</span>
        `;
        grid.appendChild(div);
      });
      convertBtn.style.display = imageFiles.length > 0 ? 'block' : 'none';
    }

    convertBtn.addEventListener('click', async () => {
      if (imageFiles.length === 0) return;
      if (!window.jspdf) return CyberApp.showToast('jsPDF library loading...', 'error');

      try {
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating PDF...';

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        for (let i = 0; i < imageFiles.length; i++) {
          if (i > 0) pdf.addPage('a4', 'p');
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFiles[i]);
          });
          pdf.addImage(dataUrl, 'JPEG', 10, 10, 190, 277);
        }

        pdf.save(`CyberHub_ScannedDoc_${Date.now()}.pdf`);
        CyberApp.showToast('PDF created successfully!', 'success');
      } catch (err) {
        console.error(err);
        CyberApp.showToast('Error converting images to PDF', 'error');
      } finally {
        convertBtn.disabled = false;
        convertBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Convert & Download PDF';
      }
    });
  },

  // 13. PDF ROTATE
  renderPdfRotate(container) {
    container.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="dropzone" id="pr-dropzone" style="margin-bottom: 16px;">
          <i class="fa-solid fa-rotate" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Select PDF to Rotate</p>
          <input type="file" id="pr-file" accept="application/pdf" style="display: none;">
        </div>

        <div id="pr-controls" style="display: none;">
          <p id="pr-filename" style="font-size: 13.5px; font-weight: 600; margin-bottom: 12px; color: var(--text);"></p>
          
          <div class="form-group">
            <label class="form-label">Rotation Angle</label>
            <select id="pr-angle" class="form-control">
              <option value="90">90° Clockwise</option>
              <option value="180">180° Upside Down</option>
              <option value="270">270° Counter-Clockwise</option>
            </select>
          </div>

          <button id="pr-btn" class="btn btn-primary" style="width: 100%;">
            <i class="fa-solid fa-rotate"></i> Rotate All Pages & Download
          </button>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#pr-dropzone');
    const fileInput = container.querySelector('#pr-file');
    const controls = container.querySelector('#pr-controls');
    let pdfFile = null;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        pdfFile = e.target.files[0];
        container.querySelector('#pr-filename').textContent = 'Selected: ' + pdfFile.name;
        controls.style.display = 'block';
      }
    });

    container.querySelector('#pr-btn').addEventListener('click', async () => {
      if (!pdfFile || !window.PDFLib) return;
      try {
        const bytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(bytes);
        const angle = parseInt(container.querySelector('#pr-angle').value, 10);
        const pages = pdfDoc.getPages();
        pages.forEach(p => {
          const current = p.getRotation().angle;
          p.setRotation(PDFLib.degrees((current + angle) % 360));
        });
        const out = await pdfDoc.save();
        const blob = new Blob([out], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Rotated_${pdfFile.name}`;
        link.click();
        CyberApp.showToast('Rotated PDF downloaded!', 'success');
      } catch (err) {
        console.error(err);
        CyberApp.showToast('Could not rotate PDF', 'error');
      }
    });
  },

  // 14. PDF WATERMARK
  renderPdfWatermark(container) {
    container.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="dropzone" id="pw-dropzone" style="margin-bottom: 16px;">
          <i class="fa-solid fa-stamp" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Select PDF to Watermark</p>
          <input type="file" id="pw-file" accept="application/pdf" style="display: none;">
        </div>

        <div id="pw-controls" style="display: none;">
          <div class="form-group">
            <label class="form-label">Watermark Text</label>
            <input type="text" id="pw-text" class="form-control" value="CYBER HUB SIKTI">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Font Size</label>
              <input type="number" id="pw-size" class="form-control" value="48">
            </div>
            <div class="form-group">
              <label class="form-label">Opacity (0.1 - 1.0)</label>
              <input type="number" id="pw-opacity" class="form-control" value="0.25" step="0.05" min="0.1" max="1.0">
            </div>
          </div>

          <button id="pw-apply-btn" class="btn btn-primary" style="width: 100%;">
            <i class="fa-solid fa-stamp"></i> Apply Watermark & Download
          </button>
        </div>
      </div>
    `;

    const dropzone = container.querySelector('#pw-dropzone');
    const fileInput = container.querySelector('#pw-file');
    const controls = container.querySelector('#pw-controls');
    let pdfFile = null;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        pdfFile = e.target.files[0];
        controls.style.display = 'block';
      }
    });

    container.querySelector('#pw-apply-btn').addEventListener('click', async () => {
      if (!pdfFile || !window.PDFLib) return;
      try {
        const bytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(bytes);
        const text = container.querySelector('#pw-text').value;
        const size = parseInt(container.querySelector('#pw-size').value, 10) || 48;
        const opacity = parseFloat(container.querySelector('#pw-opacity').value) || 0.25;
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();
        pages.forEach(p => {
          const { width, height } = p.getSize();
          p.drawText(text, {
            x: width / 4,
            y: height / 2,
            size: size,
            font: font,
            color: PDFLib.rgb(0.5, 0.5, 0.5),
            opacity: opacity,
            rotate: PDFLib.degrees(45)
          });
        });

        const out = await pdfDoc.save();
        const blob = new Blob([out], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Watermarked_${pdfFile.name}`;
        link.click();
        CyberApp.showToast('Watermark added successfully!', 'success');
      } catch (err) {
        console.error(err);
        CyberApp.showToast('Failed to watermark PDF', 'error');
      }
    });
  },

  // 15. CUSTOMER REGISTRY (KHATA)
  renderCustomerRegistry(container) {
    let customers = CyberApp.getCustomers();

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 18px;">Customer Service Khata</h3>
            <p style="font-size: 13px; color: var(--muted);">Track customer orders, forms, mobile numbers and pending statuses.</p>
          </div>
          <button id="cr-add-btn" class="btn btn-primary">
            <i class="fa-solid fa-user-plus"></i> New Customer Entry
          </button>
        </div>

        <!-- Add Form Modal / Inline Box -->
        <div id="cr-form-box" style="display: none; background: var(--surface); padding: 18px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px;">
          <h4 style="font-size: 15px; margin-bottom: 12px;">Add Service Entry</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px;">
            <div class="form-group">
              <label class="form-label">Customer Name</label>
              <input type="text" id="cr-name" class="form-control" placeholder="e.g. Mukesh Yadav">
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="text" id="cr-mobile" class="form-control" placeholder="7369087808">
            </div>
            <div class="form-group">
              <label class="form-label">Service Name</label>
              <select id="cr-service" class="form-control">
                <option value="Aadhaar Print">Aadhaar Card Print / Lamination</option>
                <option value="PAN Card Application">PAN Card New / Correction</option>
                <option value="Online Job Form">Sarkari Job Form Filling</option>
                <option value="Passport Photos">Passport Photo (8 copies)</option>
                <option value="Money Transfer">AEPS / Cash Withdrawal / Transfer</option>
                <option value="Certificate / Dakhil Kharij">Jati / Niwas / Land Record</option>
                <option value="Printing / Typing">Document Printing / Typing</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹)</label>
              <input type="number" id="cr-amount" class="form-control" value="50">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="cr-status" class="form-control">
                <option value="pending">🟡 Pending</option>
                <option value="processing">🔵 Processing</option>
                <option value="completed" selected>🟢 Completed</option>
              </select>
            </div>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="cr-save-btn" class="btn btn-primary"><i class="fa-solid fa-check"></i> Save to Registry</button>
            <button id="cr-cancel-btn" class="btn btn-secondary">Cancel</button>
          </div>
        </div>

        <!-- Table of Customers -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
            <thead>
              <tr style="background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 12px; text-transform: uppercase;">
                <th style="padding: 12px 16px;">Date</th>
                <th style="padding: 12px 16px;">Customer</th>
                <th style="padding: 12px 16px;">Service</th>
                <th style="padding: 12px 16px;">Amount</th>
                <th style="padding: 12px 16px;">Status</th>
                <th style="padding: 12px 16px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="cr-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function renderTable() {
      const tbody = container.querySelector('#cr-tbody');
      if (customers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 30px; text-align: center; color: var(--muted);">
              <i class="fa-solid fa-users" style="font-size: 28px; margin-bottom: 8px; display: block; opacity: 0.4;"></i>
              No customer entries yet. Click "New Customer Entry" above.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = customers.map((c, i) => {
        let badgeStyle = 'background: #fef08a; color: #854d0e;';
        if (c.status === 'processing') badgeStyle = 'background: #bfdbfe; color: #1e40af;';
        if (c.status === 'completed') badgeStyle = 'background: #bbf7d0; color: #166534;';

        const waMsg = encodeURIComponent(`Namaste ${c.name}, aapka ${c.service} CYBER HUB Sikti par ${c.status === 'completed' ? 'ready hai' : 'process ho raha hai'}. Total: ₹${c.amount}. Dhanyawad!`);

        return `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 12px 16px; color: var(--muted); font-size: 12px;">${c.date}</td>
            <td style="padding: 12px 16px; font-weight: 600;">
              ${c.name}
              <div style="font-size: 11px; color: var(--muted);">${c.mobile}</div>
            </td>
            <td style="padding: 12px 16px;">${c.service}</td>
            <td style="padding: 12px 16px; font-weight: 700; color: var(--text);">₹ ${c.amount}</td>
            <td style="padding: 12px 16px;">
              <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; ${badgeStyle}">
                ${c.status.toUpperCase()}
              </span>
            </td>
            <td style="padding: 12px 16px; text-align: right; white-space: nowrap;">
              <a href="https://wa.me/91${c.mobile.replace(/[^0-9]/g, '')}?text=${waMsg}" target="_blank" class="btn btn-sm btn-secondary" title="WhatsApp Customer" style="color: #16a34a;">
                <i class="fa-brands fa-whatsapp"></i>
              </a>
              <button class="btn btn-sm btn-secondary cr-del" data-idx="${i}" title="Delete" style="color: #ef4444;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.cr-del').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          customers.splice(idx, 1);
          CyberApp.saveCustomers(customers);
          renderTable();
          CyberApp.showToast('Customer record removed', 'info');
        });
      });
    }

    const formBox = container.querySelector('#cr-form-box');
    container.querySelector('#cr-add-btn').addEventListener('click', () => {
      formBox.style.display = 'block';
    });
    container.querySelector('#cr-cancel-btn').addEventListener('click', () => {
      formBox.style.display = 'none';
    });

    container.querySelector('#cr-save-btn').addEventListener('click', () => {
      const name = container.querySelector('#cr-name').value.trim();
      const mobile = container.querySelector('#cr-mobile').value.trim();
      const service = container.querySelector('#cr-service').value;
      const amount = parseFloat(container.querySelector('#cr-amount').value) || 0;
      const status = container.querySelector('#cr-status').value;

      if (!name || !mobile) {
        CyberApp.showToast('Please enter customer name and mobile', 'error');
        return;
      }

      customers.unshift({
        id: Date.now(),
        name,
        mobile,
        service,
        amount,
        status,
        date: new Date().toLocaleDateString('en-IN')
      });

      CyberApp.saveCustomers(customers);
      CyberApp.showToast('Customer entry added to Khata!', 'success');
      formBox.style.display = 'none';
      renderTable();
    });

    renderTable();
  },

  // 16. INCOME & EXPENSE TRACKER
  renderIncomeExpense(container) {
    let ledger = CyberApp.getLedger();

    container.innerHTML = `
      <div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px;">
          <div style="background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
            <span style="font-size: 12px; color: var(--muted); font-weight: 600;">Today's Income</span>
            <p id="ie-income-stat" style="font-size: 24px; font-weight: 800; color: #16a34a; font-family: var(--font-heading);">₹ 0</p>
          </div>
          <div style="background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
            <span style="font-size: 12px; color: var(--muted); font-weight: 600;">Today's Expense</span>
            <p id="ie-expense-stat" style="font-size: 24px; font-weight: 800; color: #ef4444; font-family: var(--font-heading);">₹ 0</p>
          </div>
          <div style="background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border);">
            <span style="font-size: 12px; color: var(--muted); font-weight: 600;">Today's Net Profit</span>
            <p id="ie-profit-stat" style="font-size: 24px; font-weight: 800; color: var(--primary); font-family: var(--font-heading);">₹ 0</p>
          </div>
        </div>

        <div style="background: var(--surface); padding: 18px; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px;">
          <h4 style="font-size: 15px; margin-bottom: 12px;">Add New Transaction</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select id="ie-type" class="form-control">
                <option value="income" selected>🟢 Income (Customer Cash/UPI)</option>
                <option value="expense">🔴 Expense (Paper/Ink/Shop)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Category / Note</label>
              <input type="text" id="ie-desc" class="form-control" placeholder="e.g. A4 Paper Rim, Printing, Pan form">
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹)</label>
              <input type="number" id="ie-amt" class="form-control" value="100">
            </div>
          </div>
          <button id="ie-add-btn" class="btn btn-primary" style="margin-top: 10px;">
            <i class="fa-solid fa-plus"></i> Record Transaction
          </button>
        </div>

        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
            <thead>
              <tr style="background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 12px; text-transform: uppercase;">
                <th style="padding: 10px 14px;">Date</th>
                <th style="padding: 10px 14px;">Note</th>
                <th style="padding: 10px 14px;">Type</th>
                <th style="padding: 10px 14px;">Amount</th>
                <th style="padding: 10px 14px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody id="ie-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    function updateLedger() {
      let income = 0;
      let expense = 0;
      const todayStr = new Date().toLocaleDateString('en-IN');

      ledger.forEach(item => {
        if (item.type === 'income') income += item.amount;
        else expense += item.amount;
      });

      const profit = income - expense;
      container.querySelector('#ie-income-stat').textContent = '₹ ' + income.toLocaleString('en-IN');
      container.querySelector('#ie-expense-stat').textContent = '₹ ' + expense.toLocaleString('en-IN');
      container.querySelector('#ie-profit-stat').textContent = '₹ ' + profit.toLocaleString('en-IN');

      const tbody = container.querySelector('#ie-tbody');
      if (ledger.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--muted);">No transactions recorded yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = ledger.map((item, idx) => `
        <tr style="border-bottom: 1px solid var(--border);">
          <td style="padding: 10px 14px; font-size: 12px; color: var(--muted);">${item.date}</td>
          <td style="padding: 10px 14px; font-weight: 600;">${item.desc}</td>
          <td style="padding: 10px 14px;">
            <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${item.type === 'income' ? 'background: #bbf7d0; color: #166534;' : 'background: #fecaca; color: #991b1b;'}">
              ${item.type.toUpperCase()}
            </span>
          </td>
          <td style="padding: 10px 14px; font-weight: 700; color: ${item.type === 'income' ? '#16a34a' : '#ef4444'};">
            ${item.type === 'income' ? '+' : '-'} ₹ ${item.amount}
          </td>
          <td style="padding: 10px 14px; text-align: right;">
            <button class="btn btn-sm btn-secondary ie-del" data-idx="${idx}" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.ie-del').forEach(btn => {
        btn.addEventListener('click', () => {
          ledger.splice(parseInt(btn.dataset.idx, 10), 1);
          CyberApp.saveLedger(ledger);
          updateLedger();
        });
      });
    }

    container.querySelector('#ie-add-btn').addEventListener('click', () => {
      const desc = container.querySelector('#ie-desc').value.trim();
      const amt = parseFloat(container.querySelector('#ie-amt').value) || 0;
      const type = container.querySelector('#ie-type').value;

      if (!desc || amt <= 0) return CyberApp.showToast('Please enter description and valid amount', 'error');

      ledger.unshift({
        id: Date.now(),
        desc,
        amount: amt,
        type,
        date: new Date().toLocaleDateString('en-IN')
      });

      CyberApp.saveLedger(ledger);
      CyberApp.showToast('Transaction recorded successfully!', 'success');
      container.querySelector('#ie-desc').value = '';
      updateLedger();
    });

    updateLedger();
  },

  // 17. CASH RECEIPT / INVOICE GENERATOR
  renderInvoiceReceipt(container) {
    const invNum = 'CH-' + Math.floor(100000 + Math.random() * 900000);
    const today = new Date().toLocaleDateString('en-IN');

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
        <div style="background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
          <h3 style="font-size: 16px; margin-bottom: 12px;"><i class="fa-solid fa-receipt"></i> Invoice Details</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Customer Name</label>
              <input type="text" id="inv-cust" class="form-control" value="Mukesh Kumar">
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number</label>
              <input type="text" id="inv-phone" class="form-control" value="+91 98XXXXXXXX">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Service / Item Description</label>
            <input type="text" id="inv-item" class="form-control" value="Online Job Form Filling + Passport Photo (8 Copies)">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Amount (₹)</label>
              <input type="number" id="inv-amount" class="form-control" value="120">
            </div>
            <div class="form-group">
              <label class="form-label">Payment Mode</label>
              <select id="inv-mode" class="form-control">
                <option value="Cash" selected>Cash</option>
                <option value="UPI / PhonePe">UPI / PhonePe / GPay</option>
                <option value="Pending">Credit / Udhaar</option>
              </select>
            </div>
          </div>

          <button id="inv-refresh-btn" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
            <i class="fa-solid fa-arrows-rotate"></i> Update Receipt Preview
          </button>
        </div>

        <div style="background: var(--surface); padding: 20px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 16px;"><i class="fa-solid fa-print"></i> Customer Bill Preview</h3>
            <button id="inv-print-btn" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-print"></i> Print Receipt
            </button>
          </div>

          <div id="inv-receipt-card" class="printable-area" style="flex: 1; padding: 24px; background: white; border: 2px dashed #94a3b8; border-radius: 12px; color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif;">
            <!-- Receipt filled dynamically -->
          </div>
        </div>
      </div>
    `;

    function buildReceipt() {
      const cust = container.querySelector('#inv-cust').value;
      const phone = container.querySelector('#inv-phone').value;
      const item = container.querySelector('#inv-item').value;
      const amt = container.querySelector('#inv-amount').value;
      const mode = container.querySelector('#inv-mode').value;

      container.querySelector('#inv-receipt-card').innerHTML = `
        <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
          <h2 style="font-size: 20px; font-weight: 800; color: #2563eb; margin-bottom: 2px;">🌐 CYBER HUB</h2>
          <div style="font-size: 12px; font-weight: 600; color: #475569;">DIGITAL SERVICE POINT</div>
          <div style="font-size: 11px; color: #64748b;">Sikti, Araria, Bihar • Mobile: +91 73690 87808</div>
          <div style="font-size: 11px; color: #64748b;">Founder: Rahul Rrony</div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 12px; color: #475569;">
          <div><strong>Receipt #:</strong> ${invNum}</div>
          <div><strong>Date:</strong> ${today}</div>
        </div>

        <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 12.5px; margin-bottom: 14px;">
          <div><strong>Customer:</strong> ${cust}</div>
          <div><strong>Phone:</strong> ${phone}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 14px;">
          <tr style="border-bottom: 1px solid #cbd5e1; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">
            <th style="padding: 6px 0;">Service Description</th>
            <th style="padding: 6px 0; text-align: right;">Amount</th>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 0;">${item}</td>
            <td style="padding: 10px 0; text-align: right; font-weight: 700;">₹ ${amt}</td>
          </tr>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #0f172a; padding-top: 10px; margin-bottom: 16px;">
          <div style="font-size: 13px;"><strong>Payment Mode:</strong> ${mode}</div>
          <div style="font-size: 18px; font-weight: 800; color: #2563eb;">Total: ₹ ${amt}</div>
        </div>

        <div style="text-align: center; font-size: 11.5px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
          “Thank you for visiting CYBER HUB Sikti!”<br>
          For digital queries or status, WhatsApp +91 73690 87808
        </div>
      `;
    }

    container.querySelector('#inv-refresh-btn').addEventListener('click', buildReceipt);
    container.querySelectorAll('input, select').forEach(el => el.addEventListener('input', buildReceipt));

    container.querySelector('#inv-print-btn').addEventListener('click', () => {
      const content = container.querySelector('#inv-receipt-card').innerHTML;
      const win = window.open('');
      win.document.write(`
        <html>
          <head>
            <title>Receipt - CYBER HUB</title>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; }
              .slip { width: 340px; border: 1px solid #000; padding: 20px; }
            </style>
          </head>
          <body onload="window.print();window.close();">
            <div class="slip">${content}</div>
          </body>
        </html>
      `);
      win.document.close();
    });

    buildReceipt();
  },

  // 18. TEXT TOOLS (Word Counter, Case Converter, Deduplicator)
  renderTextTools(container) {
    container.innerHTML = `
      <div style="max-width: 700px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; text-align: center;">
          <div style="background: var(--background); padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--muted);">Words</div>
            <div id="tt-words" style="font-size: 18px; font-weight: 700;">0</div>
          </div>
          <div style="background: var(--background); padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--muted);">Characters</div>
            <div id="tt-chars" style="font-size: 18px; font-weight: 700;">0</div>
          </div>
          <div style="background: var(--background); padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--muted);">Lines</div>
            <div id="tt-lines" style="font-size: 18px; font-weight: 700;">0</div>
          </div>
          <div style="background: var(--background); padding: 10px; border-radius: 8px;">
            <div style="font-size: 11px; color: var(--muted);">Reading Time</div>
            <div id="tt-read" style="font-size: 18px; font-weight: 700;">0m</div>
          </div>
        </div>

        <div class="form-group">
          <textarea id="tt-input" class="form-control" rows="8" placeholder="Type or paste your text here for formatting, case conversion, or cleaning..."></textarea>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
          <button class="btn btn-sm btn-secondary tt-btn" data-action="upper">UPPERCASE</button>
          <button class="btn btn-sm btn-secondary tt-btn" data-action="lower">lowercase</button>
          <button class="btn btn-sm btn-secondary tt-btn" data-action="title">Title Case</button>
          <button class="btn btn-sm btn-secondary tt-btn" data-action="sentence">Sentence case</button>
          <button class="btn btn-sm btn-secondary tt-btn" data-action="clean-spaces">Remove Extra Spaces</button>
          <button class="btn btn-sm btn-secondary tt-btn" data-action="dedupe">Remove Duplicate Lines</button>
          <button class="btn btn-sm btn-secondary tt-btn" data-action="sort">Sort A-Z</button>
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="tt-copy-btn" class="btn btn-primary" style="flex: 1;"><i class="fa-solid fa-copy"></i> Copy Cleaned Text</button>
          <button id="tt-clear-btn" class="btn btn-secondary"><i class="fa-solid fa-eraser"></i> Clear</button>
        </div>
      </div>
    `;

    const textarea = container.querySelector('#tt-input');

    function updateStats() {
      const val = textarea.value;
      const words = val.trim() ? val.trim().split(/\s+/).length : 0;
      const chars = val.length;
      const lines = val ? val.split('\n').length : 0;
      const readMin = Math.ceil(words / 200);

      container.querySelector('#tt-words').textContent = words;
      container.querySelector('#tt-chars').textContent = chars;
      container.querySelector('#tt-lines').textContent = lines;
      container.querySelector('#tt-read').textContent = `${readMin}m`;
    }

    textarea.addEventListener('input', updateStats);

    container.querySelectorAll('.tt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let str = textarea.value;

        if (action === 'upper') {
          textarea.value = str.toUpperCase();
        } else if (action === 'lower') {
          textarea.value = str.toLowerCase();
        } else if (action === 'title') {
          textarea.value = str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        } else if (action === 'sentence') {
          textarea.value = str.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        } else if (action === 'clean-spaces') {
          textarea.value = str.replace(/[ \t]+/g, ' ').replace(/^\s+|\s+$/gm, '');
        } else if (action === 'dedupe') {
          const lines = str.split('\n');
          textarea.value = Array.from(new Set(lines)).join('\n');
        } else if (action === 'sort') {
          const lines = str.split('\n').filter(Boolean);
          lines.sort((a, b) => a.localeCompare(b));
          textarea.value = lines.join('\n');
        }

        updateStats();
        CyberApp.showToast(`Applied ${btn.textContent}`, 'info');
      });
    });

    container.querySelector('#tt-copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(textarea.value).then(() => {
        CyberApp.showToast('Copied to clipboard!', 'success');
      });
    });

    container.querySelector('#tt-clear-btn').addEventListener('click', () => {
      textarea.value = '';
      updateStats();
    });
  },

  // 19. GST CALCULATOR
  renderGstCalculator(container) {
    container.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="form-group">
          <label class="form-label">Initial Amount (₹)</label>
          <input type="number" id="gst-amt" class="form-control" value="1000">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
          <div class="form-group">
            <label class="form-label">GST Slab Rate</label>
            <select id="gst-rate" class="form-control">
              <option value="3">3% (Gold & Precious Items)</option>
              <option value="5">5% (Essential Commodities)</option>
              <option value="12">12% (Standard Goods)</option>
              <option value="18" selected>18% (IT / Cyber / Electronics)</option>
              <option value="28">28% (Luxury Items)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tax Calculation Mode</label>
            <select id="gst-mode" class="form-control">
              <option value="exclusive" selected>Exclusive (Add GST to Amount)</option>
              <option value="inclusive">Inclusive (GST included in Amount)</option>
            </select>
          </div>
        </div>

        <div style="background: var(--background); padding: 18px; border-radius: 10px; border: 1px solid var(--border);" id="gst-results">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div>
              <span style="font-size: 11px; color: var(--muted);">Net Base Amount</span>
              <p id="gst-net-amt" style="font-size: 16px; font-weight: 700;">₹ 0</p>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--muted);">Total GST Tax</span>
              <p id="gst-tax-amt" style="font-size: 16px; font-weight: 700; color: #2563eb;">₹ 0</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; border-top: 1px solid var(--border); padding-top: 10px;">
            <div>
              <span style="font-size: 11px; color: var(--muted);">CGST (Central)</span>
              <p id="gst-cgst" style="font-size: 14px; font-weight: 600;">₹ 0</p>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--muted);">SGST (Bihar State)</span>
              <p id="gst-sgst" style="font-size: 14px; font-weight: 600;">₹ 0</p>
            </div>
          </div>

          <div style="border-top: 2px solid var(--primary); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 15px;">Final Gross Total:</span>
            <span id="gst-gross-amt" style="font-size: 24px; font-weight: 800; color: var(--primary);">₹ 0</span>
          </div>
        </div>
      </div>
    `;

    function updateGst() {
      const amt = parseFloat(container.querySelector('#gst-amt').value) || 0;
      const rate = parseFloat(container.querySelector('#gst-rate').value) || 18;
      const mode = container.querySelector('#gst-mode').value;

      let net = 0, tax = 0, gross = 0;
      if (mode === 'exclusive') {
        net = amt;
        tax = (amt * rate) / 100;
        gross = net + tax;
      } else {
        gross = amt;
        net = (amt * 100) / (100 + rate);
        tax = gross - net;
      }

      container.querySelector('#gst-net-amt').textContent = '₹ ' + net.toFixed(2);
      container.querySelector('#gst-tax-amt').textContent = '₹ ' + tax.toFixed(2);
      container.querySelector('#gst-cgst').textContent = '₹ ' + (tax / 2).toFixed(2);
      container.querySelector('#gst-sgst').textContent = '₹ ' + (tax / 2).toFixed(2);
      container.querySelector('#gst-gross-amt').textContent = '₹ ' + gross.toFixed(2);
    }

    container.querySelector('#gst-amt').addEventListener('input', updateGst);
    container.querySelector('#gst-rate').addEventListener('change', updateGst);
    container.querySelector('#gst-mode').addEventListener('change', updateGst);
    updateGst();
  }
});

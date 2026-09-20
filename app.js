/**
 * CYBER HUB - Main Application Controller
 * Handles Navigation, AI Assistant, Search, Favorites, Recent Tools, Theme, and Modals.
 */

window.CyberApp = {
  state: {
    currentTab: 'dashboard',
    theme: localStorage.getItem('cyberhub_theme') || 'light',
    favorites: JSON.parse(localStorage.getItem('cyberhub_favorites') || '["passport-photo", "pdf-compressor", "qr-generator", "age-calculator"]'),
    recent: JSON.parse(localStorage.getItem('cyberhub_recent') || '[]'),
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'popular',
    settings: JSON.parse(localStorage.getItem('cyberhub_settings') || JSON.stringify({
      businessName: 'CYBER HUB',
      subtitle: 'Digital Service Point',
      founder: 'Rahul Rrony',
      mobile: '+91 73690 87808',
      location: 'Sikti, Araria, Bihar',
      printRates: {
        bw_single: 3,
        bw_double: 5,
        color_a4: 10,
        photo_4x6: 20,
        passport_copies: 40,
        lamination: 20,
        scan_page: 10,
        form_fill: 50
      }
    }))
  },

  init() {
    this.applyTheme(this.state.theme);
    this.setupEventListeners();
    this.renderView('dashboard');
    this.updateStatsCounters();
    this.renderSidebarRecent();
  },

  // THEME MANAGEMENT
  applyTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cyberhub_theme', theme);
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  },

  toggleTheme() {
    const next = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.showToast(`Switched to ${next} theme`, 'info');
  },

  // LOCAL STORAGE HELPERS
  getPrintRates() {
    return this.state.settings.printRates;
  },

  getCustomers() {
    return JSON.parse(localStorage.getItem('cyberhub_customers') || '[]');
  },

  saveCustomers(customers) {
    localStorage.setItem('cyberhub_customers', JSON.stringify(customers));
  },

  getLedger() {
    return JSON.parse(localStorage.getItem('cyberhub_ledger') || '[]');
  },

  saveLedger(ledger) {
    localStorage.setItem('cyberhub_ledger', JSON.stringify(ledger));
  },

  toggleFavorite(toolId, event) {
    if (event) event.stopPropagation();
    const idx = this.state.favorites.indexOf(toolId);
    if (idx > -1) {
      this.state.favorites.splice(idx, 1);
      this.showToast('Removed from favorites', 'info');
    } else {
      this.state.favorites.push(toolId);
      this.showToast('Added to favorites ⭐', 'success');
    }
    localStorage.setItem('cyberhub_favorites', JSON.stringify(this.state.favorites));
    this.refreshCurrentView();
  },

  addRecentTool(toolId) {
    this.state.recent = this.state.recent.filter(id => id !== toolId);
    this.state.recent.unshift(toolId);
    if (this.state.recent.length > 8) this.state.recent.pop();
    localStorage.setItem('cyberhub_recent', JSON.stringify(this.state.recent));
    this.renderSidebarRecent();
  },

  // TOAST NOTIFICATIONS
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'fa-circle-info';
    let iconColor = 'var(--primary)';

    if (type === 'success') {
      icon = 'fa-circle-check';
      iconColor = '#16a34a';
    } else if (type === 'error') {
      icon = 'fa-triangle-exclamation';
      iconColor = '#ef4444';
    }

    toast.innerHTML = `
      <i class="fa-solid ${icon}" style="color: ${iconColor}; font-size: 16px;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  },

  // MODAL & TOOL OPENING
  openTool(toolId) {
    const tool = window.TOOL_REGISTRY.find(t => t.id === toolId);
    if (!tool) {
      this.showToast('Tool not found', 'error');
      return;
    }

    this.addRecentTool(toolId);

    const modal = document.getElementById('tool-modal');
    const titleEl = document.getElementById('modal-tool-title');
    const iconEl = document.getElementById('modal-tool-icon');
    const bodyEl = document.getElementById('modal-tool-body');

    titleEl.textContent = tool.name;
    iconEl.className = `fa-solid ${tool.icon}`;
    bodyEl.innerHTML = '';

    // Route to appropriate rendering engine
    if (tool.id === 'passport-photo') {
      CyberTools.renderPassportPhoto(bodyEl);
    } else if (tool.id === 'image-compressor') {
      CyberTools.renderImageCompressor(bodyEl);
    } else if (tool.id === 'signature-resizer') {
      CyberTools.renderSignatureResizer(bodyEl);
    } else if (tool.id === 'qr-generator') {
      CyberTools.renderQrGenerator(bodyEl);
    } else if (tool.id === 'age-calculator') {
      CyberTools.renderAgeCalculator(bodyEl);
    } else if (tool.id === 'emi-calculator') {
      CyberTools.renderEmiCalculator(bodyEl);
    } else if (tool.id === 'bihar-land-converter') {
      CyberTools.renderBiharLandConverter(bodyEl);
    } else if (tool.id === 'application-maker') {
      CyberTools.renderApplicationMaker(bodyEl);
    } else if (tool.id === 'resume-maker') {
      CyberTools.renderResumeMaker(bodyEl);
    } else if (tool.id === 'print-calculator') {
      CyberTools.renderPrintCalculator(bodyEl);
    } else if (tool.id === 'pdf-merge') {
      CyberTools.renderPdfMerge(bodyEl);
    } else if (tool.id === 'jpg-to-pdf') {
      CyberTools.renderJpgToPdf(bodyEl);
    } else if (tool.id === 'pdf-rotate') {
      CyberTools.renderPdfRotate(bodyEl);
    } else if (tool.id === 'pdf-watermark') {
      CyberTools.renderPdfWatermark(bodyEl);
    } else if (tool.id === 'customer-registry') {
      CyberTools.renderCustomerRegistry(bodyEl);
    } else if (tool.id === 'income-expense') {
      CyberTools.renderIncomeExpense(bodyEl);
    } else if (tool.id === 'invoice-receipt') {
      CyberTools.renderInvoiceReceipt(bodyEl);
    } else if (tool.id === 'word-counter' || tool.id === 'case-converter' || tool.id === 'text-cleaner' || tool.id === 'hindi-typing-helper') {
      CyberTools.renderTextTools(bodyEl);
    } else if (tool.id === 'gst-calculator') {
      CyberTools.renderGstCalculator(bodyEl);
    } else if (tool.id === 'percentage-calculator' || tool.id === 'cgpa-calculator' || tool.id === 'bmi-calculator' || tool.id === 'interest-calculator') {
      // General calculator view
      if (tool.id === 'gst-calculator') CyberTools.renderGstCalculator(bodyEl);
      else if (tool.id === 'bmi-calculator') this.renderSimpleBmi(bodyEl);
      else this.renderGeneralCalculator(bodyEl, tool);
    } else if (tool.id === 'pdf-compressor') {
      // PDF Compressor UI with client-side instruction and reduction
      this.renderPdfCompressorUI(bodyEl);
    } else {
      // Extra tools, or a "coming soon" card (never open the wrong tool)
      CyberTools.renderExtra(bodyEl, tool);
    }

    modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('tool-modal');
    modal.classList.remove('active');
  },

  // Fallback / Specialized tool UI helpers
  renderSimpleBmi(container) {
    container.innerHTML = `
      <div style="max-width: 550px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <p style="font-size: 13.5px; color: var(--muted); margin-bottom: 16px;">Check Body Mass Index (BMI) for Police, Defense & Physical tests.</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div class="form-group">
            <label class="form-label">Height (cm)</label>
            <input type="number" id="bmi-h" class="form-control" value="170">
          </div>
          <div class="form-group">
            <label class="form-label">Weight (kg)</label>
            <input type="number" id="bmi-w" class="form-control" value="65">
          </div>
        </div>
        <div style="background: var(--background); padding: 16px; border-radius: 8px; text-align: center;" id="bmi-result">
          <div style="font-size: 12px; color: var(--muted);">Calculated BMI</div>
          <div id="bmi-score" style="font-size: 28px; font-weight: 800; color: var(--primary);">22.5</div>
          <div id="bmi-cat" style="font-weight: 700; color: #16a34a; font-size: 14px;">Normal Weight (Eligible)</div>
        </div>
      </div>
    `;
    const calc = () => {
      const h = (parseFloat(container.querySelector('#bmi-h').value) || 0) / 100;
      const w = parseFloat(container.querySelector('#bmi-w').value) || 0;
      if (h > 0 && w > 0) {
        const bmi = (w / (h * h)).toFixed(1);
        container.querySelector('#bmi-score').textContent = bmi;
        let cat = 'Normal Weight';
        let color = '#16a34a';
        if (bmi < 18.5) { cat = 'Underweight'; color = '#eab308'; }
        else if (bmi >= 25 && bmi < 29.9) { cat = 'Overweight'; color = '#f97316'; }
        else if (bmi >= 30) { cat = 'Obese'; color = '#ef4444'; }
        container.querySelector('#bmi-cat').textContent = cat;
        container.querySelector('#bmi-cat').style.color = color;
      }
    };
    container.querySelector('#bmi-h').addEventListener('input', calc);
    container.querySelector('#bmi-w').addEventListener('input', calc);
    calc();
  },

  renderGeneralCalculator(container, tool) {
    container.innerHTML = `
      <div style="max-width: 550px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <h4 style="margin-bottom: 12px;">${tool.name}</h4>
        <div class="form-group">
          <label class="form-label">Value A</label>
          <input type="number" id="gen-a" class="form-control" value="500">
        </div>
        <div class="form-group">
          <label class="form-label">Value B</label>
          <input type="number" id="gen-b" class="form-control" value="10">
        </div>
        <div style="background: var(--background); padding: 16px; border-radius: 8px; text-align: center; margin-top: 14px;">
          <div style="font-size: 12px; color: var(--muted);">Calculation Result</div>
          <div id="gen-res" style="font-size: 26px; font-weight: 800; color: var(--primary);">-</div>
        </div>
      </div>
    `;
    const calc = () => {
      const a = parseFloat(container.querySelector('#gen-a').value) || 0;
      const b = parseFloat(container.querySelector('#gen-b').value) || 0;
      let res = (a * b) / 100; // default percent
      if (tool.id === 'cgpa-calculator') res = (a * 9.5).toFixed(2) + ' %';
      container.querySelector('#gen-res').textContent = res;
    };
    container.querySelector('#gen-a').addEventListener('input', calc);
    container.querySelector('#gen-b').addEventListener('input', calc);
    calc();
  },

  renderPdfCompressorUI(container) {
    container.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 22px; border-radius: 12px; border: 1px solid var(--border);">
        <div class="dropzone" id="pdfc-dropzone" style="margin-bottom: 16px;">
          <i class="fa-solid fa-file-zipper" style="font-size: 32px; color: var(--primary); margin-bottom: 8px;"></i>
          <p style="font-weight: 600;">Select PDF to Compress</p>
          <p style="font-size: 12px; color: var(--muted);">Reduce file size for online portal submissions</p>
          <input type="file" id="pdfc-file" accept="application/pdf" style="display: none;">
        </div>

        <div id="pdfc-controls" style="display: none;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span>Current Size: <strong id="pdfc-orig-size">-</strong></span>
            <span>Target Level: <strong style="color: var(--primary);">Standard (High Optimization)</strong></span>
          </div>
          <button id="pdfc-btn" class="btn btn-primary" style="width: 100%;">
            <i class="fa-solid fa-bolt"></i> Optimize & Download PDF
          </button>
        </div>
      </div>
    `;
    const dropzone = container.querySelector('#pdfc-dropzone');
    const fileInput = container.querySelector('#pdfc-file');
    const controls = container.querySelector('#pdfc-controls');
    let pdfFile = null;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        pdfFile = e.target.files[0];
        container.querySelector('#pdfc-orig-size').textContent = (pdfFile.size / 1024).toFixed(0) + ' KB';
        controls.style.display = 'block';
      }
    });

    container.querySelector('#pdfc-btn').addEventListener('click', async () => {
      if (!pdfFile || !window.PDFLib) return;
      try {
        const btn = container.querySelector('#pdfc-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Compressing PDF streams...';
        const buffer = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(buffer);
        // Save with object stream and discard unused
        const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
        const blob = new Blob([compressedBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Compressed_${pdfFile.name}`;
        link.click();
        CyberApp.showToast('PDF optimized and downloaded!', 'success');
      } catch (err) {
        console.error(err);
        CyberApp.showToast('Could not optimize PDF', 'error');
      } finally {
        container.querySelector('#pdfc-btn').disabled = false;
        container.querySelector('#pdfc-btn').innerHTML = '<i class="fa-solid fa-bolt"></i> Optimize & Download PDF';
      }
    });
  },

  // ROUTER & VIEW RENDERING
  renderView(viewName) {
    this.state.currentTab = viewName;

    // Update active state in desktop sidebar and mobile bottom nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });
    document.querySelectorAll('.bottom-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === viewName);
    });

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (viewName === 'dashboard') {
      this.renderDashboardView(mainContent);
    } else if (viewName === 'tools') {
      this.renderAllToolsView(mainContent);
    } else if (viewName === 'favorites') {
      this.renderFavoritesView(mainContent);
    } else if (viewName === 'recent') {
      this.renderRecentView(mainContent);
    } else if (viewName === 'business') {
      this.renderBusinessView(mainContent);
    } else if (viewName === 'ai') {
      this.renderAiView(mainContent);
    } else if (viewName === 'settings') {
      this.renderSettingsView(mainContent);
    } else {
      // Category filtered view (e.g. pdf, image, text, calculator, documents)
      this.state.selectedCategory = viewName;
      this.renderAllToolsView(mainContent);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  refreshCurrentView() {
    this.renderView(this.state.currentTab);
  },

  // DASHBOARD VIEW
  renderDashboardView(container) {
    const popularIds = ['passport-photo', 'pdf-compressor', 'qr-generator', 'age-calculator', 'emi-calculator', 'resume-maker'];
    const popularTools = window.TOOL_REGISTRY.filter(t => popularIds.includes(t.id));

    container.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-card">
        <div class="hero-tag"><i class="fa-solid fa-location-dot"></i> ${this.state.settings.location}</div>
        <h1 class="hero-title">Good Morning 👋 Welcome to ${this.state.settings.businessName}</h1>
        <p class="hero-subtitle">“Everything you need for your Cyber Cafe, in one place.” Digital service assistant by ${this.state.settings.founder}.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="CyberApp.renderView('ai')">
            <i class="fa-solid fa-robot"></i> Ask AI Assistant
          </button>
          <button class="btn btn-secondary" onclick="CyberApp.renderView('tools')">
            <i class="fa-solid fa-toolbox"></i> Explore 50+ Tools
          </button>
        </div>
      </section>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(37,99,235,0.1); color: var(--primary);">
            <i class="fa-solid fa-toolbox"></i>
          </div>
          <div>
            <div class="stat-val">50+</div>
            <div class="stat-label">Total Tools</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239,68,68,0.1); color: #ef4444;">
            <i class="fa-solid fa-file-pdf"></i>
          </div>
          <div>
            <div class="stat-val">12+</div>
            <div class="stat-label">PDF Tools</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16,185,129,0.1); color: #10b981;">
            <i class="fa-solid fa-image"></i>
          </div>
          <div>
            <div class="stat-val">12+</div>
            <div class="stat-label">Image Tools</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245,158,11,0.1); color: #f59e0b;">
            <i class="fa-solid fa-calculator"></i>
          </div>
          <div>
            <div class="stat-val">10+</div>
            <div class="stat-label">Calculators</div>
          </div>
        </div>
      </div>

      <!-- Quick AI Assistant Banner Widget -->
      <div class="ai-assistant-panel" style="margin-bottom: 28px;">
        <div class="ai-header">
          <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
          <div>
            <h3 style="font-size: 16px;">🤖 CYBER HUB Smart Assistant</h3>
            <p style="font-size: 13px; color: var(--muted);">“Namaste 👋 बताइए आपको कौन सा काम करना है?”</p>
          </div>
        </div>

        <form class="ai-input-form" onsubmit="CyberApp.handleAiQuickSubmit(event)">
          <input type="text" id="ai-quick-input" placeholder="Type request in Hindi or English (e.g. Passport photo banani hai, PDF chhota karna hai)...">
          <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Ask</button>
        </form>

        <div class="ai-chips">
          <span class="ai-chip" onclick="CyberApp.handleAiKeyword('Passport photo banani hai')">📸 Passport Photo</span>
          <span class="ai-chip" onclick="CyberApp.handleAiKeyword('PDF chhota karna hai')">📄 PDF Compressor</span>
          <span class="ai-chip" onclick="CyberApp.handleAiKeyword('UPI QR Code banana hai')">🔳 QR Generator</span>
          <span class="ai-chip" onclick="CyberApp.handleAiKeyword('Resume banana hai naukri ke liye')">📝 Resume Maker</span>
          <span class="ai-chip" onclick="CyberApp.handleAiKeyword('Umar nikalna hai cut off date')">🎂 Age Calculator</span>
          <span class="ai-chip" onclick="CyberApp.handleAiKeyword('Bank application likhna hai')">📄 Bank Application</span>
        </div>
      </div>

      <!-- Popular Tools Section -->
      <div class="section-header">
        <h2 class="section-title"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> Popular Cyber Cafe Tools</h2>
        <button class="btn btn-secondary btn-sm" onclick="CyberApp.renderView('tools')">View All</button>
      </div>
      <div class="tools-grid">
        ${popularTools.map(tool => this.renderToolCardHtml(tool)).join('')}
      </div>

      <!-- Categories Section -->
      <div class="section-header">
        <h2 class="section-title"><i class="fa-solid fa-folder-open" style="color: var(--primary);"></i> Browse by Category</h2>
      </div>
      <div class="category-grid">
        <div class="category-card" onclick="CyberApp.renderView('pdf')">
          <div class="cat-icon" style="color: #ef4444;"><i class="fa-solid fa-file-pdf"></i></div>
          <div class="cat-title">PDF Tools</div>
          <div class="cat-desc">Merge, split, compress, rotate and convert PDFs.</div>
        </div>

        <div class="category-card" onclick="CyberApp.renderView('image')">
          <div class="cat-icon" style="color: #10b981;"><i class="fa-solid fa-image"></i></div>
          <div class="cat-title">Image Tools</div>
          <div class="cat-desc">Passport photos, crop, resize and signature booster.</div>
        </div>

        <div class="category-card" onclick="CyberApp.renderView('calculator')">
          <div class="cat-icon" style="color: #f59e0b;"><i class="fa-solid fa-calculator"></i></div>
          <div class="cat-title">Calculators</div>
          <div class="cat-desc">EMI, GST, Age, Bihar land converter and interest.</div>
        </div>

        <div class="category-card" onclick="CyberApp.renderView('documents')">
          <div class="cat-icon" style="color: #8b5cf6;"><i class="fa-solid fa-file-signature"></i></div>
          <div class="cat-title">Documents</div>
          <div class="cat-desc">Resume builder, Sarkari applications and ID cards.</div>
        </div>

        <div class="category-card" onclick="CyberApp.renderView('text')">
          <div class="cat-icon" style="color: #06b6d4;"><i class="fa-solid fa-font"></i></div>
          <div class="cat-title">Text Tools</div>
          <div class="cat-desc">Word count, case converter, cleanup & Hindi typing.</div>
        </div>

        <div class="category-card" onclick="CyberApp.renderView('business')">
          <div class="cat-icon" style="color: #3b82f6;"><i class="fa-solid fa-store"></i></div>
          <div class="cat-title">Business & Khata</div>
          <div class="cat-desc">Customer registry, income ledger, receipts & rates.</div>
        </div>
      </div>
    `;
  },

  // ALL TOOLS VIEW
  renderAllToolsView(container) {
    let tools = [...window.TOOL_REGISTRY];

    // Filter by Category
    if (this.state.selectedCategory !== 'all') {
      tools = tools.filter(t => t.category === this.state.selectedCategory);
    }

    // Filter by Search
    if (this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase().trim();
      tools = tools.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    }

    // Sort
    if (this.state.sortBy === 'az') {
      tools.sort((a, b) => a.name.localeCompare(b.name));
    }

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; margin-bottom: 6px;">Explore Tools (${tools.length})</h1>
        <p style="color: var(--muted); font-size: 14px;">Instant offline-first digital utilities for daily cyber cafe operations.</p>
      </div>

      <!-- Filters & Search Toolbar -->
      <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${['all', 'pdf', 'image', 'calculator', 'documents', 'text', 'business'].map(cat => `
            <button class="btn btn-sm ${this.state.selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}" 
                    onclick="CyberApp.filterCategory('${cat}')">
              ${cat.toUpperCase()}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; color: var(--muted);">Sort by:</span>
          <select class="form-control" style="width: auto; padding: 6px 10px;" onchange="CyberApp.sortTools(this.value)">
            <option value="popular" ${this.state.sortBy === 'popular' ? 'selected' : ''}>Popular</option>
            <option value="az" ${this.state.sortBy === 'az' ? 'selected' : ''}>A to Z</option>
          </select>
        </div>
      </div>

      <!-- Tools Grid -->
      ${tools.length === 0 ? `
        <div style="text-align: center; padding: 60px 20px; color: var(--muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; margin-bottom: 12px; opacity: 0.5;"></i>
          <h3 style="font-size: 18px; margin-bottom: 6px;">No tools found</h3>
          <p style="font-size: 14px;">Try searching for "passport", "compress", "gst", or clear your filter.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="CyberApp.filterCategory('all')">View All Tools</button>
        </div>
      ` : `
        <div class="tools-grid">
          ${tools.map(tool => this.renderToolCardHtml(tool)).join('')}
        </div>
      `}
    `;
  },

  filterCategory(cat) {
    this.state.selectedCategory = cat;
    this.renderAllToolsView(document.getElementById('main-content'));
  },

  sortTools(sortBy) {
    this.state.sortBy = sortBy;
    this.renderAllToolsView(document.getElementById('main-content'));
  },

  // FAVORITES VIEW
  renderFavoritesView(container) {
    const favTools = window.TOOL_REGISTRY.filter(t => this.state.favorites.includes(t.id));

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; margin-bottom: 6px;"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> My Favorites</h1>
        <p style="color: var(--muted); font-size: 14px;">Your starred tools for immediate one-click access.</p>
      </div>

      ${favTools.length === 0 ? `
        <div style="text-align: center; padding: 60px 20px; color: var(--muted);">
          <i class="fa-regular fa-star" style="font-size: 40px; margin-bottom: 12px; opacity: 0.4;"></i>
          <h3>No favorite tools added yet</h3>
          <p style="font-size: 13.5px; margin-top: 4px;">Click the star icon ⭐ on any tool card to add it to your quick favorites list.</p>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="CyberApp.renderView('tools')">Browse Tools</button>
        </div>
      ` : `
        <div class="tools-grid">
          ${favTools.map(t => this.renderToolCardHtml(t)).join('')}
        </div>
      `}
    `;
  },

  // RECENT VIEW
  renderRecentView(container) {
    const recentTools = this.state.recent.map(id => window.TOOL_REGISTRY.find(t => t.id === id)).filter(Boolean);

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; margin-bottom: 6px;"><i class="fa-solid fa-clock-rotate-left" style="color: var(--primary);"></i> Recently Used Tools</h1>
        <p style="color: var(--muted); font-size: 14px;">Quick history of tools you opened recently on this device.</p>
      </div>

      ${recentTools.length === 0 ? `
        <div style="text-align: center; padding: 60px 20px; color: var(--muted);">
          <i class="fa-solid fa-clock" style="font-size: 40px; margin-bottom: 12px; opacity: 0.4;"></i>
          <h3>No recently opened tools yet</h3>
          <button class="btn btn-primary" style="margin-top: 16px;" onclick="CyberApp.renderView('tools')">Explore Tools</button>
        </div>
      ` : `
        <div class="tools-grid">
          ${recentTools.map(t => this.renderToolCardHtml(t)).join('')}
        </div>
      `}
    `;
  },

  // BUSINESS MANAGEMENT VIEW
  renderBusinessView(container) {
    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <h1 style="font-size: 24px; margin-bottom: 6px;"><i class="fa-solid fa-store" style="color: var(--primary);"></i> Cyber Cafe Business Dashboard</h1>
        <p style="color: var(--muted); font-size: 14px;">Customer Khata, Daily Accounts & Cash Receipts for ${this.state.settings.businessName} (Sikti, Araria).</p>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
        <button class="btn btn-primary biz-tab" data-tab="registry"><i class="fa-solid fa-users"></i> Customer Khata</button>
        <button class="btn btn-secondary biz-tab" data-tab="ledger"><i class="fa-solid fa-sack-dollar"></i> Income & Expense</button>
        <button class="btn btn-secondary biz-tab" data-tab="receipt"><i class="fa-solid fa-receipt"></i> Invoice / Receipt</button>
        <button class="btn btn-secondary biz-tab" data-tab="calc"><i class="fa-solid fa-print"></i> Print Rate Calculator</button>
      </div>

      <div id="biz-content-area"></div>
    `;

    const area = container.querySelector('#biz-content-area');
    const tabs = container.querySelectorAll('.biz-tab');

    const switchBizTab = (tabName) => {
      tabs.forEach(t => {
        t.classList.toggle('btn-primary', t.dataset.tab === tabName);
        t.classList.toggle('btn-secondary', t.dataset.tab !== tabName);
      });
      area.innerHTML = '';
      if (tabName === 'registry') CyberTools.renderCustomerRegistry(area);
      else if (tabName === 'ledger') CyberTools.renderIncomeExpense(area);
      else if (tabName === 'receipt') CyberTools.renderInvoiceReceipt(area);
      else if (tabName === 'calc') CyberTools.renderPrintCalculator(area);
    };

    tabs.forEach(t => t.addEventListener('click', () => switchBizTab(t.dataset.tab)));
    switchBizTab('registry');
  },

  // AI ASSISTANT FULL VIEW
  renderAiView(container) {
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 4px;"><i class="fa-solid fa-robot" style="color: #8b5cf6;"></i> CYBER HUB AI Assistant</h1>
          <p style="color: var(--muted); font-size: 14px;">Smart natural language tool routing & assistant. Ask in Hindi, English, or Hinglish.</p>
        </div>

        <div class="ai-assistant-panel" style="padding: 24px;">
          <div class="ai-header">
            <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
            <div>
              <h3 style="font-size: 16px;">Namaste 👋 बताइए आपको कौन सा काम करना है?</h3>
              <p style="font-size: 12.5px; color: var(--muted);">Type what you need, and I will route you to the exact Cyber tool.</p>
            </div>
          </div>

          <div class="ai-chat-box" id="ai-main-chat" style="max-height: 380px; min-height: 240px;">
            <div class="chat-bubble bot">
              Namaste! Main CYBER HUB ka Digital Assistant hoon. Aapko passport photo banani hai, PDF compress karna hai, ya koi application likhni hai?
            </div>
          </div>

          <form class="ai-input-form" onsubmit="CyberApp.handleAiChatSubmit(event)" style="margin-top: 14px;">
            <input type="text" id="ai-chat-input" placeholder="Type your request (e.g. 'Customer ki passport photo print karni hai', 'PDF jodna hai')...">
            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Send</button>
          </form>

          <div class="ai-chips">
            <span class="ai-chip" onclick="CyberApp.sendAiQuery('Passport size photo banani hai')">📸 Passport Photo</span>
            <span class="ai-chip" onclick="CyberApp.sendAiQuery('PDF file chhoti karni hai upload ke liye')">📄 PDF Compressor</span>
            <span class="ai-chip" onclick="CyberApp.sendAiQuery('Shop ke liye UPI QR Code standee')">🔳 UPI QR Code</span>
            <span class="ai-chip" onclick="CyberApp.sendAiQuery('SBI bank me ATM card ke liye application')">🏦 Bank Application</span>
            <span class="ai-chip" onclick="CyberApp.sendAiQuery('Katha bigha decimal napna hai')">🌾 Bihar Land Units</span>
            <span class="ai-chip" onclick="CyberApp.sendAiQuery('Grahak ka bill rasid banana hai')">🧾 Invoice Receipt</span>
          </div>
        </div>
      </div>
    `;
  },

  // SETTINGS VIEW
  renderSettingsView(container) {
    const s = this.state.settings;
    container.innerHTML = `
      <div style="max-width: 650px; margin: 0 auto; background: var(--surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border);">
        <h2 style="font-size: 20px; margin-bottom: 6px;"><i class="fa-solid fa-gear" style="color: var(--primary);"></i> Cyber Cafe Settings</h2>
        <p style="color: var(--muted); font-size: 13.5px; margin-bottom: 20px;">Configure shop details, contact numbers, print pricing, and backups.</p>

        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--primary);">Shop Information</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div class="form-group">
            <label class="form-label">Cyber Cafe Name</label>
            <input type="text" id="set-name" class="form-control" value="${s.businessName}">
          </div>
          <div class="form-group">
            <label class="form-label">Subtitle / Tagline</label>
            <input type="text" id="set-sub" class="form-control" value="${s.subtitle}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div class="form-group">
            <label class="form-label">Founder Name</label>
            <input type="text" id="set-founder" class="form-control" value="${s.founder}">
          </div>
          <div class="form-group">
            <label class="form-label">Mobile / WhatsApp</label>
            <input type="text" id="set-mobile" class="form-control" value="${s.mobile}">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">Shop Address / Location</label>
          <input type="text" id="set-loc" class="form-control" value="${s.location}">
        </div>

        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--primary);">Default Print Rates (₹)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px;">
          <div class="form-group">
            <label class="form-label">B&W Single Side</label>
            <input type="number" id="set-rate-bw" class="form-control" value="${s.printRates.bw_single}">
          </div>
          <div class="form-group">
            <label class="form-label">Color Print</label>
            <input type="number" id="set-rate-color" class="form-control" value="${s.printRates.color_a4}">
          </div>
          <div class="form-group">
            <label class="form-label">Photo 4×6</label>
            <input type="number" id="set-rate-photo" class="form-control" value="${s.printRates.photo_4x6}">
          </div>
          <div class="form-group">
            <label class="form-label">A4 Lamination</label>
            <input type="number" id="set-rate-lam" class="form-control" value="${s.printRates.lamination}">
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 24px;">
          <button id="set-save-btn" class="btn btn-primary" style="flex: 1;"><i class="fa-solid fa-floppy-disk"></i> Save Settings</button>
        </div>

        <h3 style="font-size: 15px; margin-bottom: 12px; color: #ef4444;">Data & Backup</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="set-export-btn" class="btn btn-secondary btn-sm"><i class="fa-solid fa-file-arrow-down"></i> Export All Data (JSON)</button>
          <button id="set-clear-btn" class="btn btn-secondary btn-sm" style="color: #ef4444;"><i class="fa-solid fa-trash"></i> Reset All Data</button>
        </div>
      </div>
    `;

    container.querySelector('#set-save-btn').addEventListener('click', () => {
      this.state.settings.businessName = container.querySelector('#set-name').value;
      this.state.settings.subtitle = container.querySelector('#set-sub').value;
      this.state.settings.founder = container.querySelector('#set-founder').value;
      this.state.settings.mobile = container.querySelector('#set-mobile').value;
      this.state.settings.location = container.querySelector('#set-loc').value;

      this.state.settings.printRates.bw_single = parseFloat(container.querySelector('#set-rate-bw').value) || 3;
      this.state.settings.printRates.color_a4 = parseFloat(container.querySelector('#set-rate-color').value) || 10;
      this.state.settings.printRates.photo_4x6 = parseFloat(container.querySelector('#set-rate-photo').value) || 20;
      this.state.settings.printRates.lamination = parseFloat(container.querySelector('#set-rate-lam').value) || 20;

      localStorage.setItem('cyberhub_settings', JSON.stringify(this.state.settings));
      this.showToast('Settings saved successfully!', 'success');
      this.refreshCurrentView();
    });

    container.querySelector('#set-export-btn').addEventListener('click', () => {
      const backup = {
        settings: this.state.settings,
        customers: this.getCustomers(),
        ledger: this.getLedger(),
        favorites: this.state.favorites
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = `CyberHub_Backup_${Date.now()}.json`;
      link.href = URL.createObjectURL(blob);
      link.click();
      this.showToast('Data exported successfully!', 'success');
    });

    container.querySelector('#set-clear-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all Customer Khata and Ledger data?')) {
        localStorage.removeItem('cyberhub_customers');
        localStorage.removeItem('cyberhub_ledger');
        this.showToast('Data reset to default', 'info');
        this.refreshCurrentView();
      }
    });
  },

  // TOOL CARD HTML BUILDER
  renderToolCardHtml(tool) {
    const isFav = this.state.favorites.includes(tool.id);
    return `
      <div class="tool-card" onclick="CyberApp.openTool('${tool.id}')">
        <div class="tool-card-top">
          <div class="tool-icon-wrap" style="background: rgba(37,99,235,0.08); color: var(--primary);">
            <i class="fa-solid ${tool.icon}"></i>
          </div>
          <button class="fav-btn ${isFav ? 'active' : ''}" onclick="CyberApp.toggleFavorite('${tool.id}', event)" title="Star as Favorite">
            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-star"></i>
          </button>
        </div>

        <h3 class="tool-title">${tool.name}</h3>
        <p class="tool-desc">${tool.desc}</p>

        <div class="tool-card-foot">
          <span class="category-tag">${tool.category.toUpperCase()}</span>
          <span style="font-size: 12.5px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 4px;">
            Open <i class="fa-solid fa-arrow-right" style="font-size: 11px;"></i>
          </span>
        </div>
      </div>
    `;
  },

  // AI ROUTING LOGIC
  matchToolForPrompt(query) {
    const q = query.toLowerCase();
    
    // Exact mapping patterns
    if (q.includes('passport') || q.includes('photo') || q.includes('35x45') || q.includes('chhota photo') || q.includes('visa')) {
      return { toolId: 'passport-photo', reply: 'आपके लिए Passport Photo Maker सबसे सही रहेगा. यह 3.5×4.5cm फोटो A4 या 4×6 शीट पर तैयार करता है.' };
    }
    if (q.includes('compress') || q.includes('chhota') || q.includes('mb to kb') || q.includes('size kam') || q.includes('pdf chhota')) {
      return { toolId: 'pdf-compressor', reply: 'PDF या डॉक्यूमेंट का साइज कम करने के लिए PDF Compressor या Image Compressor का उपयोग करें.' };
    }
    if (q.includes('qr') || q.includes('barcode') || q.includes('upi') || q.includes('wifi') || q.includes('scan')) {
      return { toolId: 'qr-generator', reply: 'दुकान या UPI पेमेंट के लिए QR Code Generator तैयार है.' };
    }
    if (q.includes('age') || q.includes('umar') || q.includes('dob') || q.includes('saal')) {
      return { toolId: 'age-calculator', reply: 'सरकारी फॉर्म की कट-ऑफ डेट के अनुसार सही उम्र निकालने के लिए Age Calculator खोलें.' };
    }
    if (q.includes('emi') || q.includes('kist') || q.includes('loan') || q.includes('byaj')) {
      return { toolId: 'emi-calculator', reply: 'लोन की मासिक किश्त और ब्याज जानने के लिए EMI Calculator इस्तेमाल करें.' };
    }
    if (q.includes('resume') || q.includes('cv') || q.includes('biodata') || q.includes('naukri')) {
      return { toolId: 'resume-maker', reply: 'नौकरी के लिए प्रोफेशनल बायोडाटा बनाने के लिए Resume Maker खोलिए.' };
    }
    if (q.includes('application') || q.includes('patra') || q.includes('leave') || q.includes('bank') || q.includes('chhutti')) {
      return { toolId: 'application-maker', reply: 'बैंक (ATM/Passbook), स्कूल या पुलिस आवेदन पत्र तुरंत हिंदी/अंग्रेजी में बनाने के लिए Sarkari Application Maker चुनें.' };
    }
    if (q.includes('merge') || q.includes('jodna') || q.includes('combine')) {
      return { toolId: 'pdf-merge', reply: 'कई सारे PDF को एक साथ जोड़ने के लिए PDF Merge टूल सबसे उपयुक्त है.' };
    }
    if (q.includes('signature') || q.includes('dastakhat') || q.includes('hastakshar') || q.includes('ssc')) {
      return { toolId: 'signature-resizer', reply: 'SSC, UPSC, BPSC फॉर्म के लिए 140×60px और 10-20KB का सिग्नेचर बनाने के लिए Signature Resizer खोलें.' };
    }
    if (q.includes('bigha') || q.includes('katha') || q.includes('dhur') || q.includes('decimal') || q.includes('zameen')) {
      return { toolId: 'bihar-land-converter', reply: 'सिकटी और अररिया में कट्ठा, बीघा, धूर और डिसमिल नापने के लिए Bihar Land Converter प्रयोग करें.' };
    }
    if (q.includes('customer') || q.includes('khata') || q.includes('grahak') || q.includes('register')) {
      return { toolId: 'customer-registry', reply: 'ग्राहकों के काम और पेमेंट का हिसाब रखने के लिए Customer Registry (Khata) खोलें.' };
    }
    if (q.includes('bill') || q.includes('receipt') || q.includes('rasid') || q.includes('invoice')) {
      return { toolId: 'invoice-receipt', reply: 'ग्राहक को साइबर कैफे की रसीद देने के लिए Invoice / Receipt Generator का उपयोग करें.' };
    }
    if (q.includes('gst') || q.includes('tax')) {
      return { toolId: 'gst-calculator', reply: 'GST और टैक्स की गणना के लिए GST Calculator सबसे उपयुक्त है.' };
    }

    return { toolId: 'passport-photo', reply: 'नमस्ते! आपकी सुविधा के लिए हमारे पास 50+ टूल्स उपलब्ध हैं. नीचे दिए गए टूल को देखें:' };
  },

  handleAiQuickSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('ai-quick-input');
    if (!input || !input.value.trim()) return;
    const query = input.value.trim();
    this.sendAiQuery(query);
  },

  handleAiKeyword(query) {
    this.sendAiQuery(query);
  },

  sendAiQuery(query) {
    this.renderView('ai');
    setTimeout(() => {
      const chatBox = document.getElementById('ai-main-chat');
      if (!chatBox) return;

      // Add user message
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.textContent = query;
      chatBox.appendChild(userBubble);

      const match = this.matchToolForPrompt(query);
      const tool = window.TOOL_REGISTRY.find(t => t.id === match.toolId);

      setTimeout(() => {
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';
        botBubble.innerHTML = `
          <div>${match.reply}</div>
          ${tool ? `
            <div class="ai-action-card">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid ${tool.icon}" style="color: var(--primary);"></i>
                <span style="font-weight: 700; font-size: 13px;">${tool.name}</span>
              </div>
              <button class="btn btn-primary btn-sm" onclick="CyberApp.openTool('${tool.id}')">
                Open Tool →
              </button>
            </div>
          ` : ''}
        `;
        chatBox.appendChild(botBubble);
        chatBox.scrollTop = chatBox.scrollHeight;
      }, 300);

      chatBox.scrollTop = chatBox.scrollHeight;
    }, 100);
  },

  handleAiChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('ai-chat-input');
    if (!input || !input.value.trim()) return;
    const q = input.value.trim();
    input.value = '';
    this.sendAiQuery(q);
  },

  // SIDEBAR RECENT TOOLS
  renderSidebarRecent() {
    const list = document.getElementById('sidebar-recent-list');
    if (!list) return;
    const recentTools = this.state.recent.slice(0, 4).map(id => window.TOOL_REGISTRY.find(t => t.id === id)).filter(Boolean);
    if (recentTools.length === 0) {
      list.innerHTML = `<span style="font-size: 11px; color: var(--muted); padding-left: 14px;">No recent tools</span>`;
      return;
    }
    list.innerHTML = recentTools.map(t => `
      <button class="nav-item" onclick="CyberApp.openTool('${t.id}')" style="padding: 6px 14px; font-size: 12.5px;">
        <i class="fa-solid ${t.icon}" style="font-size: 13px; color: var(--primary);"></i>
        <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${t.name}</span>
      </button>
    `).join('');
  },

  updateStatsCounters() {
    // Badges in sidebar
    const allToolsCount = window.TOOL_REGISTRY.length;
    const el = document.getElementById('badge-all-tools');
    if (el) el.textContent = allToolsCount;
  },

  // EVENT LISTENERS
  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        if (this.state.currentTab !== 'tools') {
          this.renderView('tools');
        } else {
          this.renderAllToolsView(document.getElementById('main-content'));
        }
      });
    }

    // Modal close events
    const modalClose = document.getElementById('modal-close-btn');
    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());

    const modal = document.getElementById('tool-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // ESC to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.CyberApp.init();
});

import { API_METADATA, API_ENDPOINTS } from './apiSpec.js';

export function renderApiDocsHtml(): string {
  const categories = ['Tasks', 'Members', 'Webhooks', 'System'] as const;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${API_METADATA.name} — Interactive API Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111726;
      --card-border: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #3b82f6;
      --get: #10b981;
      --post: #3b82f6;
      --patch: #f59e0b;
      --delete: #ef4444;
      --code-bg: #050811;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 5rem;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .header {
      background: linear-gradient(180deg, #131b2e 0%, #090d16 100%);
      border-bottom: 1px solid var(--card-border);
      padding: 2.5rem 1.5rem 2rem;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 0.375rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-get { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-post { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-patch { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-delete { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    
    .nav-tabs {
      display: flex;
      gap: 0.5rem;
      margin-top: 1.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    .nav-tab {
      background: #172136;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.45rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .nav-tab:hover, .nav-tab.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 2rem 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .endpoint-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 0.65rem;
      margin-bottom: 1.25rem;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .endpoint-card:hover {
      border-color: #334155;
    }
    .endpoint-header {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      cursor: pointer;
      user-select: none;
      background: rgba(255, 255, 255, 0.015);
    }
    .endpoint-path {
      font-family: 'Fira Code', monospace;
      font-weight: 600;
      font-size: 0.88rem;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .endpoint-summary {
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 500;
    }
    .endpoint-body {
      padding: 1.25rem;
      border-top: 1px solid var(--card-border);
      background: rgba(0, 0, 0, 0.2);
    }
    .desc-text {
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      font-family: 'Fira Code', monospace;
    }
    .input-text, .textarea-json {
      width: 100%;
      background: var(--code-bg);
      border: 1px solid #1e293b;
      border-radius: 0.375rem;
      color: #e2e8f0;
      font-family: 'Fira Code', monospace;
      font-size: 0.8rem;
      padding: 0.6rem 0.75rem;
    }
    .input-text:focus, .textarea-json:focus {
      outline: none;
      border-color: var(--accent);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #1e293b; color: #94a3b8; }
    .btn-secondary:hover { background: #334155; color: white; }
    
    .response-box {
      margin-top: 1rem;
      background: var(--code-bg);
      border: 1px solid #1e293b;
      border-radius: 0.375rem;
      padding: 1rem;
      overflow-x: auto;
      font-family: 'Fira Code', monospace;
      font-size: 0.78rem;
      color: #a7f3d0;
      white-space: pre-wrap;
      max-height: 350px;
    }
    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
        <div>
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
            <span style="background:#2563eb; color:white; font-size:0.75rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:0.35rem;">SI-PATIR</span>
            <span style="font-size:0.75rem; color:#94a3b8; font-family:'Fira Code', monospace;">v${API_METADATA.version}</span>
            <span style="background:rgba(16,185,129,0.15); color:#34d399; font-size:0.7rem; padding:0.15rem 0.45rem; border-radius:0.3rem; border:1px solid rgba(16,185,129,0.3);">● Live API</span>
          </div>
          <h1 style="font-size:1.6rem; font-weight:800; color:#fff;">Interactive REST API Explorer</h1>
          <p style="color:#94a3b8; font-size:0.88rem; max-width:680px; margin-top:0.35rem;">
            ${API_METADATA.description}
          </p>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <a href="http://localhost:3000/dashboard" class="btn btn-secondary">← Ke Web Dashboard</a>
          <a href="/api/v1/system/docs" target="_blank" class="btn btn-secondary">JSON OpenAPI</a>
        </div>
      </div>

      <div class="nav-tabs">
        <button type="button" class="nav-tab active" data-cat="ALL">Semua Endpoint (${API_ENDPOINTS.length})</button>
        ${categories.map((c) => `<button type="button" class="nav-tab" data-cat="${c}">${c} (${API_ENDPOINTS.filter((e) => e.category === c).length})</button>`).join('')}
      </div>

      <div style="margin-top: 1rem; position: relative;">
        <input
          type="text"
          id="api-search-input"
          placeholder="Cari endpoint (misal: /tasks, PATCH, trello, status)..."
          class="input-text"
          style="padding-left: 2.25rem; font-size: 0.85rem;"
        />
        <span style="position: absolute; left: 0.75rem; top: 0.6rem; color: #64748b; font-size: 0.85rem; pointer-events: none;">🔍</span>
      </div>
    </div>
  </div>

  <div class="container" style="margin-top:1.5rem;">
    <div id="endpoints-list">
      ${API_ENDPOINTS.map((endpoint, index) => {
        const badgeClass = `badge-${endpoint.method.toLowerCase()}`;
        const hasParams = endpoint.params && endpoint.params.length > 0;
        const hasBody = Boolean(endpoint.body);

        return `
        <div class="endpoint-card" data-category="${endpoint.category}" id="card-${index}">
          <div class="endpoint-header" onclick="toggleCard(${index})">
            <div class="endpoint-path">
              <span class="badge ${badgeClass}">${endpoint.method}</span>
              <span>${endpoint.path}</span>
            </div>
            <div class="endpoint-summary">${endpoint.summary}</div>
          </div>
          <div class="endpoint-body" id="body-${index}">
            <p class="desc-text">${endpoint.description}</p>
            
            ${hasParams ? `
              <div class="form-group">
                <label class="form-label">Path Parameters</label>
                ${endpoint.params!.map((p) => `
                  <div style="margin-bottom:0.5rem;">
                    <span style="font-size:0.75rem; color:#94a3b8; font-family:'Fira Code';">${p.name} (${p.type}): ${p.description}</span>
                    <input type="text" id="param-${index}-${p.name}" class="input-text" placeholder="Isi nilai ${p.name}..." style="margin-top:0.25rem;">
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${hasBody ? `
              <div class="form-group">
                <label class="form-label">Request Body (JSON)</label>
                <textarea id="payload-${index}" rows="4" class="textarea-json">${JSON.stringify(endpoint.body, null, 2)}</textarea>
              </div>
            ` : ''}

            <div style="display:flex; gap:0.5rem; align-items:center; margin-top:1rem;">
              <button class="btn btn-primary" onclick="executeApi(${index}, '${endpoint.method}', '${endpoint.path}')">
                ⚡ Send Request
              </button>
              <button class="btn btn-secondary" onclick="copyCurl(${index}, '${endpoint.method}', '${endpoint.path}')">
                📋 Copy cURL
              </button>
            </div>

            <div id="result-box-${index}" style="display:none;" class="response-box">
              <div class="response-header">
                <span id="result-status-${index}">Status: ...</span>
                <span id="result-time-${index}">Waktu: ...</span>
              </div>
              <code id="result-json-${index}"></code>
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  </div>

  <script>
    let currentCategory = 'ALL';
    let searchQuery = '';

    function applyFilters() {
      const q = searchQuery.toLowerCase().trim();
      document.querySelectorAll('.endpoint-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        const text = card.textContent.toLowerCase();

        const matchCat = currentCategory === 'ALL' || cat === currentCategory;
        const matchSearch = !q || text.includes(q);

        if (matchCat && matchSearch) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Attach event listeners to category filter tabs
    document.querySelectorAll('.nav-tab').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.getAttribute('data-cat') || 'ALL';
        applyFilters();
      });
    });

    // Attach event listener to search input
    const searchInput = document.getElementById('api-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchQuery = this.value;
        applyFilters();
      });
    }

    function toggleCard(index) {
      const el = document.getElementById('body-' + index);
      if (el) {
        const isHidden = window.getComputedStyle(el).display === 'none';
        el.style.display = isHidden ? 'block' : 'none';
      }
    }

    async function executeApi(index, method, path) {
      const resultBox = document.getElementById('result-box-' + index);
      const statusEl = document.getElementById('result-status-' + index);
      const timeEl = document.getElementById('result-time-' + index);
      const jsonEl = document.getElementById('result-json-' + index);

      resultBox.style.display = 'block';
      statusEl.textContent = 'Mengirim request...';
      jsonEl.textContent = 'Waiting for response...';

      let resolvedPath = path;
      const paramInputs = document.querySelectorAll('[id^="param-' + index + '-"]');
      paramInputs.forEach(input => {
        const paramName = input.id.replace('param-' + index + '-', '');
        const val = input.value.trim() || '1';
        resolvedPath = resolvedPath.replace(':' + paramName, val);
      });

      let options = { method, headers: { 'Accept': 'application/json' } };
      const payloadEl = document.getElementById('payload-' + index);
      if (payloadEl && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        options.headers['Content-Type'] = 'application/json';
        options.body = payloadEl.value;
      }

      const startTime = performance.now();
      try {
        const res = await fetch(resolvedPath, options);
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json().catch(() => ({ message: 'Non-JSON response' }));

        statusEl.innerHTML = '<span style="color:' + (res.ok ? '#34d399' : '#f87171') + '; font-weight:700;">Status: ' + res.status + ' ' + res.statusText + '</span>';
        timeEl.textContent = 'Durasi: ' + duration + 'ms';
        jsonEl.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        statusEl.innerHTML = '<span style="color:#f87171; font-weight:700;">Error: Request Failed</span>';
        jsonEl.textContent = err.message;
      }
    }

    function copyCurl(index, method, path) {
      let resolvedPath = path;
      const paramInputs = document.querySelectorAll('[id^="param-' + index + '-"]');
      paramInputs.forEach(input => {
        const paramName = input.id.replace('param-' + index + '-', '');
        const val = input.value.trim() || '1';
        resolvedPath = resolvedPath.replace(':' + paramName, val);
      });

      const fullUrl = window.location.origin + resolvedPath;
      let curl = 'curl -X ' + method + ' "' + fullUrl + '"';
      const payloadEl = document.getElementById('payload-' + index);
      if (payloadEl && (method === 'POST' || method === 'PATCH')) {
        const payloadClean = payloadEl.value.replace(/\s+/g, ' ').replace(/'/g, "");
        curl += ' -H "Content-Type: application/json" -d \'' + payloadClean + '\'';
      }

      navigator.clipboard.writeText(curl);
      alert('Perintah cURL berhasil disalin ke clipboard!\n\n' + curl);
    }
  </script>
</body>
</html>`;
}


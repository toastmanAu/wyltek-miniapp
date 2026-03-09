/**
 * Research tab — list + inline detail panel
 */

const WORKER = 'https://wyltek-rpc.toastman-one.workers.dev'

export async function renderResearch(el, state) {
  el.innerHTML = `
    <div class="section-header">Research</div>
    <div class="search-bar">
      <input id="research-search" class="search-input" placeholder="🔍  Search findings…">
      <select id="research-filter" class="filter-dropdown">
        <option value="">All</option>
        <option value="DONE">✅ Done</option>
        <option value="IN_PROGRESS">🔄 Active</option>
        <option value="PENDING">⏳ Pending</option>
      </select>
    </div>
    <div id="research-list"><div class="spinner"></div></div>

    <!-- Detail panel (slides up over list) -->
    <div id="research-panel" class="research-panel hidden">
      <div class="research-panel-header">
        <button id="research-back" class="back-btn">&#8592; Back</button>
        <span id="research-panel-title" class="research-panel-title"></span>
      </div>
      <div id="research-panel-body" class="research-panel-body"><div class="spinner"></div></div>
    </div>
  `

  await loadResearch()

  let timer
  document.getElementById('research-search').addEventListener('input', e => {
    clearTimeout(timer)
    timer = setTimeout(() => loadResearch(
      e.target.value,
      document.getElementById('research-filter').value
    ), 280)
  })
  document.getElementById('research-filter').addEventListener('change', e => {
    loadResearch(document.getElementById('research-search').value, e.target.value)
  })

  document.getElementById('research-back').addEventListener('click', () => {
    closePanel()
  })
}

function closePanel() {
  const panel = document.getElementById('research-panel')
  panel?.classList.add('hidden')
  window.Telegram?.WebApp?.BackButton?.hide()
}

async function openFinding(id, title) {
  const panel = document.getElementById('research-panel')
  const body  = document.getElementById('research-panel-body')
  const titleEl = document.getElementById('research-panel-title')
  if (!panel || !body) return

  titleEl.textContent = title
  body.innerHTML = '<div class="spinner"></div>'
  panel.classList.remove('hidden')

  // Show TG back button if available
  const tgBack = window.Telegram?.WebApp?.BackButton
  if (tgBack) {
    tgBack.show()
    tgBack.onClick(() => closePanel())
  }

  try {
    const res = await fetch(`${WORKER}/research-finding?id=${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const md = await res.text()
    body.innerHTML = markdownToHtml(md)
  } catch (err) {
    body.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

/** Minimal markdown → HTML (headings, bold, italic, code, links, lists, hr) */
function markdownToHtml(md) {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // HR
    .replace(/^---+$/gm, '<hr>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Code blocks (fenced)
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Paragraphs (blank line separation)
    .replace(/\n\n+/g, '</p><p>')

  // Wrap list items
  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)

  return `<div class="md-body"><p>${html}</p></div>`
}

async function loadResearch(search = '', filter = '') {
  const listEl = document.getElementById('research-list')
  if (!listEl) return

  try {
    const res  = await fetch('https://wyltekindustries.com/js/research-tasks.js')
    const text = await res.text()

    let tasks = []
    const match = text.match(/const RESEARCH_TASKS\s*=\s*(\[[\s\S]*?\]);/)
    if (match) {
      try {
        const clean = match[1].replace(/,(\s*[}\]])/g, '$1')
        tasks = JSON.parse(clean)
      } catch (e) {
        console.warn('[Research] JSON parse failed:', e.message)
      }
    }

    let filtered = tasks
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.goal?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    }
    if (filter) filtered = filtered.filter(t => t.status === filter)

    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state"><div class="icon">🔬</div><p>No results found</p></div>`
      return
    }

    const statusDot = s => {
      if (s === 'DONE') return '<span class="status-dot done"></span>'
      if (s === 'IN_PROGRESS') return '<span class="status-dot progress"></span>'
      return '<span class="status-dot pending"></span>'
    }

    listEl.innerHTML = filtered.slice(0, 40).map(t => `
      <div class="research-item" data-id="${t.id}" data-title="${(t.goal && t.goal !== '|' ? t.goal : t.id.replace(/-/g,' ')).replace(/"/g,'&quot;')}">
        <div class="research-item-title">${t.goal && t.goal !== '|' ? t.goal : t.id.replace(/-/g,' ')}</div>
        <div class="research-item-meta">
          <span>${statusDot(t.status)}${t.status || ''}</span>
          ${t.priority ? `<span>${t.priority}</span>` : ''}
          ${t.date ? `<span>${t.date}</span>` : ''}
        </div>
        ${t.tags?.length ? `<div class="research-item-tags">
          ${t.tags.slice(0,4).map(tag => `<span class="pill">${tag}</span>`).join('')}
        </div>` : ''}
        ${t.status === 'DONE' ? '<div class="research-item-hint">Tap to read finding ›</div>' : ''}
      </div>
    `).join('')

    listEl.querySelectorAll('.research-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id
        const title = item.dataset.title
        if (item.querySelector('.research-item-hint')) {
          // Has a finding — open inline
          openFinding(id, title)
        }
        // PENDING/IN_PROGRESS items — nothing to show yet
      })
    })

  } catch (err) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

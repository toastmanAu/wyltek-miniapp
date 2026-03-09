/**
 * Research tab (v2)
 */
import { sb } from '../supabase.js'

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
        // Strip trailing commas before ] or } (JS allows, JSON doesn't)
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
      <div class="research-item" data-id="${t.id}">
        <div class="research-item-title">${t.goal && t.goal !== '|' ? t.goal : t.id.replace(/-/g,' ')}</div>
        <div class="research-item-meta">
          <span>${statusDot(t.status)}${t.status || ''}</span>
          ${t.priority ? `<span>${t.priority}</span>` : ''}
          ${t.date ? `<span>${t.date}</span>` : ''}
        </div>
        ${t.tags?.length ? `<div class="research-item-tags">
          ${t.tags.slice(0,4).map(tag => `<span class="pill">${tag}</span>`).join('')}
        </div>` : ''}
      </div>
    `).join('')

    listEl.querySelectorAll('.research-item').forEach(item => {
      item.addEventListener('click', () => {
        window.Telegram?.WebApp?.openLink(`https://wyltekindustries.com/research.html#${item.dataset.id}`)
      })
    })

  } catch (err) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

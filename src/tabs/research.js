/**
 * Research tab — browse findings, like, comment
 */
import { sb } from '../supabase.js'

export async function renderResearch(el, state) {
  el.innerHTML = `
    <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">
      <input id="research-search" placeholder="Search findings…" style="
        flex:1;background:var(--surface);border:1px solid var(--border);
        border-radius:8px;color:var(--text);padding:0.5rem 0.75rem;
        font-size:0.875rem;outline:none;">
      <select id="research-filter" style="
        background:var(--surface);border:1px solid var(--border);
        border-radius:8px;color:var(--muted);padding:0.5rem;font-size:0.8rem;outline:none;">
        <option value="">All</option>
        <option value="DONE">Done</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="PENDING">Pending</option>
      </select>
    </div>
    <div id="research-list"><div class="spinner"></div></div>
  `

  await loadResearch(el, state)

  let searchTimer
  document.getElementById('research-search').addEventListener('input', (e) => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => loadResearch(el, state, e.target.value, document.getElementById('research-filter').value), 300)
  })

  document.getElementById('research-filter').addEventListener('change', (e) => {
    loadResearch(el, state, document.getElementById('research-search').value, e.target.value)
  })
}

async function loadResearch(el, state, search = '', filter = '') {
  const listEl = document.getElementById('research-list')
  if (!listEl) return

  try {
    // Load from research-tasks.js data (same source as website)
    const res = await fetch('https://wyltekindustries.com/js/research-tasks.js')
    const text = await res.text()

    // Parse the RESEARCH_TASKS array from the JS file
    let tasks = []
    try {
      const match = text.match(/const RESEARCH_TASKS\s*=\s*(\[[\s\S]*?\]);/)
      if (match) tasks = JSON.parse(match[1])
    } catch {
      // Fallback: fetch from Supabase if available
    }

    // Apply filters
    let filtered = tasks
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      )
    }
    if (filter) filtered = filtered.filter(t => t.status === filter)

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="empty-state"><div class="icon">🔬</div><p>No results</p></div>`
      return
    }

    listEl.innerHTML = filtered.slice(0, 30).map(task => `
      <div class="research-item" data-id="${task.id}">
        <div class="research-item-title">${task.title || task.id}</div>
        <div class="research-item-meta">
          <span>${task.status || ''}</span>
          <span>${task.priority || ''}</span>
          <span>${task.date || ''}</span>
        </div>
        ${task.tags ? `<div class="research-item-tags">
          ${task.tags.map(t => `<span class="pill">${t}</span>`).join('')}
        </div>` : ''}
      </div>
    `).join('')

    // Click → open on website
    listEl.querySelectorAll('.research-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id
        window.Telegram?.WebApp?.openLink(`https://wyltekindustries.com/research.html#${id}`)
      })
    })

  } catch (err) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

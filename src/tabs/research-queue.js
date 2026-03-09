/**
 * research-queue.js — shows the research task queue (from GitHub)
 */
export async function renderQueue(el, state) {
  el.innerHTML = `<div class="spinner"></div>`

  let tasks = []
  try {
    const r = await fetch('https://raw.githubusercontent.com/toastmanAu/wyltek-industries/master/js/research-tasks.js')
    const txt = await r.text()
    // Parse: const TASKS = [...] embedded JS
    const match = txt.match(/const\s+TASKS\s*=\s*(\[[\s\S]*?\]);/)
    if (match) tasks = JSON.parse(match[1])
  } catch (e) {
    el.innerHTML = `<div class="empty-state"><span class="icon">⚠️</span><p>Could not load queue: ${e.message}</p></div>`
    return
  }

  const pending  = tasks.filter(t => t.status === 'PENDING')
  const inprog   = tasks.filter(t => t.status === 'IN_PROGRESS')
  const done     = tasks.filter(t => t.status === 'DONE')

  el.innerHTML = `
    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--orange)">${pending.length}</div>
        <div class="stat-chip-label">Pending</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--accent)">${inprog.length}</div>
        <div class="stat-chip-label">Active</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--green)">${done.length}</div>
        <div class="stat-chip-label">Done</div>
      </div>
    </div>

    ${inprog.length > 0 ? `
    <div class="section-header">In Progress</div>
    ${inprog.map(t => taskCard(t)).join('')}
    ` : ''}

    <div class="section-header">Pending (${pending.length})</div>
    ${pending.slice(0, 12).map(t => taskCard(t)).join('')}
    ${pending.length > 12 ? `<div style="text-align:center;color:var(--text3);font-size:0.75rem;padding:0.5rem">+${pending.length-12} more</div>` : ''}
  `
}

function taskCard(t) {
  const priority = { HIGH: '🔴', MEDIUM: '🟡', LOW: '🟢', SYNTHESIS: '🔵' }
  const statusColor = { PENDING: 'var(--text3)', IN_PROGRESS: 'var(--accent)', DONE: 'var(--green)' }
  return `
    <div class="research-item">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
        <span>${priority[t.priority] || '⚪'}</span>
        <div class="research-item-title" style="margin:0">${t.title || t.id}</div>
      </div>
      <div class="research-item-meta">
        <span style="color:${statusColor[t.status]}">${t.status}</span>
        ${t.tags ? t.tags.slice(0,3).map(tag => `<span class="pill blue">${tag}</span>`).join('') : ''}
      </div>
    </div>
  `
}

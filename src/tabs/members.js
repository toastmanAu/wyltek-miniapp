/**
 * Members tab — founding member DOB NFTs
 */
import { sb } from '../supabase.js'

export async function renderMembers(el, state) {
  el.innerHTML = `
    <div class="card" style="margin-bottom:1rem">
      <div class="card-title">Founding Members</div>
      <div class="stat-row">
        <span class="stat-label">DOB NFTs minted</span>
        <span class="stat-value accent" id="member-count">…</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total supply</span>
        <span class="stat-value">50</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Chain</span>
        <span class="stat-value">CKB Mainnet</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Protocol</span>
        <span class="stat-value">Spore DOB</span>
      </div>
    </div>

    ${state.address ? '' : `
    <div class="card" style="text-align:center;padding:1.5rem">
      <div style="font-size:2rem;margin-bottom:0.5rem">👾</div>
      <p style="color:var(--muted);font-size:0.85rem;margin:0 0 1rem">
        Connect your wallet to check your member status
      </p>
    </div>`}

    <div id="members-grid"><div class="spinner"></div></div>
  `

  await loadMembers(state)
}

async function loadMembers(state) {
  const gridEl = document.getElementById('members-grid')
  if (!gridEl) return

  try {
    const { data, error } = await sb
      .from('mint_queue')
      .select('member_number, ckb_address, spore_id, minted_at')
      .not('spore_id', 'is', null)
      .order('member_number', { ascending: true })

    const minted = data || []

    document.getElementById('member-count').textContent = minted.length

    // Highlight current user's card
    gridEl.innerHTML = minted.map(m => {
      const isYou = state.address && m.ckb_address === state.address
      const short = m.ckb_address
        ? m.ckb_address.slice(0, 12) + '…' + m.ckb_address.slice(-8)
        : '—'
      const sporeShort = m.spore_id
        ? m.spore_id.slice(0, 10) + '…'
        : '—'

      return `
        <div class="member-card ${isYou ? 'you' : ''}" style="${isYou ? 'border-color:var(--accent);' : ''}">
          <div class="member-num">#${m.member_number}</div>
          <div style="flex:1;min-width:0">
            <div class="member-addr">${short} ${isYou ? '← you' : ''}</div>
            <div style="font-size:0.68rem;color:var(--muted);margin-top:2px">
              Spore: ${sporeShort}
            </div>
          </div>
          ${m.spore_id ? `
          <a href="https://explorer.nervos.org/transaction/${m.spore_id}" 
             target="_blank"
             style="color:var(--accent);font-size:0.75rem;text-decoration:none;flex-shrink:0">
            View ↗
          </a>` : ''}
        </div>
      `
    }).join('')

    if (minted.length === 0) {
      gridEl.innerHTML = `<div class="empty-state"><div class="icon">👾</div><p>No members minted yet</p></div>`
    }

  } catch (err) {
    gridEl.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

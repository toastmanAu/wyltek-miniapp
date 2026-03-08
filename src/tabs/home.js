/**
 * Home tab — portfolio overview (v2)
 */
import { sb } from '../supabase.js'

export async function renderHome(el, state) {
  if (!state.address) {
    el.innerHTML = `
      <div class="welcome-wrap">
        <img src="/wyltek-mark.png" class="welcome-logo" alt="Wyltek">
        <h1 class="welcome-title">Wyltek Industries</h1>
        <p class="welcome-sub">CKB tools, live node data, research and community — powered by real nodes.</p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon fi-ckb">⚡</div>
            <div class="feature-text">
              <strong>CKB Light Client</strong>
              <span>Real balance + tx history via your own node</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-btc">₿</div>
            <div class="feature-text">
              <strong>Bitcoin Node Stats</strong>
              <span>Live data from Wyltek's Bitcoin node</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-res">🔬</div>
            <div class="feature-text">
              <strong>CKB Research</strong>
              <span>Ecosystem findings, searchable and tagged</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-chat">🛋️</div>
            <div class="feature-text">
              <strong>Community Lounge</strong>
              <span>Real-time chat, same backend as the website</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-nft">👾</div>
            <div class="feature-text">
              <strong>Founding Member DOBs</strong>
              <span>50 Spore NFTs on CKB mainnet</span>
            </div>
          </div>
        </div>

        <button class="btn btn-accent btn-full" id="connect-btn" style="font-size:1rem;padding:0.875rem">
          Connect with JoyID
        </button>
        <p style="color:var(--text3);font-size:0.75rem;margin-top:0.875rem">
          Passkey wallet — no seed phrase, no password
        </p>
      </div>
    `
    document.getElementById('connect-btn').addEventListener('click', () => {
      document.getElementById('auth-badge').click()
    })
    return
  }

  const shortAddr = state.address.slice(0, 14) + '…' + state.address.slice(-8)

  el.innerHTML = `
    <div class="hero-card">
      <div class="balance-label">CKB Balance</div>
      <div style="display:flex;align-items:baseline;gap:0.3rem">
        <span class="balance-big" id="ckb-balance">—</span>
        <span class="balance-unit">CKB</span>
      </div>
      <div class="hero-address" id="ckb-addr" title="${state.address}">${shortAddr}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.75rem">
      <div class="card" style="margin:0;text-align:center;padding:0.875rem">
        <div class="card-title" style="margin-bottom:0.4rem">Member</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--accent)" id="member-num">—</div>
      </div>
      <div class="card" style="margin:0;text-align:center;padding:0.875rem">
        <div class="card-title" style="margin-bottom:0.4rem">DOBs</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--purple)" id="dob-count">—</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Recent Transactions</div>
      <div id="tx-list"><div class="spinner" style="margin:1rem auto"></div></div>
    </div>

    <div class="card">
      <div class="card-title">Quick Links</div>
      <div class="stat-row">
        <span class="stat-label">🌐 Website</span>
        <a href="https://wyltekindustries.com" target="_blank" style="color:var(--accent);font-size:0.82rem;font-weight:500">Open ↗</a>
      </div>
      <div class="stat-row">
        <span class="stat-label">💻 GitHub</span>
        <a href="https://github.com/toastmanAu" target="_blank" style="color:var(--accent);font-size:0.82rem;font-weight:500">toastmanAu ↗</a>
      </div>
      <div class="stat-row">
        <span class="stat-label">🔍 Explorer</span>
        <a href="https://explorer.nervos.org/address/${state.address}" target="_blank" style="color:var(--accent);font-size:0.82rem;font-weight:500">View ↗</a>
      </div>
    </div>
  `

  // Load data in parallel
  await Promise.allSettled([loadBalance(state), loadMemberStatus(state), loadTxHistory(state)])
}

async function loadBalance(state) {
  // Placeholder — wire to light client once Worker is deployed
  try {
    const res = await fetch('https://mainnet.ckbapp.dev/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'get_tip_block_number', params: [] }),
    })
    // Balance display placeholder
    document.getElementById('ckb-balance').textContent = '—'
  } catch {}
}

async function loadMemberStatus(state) {
  try {
    const { data } = await sb.from('mint_queue')
      .select('member_number, spore_id')
      .eq('ckb_address', state.address)
      .single()
    const el = document.getElementById('member-num')
    const dobEl = document.getElementById('dob-count')
    if (el) el.textContent = data?.member_number ? `#${data.member_number}` : '—'
    if (dobEl) dobEl.textContent = data?.spore_id ? '1' : '0'
  } catch {
    const el = document.getElementById('member-num')
    if (el) el.textContent = '—'
  }
}

async function loadTxHistory(state) {
  const el = document.getElementById('tx-list')
  if (!el) return
  // Placeholder until light client Worker is live
  el.innerHTML = `
    <div style="text-align:center;padding:1rem;color:var(--text3);font-size:0.82rem">
      Connect to a light client node in Settings to see transaction history
    </div>
  `
}

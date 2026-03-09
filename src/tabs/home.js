/**
 * Home tab (v3) — tool launcher + wallet overview
 */
import { sb } from '../supabase.js'
import { navigate } from '../main.js'

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
    <!-- Wallet hero -->
    <div class="hero-card">
      <div class="balance-label">CKB Balance</div>
      <div style="display:flex;align-items:baseline;gap:0.3rem">
        <span class="balance-big" id="ckb-balance">—</span>
        <span class="balance-unit">CKB</span>
      </div>
      <div class="hero-address" title="${state.address}">${shortAddr}</div>
    </div>

    <!-- Stats row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:1rem">
      <div class="card" style="margin:0;text-align:center;padding:0.875rem">
        <div class="card-title" style="margin-bottom:0.4rem">Member</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--accent)" id="member-num">—</div>
      </div>
      <div class="card" style="margin:0;text-align:center;padding:0.875rem">
        <div class="card-title" style="margin-bottom:0.4rem">DOBs</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--purple)" id="dob-count">—</div>
      </div>
    </div>

    <!-- Tool grid -->
    <div class="section-header">Tools</div>
    <div class="tool-grid">
      <button class="tool-btn" data-tab="chain">
        <div class="tool-icon">⛓️</div>
        <div class="tool-label">Chain</div>
        <div class="tool-sub">CKB · BTC</div>
      </button>
      <button class="tool-btn" data-tab="research">
        <div class="tool-icon">🔬</div>
        <div class="tool-label">Research</div>
        <div class="tool-sub">Findings</div>
      </button>
      <button class="tool-btn" data-tab="lounge">
        <div class="tool-icon">💬</div>
        <div class="tool-label">Lounge</div>
        <div class="tool-sub">Chat</div>
      </button>
      <button class="tool-btn" data-tab="fiber">
        <div class="tool-icon">⚡</div>
        <div class="tool-label">Fiber</div>
        <div class="tool-sub">Channels</div>
      </button>
      <button class="tool-btn" data-tab="members">
        <div class="tool-icon">👾</div>
        <div class="tool-label">Members</div>
        <div class="tool-sub">DOBs</div>
      </button>
      <button class="tool-btn" data-href="https://explorer.nervos.org/address/${state.address}">
        <div class="tool-icon">🔍</div>
        <div class="tool-label">Explorer</div>
        <div class="tool-sub">On-chain</div>
      </button>
    </div>

    <!-- Recent txs -->
    <div class="section-header" style="margin-top:0.25rem">Recent Activity</div>
    <div class="card">
      <div id="tx-list">
        <div style="text-align:center;padding:1rem;color:var(--text3);font-size:0.82rem">
          Connect to Wyltek Light Client in Settings to see transaction history
        </div>
      </div>
    </div>
  `

  // Tool button handlers
  el.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab) {
        navigate(btn.dataset.tab)
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
      } else if (btn.dataset.href) {
        window.Telegram?.WebApp?.openLink(btn.dataset.href)
      }
    })
  })

  await Promise.allSettled([loadMemberStatus(state)])
}

async function loadMemberStatus(state) {
  try {
    const { data } = await sb.from('mint_queue')
      .select('member_number, spore_id')
      .eq('ckb_address', state.address)
      .single()
    const numEl = document.getElementById('member-num')
    const dobEl = document.getElementById('dob-count')
    if (numEl) numEl.textContent = data?.member_number ? `#${data.member_number}` : '—'
    if (dobEl) dobEl.textContent = data?.spore_id ? '1' : '0'
  } catch {}
}

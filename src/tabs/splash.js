/**
 * splash.js — Home tab: live ticker cards + quick navigation
 */
import { navigate } from '../main.js'

export async function renderSplash(el, state) {
  el.innerHTML = `
    <div class="splash-wrap">

      <!-- Hero -->
      <div class="splash-hero">
        <img src="/wyltek-mark.png" class="splash-logo" alt="Wyltek">
        <div class="splash-title">Wyltek Industries</div>
        <div class="splash-sub">CKB blockchain tools · live nodes · community</div>
      </div>

      <!-- Live ticker cards -->
      <div class="ticker-row" id="ticker-row">
        <div class="ticker-card ckb-card" id="ticker-ckb">
          <div class="ticker-label"><span class="live-dot"></span>CKB</div>
          <div class="ticker-value" id="ckb-tip">…</div>
          <div class="ticker-meta" id="ckb-peers">— peers</div>
        </div>
        <div class="ticker-card btc-card" id="ticker-btc">
          <div class="ticker-label" style="color:#f7931a"><span class="live-dot" style="background:#f7931a"></span>BTC</div>
          <div class="ticker-value" id="btc-tip">…</div>
          <div class="ticker-meta" id="btc-fees">— sat/vB</div>
        </div>
      </div>

      <!-- Section tiles -->
      <div class="splash-grid">
        <div class="splash-tile" data-nav="chain.ckb" style="--tile-color:var(--accent)">
          <div class="splash-tile-icon">⛓️</div>
          <div class="splash-tile-label">Chain</div>
          <div class="splash-tile-sub">CKB · BTC · Fiber · RPC</div>
        </div>
        <div class="splash-tile" data-nav="tools.home" style="--tile-color:var(--green)">
          <div class="splash-tile-icon">🔧</div>
          <div class="splash-tile-label">Tools</div>
          <div class="splash-tile-sub">Wallet · Mint DOB</div>
        </div>
        <div class="splash-tile" data-nav="social.lounge" style="--tile-color:#3b82f6">
          <div class="splash-tile-icon">💬</div>
          <div class="splash-tile-label">Social</div>
          <div class="splash-tile-sub">Lounge · Members</div>
        </div>
        <div class="splash-tile" data-nav="research.browse" style="--tile-color:var(--purple)">
          <div class="splash-tile-icon">🔬</div>
          <div class="splash-tile-label">Research</div>
          <div class="splash-tile-sub">Findings · Queue</div>
        </div>
      </div>

      ${state.address ? `
      <!-- Connected wallet strip -->
      <div class="splash-wallet" id="splash-wallet">
        <div style="font-size:0.68rem;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:0.25rem">Connected</div>
        <div style="font-family:monospace;font-size:0.75rem;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${state.address}
        </div>
      </div>
      ` : `
      <button class="btn btn-accent btn-full" id="splash-connect" style="margin-top:0.5rem">
        Connect JoyID Wallet
      </button>
      `}

    </div>
  `

  // Tile navigation with expand transition
  el.querySelectorAll('.splash-tile[data-nav]').forEach(tile => {
    tile.addEventListener('click', () => {
      navigate(tile.dataset.nav)
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')
    })
  })

  document.getElementById('splash-connect')?.addEventListener('click', () => {
    document.getElementById('auth-badge')?.click()
  })

  // Load live data async
  loadTickers()
}

async function loadTickers() {
  // CKB
  try {
    const r = await fetch('https://mainnet.ckbapp.dev/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'get_tip_header', params: [] }),
    })
    const j = await r.json()
    const block = parseInt(j.result?.number, 16)
    const el = document.getElementById('ckb-tip')
    if (el) el.textContent = block.toLocaleString()

    const r2 = await fetch('https://mainnet.ckbapp.dev/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'get_peers', params: [] }),
    })
    const j2 = await r2.json()
    const peers = document.getElementById('ckb-peers')
    if (peers) peers.textContent = `${j2.result?.length ?? '—'} peers`
  } catch {}

  // BTC
  try {
    const [h, f] = await Promise.all([
      fetch('https://mempool.space/api/blocks/tip/height').then(r => r.text()),
      fetch('https://mempool.space/api/v1/fees/recommended').then(r => r.json()),
    ])
    const tipEl  = document.getElementById('btc-tip')
    const feeEl  = document.getElementById('btc-fees')
    if (tipEl)  tipEl.textContent  = parseInt(h).toLocaleString()
    if (feeEl)  feeEl.textContent  = `${f.fastestFee} sat/vB fast`
  } catch {}
}

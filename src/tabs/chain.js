/**
 * Chain tab (v3) — sub-menu: CKB mainnet/testnet/light/indexer, BTC mainnet/testnet, Fiber
 */
import { ckbRpc, btcRpc } from '../rpc.js'

const SECTIONS = [
  { id: 'ckb-main',    label: 'CKB Mainnet',     icon: '⚡', color: 'ckb',    group: 'CKB' },
  { id: 'ckb-test',    label: 'CKB Testnet',      icon: '🧪', color: 'purple', group: 'CKB' },
  { id: 'ckb-light',   label: 'CKB Light Client', icon: '💡', color: 'ckb',    group: 'CKB' },
  { id: 'ckb-index',   label: 'CKB Indexer',      icon: '📇', color: 'blue',   group: 'CKB' },
  { id: 'btc-main',    label: 'BTC Mainnet',      icon: '₿',  color: 'btc',    group: 'Bitcoin' },
  { id: 'btc-test',    label: 'BTC Testnet',       icon: '🧪', color: 'orange', group: 'Bitcoin' },
  { id: 'fiber',       label: 'Fiber Network',    icon: '🌐', color: 'purple', group: 'Fiber' },
]

let activeSection = 'ckb-main'

export async function renderChain(el, state) {
  el.innerHTML = `
    <div class="section-header">Chain</div>

    <!-- Horizontal scroll sub-menu -->
    <div class="chain-submenu-wrap">
      <div class="chain-submenu" id="chain-submenu">
        ${renderGroupedMenu()}
      </div>
    </div>

    <!-- Content area -->
    <div id="chain-panel" style="margin-top:0.875rem">
      <div class="spinner"></div>
    </div>
  `

  // Sub-menu click
  el.querySelectorAll('.chain-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSection = btn.dataset.section
      el.querySelectorAll('.chain-tab').forEach(b => b.classList.toggle('active', b.dataset.section === activeSection))
      loadSection(activeSection)
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })

  loadSection(activeSection)
}

function renderGroupedMenu() {
  const groups = {}
  SECTIONS.forEach(s => {
    if (!groups[s.group]) groups[s.group] = []
    groups[s.group].push(s)
  })

  return Object.entries(groups).map(([group, items]) => `
    <div class="chain-group">
      <div class="chain-group-label">${group}</div>
      <div class="chain-group-items">
        ${items.map(s => `
          <button class="chain-tab ${s.id === activeSection ? 'active' : ''} color-${s.color}"
            data-section="${s.id}">
            <span class="chain-tab-icon">${s.icon}</span>
            <span class="chain-tab-label">${s.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('')
}

async function loadSection(id) {
  const panel = document.getElementById('chain-panel')
  if (!panel) return
  panel.innerHTML = '<div class="spinner"></div>'

  try {
    switch (id) {
      case 'ckb-main':   await showCKB(panel, 'mainnet',  'https://mainnet.ckbapp.dev/rpc'); break
      case 'ckb-test':   await showCKB(panel, 'testnet',  'https://testnet.ckbapp.dev/rpc'); break
      case 'ckb-light':  await showCKBLight(panel); break
      case 'ckb-index':  await showIndexer(panel); break
      case 'btc-main':   await showBTC(panel, 'mainnet'); break
      case 'btc-test':   panel.innerHTML = comingSoon('BTC Testnet', 'Bitcoin testnet node not yet configured'); break
      case 'fiber':      await showFiber(panel); break
    }
  } catch (err) {
    panel.innerHTML = errCard(err.message)
  }
}

async function showCKB(panel, net, url) {
  const [tip, pool, peers] = await Promise.all([
    jsonRpc(url, 'get_tip_header', []),
    jsonRpc(url, 'tx_pool_info', []),
    jsonRpc(url, 'get_peers', []),
  ])

  const block = parseInt(tip?.number, 16).toLocaleString()
  const pending = parseInt(pool?.pending_size ?? pool?.pending ?? 0)
  const peerCount = peers?.length ?? 0

  panel.innerHTML = `
    ${statusCard('CKB ' + net.charAt(0).toUpperCase() + net.slice(1), '⚡', 'ok', 'Live')}
    <div class="card">
      <div class="stat-row"><span class="stat-label">Block Height</span><span class="stat-value accent">${block}</span></div>
      <div class="stat-row"><span class="stat-label">Mempool</span><span class="stat-value">${pending.toLocaleString()} txs</span></div>
      <div class="stat-row"><span class="stat-label">Peers</span><span class="stat-value ${peerCount > 5 ? 'green' : 'orange'}">${peerCount}</span></div>
      <div class="stat-row"><span class="stat-label">Endpoint</span><span class="stat-value" style="font-size:0.7rem">${url.replace('https://','')}</span></div>
    </div>
  `
}

async function showCKBLight(panel) {
  // Proxy via Wyltek worker → Pi light client (port 9001)
  const LIGHT_URL = 'https://wyltek-rpc.toastmanau.workers.dev/ckb-light'
  try {
    const [tip, scripts] = await Promise.all([
      jsonRpc(LIGHT_URL, 'get_tip_header', []),
      jsonRpc(LIGHT_URL, 'get_scripts', []),
    ])
    const block = parseInt(tip?.number, 16).toLocaleString()
    const watching = Array.isArray(scripts) ? scripts.length : 0

    panel.innerHTML = `
      ${statusCard('CKB Light Client', '💡', 'ok', 'Live')}
      <div class="card">
        <div class="stat-row"><span class="stat-label">Chain Tip</span><span class="stat-value accent">${block}</span></div>
        <div class="stat-row"><span class="stat-label">Scripts Watching</span><span class="stat-value">${watching}</span></div>
        <div class="stat-row"><span class="stat-label">Node</span><span class="stat-value" style="font-size:0.78rem">Wyltek Pi5 · port 9001</span></div>
        <div class="stat-row"><span class="stat-label">Proxy</span><span class="stat-value" style="font-size:0.78rem">Cloudflare Worker</span></div>
      </div>
      <div class="card">
        <div class="card-title">Why Light Client?</div>
        <div style="font-size:0.82rem;color:var(--text2);line-height:1.6">
          Verified block headers · Full tx history · No separate indexer needed · Send transactions
        </div>
      </div>
    `
  } catch (err) {
    panel.innerHTML = `
      ${statusCard('CKB Light Client', '💡', 'err', 'Offline')}
      <div class="card">
        <div style="color:var(--text2);font-size:0.82rem">Worker not yet deployed. Deploy <code>workers/rpc-proxy.js</code> to Cloudflare.</div>
      </div>
    `
  }
}

async function showIndexer(panel) {
  // CKB Indexer / Mercury endpoint
  const INDEXER_URL = 'https://mainnet.ckbapp.dev/indexer'
  try {
    const tip = await jsonRpc(INDEXER_URL, 'get_indexer_tip', [])
    const block = parseInt(tip?.block_number, 16).toLocaleString()

    panel.innerHTML = `
      ${statusCard('CKB Indexer', '📇', 'ok', 'Live')}
      <div class="card">
        <div class="stat-row"><span class="stat-label">Indexed Block</span><span class="stat-value accent">${block}</span></div>
        <div class="stat-row"><span class="stat-label">Type</span><span class="stat-value">CKB Indexer v2</span></div>
        <div class="stat-row"><span class="stat-label">Endpoint</span><span class="stat-value" style="font-size:0.72rem">mainnet.ckbapp.dev/indexer</span></div>
      </div>
      <div class="card">
        <div class="card-title">Rich Indexer</div>
        <div style="font-size:0.82rem;color:var(--text2)">Full UTXO indexing, address history, cell queries. Separate from the light client.</div>
      </div>
    `
  } catch (err) {
    panel.innerHTML = errCard('Indexer: ' + err.message)
  }
}

async function showBTC(panel, net) {
  try {
    const [info, netInfo] = await Promise.all([
      btcRpc('getblockchaininfo', []),
      btcRpc('getnetworkinfo', []),
    ])
    const height   = (info?.blocks || 0).toLocaleString()
    const ibd      = info?.initialblockdownload
    const progress = ((info?.verificationprogress || 0) * 100).toFixed(2)
    const peers    = netInfo?.connections ?? 0

    panel.innerHTML = `
      ${statusCard('Bitcoin Mainnet', '₿', ibd ? 'sync' : 'ok', ibd ? `IBD ${progress}%` : 'Synced')}
      <div class="card">
        <div class="stat-row"><span class="stat-label">Block Height</span><span class="stat-value accent">${height}</span></div>
        <div class="stat-row"><span class="stat-label">Sync</span><span class="stat-value ${ibd ? 'orange' : 'green'}">${ibd ? progress + '%' : 'Complete ✓'}</span></div>
        ${ibd ? `<div class="sync-bar-wrap"><div class="sync-bar" style="width:${progress}%"></div></div>` : ''}
        <div class="stat-row"><span class="stat-label">Peers</span><span class="stat-value ${peers > 5 ? 'green' : 'orange'}">${peers}</span></div>
        <div class="stat-row"><span class="stat-label">Chain</span><span class="stat-value">${info?.chain ?? '—'}</span></div>
        <div class="stat-row"><span class="stat-label">Node</span><span class="stat-value" style="font-size:0.78rem">Wyltek OPi3B</span></div>
      </div>
    `
  } catch (err) {
    panel.innerHTML = errCard('BTC: ' + err.message)
  }
}

async function showFiber(panel) {
  // Fiber RPC via SSH tunnel (future: proxy via Worker)
  panel.innerHTML = `
    ${statusCard('Fiber Network', '🌐', 'sync', 'Coming Soon')}
    <div class="card">
      <div class="card-title">What's coming</div>
      <div style="font-size:0.82rem;color:var(--text2);line-height:1.7">
        • Channel list + balances<br>
        • Open / close channels<br>
        • Send payments via Fiber<br>
        • Counterparty peer info<br>
        • Node: Wyltek ckbnode + N100
      </div>
    </div>
    <div class="card">
      <div class="stat-row"><span class="stat-label">ckbnode Fiber</span><span class="stat-value green">Running ✓</span></div>
      <div class="stat-row"><span class="stat-label">N100 Fiber</span><span class="stat-value orange">Needs funding</span></div>
      <div class="stat-row"><span class="stat-label">RPC proxy</span><span class="stat-value" style="color:var(--text3)">Not yet deployed</span></div>
    </div>
  `
}

// ── Helpers ────────────────────────────────────────────────────────
async function jsonRpc(url, method, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error))
  return json.result
}

function statusCard(title, icon, state, label) {
  return `
    <div class="card-glow" style="margin-bottom:0.75rem;display:flex;align-items:center;gap:0.75rem;padding:0.875rem 1rem">
      <div style="font-size:1.5rem">${icon}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:0.95rem">${title}</div>
      </div>
      <div class="chain-status ${state}">${label}</div>
    </div>
  `
}

function errCard(msg) {
  return `<div class="card"><div class="empty-state" style="padding:1.5rem"><div class="icon">⚠️</div><p>${msg}</p></div></div>`
}

function comingSoon(title, desc) {
  return `
    ${statusCard(title, '🧪', 'sync', 'Coming Soon')}
    <div class="card"><div style="font-size:0.82rem;color:var(--text2)">${desc}</div></div>
  `
}

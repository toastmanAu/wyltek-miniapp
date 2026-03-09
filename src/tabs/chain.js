/**
 * Chain tab — CKB / BTC / Fiber via segmented control
 */

const CKB_RPC  = 'https://mainnet.ckbapp.dev/rpc'
const BTC_INFO = 'https://mempool.space/api'   // public mempool API as fallback

async function ckbRpc(method, params = []) {
  const r = await fetch(CKB_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const j = await r.json()
  if (j.error) throw new Error(j.error.message)
  return j.result
}

let activeChain = 'ckb'

export async function renderChain(el, state) {
  el.innerHTML = `
    <!-- Segmented control -->
    <div class="chain-seg">
      <button class="chain-seg-btn ckb active" data-chain="ckb">⚡ CKB</button>
      <button class="chain-seg-btn btc"        data-chain="btc">₿ Bitcoin</button>
      <button class="chain-seg-btn fiber"      data-chain="fiber">🌐 Fiber</button>
    </div>
    <div id="chain-panel"><div class="spinner"></div></div>
  `

  el.querySelectorAll('.chain-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.chain-seg-btn').forEach(b => b.classList.toggle('active', b === btn))
      activeChain = btn.dataset.chain
      loadChainPanel(activeChain, state)
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })

  await loadChainPanel(activeChain, state)
}

async function loadChainPanel(chain, state) {
  const panel = document.getElementById('chain-panel')
  if (!panel) return
  panel.innerHTML = '<div class="spinner"></div>'

  try {
    if (chain === 'ckb')   await renderCKB(panel, state)
    if (chain === 'btc')   await renderBTC(panel)
    if (chain === 'fiber') await renderFiberSummary(panel)
  } catch (err) {
    panel.innerHTML = `<div class="empty-state"><span class="icon">⚠️</span><p>${err.message}</p></div>`
  }
}

// ── CKB ───────────────────────────────────────────────────────────
async function renderCKB(panel, state) {
  const [header, peers, pool] = await Promise.all([
    ckbRpc('get_tip_header'),
    ckbRpc('get_peers'),
    ckbRpc('tx_pool_info'),
  ])

  const blockNum   = parseInt(header.number, 16).toLocaleString()
  const epoch      = header.epoch
  const peerCount  = peers.length
  const pending    = parseInt(pool.pending, 16)
  const proposed   = parseInt(pool.proposed, 16)

  // Parse epoch for display
  let epochStr = '—'
  try {
    const e = parseInt(epoch, 16)
    const epNum   = e & 0xFFFFFF
    const epIndex = (e >> 24) & 0xFFFF
    const epLen   = (e >> 40) & 0xFFFF
    epochStr = `${epNum} [${epIndex}/${epLen}]`
  } catch {}

  panel.innerHTML = `
    <!-- Live block card -->
    <div class="card-glow" style="padding:1.1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem">
        <div style="display:flex;align-items:center;gap:0.6rem">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem">⚡</div>
          <div>
            <div style="font-weight:800;font-size:0.95rem">CKB Mainnet</div>
            <div style="font-size:0.72rem;color:var(--text2)">Nervos Network</div>
          </div>
        </div>
        <div class="chain-status ok">● Live</div>
      </div>

      <div style="font-size:0.65rem;font-weight:800;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:0.3rem">Block Height</div>
      <div style="font-size:2.2rem;font-weight:800;color:var(--accent);letter-spacing:-0.04em;line-height:1">${blockNum}</div>
    </div>

    <!-- Stats grid -->
    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val">${peerCount}</div>
        <div class="stat-chip-label">Peers</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${pending.toLocaleString()}</div>
        <div class="stat-chip-label">Pending TX</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${proposed.toLocaleString()}</div>
        <div class="stat-chip-label">Proposed</div>
      </div>
    </div>

    <!-- Epoch -->
    <div class="card">
      <div class="card-title">Epoch</div>
      <div class="stat-row"><span class="stat-label">Current Epoch</span><span class="stat-value accent">${epochStr}</span></div>
      <div class="stat-row"><span class="stat-label">Block Hash</span><span class="stat-value" style="font-size:0.65rem">${header.hash?.slice(0,18)}…</span></div>
      <div class="stat-row"><span class="stat-label">Min Fee Rate</span><span class="stat-value">${parseInt(pool.min_fee_rate,16)} shannons/KB</span></div>
    </div>

    ${state.address ? `
    <!-- Balance card -->
    <div class="card">
      <div class="card-title">Your Balance</div>
      <div id="ckb-balance-row" style="text-align:center;padding:0.5rem 0">
        <div class="skeleton" style="height:1.8rem;width:60%;margin:0 auto"></div>
      </div>
    </div>
    ` : `
    <div class="card" style="text-align:center;padding:1.25rem">
      <div style="font-size:0.875rem;color:var(--text2);margin-bottom:0.75rem">Connect JoyID to see your balance</div>
      <button class="btn btn-accent btn-sm" id="chain-connect-btn">Connect Wallet</button>
    </div>
    `}

    <!-- Links -->
    <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://explorer.nervos.org')">CKB Explorer ↗</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://community.ckb.dev')">Community ↗</button>
    </div>
  `

  document.getElementById('chain-connect-btn')?.addEventListener('click', () => {
    document.getElementById('auth-badge')?.click()
  })

  // Load balance async
  if (state.address) loadCKBBalance(state.address)
}

async function loadCKBBalance(address) {
  const el = document.getElementById('ckb-balance-row')
  if (!el) return
  try {
    const cells = await ckbRpc('get_cells_capacity', [{ script: null, script_type: 'lock' }])
    // Use live light client if available, else show placeholder
    el.innerHTML = `
      <div style="font-size:0.72rem;color:var(--text3)">Requires light client connection</div>
      <div style="font-size:0.78rem;color:var(--text2);margin-top:0.25rem">Configure in Settings → Node Config</div>
    `
  } catch {
    el.innerHTML = `<div style="font-size:0.78rem;color:var(--text3)">Balance unavailable — configure node in Settings</div>`
  }
}

// ── Bitcoin ───────────────────────────────────────────────────────
async function renderBTC(panel) {
  const [blockRes, feeRes, mempoolRes] = await Promise.all([
    fetch(`${BTC_INFO}/blocks/tip/height`).then(r => r.text()),
    fetch(`${BTC_INFO}/v1/fees/recommended`).then(r => r.json()),
    fetch(`${BTC_INFO}/mempool`).then(r => r.json()),
  ])

  const blockNum = parseInt(blockRes).toLocaleString()
  const vsize    = mempoolRes.vsize ? (mempoolRes.vsize / 1000).toFixed(0) + 'K vB' : '—'
  const txCount  = mempoolRes.count?.toLocaleString() || '—'

  panel.innerHTML = `
    <div class="card-glow" style="padding:1.1rem;border-color:rgba(247,147,26,0.2);box-shadow:0 0 28px rgba(247,147,26,0.05)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem">
        <div style="display:flex;align-items:center;gap:0.6rem">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(247,147,26,0.1);border:1px solid rgba(247,147,26,0.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem">₿</div>
          <div>
            <div style="font-weight:800;font-size:0.95rem">Bitcoin</div>
            <div style="font-size:0.72rem;color:var(--text2)">via mempool.space</div>
          </div>
        </div>
        <div class="chain-status ok" style="background:rgba(247,147,26,0.12);color:#f7931a">● Live</div>
      </div>
      <div style="font-size:0.65rem;font-weight:800;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:0.3rem">Block Height</div>
      <div style="font-size:2.2rem;font-weight:800;color:#f7931a;letter-spacing:-0.04em;line-height:1">${blockNum}</div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:#f7931a">${feeRes.fastestFee}</div>
        <div class="stat-chip-label">Fast sat/vB</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${feeRes.halfHourFee}</div>
        <div class="stat-chip-label">30min sat/vB</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${feeRes.hourFee}</div>
        <div class="stat-chip-label">1hr sat/vB</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mempool</div>
      <div class="stat-row"><span class="stat-label">Unconfirmed TXs</span><span class="stat-value">${txCount}</span></div>
      <div class="stat-row"><span class="stat-label">Mempool Size</span><span class="stat-value">${vsize}</span></div>
      <div class="stat-row"><span class="stat-label">Economy Fee</span><span class="stat-value">${feeRes.economyFee} sat/vB</span></div>
      <div class="stat-row"><span class="stat-label">Minimum Fee</span><span class="stat-value">${feeRes.minimumFee} sat/vB</span></div>
    </div>

    <div style="display:flex;gap:0.5rem">
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://mempool.space')">mempool.space ↗</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://blockstream.info')">Blockstream ↗</button>
    </div>
  `
}

// ── Fiber summary ─────────────────────────────────────────────────
async function renderFiberSummary(panel) {
  // Try worker proxy first, fall back to static info
  let nodeData = null
  let channels = []
  try {
    const WORKER = 'https://wyltek-rpc.toastmanau.workers.dev/fiber'
    const [n, c] = await Promise.all([
      fetch(WORKER, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({jsonrpc:'2.0',method:'node_info',params:{},id:1}) }).then(r=>r.json()),
      fetch(WORKER, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({jsonrpc:'2.0',method:'list_channels',params:{},id:2}) }).then(r=>r.json()),
    ])
    nodeData = n.result
    channels = c.result?.channels || []
  } catch {}

  const totalLocalCKB = channels.reduce((s, ch) => s + parseInt(ch.local_balance || '0x0', 16), 0) / 1e8
  const openChannels  = channels.filter(ch => ch.state?.state_name === 'CHANNEL_READY').length

  panel.innerHTML = `
    <div class="card-glow" style="border-color:rgba(139,92,246,0.25);box-shadow:0 0 28px rgba(139,92,246,0.07)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem">
        <div style="display:flex;align-items:center;gap:0.6rem">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);display:flex;align-items:center;justify-content:center;font-size:1.1rem">🌐</div>
          <div>
            <div style="font-weight:800;font-size:0.95rem">Wyltek Fiber Node</div>
            <div style="font-size:0.72rem;color:var(--text2)">CKB Lightning · v${nodeData?.version || '0.7.0'}</div>
          </div>
        </div>
        <div class="chain-status ${nodeData ? 'ok' : 'sync'}">${nodeData ? '● Live' : '○ Offline'}</div>
      </div>
      <div style="font-family:monospace;font-size:0.66rem;color:rgba(139,92,246,0.7);word-break:break-all">
        ${nodeData?.node_id || '026a9dd1bae2e7c9ee5acaf7ad8e2e7a89fcca183740f9c9f761e402ad1da70da0'}
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--purple)">${openChannels}</div>
        <div class="stat-chip-label">Channels</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${totalLocalCKB.toFixed(0)}</div>
        <div class="stat-chip-label">Local CKB</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">3</div>
        <div class="stat-chip-label">Peers</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Network</div>
      <div class="stat-row"><span class="stat-label">P2P Port</span><span class="stat-value">8228</span></div>
      <div class="stat-row"><span class="stat-label">Protocol</span><span class="stat-value">BOLT-compatible · CKB</span></div>
      <div class="stat-row"><span class="stat-label">Status</span><span class="stat-value green">Accepting channels</span></div>
    </div>

    <button class="btn btn-ghost btn-full" style="margin-top:0.25rem" id="fiber-detail-btn">
      View Channels & Payments →
    </button>
  `

  document.getElementById('fiber-detail-btn')?.addEventListener('click', () => {
    import('../main.js').then(m => m.navigate('fiber'))
  })
}

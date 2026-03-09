import { startBlockPulse, stopBlockPulse } from '../vfx.js'

const CKB_PUBLIC  = 'https://mainnet.ckbapp.dev/rpc'
const BTC_MEMPOOL = 'https://mempool.space/api'

async function ckbRpc(method, params = [], endpoint = CKB_PUBLIC) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  if (j.error) throw new Error(j.error.message || JSON.stringify(j.error))
  return j.result
}

let activeChain = 'ckb'
let rpcHistory  = []

export async function renderChain(el, state) {
  stopBlockPulse()   // stop any previous pulse
  el.innerHTML = `
    <div class="chain-seg">
      <button class="chain-seg-btn ckb active" data-chain="ckb">⚡ CKB</button>
      <button class="chain-seg-btn btc"        data-chain="btc">₿ Bitcoin</button>
      <button class="chain-seg-btn rpc"        data-chain="rpc">🔌 RPC</button>
    </div>
    <div id="chain-panel"><div class="spinner"></div></div>
  `
  el.querySelectorAll('.chain-seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.chain-seg-btn').forEach(b => b.classList.toggle('active', b === btn))
      activeChain = btn.dataset.chain
      loadPanel(activeChain, state)
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })
  await loadPanel(activeChain, state)
}

async function loadPanel(chain, state) {
  const panel = document.getElementById('chain-panel')
  if (!panel) return
  panel.innerHTML = '<div class="spinner"></div>'
  try {
    if (chain === 'ckb') await renderCKB(panel, state)
    if (chain === 'btc') await renderBTC(panel)
    if (chain === 'rpc') renderRPCConsole(panel, state)
  } catch (err) {
    panel.innerHTML = `<div class="empty-state"><span class="icon">⚠️</span><p>${err.message}</p></div>`
  }
}

/* ── CKB Stats ─────────────────────────────────────────────────── */
async function renderCKB(panel, state) {
  const [header, peers, pool, chainInfo] = await Promise.all([
    ckbRpc('get_tip_header'),
    ckbRpc('get_peers'),
    ckbRpc('tx_pool_info'),
    ckbRpc('get_blockchain_info'),
  ])

  const blockNum = parseInt(header.number, 16)
  const peerCount = peers.length
  const pending   = parseInt(pool.pending,  16)
  const proposed  = parseInt(pool.proposed, 16)
  const minFee    = parseInt(pool.min_fee_rate, 16)
  const orphan    = parseInt(pool.orphan,   16)
  const txSize    = (parseInt(pool.total_tx_size,   16) / 1024).toFixed(1)
  const txCycles  = (parseInt(pool.total_tx_cycles, 16) / 1e9).toFixed(2)

  const epochRaw = parseInt(header.epoch, 16)
  const epNum    = epochRaw & 0xFFFFFF
  const epIndex  = (epochRaw >> 24) & 0xFFFF
  const epLen    = (epochRaw >> 40) & 0xFFFF
  const epPct    = epLen > 0 ? (epIndex / epLen * 100).toFixed(1) : 0

  const blockTime = parseInt(header.timestamp, 16)
  const age = Math.round((Date.now() - blockTime) / 1000)
  const ageStr = age < 60 ? `${age}s ago` : `${Math.round(age/60)}m ago`

  const inbound  = peers.filter(p => p.is_outbound === false).length
  const outbound = peers.filter(p => p.is_outbound !== false).length

  panel.innerHTML = `
    <div class="stat-hero ckb-hero">
      <div class="stat-hero-label"><span class="live-dot"></span>CKB MAINNET</div>
      <div class="stat-hero-value">${blockNum.toLocaleString()}</div>
      <div class="stat-hero-sub">Block height · <span style="color:var(--accent);opacity:0.8">${ageStr}</span></div>
    </div>

    <div class="card" style="padding:0.875rem 1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.45rem">
        <div style="font-size:0.72rem;font-weight:700;color:var(--text2)">Epoch ${epNum.toLocaleString()}</div>
        <div style="font-size:0.72rem;color:var(--accent);font-weight:600">${epIndex.toLocaleString()} / ${epLen.toLocaleString()} (${epPct}%)</div>
      </div>
      <div style="background:var(--surface2);border-radius:5px;height:7px;overflow:hidden">
        <div style="height:100%;width:${epPct}%;background:linear-gradient(90deg,var(--accent),#3b82f6);border-radius:5px"></div>
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--accent)">${peerCount}</div>
        <div class="stat-chip-label">Peers</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${pending.toLocaleString()}</div>
        <div class="stat-chip-label">Pending</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${proposed.toLocaleString()}</div>
        <div class="stat-chip-label">Proposed</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Chain</div>
      <div class="stat-row"><span class="stat-label">Network</span><span class="stat-value">${chainInfo.chain}</span></div>
      <div class="stat-row"><span class="stat-label">Block Hash</span><span class="stat-value" style="font-size:0.64rem">${header.hash.slice(0,20)}…</span></div>
      <div class="stat-row"><span class="stat-label">Inbound Peers</span><span class="stat-value">${inbound}</span></div>
      <div class="stat-row"><span class="stat-label">Outbound Peers</span><span class="stat-value">${outbound}</span></div>
      <div class="stat-row"><span class="stat-label">Min Fee Rate</span><span class="stat-value">${minFee} shannons/KB</span></div>
    </div>

    <div class="card">
      <div class="card-title">TX Pool</div>
      <div class="stat-row"><span class="stat-label">Pending</span><span class="stat-value">${pending.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-label">Proposed</span><span class="stat-value">${proposed.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-label">Orphan</span><span class="stat-value">${orphan}</span></div>
      <div class="stat-row"><span class="stat-label">Total Size</span><span class="stat-value">${txSize} KB</span></div>
      <div class="stat-row"><span class="stat-label">Total Cycles</span><span class="stat-value">${txCycles}G</span></div>
    </div>

    <div class="card">
      <div class="card-title">Connected Peers (${peerCount})</div>
      ${peers.slice(0, 6).map(p => {
        const addr = p.addresses?.[0]?.address || p.node_id?.slice(0,16) || '—'
        const dir  = p.is_outbound ? '↑' : '↓'
        const ver  = p.version || ''
        return `<div class="stat-row">
          <span class="stat-label" style="font-family:monospace;font-size:0.66rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${addr}</span>
          <span class="stat-value" style="font-size:0.68rem;color:var(--text3);flex-shrink:0">${dir} ${ver}</span>
        </div>`
      }).join('')}
      ${peerCount > 6 ? `<div style="font-size:0.7rem;color:var(--text3);text-align:center;padding:0.35rem">+${peerCount-6} more</div>` : ''}
    </div>

    <div style="display:flex;gap:0.5rem">
      <button class="btn btn-ghost btn-sm" style="flex:1" id="ckb-refresh">↻ Refresh</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" id="ckb-to-rpc">⌨ RPC Console</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://explorer.nervos.org')">Explorer ↗</button>
    </div>
    <div style="text-align:center;font-size:0.65rem;color:var(--text3);margin-top:0.4rem">via ckbapp.dev · ${new Date().toLocaleTimeString()}</div>
  `

  document.getElementById('ckb-refresh')?.addEventListener('click', () => renderCKB(panel, state))
  document.getElementById('ckb-to-rpc')?.addEventListener('click', () => {
    document.querySelector('.chain-seg-btn.rpc')?.click()
  })

  // Start live block pulse
  startBlockPulse(blockNum)
}

/* ── BTC Stats ─────────────────────────────────────────────────── */
async function renderBTC(panel) {
  const [blockHeight, fees, mempool, hashrate, diffAdj] = await Promise.all([
    fetch(`${BTC_MEMPOOL}/blocks/tip/height`).then(r => r.text()),
    fetch(`${BTC_MEMPOOL}/v1/fees/recommended`).then(r => r.json()),
    fetch(`${BTC_MEMPOOL}/mempool`).then(r => r.json()),
    fetch(`${BTC_MEMPOOL}/v1/mining/hashrate/3`).then(r => r.json()).catch(() => ({})),
    fetch(`${BTC_MEMPOOL}/v1/difficulty-adjustment`).then(r => r.json()).catch(() => ({})),
  ])

  const height   = parseInt(blockHeight).toLocaleString()
  const txCount  = (mempool.count || 0).toLocaleString()
  const vsizeKB  = mempool.vsize ? (mempool.vsize / 1000).toFixed(0) : '—'
  const totalFee = mempool.total_fee ? (mempool.total_fee / 1e8).toFixed(3) : '—'
  const hrEH     = hashrate?.currentHashrate ? (hashrate.currentHashrate / 1e18).toFixed(1) : '—'

  const daBlks = diffAdj?.remainingBlocks ?? '—'
  const daPct  = diffAdj?.difficultyChange != null
    ? `${diffAdj.difficultyChange > 0 ? '+' : ''}${diffAdj.difficultyChange.toFixed(1)}%`
    : '—'
  const daETA  = diffAdj?.remainingTime ? fmtSec(diffAdj.remainingTime) : '—'
  const daColor = diffAdj?.difficultyChange > 0 ? 'var(--green)' : diffAdj?.difficultyChange < 0 ? 'var(--orange)' : 'var(--text)'

  panel.innerHTML = `
    <div class="stat-hero btc-hero">
      <div class="stat-hero-label"><span class="live-dot" style="background:#f7931a"></span>BITCOIN MAINNET</div>
      <div class="stat-hero-value">${height}</div>
      <div class="stat-hero-sub">Block height</div>
    </div>

    <div class="card" style="padding:0.875rem 1rem">
      <div class="card-title">Fee Rates (sat/vB)</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;text-align:center;margin-top:0.25rem">
        ${[
          { label: '~10min', val: fees.fastestFee, color: '#f7931a' },
          { label: '~30min', val: fees.halfHourFee, color: 'var(--text)' },
          { label: '~1hr',   val: fees.hourFee,    color: 'var(--text2)' },
          { label: 'Economy',val: fees.economyFee,  color: 'var(--text3)' },
        ].map(f => `
          <div>
            <div style="font-size:1.4rem;font-weight:800;color:${f.color};letter-spacing:-0.03em">${f.val}</div>
            <div style="font-size:0.58rem;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.05em">${f.label}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:#f7931a;font-size:0.95rem">${txCount}</div>
        <div class="stat-chip-label">Mempool TX</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${vsizeKB}K</div>
        <div class="stat-chip-label">vBytes</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${hrEH}</div>
        <div class="stat-chip-label">EH/s</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mempool</div>
      <div class="stat-row"><span class="stat-label">Unconfirmed TXs</span><span class="stat-value">${txCount}</span></div>
      <div class="stat-row"><span class="stat-label">Size</span><span class="stat-value">${vsizeKB} KB vsize</span></div>
      <div class="stat-row"><span class="stat-label">Total Fees</span><span class="stat-value">${totalFee} BTC</span></div>
      <div class="stat-row"><span class="stat-label">Min Fee</span><span class="stat-value">${fees.minimumFee} sat/vB</span></div>
    </div>

    <div class="card">
      <div class="card-title">Difficulty Adjustment</div>
      <div class="stat-row"><span class="stat-label">Remaining Blocks</span><span class="stat-value">${daBlks}</span></div>
      <div class="stat-row"><span class="stat-label">ETA</span><span class="stat-value">${daETA}</span></div>
      <div class="stat-row"><span class="stat-label">Expected Change</span><span class="stat-value" style="color:${daColor}">${daPct}</span></div>
      <div class="stat-row"><span class="stat-label">Hashrate (3d avg)</span><span class="stat-value">${hrEH} EH/s</span></div>
    </div>

    <div style="display:flex;gap:0.5rem">
      <button class="btn btn-ghost btn-sm" style="flex:1" id="btc-refresh">↻ Refresh</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://mempool.space')">mempool.space ↗</button>
    </div>
    <div style="text-align:center;font-size:0.65rem;color:var(--text3);margin-top:0.4rem">via mempool.space · ${new Date().toLocaleTimeString()}</div>
  `

  document.getElementById('btc-refresh')?.addEventListener('click', () => renderBTC(panel))
}

function fmtSec(s) {
  if (s < 3600)  return `${Math.round(s/60)}m`
  if (s < 86400) return `${(s/3600).toFixed(1)}h`
  return `${(s/86400).toFixed(1)}d`
}

/* ── RPC Console ───────────────────────────────────────────────── */
const PRESETS = {
  ckb: [
    { label: 'tip_header',    method: 'get_tip_header',      params: [] },
    { label: 'chain_info',    method: 'get_blockchain_info', params: [] },
    { label: 'peers',         method: 'get_peers',           params: [] },
    { label: 'pool',          method: 'tx_pool_info',        params: [] },
    { label: 'local_node',    method: 'local_node_info',     params: [] },
    { label: 'get_block #1',  method: 'get_block_by_number', params: ['0x1'] },
  ],
  fiber: [
    { label: 'node_info',    method: 'node_info',    params: {} },
    { label: 'channels',     method: 'list_channels', params: {} },
    { label: 'peers',        method: 'list_peers',   params: [] },
    { label: 'graph_nodes',  method: 'graph_nodes',  params: {} },
  ],
}

const ENDPOINTS = [
  { label: 'CKB Mainnet (public)',  url: 'https://mainnet.ckbapp.dev/rpc',       type: 'ckb'   },
  { label: 'CKB Testnet (public)',  url: 'https://testnet.ckbapp.dev/rpc',       type: 'ckb'   },
  { label: 'CKB Mainnet (nervos)',  url: 'https://mainnet.ckb.dev/rpc',          type: 'ckb'   },
  { label: 'Wyltek Fiber (Worker)', url: 'https://wyltek-rpc.toastmanau.workers.dev/fiber', type: 'fiber' },
  { label: 'Custom…',              url: '',                                       type: 'ckb'   },
]

function renderRPCConsole(panel, state) {
  const savedUrl    = localStorage.getItem('rpc_url')    || ENDPOINTS[0].url
  const savedType   = localStorage.getItem('rpc_type')   || 'ckb'
  const savedMethod = localStorage.getItem('rpc_method') || 'get_tip_header'
  const savedParams = localStorage.getItem('rpc_params') || '[]'

  const epIdx = ENDPOINTS.findIndex(e => e.url === savedUrl)
  const presets = PRESETS[savedType] || PRESETS.ckb

  panel.innerHTML = `
    <div class="rpc-console">

      <div class="rpc-section">
        <div class="rpc-label">Endpoint</div>
        <select id="rpc-ep-sel" class="rpc-select">
          ${ENDPOINTS.map((e,i) => `<option value="${i}" ${i === epIdx ? 'selected' : ''}>${e.label}</option>`).join('')}
        </select>
        <input id="rpc-url" class="rpc-url-input" type="url" placeholder="https://…" value="${savedUrl}">
      </div>

      <div class="rpc-section">
        <div class="rpc-label">Method</div>
        <div class="rpc-preset-bar" id="rpc-presets">
          ${presets.map(p => `
            <button class="rpc-preset-btn${p.method===savedMethod?' active':''}" data-method="${p.method}" data-params='${JSON.stringify(p.params)}'>${p.label}</button>
          `).join('')}
        </div>
        <input id="rpc-method" class="rpc-method-input" placeholder="method" value="${savedMethod}">
      </div>

      <div class="rpc-section">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="rpc-label">Params (JSON)</div>
          <button class="rpc-tiny-btn" id="rpc-fmt">↺ Format</button>
        </div>
        <textarea id="rpc-params" class="rpc-params" rows="3" spellcheck="false">${savedParams}</textarea>
      </div>

      <button class="btn btn-accent btn-full" id="rpc-send" style="margin-bottom:0.75rem">⚡ Send</button>

      <div id="rpc-result"></div>

      ${rpcHistory.length > 0 ? `
        <div class="rpc-section" style="margin-top:0.5rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <div class="rpc-label">History</div>
            <button class="rpc-tiny-btn" id="rpc-clr">Clear</button>
          </div>
          ${rpcHistory.slice().reverse().slice(0,8).map((h,i) => `
            <div class="rpc-hist" data-i="${rpcHistory.length-1-i}">
              <div style="display:flex;justify-content:space-between">
                <span class="rpc-hist-method">${h.method}</span>
                <span style="font-size:0.64rem;color:${h.ok?'var(--green)':'var(--red)'}">${h.ok?'✓':'✗'} ${h.ms}ms</span>
              </div>
              <div style="font-size:0.63rem;color:var(--text3);font-family:monospace">${h.endpoint.replace('https://','').slice(0,42)}…</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `

  // Endpoint select
  const epSel  = document.getElementById('rpc-ep-sel')
  const urlIn  = document.getElementById('rpc-url')
  epSel.addEventListener('change', () => {
    const ep = ENDPOINTS[epSel.value]
    if (ep.url) urlIn.value = ep.url
    localStorage.setItem('rpc_url', ep.url || urlIn.value)
    localStorage.setItem('rpc_type', ep.type)
    const ps = PRESETS[ep.type] || PRESETS.ckb
    document.getElementById('rpc-presets').innerHTML = ps.map(p =>
      `<button class="rpc-preset-btn" data-method="${p.method}" data-params='${JSON.stringify(p.params)}'>${p.label}</button>`
    ).join('')
    wirePresets()
  })
  urlIn.addEventListener('input', () => localStorage.setItem('rpc_url', urlIn.value))

  // Format
  document.getElementById('rpc-fmt')?.addEventListener('click', () => {
    const ta = document.getElementById('rpc-params')
    try { ta.value = JSON.stringify(JSON.parse(ta.value), null, 2) } catch {}
  })

  // Presets
  function wirePresets() {
    document.querySelectorAll('.rpc-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rpc-preset-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        document.getElementById('rpc-method').value = btn.dataset.method
        document.getElementById('rpc-params').value = btn.dataset.params
        save()
      })
    })
  }
  wirePresets()

  function save() {
    localStorage.setItem('rpc_method', document.getElementById('rpc-method')?.value || '')
    localStorage.setItem('rpc_params', document.getElementById('rpc-params')?.value || '[]')
  }
  document.getElementById('rpc-method')?.addEventListener('input', () => {
    const m = document.getElementById('rpc-method').value
    document.querySelectorAll('.rpc-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.method === m))
    save()
  })
  document.getElementById('rpc-params')?.addEventListener('input', save)

  // History click
  document.querySelectorAll('.rpc-hist').forEach(row => {
    row.addEventListener('click', () => {
      const h = rpcHistory[row.dataset.i]
      if (!h) return
      document.getElementById('rpc-url').value    = h.endpoint
      document.getElementById('rpc-method').value = h.method
      document.getElementById('rpc-params').value = JSON.stringify(h.params, null, 2)
      localStorage.setItem('rpc_url', h.endpoint)
      localStorage.setItem('rpc_method', h.method)
      localStorage.setItem('rpc_params', JSON.stringify(h.params))
      showResult(document.getElementById('rpc-result'), h)
    })
  })

  document.getElementById('rpc-clr')?.addEventListener('click', () => {
    rpcHistory = []
    renderRPCConsole(panel, state)
  })

  document.getElementById('rpc-send').addEventListener('click', () => doSend(panel, state))
}

async function doSend(panel, state) {
  const btn      = document.getElementById('rpc-send')
  const endpoint = document.getElementById('rpc-url')?.value?.trim()
  const method   = document.getElementById('rpc-method')?.value?.trim()
  const paramsRaw = document.getElementById('rpc-params')?.value?.trim() || '[]'
  const resultEl = document.getElementById('rpc-result')

  if (!endpoint || !method) {
    resultEl.innerHTML = `<div class="rpc-error">Endpoint and method are required</div>`
    return
  }

  let params
  try { params = JSON.parse(paramsRaw) }
  catch (e) { resultEl.innerHTML = `<div class="rpc-error">Bad JSON params: ${e.message}</div>`; return }

  btn.disabled = true
  btn.textContent = 'Sending…'
  resultEl.innerHTML = `<div style="text-align:center;padding:1rem;color:var(--text3);font-size:0.82rem">⏳ Waiting…</div>`

  const t0 = Date.now()
  let entry
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    })
    const ms = Date.now() - t0
    if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`)
    const j = await r.json()
    entry = { endpoint, method, params, result: j.result ?? j, error: j.error, ok: !j.error, ms, ts: Date.now() }
  } catch (err) {
    const ms = Date.now() - t0
    entry = { endpoint, method, params, result: null, error: { message: err.message }, ok: false, ms, ts: Date.now() }
  }

  rpcHistory.push(entry)
  showResult(resultEl, entry)

  btn.disabled = false
  btn.textContent = '⚡ Send'
}

function showResult(el, entry) {
  const ms    = entry.ms
  const ok    = entry.ok
  const data  = entry.error ? entry.error : entry.result
  const json  = JSON.stringify(data, null, 2)
  const lines = json.split('\n').length

  el.innerHTML = `
    <div class="rpc-result-card ${ok ? 'rpc-ok' : 'rpc-err'}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <span style="font-size:0.72rem;font-weight:700;color:${ok?'var(--green)':'var(--red)'}">${ok?'✓ Success':'✗ Error'}</span>
        <span style="font-size:0.68rem;color:var(--text3)">${ms}ms · ${lines} lines</span>
      </div>
      <div class="rpc-result-toolbar">
        <button class="rpc-tiny-btn" id="rpc-copy">Copy</button>
        <button class="rpc-tiny-btn" id="rpc-collapse">Collapse</button>
      </div>
      <pre class="rpc-output" id="rpc-output-pre">${escHtml(json)}</pre>
    </div>
  `

  document.getElementById('rpc-copy')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(json).then(() => {
      const btn = document.getElementById('rpc-copy')
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn && (btn.textContent = 'Copy'), 1500) }
    })
  })

  let collapsed = false
  document.getElementById('rpc-collapse')?.addEventListener('click', () => {
    collapsed = !collapsed
    const pre = document.getElementById('rpc-output-pre')
    if (pre) pre.style.maxHeight = collapsed ? '60px' : 'none'
    const btn = document.getElementById('rpc-collapse')
    if (btn) btn.textContent = collapsed ? 'Expand' : 'Collapse'
  })
}
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// Named exports for dual-nav routing
export async function renderCKBTab(el, state) { return renderCKB(el, state) }
export async function renderBTCTab(el, state) { return renderBTC(el) }
export async function renderRPCTab(el, state) { return renderRPCConsole(el, state) }

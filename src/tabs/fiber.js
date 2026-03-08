/**
 * Fiber tab — channel list, network node directory, payment probe
 * Talks to ckbnode Fiber RPC via Worker → SSH tunnel → 127.0.0.1:8227
 */

const FIBER_URL = 'https://wyltek-rpc.toastmanau.workers.dev/fiber'

async function fiberRpc(method, params = {}) {
  const res = await fetch(FIBER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error))
  return json.result
}

// ── State ─────────────────────────────────────────────────────────
let nodeInfo = null
let channels = []
let peers    = []
let graphNodes = []

export async function renderFiber(el, state) {
  el.innerHTML = `
    <div class="section-header">Fiber Network</div>

    <!-- Sub-tabs -->
    <div class="fiber-tabs">
      <button class="fiber-tab active" data-view="channels">Channels</button>
      <button class="fiber-tab" data-view="nodes">Network</button>
      <button class="fiber-tab" data-view="probe">Probe</button>
    </div>

    <div id="fiber-panel"><div class="spinner"></div></div>
  `

  el.querySelectorAll('.fiber-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.fiber-tab').forEach(b => b.classList.toggle('active', b === btn))
      loadView(btn.dataset.view)
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })

  // Load data
  try {
    [nodeInfo, { channels }, { peers }, { nodes: graphNodes }] = await Promise.all([
      fiberRpc('node_info'),
      fiberRpc('list_channels', {}),
      fiberRpc('list_peers'),
      fiberRpc('graph_nodes', {}).catch(() => ({ nodes: [] })),
    ])
  } catch (err) {
    document.getElementById('fiber-panel').innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <p>Fiber RPC unreachable<br><small style="font-family:monospace">${err.message}</small></p>
          <p style="font-size:0.75rem;margin-top:0.5rem">Worker not yet deployed — run <code>wrangler deploy</code></p>
        </div>
      </div>
      ${nodeInfoFallback()}
    `
    return
  }

  loadView('channels')
}

function loadView(view) {
  const panel = document.getElementById('fiber-panel')
  if (!panel) return

  if (view === 'channels') renderChannels(panel)
  else if (view === 'nodes') renderNodes(panel)
  else if (view === 'probe') renderProbe(panel)
}

// ── Channels view ──────────────────────────────────────────────────
function renderChannels(panel) {
  const nodeId = nodeInfo?.node_id || '—'
  const shortId = nodeId.slice(0, 12) + '…' + nodeId.slice(-8)

  panel.innerHTML = `
    <!-- Node info strip -->
    <div class="card-glow" style="margin-bottom:0.75rem;padding:0.875rem 1rem">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <div style="font-size:1.4rem">🌐</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:0.9rem">Wyltek Fiber Node</div>
          <div style="font-family:monospace;font-size:0.68rem;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nodeId}</div>
        </div>
        <div class="chain-status ok">v${nodeInfo?.version || '—'}</div>
      </div>
    </div>

    <!-- Channel list -->
    ${channels.length === 0
      ? `<div class="empty-state"><div class="icon">📭</div><p>No open channels</p></div>`
      : channels.map(ch => renderChannel(ch)).join('')
    }

    <div style="text-align:center;margin-top:0.5rem">
      <button class="btn btn-ghost btn-sm" id="open-channel-btn">+ Open Channel</button>
    </div>
  `

  document.getElementById('open-channel-btn')?.addEventListener('click', () => showOpenChannelSheet())
}

function renderChannel(ch) {
  const localCKB   = (parseInt(ch.local_balance, 16) / 1e8).toFixed(2)
  const remoteCKB  = (parseInt(ch.remote_balance, 16) / 1e8).toFixed(2)
  const totalCKB   = (parseInt(ch.local_balance, 16) + parseInt(ch.remote_balance, 16)) / 1e8
  const localPct   = totalCKB > 0 ? (parseInt(ch.local_balance, 16) / 1e8 / totalCKB * 100) : 50
  const shortPeer  = ch.peer_id ? ch.peer_id.slice(0,8) + '…' + ch.peer_id.slice(-6) : '—'
  const stateColor = ch.state?.state_name === 'CHANNEL_READY' ? 'green' : 'orange'

  return `
    <div class="card" style="margin-bottom:0.6rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem">
        <div style="font-family:monospace;font-size:0.72rem;color:var(--text2)">${shortPeer}</div>
        <div class="chain-status ${stateColor === 'green' ? 'ok' : 'sync'}" style="font-size:0.65rem">
          ${ch.state?.state_name?.replace('_', ' ') || '—'}
        </div>
      </div>

      <!-- Liquidity bar -->
      <div style="margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text2);margin-bottom:4px">
          <span>Local: <span style="color:var(--accent);font-weight:600">${localCKB} CKB</span></span>
          <span>Remote: <span style="color:var(--text);font-weight:600">${remoteCKB} CKB</span></span>
        </div>
        <div style="background:var(--surface2);border-radius:4px;height:6px;overflow:hidden">
          <div style="height:100%;width:${localPct.toFixed(1)}%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px;transition:width 0.5s"></div>
        </div>
      </div>

      <div style="display:flex;gap:0.4rem">
        <button class="btn btn-ghost btn-sm" style="flex:1" 
          onclick="window.fiberSend('${ch.peer_id}','${ch.channel_id}')">Send</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--red)"
          onclick="window.fiberClose('${ch.channel_id}')">Close</button>
      </div>
    </div>
  `
}

// ── Nodes / network view ───────────────────────────────────────────
function renderNodes(panel) {
  const knownNodes = graphNodes || []

  panel.innerHTML = `
    <div class="card" style="margin-bottom:0.75rem">
      <div class="stat-row"><span class="stat-label">Known Nodes</span><span class="stat-value accent">${knownNodes.length}</span></div>
      <div class="stat-row"><span class="stat-label">Connected Peers</span><span class="stat-value">${peers.length}</span></div>
    </div>

    <div class="section-header" style="font-size:0.85rem">Network Nodes</div>

    ${knownNodes.length === 0
      ? `<div class="empty-state"><div class="icon">📡</div><p>No nodes in graph yet<br><small>Node is still gossiping</small></p></div>`
      : `<div id="node-list">${knownNodes.slice(0,20).map(n => renderNodeRow(n)).join('')}</div>`
    }
  `

  // Node row click → probe
  panel.querySelectorAll('.node-row').forEach(row => {
    row.addEventListener('click', () => {
      const nodeId = row.dataset.nodeId
      // Switch to probe tab pre-filled
      document.querySelector('.fiber-tab[data-view="probe"]')?.click()
      setTimeout(() => {
        const input = document.getElementById('probe-node-input')
        if (input) { input.value = nodeId; input.dispatchEvent(new Event('input')) }
      }, 100)
    })
  })
}

function renderNodeRow(n) {
  const nodeId   = n.node_id || n.node_announcement?.node_id || '—'
  const shortId  = nodeId.slice(0, 10) + '…' + nodeId.slice(-8)
  const alias    = n.node_announcement?.alias || n.alias || null
  const addrs    = n.node_announcement?.addresses || n.addresses || []
  const addr     = addrs[0] || ''
  const isMe     = nodeId === nodeInfo?.node_id

  return `
    <div class="node-row" data-node-id="${nodeId}" style="
      display:flex;align-items:center;gap:0.6rem;
      background:var(--surface);border:1px solid ${isMe ? 'rgba(0,212,255,0.3)' : 'var(--border)'};
      border-radius:10px;padding:0.75rem;margin-bottom:0.4rem;cursor:pointer;
      transition:border-color 0.15s;
    ">
      <div style="font-size:1.1rem">${isMe ? '⭐' : '🔵'}</div>
      <div style="flex:1;min-width:0">
        ${alias ? `<div style="font-size:0.82rem;font-weight:600;color:var(--text)">${alias}</div>` : ''}
        <div style="font-family:monospace;font-size:0.68rem;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${nodeId}</div>
        ${addr ? `<div style="font-size:0.68rem;color:var(--text3)">${addr}</div>` : ''}
      </div>
      ${isMe ? '<span style="font-size:0.65rem;color:var(--accent)">you</span>' : '<span style="color:var(--text3);font-size:0.8rem">→</span>'}
    </div>
  `
}

// ── Probe view ─────────────────────────────────────────────────────
function renderProbe(panel) {
  const nodeOptions = (graphNodes || [])
    .filter(n => {
      const id = n.node_id || n.node_announcement?.node_id
      return id && id !== nodeInfo?.node_id
    })
    .map(n => {
      const id    = n.node_id || n.node_announcement?.node_id
      const alias = n.node_announcement?.alias || n.alias
      return `<option value="${id}">${alias ? alias + ' — ' : ''}${id.slice(0,12)}…</option>`
    })
    .join('')

  panel.innerHTML = `
    <div class="card">
      <div class="card-title">Route Probe</div>
      <p style="font-size:0.82rem;color:var(--text2);margin:0 0 0.875rem">
        Test if a payment route exists to a node. Sends 1 shannon (≈0 CKB) to probe liquidity.
      </p>

      <div style="margin-bottom:0.75rem">
        <div style="font-size:0.75rem;color:var(--text2);margin-bottom:0.35rem;font-weight:600">Target Node</div>
        ${nodeOptions.length > 0 ? `
        <select id="probe-node-select" class="filter-dropdown" style="width:100%;margin-bottom:0.5rem;border-radius:8px;padding:0.6rem">
          <option value="">— select from network —</option>
          ${nodeOptions}
        </select>` : ''}
        <input id="probe-node-input" class="search-input" placeholder="Node ID or peer_id (Qm…)">
      </div>

      <div style="margin-bottom:0.875rem">
        <div style="font-size:0.75rem;color:var(--text2);margin-bottom:0.35rem;font-weight:600">Amount (CKB)</div>
        <input id="probe-amount" class="search-input" type="number" value="0.00000001" step="0.00000001" min="0.00000001">
      </div>

      <button class="btn btn-primary btn-full" id="probe-btn">🔍 Probe Route</button>
    </div>

    <div id="probe-result" style="margin-top:0.75rem"></div>
  `

  // Dropdown → fill input
  document.getElementById('probe-node-select')?.addEventListener('change', e => {
    const input = document.getElementById('probe-node-input')
    if (input && e.target.value) input.value = e.target.value
  })

  document.getElementById('probe-btn')?.addEventListener('click', async () => {
    const targetId = document.getElementById('probe-node-input')?.value?.trim()
    const amountCKB = parseFloat(document.getElementById('probe-amount')?.value || '0.00000001')
    const amountShannon = Math.round(amountCKB * 1e8)
    const resultEl = document.getElementById('probe-result')

    if (!targetId) {
      resultEl.innerHTML = `<div class="card" style="color:var(--orange)">Please enter a target node ID</div>`
      return
    }

    const btn = document.getElementById('probe-btn')
    btn.disabled = true; btn.textContent = 'Probing…'
    resultEl.innerHTML = '<div class="spinner"></div>'

    try {
      // Use send_payment with a probe flag or tiny amount
      // Fiber uses invoices — for probing we use build_router to check route existence
      const route = await fiberRpc('build_router', {
        target_pubkey: targetId,
        amount: `0x${amountShannon.toString(16)}`,
        payment_hash: '0x' + '00'.repeat(32), // dummy hash for route probe
      })

      if (route?.hops?.length > 0) {
        const hops = route.hops
        resultEl.innerHTML = `
          <div class="card" style="border-color:rgba(16,185,129,0.3)">
            <div style="color:var(--green);font-weight:700;margin-bottom:0.5rem">✅ Route found — ${hops.length} hop${hops.length > 1 ? 's' : ''}</div>
            ${hops.map((h, i) => `
              <div class="stat-row">
                <span class="stat-label">Hop ${i+1}</span>
                <span class="stat-value" style="font-size:0.72rem">${(h.pubkey || h.node_id || '—').slice(0,14)}…</span>
              </div>
            `).join('')}
            <div class="stat-row"><span class="stat-label">Amount</span><span class="stat-value green">${amountCKB} CKB</span></div>
          </div>
        `
      } else {
        resultEl.innerHTML = `<div class="card" style="border-color:rgba(239,68,68,0.3)"><div style="color:var(--red)">❌ No route found</div></div>`
      }
    } catch (err) {
      resultEl.innerHTML = `
        <div class="card" style="border-color:rgba(239,68,68,0.2)">
          <div style="color:var(--red);font-weight:600">Probe failed</div>
          <div style="font-size:0.78rem;color:var(--text2);margin-top:0.3rem;font-family:monospace">${err.message}</div>
        </div>
      `
    } finally {
      btn.disabled = false; btn.textContent = '🔍 Probe Route'
    }
  })
}

// ── Open channel bottom sheet ──────────────────────────────────────
function showOpenChannelSheet() {
  const sheet = document.createElement('div')
  sheet.className = 'bottom-sheet'
  sheet.innerHTML = `
    <div class="bottom-sheet-handle"></div>
    <div class="bottom-sheet-content">
      <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700">Open Channel</h3>
      <div style="margin-bottom:0.75rem">
        <div class="sheet-label">Peer ID or address</div>
        <input class="search-input" id="sheet-peer" placeholder="QmTh1V…  or  /ip4/…/p2p/Qm…">
      </div>
      <div style="margin-bottom:0.875rem">
        <div class="sheet-label">Funding amount (CKB)</div>
        <input class="search-input" id="sheet-amount" type="number" value="100" min="62">
        <div style="font-size:0.72rem;color:var(--text3);margin-top:4px">Minimum ~62 CKB</div>
      </div>
      <button class="btn btn-accent btn-full" id="sheet-open-btn">Open Channel</button>
      <button class="btn btn-ghost btn-full" id="sheet-cancel-btn" style="margin-top:0.5rem">Cancel</button>
    </div>
  `
  document.body.appendChild(sheet)
  requestAnimationFrame(() => sheet.classList.add('open'))

  document.getElementById('sheet-cancel-btn').addEventListener('click', () => closeSheet(sheet))
  document.getElementById('sheet-open-btn').addEventListener('click', async () => {
    const peerId     = document.getElementById('sheet-peer').value.trim()
    const amountCKB  = parseFloat(document.getElementById('sheet-amount').value)
    const amountHex  = '0x' + Math.round(amountCKB * 1e8).toString(16)

    if (!peerId) return

    document.getElementById('sheet-open-btn').textContent = 'Opening…'
    document.getElementById('sheet-open-btn').disabled = true

    try {
      await fiberRpc('open_channel', {
        peer_id: peerId,
        funding_amount: amountHex,
      })
      closeSheet(sheet)
      window.Telegram?.WebApp?.showAlert('Channel opening initiated! It will appear once confirmed on-chain.')
    } catch (err) {
      window.Telegram?.WebApp?.showAlert(`Failed: ${err.message}`)
      document.getElementById('sheet-open-btn').textContent = 'Open Channel'
      document.getElementById('sheet-open-btn').disabled = false
    }
  })
}

function closeSheet(sheet) {
  sheet.classList.remove('open')
  setTimeout(() => sheet.remove(), 300)
}

// ── Global action handlers ─────────────────────────────────────────
window.fiberSend = (peerId, channelId) => {
  window.Telegram?.WebApp?.showAlert('Send payment UI coming soon — requires invoice input')
}

window.fiberClose = async (channelId) => {
  const tg = window.Telegram?.WebApp
  tg?.showPopup({
    title: 'Close Channel',
    message: 'This will initiate a cooperative channel close. Funds return on-chain.',
    buttons: [
      { id: 'close', type: 'destructive', text: 'Close Channel' },
      { id: 'cancel', type: 'cancel' },
    ]
  }, async (btnId) => {
    if (btnId === 'close') {
      try {
        await fiberRpc('shutdown_channel', { channel_id: channelId, close_script: null })
        tg?.showAlert('Channel close initiated')
      } catch (err) {
        tg?.showAlert(`Failed: ${err.message}`)
      }
    }
  })
}

function nodeInfoFallback() {
  return `
    <div class="card" style="border-color:rgba(0,212,255,0.15)">
      <div class="card-title">Node Info (cached)</div>
      <div class="stat-row"><span class="stat-label">Node ID</span><span class="stat-value" style="font-size:0.68rem;color:var(--accent)">026a9dd1bae2e7c9ee5…</span></div>
      <div class="stat-row"><span class="stat-label">Version</span><span class="stat-value">0.7.0</span></div>
      <div class="stat-row"><span class="stat-label">P2P Port</span><span class="stat-value">8228</span></div>
    </div>
  `
}

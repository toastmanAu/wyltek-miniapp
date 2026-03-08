/**
 * Chain tab — live CKB + BTC node data (v2)
 */
import { ckbRpc, btcRpc } from '../rpc.js'

export async function renderChain(el, state) {
  el.innerHTML = `
    <div class="section-header">Live Node Data</div>

    <div class="card" style="margin-bottom:0.75rem">
      <div class="chain-header">
        <div class="chain-logo ckb">⚡</div>
        <div>
          <div class="chain-name">Nervos CKB</div>
          <div style="font-size:0.72rem;color:var(--text2)">Mainnet</div>
        </div>
        <div class="chain-status sync" id="ckb-status">Loading…</div>
      </div>
      <div id="ckb-stats"><div class="spinner"></div></div>
    </div>

    <div class="card" style="margin-bottom:0.75rem">
      <div class="chain-header">
        <div class="chain-logo btc">₿</div>
        <div>
          <div class="chain-name">Bitcoin</div>
          <div style="font-size:0.72rem;color:var(--text2)">Mainnet</div>
        </div>
        <div class="chain-status sync" id="btc-status">Loading…</div>
      </div>
      <div id="btc-stats"><div class="spinner"></div></div>
    </div>

    <div style="text-align:center;font-size:0.72rem;color:var(--text3);margin-top:0.25rem">
      Data from Wyltek nodes · <span id="chain-updated">updating…</span>
    </div>
  `

  await Promise.allSettled([loadCKB(), loadBTC()])
  const updated = document.getElementById('chain-updated')
  if (updated) updated.textContent = 'Updated ' + new Date().toLocaleTimeString()
}

async function loadCKB() {
  const statsEl  = document.getElementById('ckb-stats')
  const statusEl = document.getElementById('ckb-status')
  try {
    const [tip, txPool, peers] = await Promise.all([
      ckbRpc('get_tip_header', []),
      ckbRpc('tx_pool_info', []),
      ckbRpc('get_peers', []),
    ])

    const blockNum  = parseInt(tip?.number, 16).toLocaleString()
    const pending   = parseInt(txPool?.pending_size ?? txPool?.pending ?? 0)
    const peerCount = peers?.length ?? 0

    if (statusEl) { statusEl.textContent = 'Live'; statusEl.className = 'chain-status ok'; }
    if (statsEl) statsEl.innerHTML = `
      <div class="stat-row"><span class="stat-label">Block Height</span><span class="stat-value accent">${blockNum}</span></div>
      <div class="stat-row"><span class="stat-label">Mempool</span><span class="stat-value">${pending.toLocaleString()} txs</span></div>
      <div class="stat-row"><span class="stat-label">Peers</span><span class="stat-value ${peerCount > 5 ? 'green' : 'orange'}">${peerCount}</span></div>
      <div class="stat-row"><span class="stat-label">Node</span><span class="stat-value" style="font-size:0.78rem">Wyltek / Pi5</span></div>
    `
  } catch (err) {
    if (statusEl) { statusEl.textContent = 'Offline'; statusEl.className = 'chain-status err'; }
    if (statsEl) statsEl.innerHTML = `<div class="empty-state" style="padding:1rem"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

async function loadBTC() {
  const statsEl  = document.getElementById('btc-stats')
  const statusEl = document.getElementById('btc-status')
  try {
    const [info, net] = await Promise.all([
      btcRpc('getblockchaininfo', []),
      btcRpc('getnetworkinfo', []),
    ])

    const height   = (info?.blocks || 0).toLocaleString()
    const ibd      = info?.initialblockdownload
    const progress = ((info?.verificationprogress || 0) * 100).toFixed(2)
    const peers    = net?.connections ?? 0

    if (statusEl) {
      statusEl.textContent = ibd ? `IBD ${progress}%` : 'Synced'
      statusEl.className = `chain-status ${ibd ? 'sync' : 'ok'}`
    }
    if (statsEl) statsEl.innerHTML = `
      <div class="stat-row"><span class="stat-label">Block Height</span><span class="stat-value accent">${height}</span></div>
      <div class="stat-row"><span class="stat-label">Sync</span><span class="stat-value ${ibd ? 'orange' : 'green'}">${ibd ? `${progress}%` : 'Complete ✓'}</span></div>
      ${ibd ? `<div class="sync-bar-wrap"><div class="sync-bar" style="width:${progress}%"></div></div>` : ''}
      <div class="stat-row"><span class="stat-label">Peers</span><span class="stat-value ${peers > 5 ? 'green' : 'orange'}">${peers}</span></div>
      <div class="stat-row"><span class="stat-label">Network</span><span class="stat-value">${info?.chain ?? '—'}</span></div>
    `
  } catch (err) {
    if (statusEl) { statusEl.textContent = 'Offline'; statusEl.className = 'chain-status err'; }
    if (statsEl) statsEl.innerHTML = `<div class="empty-state" style="padding:1rem"><div class="icon">⚠️</div><p>${err.message}</p></div>`
  }
}

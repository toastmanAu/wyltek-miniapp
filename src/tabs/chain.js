/**
 * Chain tab — live CKB + BTC node data
 * Queries your own nodes via the RPC proxy worker
 */
import { ckbRpc, btcRpc, formatCKB } from '../rpc.js'

export async function renderChain(el, state) {
  el.innerHTML = `
    <div class="chain-section">
      <div class="card">
        <div class="card-title"><span class="chain-icon">⚡</span>Nervos CKB</div>
        <div id="ckb-stats"><div class="spinner"></div></div>
      </div>
    </div>
    <div class="chain-section">
      <div class="card">
        <div class="card-title"><span class="chain-icon">₿</span>Bitcoin</div>
        <div id="btc-stats"><div class="spinner"></div></div>
      </div>
    </div>
    <p style="text-align:center;font-size:0.72rem;color:var(--muted);margin-top:0.5rem">
      Data from your own nodes · <span id="chain-updated">loading…</span>
    </p>
  `

  const [ckbResult, btcResult] = await Promise.allSettled([
    loadCKB(),
    loadBTC(),
  ])

  document.getElementById('chain-updated').textContent =
    'Updated ' + new Date().toLocaleTimeString()
}

async function loadCKB() {
  const el = document.getElementById('ckb-stats')
  try {
    const [tip, txPool, peers] = await Promise.all([
      ckbRpc('get_tip_header', []),
      ckbRpc('tx_pool_info', []),
      ckbRpc('get_peers', []),
    ])

    const blockNum = parseInt(tip?.number, 16).toLocaleString()
    const pending  = parseInt(txPool?.pending_size || txPool?.pending || 0)
    const peerCount = peers?.length ?? '—'

    el.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Block Height</span>
        <span class="stat-value accent">${blockNum}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Mempool</span>
        <span class="stat-value">${pending.toLocaleString()} txs</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Peers</span>
        <span class="stat-value ${parseInt(peerCount) > 5 ? 'green' : 'orange'}">${peerCount}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Node</span>
        <span class="stat-value" style="font-size:0.75rem">ckbnode (Pi5)</span>
      </div>
    `
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>CKB node unreachable<br><small>${err.message}</small></p></div>`
  }
}

async function loadBTC() {
  const el = document.getElementById('btc-stats')
  try {
    const info = await btcRpc('getblockchaininfo', [])
    const net  = await btcRpc('getnetworkinfo', [])

    const height    = info?.blocks?.toLocaleString() ?? '—'
    const ibd       = info?.initialblockdownload
    const progress  = ((info?.verificationprogress || 0) * 100).toFixed(2)
    const peers     = net?.connections ?? '—'

    el.innerHTML = `
      <div class="stat-row">
        <span class="stat-label">Block Height</span>
        <span class="stat-value accent">${height}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Sync</span>
        <span class="stat-value ${ibd ? 'orange' : 'green'}">${ibd ? `IBD ${progress}%` : 'Synced ✓'}</span>
      </div>
      ${ibd ? `
      <div class="sync-bar-wrap">
        <div class="sync-bar" style="width:${progress}%"></div>
      </div>` : ''}
      <div class="stat-row">
        <span class="stat-label">Peers</span>
        <span class="stat-value ${parseInt(peers) > 5 ? 'green' : 'orange'}">${peers}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Network</span>
        <span class="stat-value">${info?.chain ?? '—'}</span>
      </div>
    `
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>BTC node unreachable<br><small>${err.message}</small></p></div>`
  }
}

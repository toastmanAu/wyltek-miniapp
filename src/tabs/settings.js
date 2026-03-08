/**
 * Settings tab — node configuration
 * Users can choose their RPC backend for CKB and BTC
 */

export const NODE_PRESETS = {
  ckb: {
    mainnet: [
      {
        id: 'wyltek-light',
        label: '⚡ Wyltek Light Client',
        desc: 'Phill\'s CKB light client — tx history, UTXOs, verified headers',
        url: 'https://wyltek-rpc.toastmanau.workers.dev/ckb-light',
        proxy: true,
        lightClient: true,
      },
      {
        id: 'wyltek',
        label: '🟢 Wyltek Full Node',
        desc: 'Phill\'s CKB mainnet full node (via Cloudflare proxy)',
        url: 'https://wyltek-rpc.toastmanau.workers.dev/ckb',
        proxy: true,
      },
      {
        id: 'nervos-public',
        label: '🌐 Nervos Public RPC',
        desc: 'Official public mainnet endpoint',
        url: 'https://mainnet.ckbapp.dev/rpc',
        proxy: false,
      },
      {
        id: 'ankr',
        label: '⚡ Ankr',
        desc: 'Ankr public RPC (free tier)',
        url: 'https://rpc.ankr.com/nervos',
        proxy: false,
      },
      {
        id: 'custom',
        label: '✏️ Custom',
        desc: 'Enter your own CKB RPC URL',
        url: '',
        proxy: false,
      },
    ],
    testnet: [
      {
        id: 'nervos-testnet',
        label: '🌐 Nervos Testnet',
        desc: 'Official public testnet endpoint',
        url: 'https://testnet.ckbapp.dev/rpc',
        proxy: false,
      },
      {
        id: 'custom',
        label: '✏️ Custom',
        desc: 'Enter your own testnet RPC URL',
        url: '',
        proxy: false,
      },
    ],
  },
  btc: {
    mainnet: [
      {
        id: 'wyltek',
        label: '🟢 Wyltek Node',
        desc: 'Phill\'s Bitcoin mainnet node (via Cloudflare proxy)',
        url: 'https://wyltek-rpc.toastmanau.workers.dev/btc',
        proxy: true,
      },
      {
        id: 'blockstream',
        label: '🌐 Blockstream Esplora',
        desc: 'Blockstream public API (read-only, Esplora format)',
        url: 'https://blockstream.info/api',
        proxy: false,
        apiStyle: 'esplora',
      },
      {
        id: 'custom',
        label: '✏️ Custom',
        desc: 'Your own Bitcoin node RPC URL',
        url: '',
        proxy: false,
      },
    ],
  },
}

// ── Persistence ────────────────────────────────────────────────────
export function loadNodeConfig() {
  try {
    const saved = localStorage.getItem('wyltek_node_config')
    if (saved) return JSON.parse(saved)
  } catch {}
  return {
    ckb: { net: 'mainnet', preset: 'wyltek-light', customUrl: '' },
    btc: { net: 'mainnet', preset: 'wyltek', customUrl: '' },
  }
}

export function saveNodeConfig(cfg) {
  localStorage.setItem('wyltek_node_config', JSON.stringify(cfg))
}

export function resolveRpcUrl(chain, cfg) {
  const netKey = cfg[chain]?.net || 'mainnet'
  const presetId = cfg[chain]?.preset || 'wyltek'
  const presets = NODE_PRESETS[chain]?.[netKey] || []
  const preset = presets.find(p => p.id === presetId)
  if (!preset) return null
  if (presetId === 'custom') return cfg[chain]?.customUrl || ''
  return preset.url
}

// ── Render ─────────────────────────────────────────────────────────
export async function renderSettings(el, state) {
  const cfg = loadNodeConfig()

  el.innerHTML = `
    <h3 style="color:var(--text);margin:0 0 1rem;font-size:1rem">⚙️ Settings</h3>

    <!-- CKB Node -->
    <div class="card" style="margin-bottom:0.75rem">
      <div class="card-title">⚡ CKB Node</div>

      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">
        <button class="net-btn ${cfg.ckb.net === 'mainnet' ? 'active' : ''}"
          data-chain="ckb" data-net="mainnet"
          style="flex:1;${netBtnStyle(cfg.ckb.net === 'mainnet')}">Mainnet</button>
        <button class="net-btn ${cfg.ckb.net === 'testnet' ? 'active' : ''}"
          data-chain="ckb" data-net="testnet"
          style="flex:1;${netBtnStyle(cfg.ckb.net === 'testnet')}">Testnet</button>
      </div>

      <div id="ckb-presets">
        ${renderPresets('ckb', cfg)}
      </div>
      <div id="ckb-custom" style="${cfg.ckb.preset === 'custom' ? '' : 'display:none'}">
        ${renderCustomInput('ckb', cfg)}
      </div>
    </div>

    <!-- BTC Node -->
    <div class="card" style="margin-bottom:0.75rem">
      <div class="card-title">₿ Bitcoin Node</div>

      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">
        <button class="net-btn ${cfg.btc.net === 'mainnet' ? 'active' : ''}"
          data-chain="btc" data-net="mainnet"
          style="flex:1;${netBtnStyle(cfg.btc.net === 'mainnet')}">Mainnet</button>
      </div>

      <div id="btc-presets">
        ${renderPresets('btc', cfg)}
      </div>
      <div id="btc-custom" style="${cfg.btc.preset === 'custom' ? '' : 'display:none'}">
        ${renderCustomInput('btc', cfg)}
      </div>
    </div>

    <!-- Test connection -->
    <button class="btn btn-primary btn-full" id="test-conn" style="margin-bottom:0.75rem">
      Test Connection
    </button>
    <div id="test-result" style="font-size:0.8rem;color:var(--muted);text-align:center;min-height:1.5rem"></div>

    <!-- About -->
    <div class="card" style="margin-top:0.75rem">
      <div class="card-title">About</div>
      <div class="stat-row">
        <span class="stat-label">App</span>
        <span class="stat-value">Wyltek Industries</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Version</span>
        <span class="stat-value">0.1.0</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Source</span>
        <a href="https://github.com/toastmanAu/wyltek-miniapp" target="_blank"
           style="color:var(--accent);font-size:0.82rem">GitHub ↗</a>
      </div>
      <div class="stat-row">
        <span class="stat-label">Site</span>
        <a href="https://wyltekindustries.com" target="_blank"
           style="color:var(--accent);font-size:0.82rem">wyltekindustries.com ↗</a>
      </div>
    </div>
  `

  attachHandlers(el, cfg)
}

function netBtnStyle(active) {
  return active
    ? 'background:var(--accent2);color:white;border:none;border-radius:6px;padding:0.4rem;font-size:0.8rem;font-weight:600;cursor:pointer;'
    : 'background:var(--surface2);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:0.4rem;font-size:0.8rem;cursor:pointer;'
}

function renderPresets(chain, cfg) {
  const netKey = cfg[chain].net
  const presets = NODE_PRESETS[chain]?.[netKey] || []
  return presets.map(p => `
    <label class="preset-row" style="
      display:flex;align-items:flex-start;gap:0.6rem;
      padding:0.6rem 0;border-bottom:1px solid var(--border);
      cursor:pointer;
    ">
      <input type="radio" name="${chain}-preset" value="${p.id}"
        ${cfg[chain].preset === p.id ? 'checked' : ''}
        style="margin-top:3px;accent-color:var(--accent);">
      <div style="flex:1">
        <div style="font-size:0.875rem;color:var(--text);font-weight:500">${p.label}</div>
        <div style="font-size:0.72rem;color:var(--muted)">${p.desc}</div>
        ${p.id !== 'custom' ? `<div style="font-size:0.68rem;color:var(--border);margin-top:2px;font-family:monospace">${p.url}</div>` : ''}
      </div>
    </label>
  `).join('')
}

function renderCustomInput(chain, cfg) {
  return `
    <div style="margin-top:0.5rem">
      <input id="${chain}-custom-url"
        placeholder="https://your-node:8114"
        value="${cfg[chain].customUrl || ''}"
        style="width:100%;box-sizing:border-box;
          background:var(--surface2);border:1px solid var(--border);
          border-radius:6px;color:var(--text);padding:0.5rem 0.75rem;
          font-size:0.82rem;outline:none;font-family:monospace">
    </div>
  `
}

function attachHandlers(el, cfg) {
  // Network toggle buttons
  el.querySelectorAll('.net-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chain = btn.dataset.chain
      const net   = btn.dataset.net
      cfg[chain].net = net
      cfg[chain].preset = NODE_PRESETS[chain]?.[net]?.[0]?.id || 'wyltek'
      saveNodeConfig(cfg)
      // Re-render presets for this chain
      document.getElementById(`${chain}-presets`).innerHTML = renderPresets(chain, cfg)
      document.getElementById(`${chain}-custom`).style.display = 'none'
      // Update button styles
      el.querySelectorAll(`.net-btn[data-chain="${chain}"]`).forEach(b => {
        b.style.cssText = `flex:1;${netBtnStyle(b.dataset.net === net)}`
      })
      attachPresetHandlers(chain, cfg)
    })
  })

  // Preset radios
  ;['ckb', 'btc'].forEach(chain => attachPresetHandlers(chain, cfg))

  // Test connection
  document.getElementById('test-conn').addEventListener('click', () => testConnections(cfg))
}

function attachPresetHandlers(chain, cfg) {
  document.querySelectorAll(`input[name="${chain}-preset"]`).forEach(radio => {
    radio.addEventListener('change', () => {
      cfg[chain].preset = radio.value
      saveNodeConfig(cfg)
      const customDiv = document.getElementById(`${chain}-custom`)
      customDiv.style.display = radio.value === 'custom' ? '' : 'none'
      if (radio.value === 'custom') {
        customDiv.innerHTML = renderCustomInput(chain, cfg)
        document.getElementById(`${chain}-custom-url`).addEventListener('input', e => {
          cfg[chain].customUrl = e.target.value.trim()
          saveNodeConfig(cfg)
        })
      }
    })
  })

  // Custom URL input (if already visible)
  const customInput = document.getElementById(`${chain}-custom-url`)
  if (customInput) {
    customInput.addEventListener('input', e => {
      cfg[chain].customUrl = e.target.value.trim()
      saveNodeConfig(cfg)
    })
  }
}

async function testConnections(cfg) {
  const resultEl = document.getElementById('test-result')
  const btn = document.getElementById('test-conn')
  btn.disabled = true
  btn.textContent = 'Testing…'
  resultEl.textContent = ''

  const ckbUrl = resolveRpcUrl('ckb', cfg)
  const btcUrl = resolveRpcUrl('btc', cfg)

  const results = []

  // Test CKB
  try {
    const res = await fetch(ckbUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'get_tip_block_number', params: [] }),
      signal: AbortSignal.timeout(8000),
    })
    const json = await res.json()
    const block = parseInt(json?.result, 16)
    results.push(`⚡ CKB ✅ block ${block.toLocaleString()}`)
  } catch (err) {
    results.push(`⚡ CKB ❌ ${err.message}`)
  }

  // Test BTC (skip Esplora style for now — JSON-RPC only)
  const btcPreset = NODE_PRESETS.btc[cfg.btc.net]?.find(p => p.id === cfg.btc.preset)
  if (btcPreset?.apiStyle !== 'esplora') {
    try {
      const res = await fetch(btcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 1, jsonrpc: '1.0', method: 'getblockcount', params: [] }),
        signal: AbortSignal.timeout(8000),
      })
      const json = await res.json()
      results.push(`₿ BTC ✅ block ${(json?.result || 0).toLocaleString()}`)
    } catch (err) {
      results.push(`₿ BTC ❌ ${err.message}`)
    }
  } else {
    results.push('₿ BTC — Esplora (no test needed)')
  }

  resultEl.innerHTML = results.join('<br>')
  btn.disabled = false
  btn.textContent = 'Test Connection'
}

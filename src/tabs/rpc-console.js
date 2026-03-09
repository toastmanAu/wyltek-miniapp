/**
 * rpc-console.js — Smart RPC console
 * Searchable dropdown, typed param fields, unghost send on valid
 */

// ── CKB full node methods ─────────────────────────────────────────
const CKB_METHODS = [
  { m: 'get_tip_block_number',    cat: 'Chain',       params: [] },
  { m: 'get_tip_header',          cat: 'Chain',       params: [] },
  { m: 'get_blockchain_info',     cat: 'Chain',       params: [] },
  { m: 'get_current_epoch',       cat: 'Chain',       params: [] },
  { m: 'get_block_by_number', cat: 'Chain', params: [
    { name:'block_number', type:'hex',  label:'Block number (hex, e.g. 0x1)', required:true },
    { name:'verbosity',    type:'hex',  label:'Verbosity (optional)',          required:false },
  ]},
  { m: 'get_block', cat: 'Chain', params: [
    { name:'block_hash', type:'hash', label:'Block hash (0x…)',  required:true  },
    { name:'verbosity',  type:'hex',  label:'Verbosity (optional)', required:false },
  ]},
  { m: 'get_header', cat: 'Chain', params: [
    { name:'block_hash', type:'hash', label:'Block hash (0x…)', required:true },
  ]},
  { m: 'get_header_by_number', cat: 'Chain', params: [
    { name:'block_number', type:'hex', label:'Block number (hex)', required:true },
  ]},
  { m: 'get_epoch_by_number', cat: 'Chain', params: [
    { name:'epoch_number', type:'hex', label:'Epoch number (hex)', required:true },
  ]},
  { m: 'tx_pool_info',            cat: 'Pool',        params: [] },
  { m: 'get_raw_tx_pool', cat: 'Pool', params: [
    { name:'verbose', type:'bool', label:'Verbose (true / false)', required:false },
  ]},
  { m: 'get_fee_rate_statistics', cat: 'Pool', params: [
    { name:'target', type:'hex', label:'Target blocks (hex, optional)', required:false },
  ]},
  { m: 'get_transaction', cat: 'Transaction', params: [
    { name:'tx_hash',        type:'hash', label:'Transaction hash (0x…)', required:true  },
    { name:'verbosity',      type:'hex',  label:'Verbosity (optional)',    required:false },
    { name:'only_committed', type:'bool', label:'Only committed (true/false, optional)', required:false },
  ]},
  { m: 'send_transaction', cat: 'Transaction', params: [
    { name:'transaction',        type:'json', label:'Transaction object (JSON)', required:true  },
    { name:'outputs_validator',  type:'text', label:'"passthrough" or "well_known_scripts_only" (optional)', required:false },
  ]},
  { m: 'estimate_cycles', cat: 'Transaction', params: [
    { name:'transaction', type:'json', label:'Transaction object (JSON)', required:true },
  ]},
  { m: 'get_cells', cat: 'Cell', params: [
    { name:'search_key',   type:'json', label:'Search key {script, script_type, filter?}', required:true  },
    { name:'order',        type:'text', label:'"asc" or "desc"',          required:true  },
    { name:'limit',        type:'hex',  label:'Limit (hex, e.g. 0x10)',   required:true  },
    { name:'after_cursor', type:'text', label:'Cursor from previous page (optional)', required:false },
  ]},
  { m: 'get_cells_capacity', cat: 'Cell', params: [
    { name:'search_key', type:'json', label:'Search key (JSON)', required:true },
  ]},
  { m: 'get_live_cell', cat: 'Cell', params: [
    { name:'out_point', type:'json', label:'OutPoint {tx_hash, index}', required:true  },
    { name:'with_data', type:'bool', label:'Include cell data (true/false)', required:true  },
    { name:'verbosity', type:'hex',  label:'Verbosity (optional)',          required:false },
  ]},
  { m: 'get_transactions', cat: 'Cell', params: [
    { name:'search_key',   type:'json', label:'Search key (JSON)', required:true  },
    { name:'order',        type:'text', label:'"asc" or "desc"',   required:true  },
    { name:'limit',        type:'hex',  label:'Limit (hex)',        required:true  },
    { name:'after_cursor', type:'text', label:'Cursor (optional)',  required:false },
  ]},
  { m: 'local_node_info',         cat: 'Node',        params: [] },
  { m: 'get_peers',               cat: 'Node',        params: [] },
  { m: 'get_banned_addresses',    cat: 'Node',        params: [] },
  { m: 'sync_state',              cat: 'Node',        params: [] },
]

// ── CKB light client methods ──────────────────────────────────────
const LIGHT_METHODS = [
  { m: 'get_tip_header',      cat: 'Chain', params: [] },
  { m: 'get_genesis_block',   cat: 'Chain', params: [] },
  { m: 'get_header', cat: 'Chain', params: [
    { name:'block_hash', type:'hash', label:'Block hash (0x…)', required:true },
  ]},
  { m: 'get_header_by_number', cat: 'Chain', params: [
    { name:'block_number', type:'hex', label:'Block number (hex)', required:true },
  ]},
  { m: 'get_transaction', cat: 'Transaction', params: [
    { name:'tx_hash', type:'hash', label:'Transaction hash (0x…)', required:true },
  ]},
  { m: 'fetch_transaction', cat: 'Transaction', params: [
    { name:'tx_hash', type:'hash', label:'Transaction hash (0x…)', required:true },
  ]},
  { m: 'send_transaction', cat: 'Transaction', params: [
    { name:'transaction', type:'json', label:'Transaction object (JSON)', required:true },
  ]},
  { m: 'get_cells', cat: 'Cell', params: [
    { name:'search_key',   type:'json', label:'Search key {script, script_type}', required:true  },
    { name:'order',        type:'text', label:'"asc" or "desc"', required:true  },
    { name:'limit',        type:'hex',  label:'Limit (hex, e.g. 0x10)', required:true  },
    { name:'after_cursor', type:'text', label:'Cursor (optional)', required:false },
  ]},
  { m: 'get_cells_capacity', cat: 'Cell', params: [
    { name:'search_key', type:'json', label:'Search key (JSON)', required:true },
  ]},
  { m: 'get_transactions', cat: 'Cell', params: [
    { name:'search_key',   type:'json', label:'Search key (JSON)', required:true  },
    { name:'order',        type:'text', label:'"asc" or "desc"',   required:true  },
    { name:'limit',        type:'hex',  label:'Limit (hex)',        required:true  },
    { name:'after_cursor', type:'text', label:'Cursor (optional)',  required:false },
  ]},
  { m: 'set_scripts',  cat: 'Light Client', params: [
    { name:'scripts', type:'json', label:'ScriptStatus array [{script, script_type, block_number}]', required:true },
    { name:'command', type:'text', label:'"all" | "partial" | "delete"', required:true },
  ]},
  { m: 'get_scripts',  cat: 'Light Client', params: [] },
  { m: 'fetch_header', cat: 'Light Client', params: [
    { name:'block_hash', type:'hash', label:'Block hash (0x…)', required:true },
  ]},
  { m: 'local_node_info', cat: 'Node', params: [] },
  { m: 'get_peers',       cat: 'Node', params: [] },
]

// ── Fiber methods ─────────────────────────────────────────────────
const FIBER_METHODS = [
  { m: 'node_info',       cat: 'Node',     params: [] },
  { m: 'list_channels', cat: 'Channel', params: [
    { name:'peer_id',        type:'text', label:'Filter by peer ID (optional)', required:false },
    { name:'include_closed', type:'bool', label:'Include closed (true/false, optional)', required:false },
  ]},
  { m: 'open_channel', cat: 'Channel', params: [
    { name:'peer_id',        type:'text', label:'Peer multiaddr or ID', required:true  },
    { name:'funding_amount', type:'hex',  label:'Funding (hex Shannon)', required:true  },
    { name:'public',         type:'bool', label:'Public channel (true/false, optional)', required:false },
  ]},
  { m: 'accept_channel', cat: 'Channel', params: [
    { name:'id',             type:'hash', label:'Temporary channel ID (0x…)', required:true },
    { name:'funding_amount', type:'hex',  label:'Funding amount (hex Shannon)', required:true },
  ]},
  { m: 'list_payments',   cat: 'Payment',  params: [] },
  { m: 'get_payment', cat: 'Payment', params: [
    { name:'payment_hash', type:'hash', label:'Payment hash (0x…)', required:true },
  ]},
  { m: 'send_payment', cat: 'Payment', params: [
    { name:'target_pubkey',    type:'hash', label:'Target public key (0x…)', required:true  },
    { name:'amount',           type:'hex',  label:'Amount (hex Shannon)',     required:true  },
    { name:'invoice',          type:'text', label:'Invoice string (optional)', required:false },
    { name:'final_cltv_delta', type:'hex',  label:'CLTV delta (optional)',     required:false },
  ]},
  { m: 'new_invoice', cat: 'Invoice', params: [
    { name:'amount',      type:'hex',  label:'Amount (hex Shannon)', required:true },
    { name:'currency',    type:'text', label:'"Fibt" or "Fibb"', required:true },
    { name:'description', type:'text', label:'Description (optional)', required:false },
    { name:'expiry',      type:'hex',  label:'Expiry seconds (hex, optional)', required:false },
  ]},
  { m: 'parse_invoice', cat: 'Invoice', params: [
    { name:'invoice', type:'text', label:'Invoice string', required:true },
  ]},
  { m: 'list_peers',      cat: 'Network',  params: [] },
  { m: 'connect_peer', cat: 'Network', params: [
    { name:'address', type:'text', label:'/ip4/…/tcp/8228/p2p/Qm…', required:true },
  ]},
  { m: 'disconnect_peer', cat: 'Network', params: [
    { name:'peer_id', type:'text', label:'Peer ID', required:true },
  ]},
  { m: 'graph_nodes', cat: 'Network', params: [
    { name:'limit', type:'hex',  label:'Limit (hex, optional)', required:false },
    { name:'after', type:'text', label:'Cursor (optional)',      required:false },
  ]},
  { m: 'graph_channels', cat: 'Network', params: [
    { name:'limit', type:'hex',  label:'Limit (hex, optional)', required:false },
    { name:'after', type:'text', label:'Cursor (optional)',      required:false },
  ]},
  { m: 'build_router', cat: 'Network', params: [
    { name:'source', type:'hash', label:'Source pubkey (0x…)', required:true },
    { name:'target', type:'hash', label:'Target pubkey (0x…)', required:true },
    { name:'amount', type:'hex',  label:'Amount (hex Shannon)', required:true },
  ]},
]

// ── Endpoint definitions ──────────────────────────────────────────
const ENDPOINTS = [
  { id:'ckb-pub',     label:'CKB Mainnet',         shortLabel:'CKB ↑',    url:'https://mainnet.ckbapp.dev/rpc',                              methods:CKB_METHODS,   rpcType:'ckb'   },
  { id:'ckb-testnet', label:'CKB Testnet',          shortLabel:'Testnet',  url:'https://testnet.ckbapp.dev/rpc',                              methods:CKB_METHODS,   rpcType:'ckb'   },
  { id:'ckb-light',   label:'Wyltek Light Client',  shortLabel:'Light ✦',  url:'https://wyltek-rpc.toastman-one.workers.dev/ckb-light',         methods:LIGHT_METHODS, rpcType:'light' },
  { id:'fiber',       label:'Wyltek Fiber',         shortLabel:'Fiber 🌐', url:'https://wyltek-rpc.toastman-one.workers.dev/fiber',             methods:FIBER_METHODS, rpcType:'fiber' },
  { id:'custom',      label:'Custom URL',           shortLabel:'Custom',   url:'',                                                             methods:CKB_METHODS,   rpcType:'ckb'   },
]

// ── Module state ──────────────────────────────────────────────────
let rpcHistory  = []
let currentEp   = ENDPOINTS[0]
let currentMeta = null  // { m, params, cat }
let paramValues = {}

// ── Entry point ───────────────────────────────────────────────────
export async function renderRPCConsole(el, _state) {
  const savedEpId = localStorage.getItem('rpc_ep_id') || 'ckb-pub'
  currentEp = ENDPOINTS.find(e => e.id === savedEpId) || ENDPOINTS[0]
  currentMeta = null
  paramValues = {}

  el.innerHTML = `
    <div class="rpc-wrap">
      <div class="rpc-block">
        <div class="rpc-block-label">Endpoint</div>
        <div class="rpc-ep-pills" id="rpc-ep-pills">
          ${ENDPOINTS.map(ep => `
            <button class="rpc-ep-pill${ep.id===currentEp.id?' active':''}" data-epid="${ep.id}">${ep.shortLabel}</button>
          `).join('')}
        </div>
        <input id="rpc-custom-url" class="rpc-input" type="url"
          style="display:${currentEp.id==='custom'?'block':'none'};margin-top:0.4rem"
          placeholder="https://…"
          value="${localStorage.getItem('rpc_custom_url')||''}">
      </div>

      <div class="rpc-block">
        <div class="rpc-block-label">Method</div>
        <div style="position:relative">
          <input id="rpc-search" class="rpc-input" type="text"
            autocomplete="off" autocorrect="off" spellcheck="false"
            placeholder="Search or type method…"
            value="">
          <div id="rpc-dd" class="rpc-dropdown" style="display:none"></div>
        </div>
        <div id="rpc-method-meta" style="display:none;margin-top:0.4rem"></div>
      </div>

      <div id="rpc-params-block" class="rpc-block" style="display:none">
        <div class="rpc-block-label">Parameters</div>
        <div id="rpc-param-fields"></div>
      </div>

      <button id="rpc-send" class="btn btn-accent btn-full rpc-send-btn" disabled>
        Make Call
      </button>

      <div id="rpc-result"></div>
      <div id="rpc-hist-wrap"></div>
    </div>
  `

  bindEpPills()
  bindSearch()

  // Restore last used method for this endpoint
  const saved = localStorage.getItem('rpc_method_'+currentEp.id)
  if (saved) {
    const m = currentEp.methods.find(x => x.m === saved)
    if (m) selectMethod(m)
  }

  document.getElementById('rpc-send').addEventListener('click', executeCall)
  renderHistory()
}

// ── Endpoint pills ────────────────────────────────────────────────
function bindEpPills() {
  document.getElementById('rpc-ep-pills')?.querySelectorAll('.rpc-ep-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const ep = ENDPOINTS.find(e => e.id === pill.dataset.epid)
      if (!ep) return
      currentEp   = ep
      currentMeta = null
      paramValues = {}
      localStorage.setItem('rpc_ep_id', ep.id)

      document.querySelectorAll('.rpc-ep-pill').forEach(p =>
        p.classList.toggle('active', p.dataset.epid === ep.id))

      const customInput = document.getElementById('rpc-custom-url')
      if (customInput) customInput.style.display = ep.id === 'custom' ? 'block' : 'none'

      const searchEl = document.getElementById('rpc-search')
      if (searchEl) searchEl.value = ''
      clearMethod()
      updateBtn()
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })

  document.getElementById('rpc-custom-url')?.addEventListener('input', e => {
    localStorage.setItem('rpc_custom_url', e.target.value)
    updateBtn()
  })
}

// ── Search + dropdown ─────────────────────────────────────────────
function bindSearch() {
  const input = document.getElementById('rpc-search')
  const dd    = document.getElementById('rpc-dd')

  input?.addEventListener('focus', () => showDropdown(input.value))
  input?.addEventListener('input', () => showDropdown(input.value))

  // Close on outside tap
  document.addEventListener('pointerdown', e => {
    if (input && !input.contains(e.target) && dd && !dd.contains(e.target))
      dd.style.display = 'none'
  }, { capture: true, passive: true })
}

function showDropdown(query) {
  const dd = document.getElementById('rpc-dd')
  if (!dd) return
  const q = query.trim().toLowerCase()
  const methods = currentEp.methods

  const filtered = q
    ? methods.filter(m => m.m.toLowerCase().includes(q) || m.cat.toLowerCase().includes(q))
    : methods

  if (!filtered.length) { dd.style.display = 'none'; return }

  // Group by category
  const groups = {}
  filtered.forEach(m => { (groups[m.cat] = groups[m.cat] || []).push(m) })

  dd.innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="rpc-dd-cat">${cat}</div>
    ${items.map(item => `
      <div class="rpc-dd-item${currentMeta?.m===item.m?' selected':''}" data-m="${item.m}">
        <span class="rpc-dd-name">${item.m}</span>
        <span class="rpc-dd-badge${item.params.length===0?' zero':''}">
          ${item.params.length===0 ? 'no params' :
            item.params.filter(p=>p.required).length+'+ args'}
        </span>
      </div>
    `).join('')}
  `).join('')
  dd.style.display = 'block'

  dd.querySelectorAll('.rpc-dd-item').forEach(row => {
    row.addEventListener('pointerdown', e => {
      e.preventDefault()
      const m = currentEp.methods.find(x => x.m === row.dataset.m)
      if (m) selectMethod(m)
      dd.style.display = 'none'
    })
  })
}

// ── Method selection ──────────────────────────────────────────────
function selectMethod(m) {
  currentMeta = m
  paramValues = {}
  localStorage.setItem('rpc_method_'+currentEp.id, m.m)

  const searchEl = document.getElementById('rpc-search')
  if (searchEl) searchEl.value = m.m

  // Category + quick info badge
  const metaEl = document.getElementById('rpc-method-meta')
  if (metaEl) {
    metaEl.style.display = 'flex'
    metaEl.innerHTML = `
      <span class="rpc-cat-badge">${m.cat}</span>
      <span style="font-size:0.72rem;color:var(--text3)">
        ${m.params.filter(p=>p.required).length} required
        · ${m.params.filter(p=>!p.required).length} optional
      </span>
    `
  }

  // Param fields
  const block  = document.getElementById('rpc-params-block')
  const fields = document.getElementById('rpc-param-fields')
  if (!block || !fields) { updateBtn(); return }

  if (m.params.length === 0) {
    block.style.display = 'none'
    fields.innerHTML = ''
  } else {
    block.style.display = 'block'
    fields.innerHTML = m.params.map((p, i) => `
      <div class="rpc-param-row">
        <div class="rpc-param-header">
          <span class="rpc-param-name">${p.name}</span>
          <span class="rpc-param-badge ${p.required ? 'req' : 'opt'}">${p.required ? 'required' : 'optional'}</span>
        </div>
        <div class="rpc-param-hint">${p.label}</div>
        ${p.type === 'json'
          ? `<textarea class="rpc-input rpc-pf" data-name="${p.name}" data-req="${p.required}"
               rows="3" placeholder="Enter JSON…" spellcheck="false"></textarea>`
          : `<input class="rpc-input rpc-pf" data-name="${p.name}" data-req="${p.required}"
               type="text" placeholder="${p.type==='hex'||p.type==='hash' ? '0x…' : p.type==='bool' ? 'true / false' : '…'}">`
        }
      </div>
    `).join('')

    fields.querySelectorAll('.rpc-pf').forEach(f => {
      f.addEventListener('input', () => {
        paramValues[f.dataset.name] = f.value.trim()
        updateBtn()
      })
    })
  }

  updateBtn()
}

function clearMethod() {
  currentMeta = null
  document.getElementById('rpc-method-meta').style.display = 'none'
  document.getElementById('rpc-params-block').style.display = 'none'
  document.getElementById('rpc-param-fields').innerHTML = ''
}

// ── Send button state ─────────────────────────────────────────────
function updateBtn() {
  const btn = document.getElementById('rpc-send')
  if (!btn) return
  if (!currentMeta) { btn.disabled = true; return }

  const required = currentMeta.params.filter(p => p.required)
  const allFilled = required.every(p => (paramValues[p.name]||'').length > 0)
  const hasUrl = currentEp.id !== 'custom' || (localStorage.getItem('rpc_custom_url')||'').length > 5

  btn.disabled = !(allFilled && hasUrl)
}

// ── Execute ───────────────────────────────────────────────────────
async function executeCall() {
  if (!currentMeta) return
  const btn = document.getElementById('rpc-send')
  const resEl = document.getElementById('rpc-result')
  btn.disabled = true
  btn.textContent = '…'

  // Build params
  let params
  if (currentMeta.params.length === 0) {
    params = currentEp.rpcType === 'fiber' ? {} : []
  } else {
    const arr = currentMeta.params.map(p => {
      const raw = (paramValues[p.name]||'').trim()
      if (!raw) return undefined
      if (p.type === 'json' || p.type === 'bool') {
        try { return JSON.parse(raw) } catch { return raw }
      }
      return raw
    })
    // Trim trailing undefined (unfilled optional)
    while (arr.length && arr[arr.length-1] === undefined) arr.pop()
    params = arr.map(v => v === undefined ? null : v)
  }

  const url = currentEp.id === 'custom'
    ? (localStorage.getItem('rpc_custom_url')||'')
    : currentEp.url

  const t0 = Date.now()
  let entry
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc:'2.0', id: Date.now(), method: currentMeta.m, params }),
    })
    const j = await r.json()
    entry = { url, method:currentMeta.m, params, result:j.result??j, error:j.error, ok:!j.error, ms:Date.now()-t0 }
  } catch(err) {
    entry = { url, method:currentMeta.m, params, result:null, error:{message:err.message}, ok:false, ms:Date.now()-t0 }
  }

  rpcHistory.unshift(entry)
  if (rpcHistory.length > 20) rpcHistory.pop()

  renderResult(resEl, entry)
  renderHistory()

  btn.textContent = 'Make Call'
  updateBtn()
}

// ── Result display ────────────────────────────────────────────────
function renderResult(el, entry) {
  if (!el) return
  const json  = JSON.stringify(entry.error || entry.result, null, 2)
  const lines = json.split('\n').length
  const trim  = lines > 25

  el.innerHTML = `
    <div class="rpc-result ${entry.ok?'ok':'err'}">
      <div class="rpc-result-hdr">
        <span class="${entry.ok?'rpc-ok':'rpc-err'}">${entry.ok?'✓ OK':'✗ Error'} · ${entry.ms}ms</span>
        <div style="display:flex;gap:0.35rem">
          ${trim?`<button class="rpc-tiny-btn" id="rpc-expand">Expand</button>`:''}
          <button class="rpc-tiny-btn" id="rpc-copy">Copy</button>
        </div>
      </div>
      <pre class="rpc-pre${trim?' trimmed':''}">${esc(json)}</pre>
    </div>
  `
  document.getElementById('rpc-copy')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(json)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
  })
  document.getElementById('rpc-expand')?.addEventListener('click', e => {
    el.querySelector('.rpc-pre')?.classList.remove('trimmed')
    e.target.remove()
  })
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// ── History ───────────────────────────────────────────────────────
function renderHistory() {
  const wrap = document.getElementById('rpc-hist-wrap')
  if (!wrap || !rpcHistory.length) { if(wrap) wrap.innerHTML=''; return }
  wrap.innerHTML = `
    <div class="rpc-block">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="rpc-block-label">History</div>
        <button class="rpc-tiny-btn" id="rpc-clr">Clear</button>
      </div>
      ${rpcHistory.slice(0,10).map((h,i)=>`
        <div class="rpc-hist-row" data-i="${i}">
          <span class="rpc-hist-m">${h.method}</span>
          <span class="rpc-hist-s ${h.ok?'ok':'err'}">${h.ok?'✓':'✗'} ${h.ms}ms</span>
        </div>
      `).join('')}
    </div>
  `
  document.getElementById('rpc-clr')?.addEventListener('click', () => {
    rpcHistory = []; renderHistory()
  })
  wrap.querySelectorAll('.rpc-hist-row').forEach(row => {
    row.addEventListener('click', () => {
      const h = rpcHistory[row.dataset.i]
      if (!h) return
      const m = currentEp.methods.find(x => x.m === h.method)
      if (m) selectMethod(m)
      renderResult(document.getElementById('rpc-result'), h)
    })
  })
}

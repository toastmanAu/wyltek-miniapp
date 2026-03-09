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

// ── Clipboard ─────────────────────────────────────────────────────
const CLIP_KEY    = 'rpc_clipboard_v1'
const CLIP_SLOTS  = 8

function loadClip() {
  try { return JSON.parse(localStorage.getItem(CLIP_KEY)) || Array(CLIP_SLOTS).fill(null) }
  catch { return Array(CLIP_SLOTS).fill(null) }
}
function saveClip(slots) {
  localStorage.setItem(CLIP_KEY, JSON.stringify(slots))
}
function autoLabel(val) {
  if (!val) return 'empty'
  const s = String(val)
  if (/^0x[0-9a-f]{64}$/i.test(s)) return 'hash'
  if (/^0x[0-9a-f]{63}$/i.test(s)) return 'pubkey'
  if (/^ckb1[a-z0-9]{60,}/i.test(s)) return 'addr'
  if (/^ckt1[a-z0-9]{60,}/i.test(s)) return 'testnet-addr'
  if (/^0x[0-9a-f]{1,16}$/.test(s)) return 'hex'
  if (/^\d+$/.test(s)) return 'number'
  if (s.startsWith('{') || s.startsWith('[')) return 'json'
  return 'value'
}
function clipSlotShort(slot) {
  if (!slot) return '—'
  const v = String(slot.value)
  return v.length > 22 ? v.slice(0,10)+'…'+v.slice(-6) : v
}

function renderClipboard() {
  const wrap = document.getElementById('rpc-clip-wrap')
  if (!wrap) return
  const slots = loadClip()
  const filled = slots.filter(Boolean).length

  wrap.innerHTML = `
    <div class="rpc-block rpc-clip-block">
      <div class="rpc-clip-hdr" id="rpc-clip-toggle">
        <div class="rpc-block-label">📋 Clipboard <span class="rpc-clip-count">(${filled}/${CLIP_SLOTS})</span></div>
        <span class="rpc-clip-chevron" id="rpc-clip-chev">▾</span>
      </div>
      <div class="rpc-clip-tray" id="rpc-clip-tray" style="display:none">
        ${slots.map((slot, i) => `
          <div class="rpc-clip-slot${slot?' filled':' empty'}" data-slot="${i}">
            <div class="rpc-clip-slot-meta">
              <span class="rpc-clip-slot-num">${i+1}</span>
              <span class="rpc-clip-slot-label">${slot ? slot.label : 'empty'}</span>
            </div>
            <div class="rpc-clip-slot-val">${clipSlotShort(slot)}</div>
            ${slot ? `<div class="rpc-clip-slot-actions">
              <button class="rpc-clip-btn use" data-slot="${i}" title="Copy to clipboard">Copy</button>
              <button class="rpc-clip-btn paste" data-slot="${i}" title="Paste into current param field">Paste</button>
              <button class="rpc-clip-btn clr" data-slot="${i}" title="Clear">✕</button>
            </div>` : `<div class="rpc-clip-slot-actions">
              <button class="rpc-clip-btn save-here" data-slot="${i}">Save here</button>
            </div>`}
          </div>
        `).join('')}
        <button class="rpc-tiny-btn rpc-clip-clear-all" id="rpc-clip-clear-all">Clear all</button>
      </div>
    </div>
  `

  // Toggle tray
  const tray = document.getElementById('rpc-clip-tray')
  const chev = document.getElementById('rpc-clip-chev')
  const open = localStorage.getItem('rpc_clip_open') === '1'
  if (open) { tray.style.display = 'block'; chev.textContent = '▴' }

  document.getElementById('rpc-clip-toggle')?.addEventListener('click', () => {
    const visible = tray.style.display !== 'none'
    tray.style.display = visible ? 'none' : 'block'
    chev.textContent = visible ? '▾' : '▴'
    localStorage.setItem('rpc_clip_open', visible ? '0' : '1')
  })

  // Copy slot value to system clipboard
  wrap.querySelectorAll('.rpc-clip-btn.use').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const slots = loadClip()
      const slot = slots[btn.dataset.slot]
      if (!slot) return
      navigator.clipboard?.writeText(slot.value)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
      btn.textContent = '✓'
      setTimeout(() => { btn.textContent = 'Copy' }, 1200)
    })
  })

  // Paste into focused param field
  wrap.querySelectorAll('.rpc-clip-btn.paste').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const slots = loadClip()
      const slot = slots[btn.dataset.slot]
      if (!slot) return
      // Find the focused or last-touched param field
      const fields = document.querySelectorAll('.rpc-pf')
      const focused = [...fields].find(f => f === document.activeElement) || fields[fields.length-1]
      if (focused) {
        focused.value = slot.value
        focused.dispatchEvent(new Event('input'))
        window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
      }
    })
  })

  // Clear a slot
  wrap.querySelectorAll('.rpc-clip-btn.clr').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const slots = loadClip()
      slots[btn.dataset.slot] = null
      saveClip(slots)
      renderClipboard()
    })
  })

  // Save pending value to a specific empty slot
  wrap.querySelectorAll('.rpc-clip-btn.save-here').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const pending = window._rpcClipPending
      if (!pending) return
      const slots = loadClip()
      slots[btn.dataset.slot] = { value: pending.value, label: pending.label }
      saveClip(slots)
      delete window._rpcClipPending
      renderClipboard()
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    })
  })

  // Clear all
  document.getElementById('rpc-clip-clear-all')?.addEventListener('click', e => {
    e.stopPropagation()
    saveClip(Array(CLIP_SLOTS).fill(null))
    renderClipboard()
  })
}

// Show save-to-slot picker — called when user taps Copy on a result
function clipSavePrompt(value, label) {
  window._rpcClipPending = { value, label }
  const slots = loadClip()
  const tray = document.getElementById('rpc-clip-tray')
  if (!tray) return

  // Open tray and scroll to it
  tray.style.display = 'block'
  document.getElementById('rpc-clip-chev').textContent = '▴'
  localStorage.setItem('rpc_clip_open', '1')
  tray.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

  // Highlight empty slots as targets; mark pending
  tray.querySelectorAll('.rpc-clip-slot.empty .save-here').forEach(btn => {
    btn.textContent = '← Save here'
    btn.style.background = 'var(--accent)'
    btn.style.color = '#000'
  })
  // Also allow overwriting filled slots via long-press (handled via contextmenu/pointerdown)
  tray.querySelectorAll('.rpc-clip-slot.filled').forEach(slotEl => {
    slotEl.title = 'Long-press to overwrite with pending value'
    slotEl.addEventListener('pointerdown', function onDown(e) {
      const timer = setTimeout(() => {
        const i = slotEl.dataset.slot
        const slots = loadClip()
        const pending = window._rpcClipPending
        if (pending) {
          slots[i] = { value: pending.value, label: pending.label }
          saveClip(slots)
          delete window._rpcClipPending
          renderClipboard()
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
        }
        slotEl.removeEventListener('pointerdown', onDown)
      }, 600)
      slotEl.addEventListener('pointerup', () => clearTimeout(timer), { once: true })
      slotEl.addEventListener('pointercancel', () => clearTimeout(timer), { once: true })
    })
  })
}

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
      <div id="rpc-clip-wrap"></div>
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
  renderClipboard()
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

// ── Hex decoder ───────────────────────────────────────────────────
// Returns a human-readable annotation for a hex string, or null if not a number
function hexAnnotation(hex) {
  // Must be 0x + 1–16 hex digits (64-bit max) to be a "number" hex
  // Skip 32+ char hashes (0x + 64 chars) — those are hashes not numbers
  if (!/^0x[0-9a-fA-F]{1,16}$/.test(hex)) return null
  const n = BigInt(hex)
  // If > 1e18 it's probably Shannon (CKB shannons = CKB * 1e8)
  const CKB_SHANNON = 100_000_000n
  const annotations = []

  // Always show decimal
  const dec = n.toString()
  annotations.push(dec)

  // If large enough to be CKB capacity (> 6100 CKB = 610_000_000_000 shannon)
  if (n >= 610_000_000_000n) {
    const ckb = (Number(n) / 1e8).toLocaleString('en-AU', { maximumFractionDigits: 4 })
    annotations.push(`${ckb} CKB`)
  }
  // Block numbers — reasonable range
  else if (n > 1000n && n < 100_000_000n) {
    annotations.push(`block ~${Number(n).toLocaleString()}`)
  }

  return annotations.join(' · ')
}

// Annotate JSON string: replace hex number values with hex + decoded inline
function annotateHex(jsonStr) {
  // Annotate BEFORE escaping — match raw "0x..." string values in JSON
  // Then escape the whole thing, but protect our annotation spans
  const annotated = jsonStr.replace(
    /"(0x[0-9a-fA-F]{1,16})"/g,
    (match, hex) => {
      const ann = hexAnnotation(hex)
      if (!ann) return match
      // Use a placeholder to survive esc(), replace after
      return `"${hex}"\x00ANN\x00${ann}\x00ENDANN\x00`
    }
  )
  // Now escape HTML entities
  const escaped = esc(annotated)
  // Restore annotation spans
  return escaped.replace(
    /\x00ANN\x00([^\x00]*)\x00ENDANN\x00/g,
    (_, ann) => `<span class="rpc-hex-ann">${esc(ann)}</span>`
  )
}

// Strip surrounding JSON quotes from a string value (for clean copy/paste into params)
function cleanForCopy(val) {
  if (typeof val === 'string') return val
  const s = String(val)
  // If it's a JSON-quoted string like "0x..." → strip the quotes
  if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
    try { return JSON.parse(s) } catch {}
  }
  return s
}
function renderResult(el, entry) {
  if (!el) return
  const json  = JSON.stringify(entry.error || entry.result, null, 2)
  const lines = json.split('\n').length
  const trim  = lines > 25

  // Toggle state for hex decode
  let hexDecoded = true

  el.innerHTML = `
    <div class="rpc-result ${entry.ok?'ok':'err'}">
      <div class="rpc-result-hdr">
        <span class="${entry.ok?'rpc-ok':'rpc-err'}">${entry.ok?'✓ OK':'✗ Error'} · ${entry.ms}ms</span>
        <div style="display:flex;gap:0.35rem">
          <button class="rpc-tiny-btn rpc-hex-toggle" id="rpc-hex-toggle" title="Toggle hex/decimal annotations">Dec ✓</button>
          ${trim?`<button class="rpc-tiny-btn" id="rpc-expand">Expand</button>`:''}
          <button class="rpc-tiny-btn" id="rpc-copy">Copy</button>
        </div>
      </div>
      <pre class="rpc-pre${trim?' trimmed':''}" id="rpc-pre-out">${annotateHex(json)}</pre>
    </div>
  `

  // Hex toggle
  document.getElementById('rpc-hex-toggle')?.addEventListener('click', e => {
    hexDecoded = !hexDecoded
    const pre = document.getElementById('rpc-pre-out')
    if (pre) pre.innerHTML = hexDecoded ? annotateHex(json) : esc(json)
    e.target.textContent = hexDecoded ? 'Dec ✓' : 'Dec'
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
  })

  document.getElementById('rpc-copy')?.addEventListener('click', () => {
    // If result is a plain string, copy without JSON quotes
    const copyText = entry.result !== null && entry.result !== undefined
      ? cleanForCopy(typeof entry.result === 'string' ? entry.result : json)
      : json
    navigator.clipboard?.writeText(copyText)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    // Offer to save to clipboard tray (also clean)
    const label = autoLabel(copyText)
    clipSavePrompt(copyText, label)
    const copyBtn = document.getElementById('rpc-copy')
    if (copyBtn) { copyBtn.textContent = '✓ Saved?'; setTimeout(()=>{ copyBtn.textContent='Copy' },1500) }
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

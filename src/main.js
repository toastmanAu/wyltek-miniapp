/**
 * Wyltek Industries — Telegram Mini App
 * main.js — dual-level nav: 5 primary tabs + sub-tabs per section
 */

import './style.css'
import { initTransitions } from './transition.js'
import { initParticles, initRipple, initHeroShimmer, injectLiveDotCSS, stopBlockPulse } from './vfx.js'
import { initJoyID, authWithJoyID, cancelAuth } from './auth.js'

// ── Lazy tab renderers ────────────────────────────────────────────
const renderers = {
  // Home (standalone, no sub-tabs)
  'home':         () => import('./tabs/splash.js').then(m => m.renderSplash),
  // Chain section
  'chain.ckb':    () => import('./tabs/chain.js').then(m => m.renderCKBTab),
  'chain.btc':    () => import('./tabs/chain.js').then(m => m.renderBTCTab),
  'chain.fiber':  () => import('./tabs/fiber.js').then(m => m.renderFiber),
  'chain.rpc':    () => import('./tabs/rpc-console.js').then(m => m.renderRPCConsole),
  // Tools section
  'tools.home':   () => import('./tabs/home.js').then(m => m.renderHome),
  'tools.wallet': () => import('./tabs/wallet.js').then(m => m.renderWallet),
  'tools.mint':   () => import('./tabs/mint.js').then(m => m.renderMint),
  // Social section
  'social.lounge':  () => import('./tabs/lounge.js').then(m => m.renderLounge),
  'social.members': () => import('./tabs/members.js').then(m => m.renderMembers),
  // Research section
  'research.browse': () => import('./tabs/research.js').then(m => m.renderResearch),
  'research.queue':  () => import('./tabs/research-queue.js').then(m => m.renderQueue),
  // Settings section
  'settings.node':   () => import('./tabs/settings.js').then(m => m.renderSettings),
  'settings.about':  () => import('./tabs/about.js').then(m => m.renderAbout),
}

// ── Sub-nav definitions ───────────────────────────────────────────
const SUB_TABS = {
  home: [],   // no sub-tabs — full-page splash
  chain: [
    { id: 'chain.ckb',   icon: '⚡', label: 'CKB',     color: 'var(--accent)' },
    { id: 'chain.btc',   icon: '₿',  label: 'Bitcoin',  color: '#f7931a' },
    { id: 'chain.fiber', icon: '🌐', label: 'Fiber',    color: 'var(--purple)' },
    { id: 'chain.rpc',   icon: '🔌', label: 'RPC',      color: 'var(--green)' },
  ],
  tools: [
    { id: 'tools.home',   icon: '🏠', label: 'Overview', color: 'var(--accent)' },
    { id: 'tools.wallet', icon: '💳', label: 'Wallet',   color: 'var(--green)' },
    { id: 'tools.mint',   icon: '🎨', label: 'Mint DOB', color: 'var(--purple)' },
  ],
  social: [
    { id: 'social.lounge',  icon: '💬', label: 'Lounge',  color: 'var(--green)' },
    { id: 'social.members', icon: '👾', label: 'Members', color: 'var(--accent2)' },
  ],
  research: [
    { id: 'research.browse', icon: '📄', label: 'Findings', color: 'var(--purple)' },
    { id: 'research.queue',  icon: '📋', label: 'Queue',    color: 'var(--orange)' },
  ],
  settings: [
    { id: 'settings.node',  icon: '🔗', label: 'Node',  color: 'var(--accent)' },
    { id: 'settings.about', icon: 'ℹ️', label: 'About', color: 'var(--text2)' },
  ],
}

// Default sub-tab for each primary tab
const DEFAULT_SUB = {
  home:     'home',
  chain:    'chain.ckb',
  tools:    'tools.home',
  social:   'social.lounge',
  research: 'research.browse',
  settings: 'settings.node',
}

// ── Telegram init ─────────────────────────────────────────────────
const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()
  tg.expand()
  tg.enableClosingConfirmation()
  tg.disableVerticalSwipes()   // prevent accidental close on scroll
  document.documentElement.style.setProperty('--bg', tg.themeParams.bg_color || '#07090f')

  // Pause live polls when app is backgrounded, resume when foregrounded
  tg.onEvent('deactivated', () => {
    import('./vfx.js').then(m => m.stopBlockPulse())
  })
  tg.onEvent('activated', () => {
    // If we have a pending auth token, do an immediate poll on resume
    // (interval may have been suspended while TG WebView was backgrounded)
    const pendingToken = window._joyidPendingToken
    if (pendingToken && !state.address) {
      fetch(`https://wyltek-rpc.toastman-one.workers.dev/joyid-poll?token=${pendingToken}`)
        .then(r => r.json())
        .then(data => {
          if (data.address) {
            state.address = data.address
            localStorage.setItem('wyltek_address', data.address)
            updateAuthUI()
            tg?.HapticFeedback?.notificationOccurred('success')
            window._joyidPendingToken = null
          }
        })
        .catch(() => {})
    }
  })
}

// ── App state ─────────────────────────────────────────────────────
export const state = {
  primary: 'chain',
  sub:     'chain.ckb',
  address: null,
  tgUser:  tg?.initDataUnsafe?.user || null,
}

// ── DOM refs ──────────────────────────────────────────────────────
const content  = document.getElementById('tab-content')
const subNavEl = document.getElementById('sub-nav')

// ── Sub-nav renderer ──────────────────────────────────────────────
function renderSubNav(primaryTab, activeSub) {
  const tabs = SUB_TABS[primaryTab] || []
  const header = document.getElementById('app-header')

  if (tabs.length <= 1) {
    subNavEl.innerHTML = ''
    subNavEl.classList.remove('visible')
    header.classList.remove('has-subnav')
    return
  }

  subNavEl.classList.add('visible')
  header.classList.add('has-subnav')
  subNavEl.innerHTML = tabs.map(t => `
    <button class="sub-tab-btn ${t.id === activeSub ? 'active' : ''}"
      data-sub="${t.id}"
      style="--sub-color:${t.color}">
      <span class="sub-tab-icon">${t.icon}</span>
      <span class="sub-tab-label">${t.label}</span>
    </button>
  `).join('')

  subNavEl.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.dataset.sub
      if (subId === state.sub) return
      navigateSub(subId)
      tg?.HapticFeedback?.selectionChanged()
    })
  })
}

// ── Navigation ────────────────────────────────────────────────────
export async function navigate(subId) {
  // Accept either a full sub-id "chain.ckb" or primary "chain"
  if (!subId.includes('.')) {
    subId = DEFAULT_SUB[subId] || subId
  }
  await navigateSub(subId)
}

async function navigateSub(subId) {
  const [primary] = subId.split('.')
  state.primary = primary
  state.sub     = subId

  // Update primary nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === primary)
  })

  // Home button in header — show on all non-home pages
  const homeBtn = document.getElementById('home-btn')
  if (homeBtn) {
    homeBtn.classList.toggle('at-home', primary === 'home')
  }

  // Update sub-nav
  renderSubNav(primary, subId)

  // Stop any running effects from previous tab
  stopBlockPulse()

  // Render content
  content.innerHTML = '<div class="spinner"></div>'
  try {
    const getRenderer = renderers[subId]
    if (!getRenderer) throw new Error(`No renderer for ${subId}`)
    const renderFn = await getRenderer()
    await renderFn(content, state)
    // Stagger animate children
    content.classList.remove('stagger')
    void content.offsetWidth
    content.classList.add('stagger')
  } catch (err) {
    content.innerHTML = `<div class="empty-state">
      <div class="icon">⚠️</div>
      <p>${err.message || 'Something went wrong'}</p>
    </div>`
    console.error('[navigate]', subId, err)
  }
}

// Primary nav clicks
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const primary = btn.dataset.tab
    if (primary === state.primary) {
      // Re-tap same section → go to default sub
      navigate(DEFAULT_SUB[primary])
    } else {
      navigate(primary)
    }
    tg?.HapticFeedback?.selectionChanged()
  })
})

// ── Auth ──────────────────────────────────────────────────────────
const authBadge = document.getElementById('auth-badge')
const authLabel = document.getElementById('auth-label')

async function updateAuthUI() {
  if (state.address) {
    authLabel.textContent = state.address.slice(0,10) + '…' + state.address.slice(-6)
    authBadge.classList.add('connected')
  } else {
    authLabel.textContent = 'Connect'
    authBadge.classList.remove('connected')
  }
}

authBadge.addEventListener('click', async () => {
  if (state.address) {
    tg?.showPopup({
      title: 'Connected',
      message: state.address,
      buttons: [
        { id: 'copy', type: 'default', text: 'Copy Address' },
        { id: 'dc',   type: 'destructive', text: 'Disconnect' },
        { id: 'x',    type: 'cancel' },
      ]
    }, (id) => {
      if (id === 'dc') {
        state.address = null
        localStorage.removeItem('wyltek_address')
        updateAuthUI()
        navigate(state.sub)
      }
    })
    return
  }
  authLabel.textContent = 'Waiting…'
  authWithJoyID(
    // onSuccess — called when Worker relay delivers the address
    (address) => {
      state.address = address
      updateAuthUI()
      tg?.HapticFeedback?.notificationOccurred('success')
    },
    // onError
    (err) => {
      console.warn('[main] Auth error:', err.message)
      authLabel.textContent = 'Connect'
    }
  )
})

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
  // Check for JoyID auth result in URL hash (set by Worker callback redirect)
  // Worker redirects to wyltek-miniapp.pages.dev/#jauth_<base64url-address>
  const hash = location.hash || ''
  const jauthParam = tg?.initDataUnsafe?.start_param || ''
  const jauthRaw = hash.startsWith('#jauth_') ? hash.slice(7)
                 : jauthParam.startsWith('jauth_') ? jauthParam.slice(6)
                 : null
  if (jauthRaw) {
    try {
      const b64 = jauthRaw.replace(/-/g, '+').replace(/_/g, '/')
      const address = atob(b64)
      if (address.startsWith('ckb1') || address.startsWith('ckt1')) {
        localStorage.setItem('wyltek_address', address)
        console.log('[boot] JoyID auth from hash/startapp:', address)
        cancelAuth()
        // Clean hash from URL
        history.replaceState(null, '', location.pathname)
      }
    } catch (e) {
      console.warn('[boot] Failed to decode jauth param:', e.message)
    }
  }

  const saved = localStorage.getItem('wyltek_address')
  if (saved) state.address = saved

  await initJoyID()
  await updateAuthUI()

  // VFX
  injectLiveDotCSS()
  initParticles()
  initRipple()
  initHeroShimmer()

  // Transitions — wire tool-btn[data-tab] clicks
  initTransitions(navigate)

  // Logo easter egg on home page, home button everywhere else
  document.getElementById('home-btn')?.addEventListener('click', () => {
    if (state.primary === 'home') {
      // On home — easter egg
      const logo = document.querySelector('.logo-mark')
      if (!logo) return
      logo.classList.remove('glitch')
      void logo.offsetWidth
      logo.classList.add('glitch')
      tg?.HapticFeedback?.impactOccurred('heavy')
      spawnBurst(logo.getBoundingClientRect())
    } else {
      // Anywhere else — go home
      navigate('home')
      tg?.HapticFeedback?.impactOccurred('light')
    }
  })

  // Deeplink: ?startapp=chain.ckb or ?startapp=chain
  const startParam = tg?.initDataUnsafe?.start_param || ''
  const startSub   = renderers[startParam]   ? startParam
                   : DEFAULT_SUB[startParam] ? DEFAULT_SUB[startParam]
                   : 'home'

  await navigate(startSub)
  initFeedbackButton()
}

function spawnBurst(rect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top  + rect.height / 2
  for (let i = 0; i < 12; i++) {
    const dot   = document.createElement('div')
    const angle = (i / 12) * Math.PI * 2
    const dist  = 30 + Math.random() * 40
    dot.style.cssText = `
      position:fixed;z-index:999;border-radius:50%;
      width:5px;height:5px;
      background:hsl(${185+Math.random()*40},100%,65%);
      left:${cx}px;top:${cy}px;pointer-events:none;
      transition:transform ${0.4+Math.random()*0.3}s ease-out,opacity 0.5s ease-out;
    `
    document.body.appendChild(dot)
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`
      dot.style.opacity   = '0'
    })
    setTimeout(() => dot.remove(), 800)
  }
}

boot()

// ── Feedback button ───────────────────────────────────────────────
function initFeedbackButton() {
  // Inject persistent bug button
  const btn = document.createElement('button')
  btn.id = 'feedback-btn'
  btn.innerHTML = '🐛'
  btn.title = 'Send feedback'
  btn.setAttribute('aria-label', 'Send feedback')
  document.body.appendChild(btn)

  // Inject bottom sheet
  const sheet = document.createElement('div')
  sheet.id = 'feedback-sheet'
  sheet.innerHTML = `
    <div class="fb-sheet-inner">
      <div class="fb-handle"></div>
      <div class="fb-title">Send Feedback</div>
      <div class="fb-type-row">
        <button class="fb-type-btn active" data-type="bug">🐛 Bug</button>
        <button class="fb-type-btn" data-type="suggestion">💡 Idea</button>
        <button class="fb-type-btn lobster-btn" data-type="praise"><img src="https://wyltekindustries.com/kernel-avatar.png" alt="praise" style="width:1.1rem;height:1.1rem;vertical-align:middle;border-radius:3px;object-fit:cover;margin-right:0.25rem">Praise</button>
      </div>
      <textarea id="fb-message" class="fb-textarea"
        placeholder="Describe the bug, idea, or feedback…" rows="4"></textarea>
      <div class="fb-hint">Sent anonymously with your current tab + app version. Opens a GitHub issue.</div>
      <button id="fb-submit" class="btn btn-accent btn-full">Send</button>
      <div id="fb-status" class="fb-status"></div>
    </div>
  `
  document.body.appendChild(sheet)

  let selectedType = 'bug'
  let sheetOpen = false

  // Type buttons
  sheet.querySelectorAll('.fb-type-btn').forEach(b => {
    b.addEventListener('click', () => {
      sheet.querySelectorAll('.fb-type-btn').forEach(x => x.classList.remove('active'))
      b.classList.add('active')
      selectedType = b.dataset.type
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })

  // Open/close
  btn.addEventListener('click', () => {
    sheetOpen = !sheetOpen
    sheet.classList.toggle('open', sheetOpen)
    if (sheetOpen) {
      document.getElementById('fb-message')?.focus()
      document.getElementById('fb-status').textContent = ''
    }
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
  })

  // Close on backdrop tap
  sheet.addEventListener('click', e => {
    if (e.target === sheet) {
      sheetOpen = false
      sheet.classList.remove('open')
    }
  })

  // Submit
  document.getElementById('fb-submit').addEventListener('click', async () => {
    const msg = document.getElementById('fb-message').value.trim()
    if (!msg) return
    const submitBtn = document.getElementById('fb-submit')
    const statusEl  = document.getElementById('fb-status')
    submitBtn.disabled = true
    submitBtn.textContent = 'Sending…'
    statusEl.textContent = ''

    try {
      const res = await fetch('https://wyltek-rpc.toastman-one.workers.dev/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          message: msg,
          tab: state.sub || state.primary,
          tg_user_id:  String(state.tgUser?.id || ''),
          tg_username: state.tgUser?.username || '',
          app_version: '0.1.0',
        }),
      })
      const data = await res.json()
      if (data.ok) {
        document.getElementById('fb-message').value = ''
        statusEl.innerHTML = `✅ Thanks! <a href="${data.url}" target="_blank" style="color:var(--accent)">Issue #${data.issue_number}</a>`
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
        setTimeout(() => { sheetOpen = false; sheet.classList.remove('open') }, 2500)
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch(err) {
      statusEl.textContent = '❌ ' + err.message
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error')
    }
    submitBtn.disabled = false
    submitBtn.textContent = 'Send'
  })
}

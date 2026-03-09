/**
 * Wyltek Industries — Telegram Mini App
 * main.js — dual-level nav: 5 primary tabs + sub-tabs per section
 */

import './style.css'
import { initTransitions } from './transition.js'
import { initParticles, initRipple, initHeroShimmer, injectLiveDotCSS, stopBlockPulse } from './vfx.js'
import { initJoyID, authWithJoyID } from './auth.js'

// ── Lazy tab renderers ────────────────────────────────────────────
const renderers = {
  // Home (standalone, no sub-tabs)
  'home':         () => import('./tabs/splash.js').then(m => m.renderSplash),
  // Chain section
  'chain.ckb':    () => import('./tabs/chain.js').then(m => m.renderCKBTab),
  'chain.btc':    () => import('./tabs/chain.js').then(m => m.renderBTCTab),
  'chain.fiber':  () => import('./tabs/fiber.js').then(m => m.renderFiber),
  'chain.rpc':    () => import('./tabs/chain.js').then(m => m.renderRPCTab),
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
  document.documentElement.style.setProperty('--bg', tg.themeParams.bg_color || '#07090f')
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
  authLabel.textContent = '...'
  try {
    const addr = await authWithJoyID()
    if (addr) {
      state.address = addr
      localStorage.setItem('wyltek_address', addr)
      updateAuthUI()
      navigate(state.sub)
      tg?.HapticFeedback?.notificationOccurred('success')
    }
  } catch { authLabel.textContent = 'Connect' }
})

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
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

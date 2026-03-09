/**
 * Wyltek Industries — Telegram Mini App
 * main.js — app shell, routing, auth
 */

import './style.css'
import { initTransitions } from './transition.js'
import { initParticles, initRipple, initHeroShimmer, injectLiveDotCSS } from './vfx.js'
import { initJoyID, authWithJoyID, getConnectedAddress } from './auth.js'
import { renderHome }     from './tabs/home.js'
import { renderChain }    from './tabs/chain.js'
import { renderResearch } from './tabs/research.js'
import { renderLounge }   from './tabs/lounge.js'
import { renderMembers }  from './tabs/members.js'
import { renderSettings } from './tabs/settings.js'
import { renderFiber }    from './tabs/fiber.js'
import { renderMore }     from './tabs/more.js'

// ─── Telegram WebApp init ────────────────────────────────────────
const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()
  tg.expand()
  tg.enableClosingConfirmation()
  // Apply Telegram theme
  document.documentElement.style.setProperty('--bg', tg.themeParams.bg_color || '#07090f')
}

// ─── App state ───────────────────────────────────────────────────
export const state = {
  tab: 'home',
  address: null,           // CKB address after JoyID auth
  tgUser: tg?.initDataUnsafe?.user || null,
}

// ─── Tab registry ────────────────────────────────────────────────
const TABS = {
  home:     renderHome,
  chain:    renderChain,
  research: renderResearch,
  lounge:   renderLounge,
  more:     renderMore,
  // Sub-tabs (no nav highlight, accessible via More or deeplink)
  members:  renderMembers,
  fiber:    renderFiber,
  settings: renderSettings,
}

// Which nav button each tab belongs to (for active state)
const TAB_NAV = {
  home: 'home', chain: 'chain', research: 'research', lounge: 'lounge',
  more: 'more', members: 'more', fiber: 'more', settings: 'more',
}

// ─── Navigation ──────────────────────────────────────────────────
const content = document.getElementById('tab-content')

export async function navigate(tab) {
  state.tab = tab

  // Update nav — highlight the parent nav button
  const navOwner = TAB_NAV[tab] || tab
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === navOwner)
  })

  // Render tab
  content.innerHTML = '<div class="spinner"></div>'
  try {
    await TABS[tab](content, state)
    // Stagger animate the top-level children
    content.classList.remove('stagger')
    void content.offsetWidth
    content.classList.add('stagger')
  } catch (err) {
    content.innerHTML = `<div class="empty-state">
      <div class="icon">⚠️</div>
      <p>${err.message || 'Something went wrong'}</p>
    </div>`
  }
}

// Nav click handlers
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.tab))
})

// ─── Auth ────────────────────────────────────────────────────────
const authBadge  = document.getElementById('auth-badge')
const authLabel  = document.getElementById('auth-label')

async function updateAuthUI() {
  if (state.address) {
    const short = state.address.slice(0, 10) + '…' + state.address.slice(-6)
    authLabel.textContent = short
    authBadge.classList.add('connected')
  } else {
    authLabel.textContent = 'Connect'
    authBadge.classList.remove('connected')
  }
}

authBadge.addEventListener('click', async () => {
  if (state.address) {
    // Already connected — show options (future: disconnect, copy address)
    if (tg) {
      tg.showPopup({
        title: 'Connected',
        message: state.address,
        buttons: [
          { id: 'copy', type: 'default', text: 'Copy Address' },
          { id: 'disconnect', type: 'destructive', text: 'Disconnect' },
          { id: 'close', type: 'cancel' },
        ]
      }, (btnId) => {
        if (btnId === 'copy') {
          tg.HapticFeedback.impactOccurred('light')
        }
        if (btnId === 'disconnect') {
          state.address = null
          localStorage.removeItem('wyltek_address')
          updateAuthUI()
          navigate(state.tab)
        }
      })
    }
    return
  }

  // Trigger JoyID auth
  authLabel.textContent = '...'
  try {
    const addr = await authWithJoyID()
    if (addr) {
      state.address = addr
      localStorage.setItem('wyltek_address', addr)
      updateAuthUI()
      navigate(state.tab)
      tg?.HapticFeedback?.notificationOccurred('success')
    }
  } catch (err) {
    authLabel.textContent = 'Connect'
    console.error('[Auth]', err)
  }
})

// ─── Boot ────────────────────────────────────────────────────────
async function boot() {
  // Restore saved address
  const saved = localStorage.getItem('wyltek_address')
  if (saved) state.address = saved

  await initJoyID()
  await updateAuthUI()

  // VFX layer
  injectLiveDotCSS()
  initParticles()
  initRipple()
  initHeroShimmer()
  initTransitions(navigate)

  // Deeplink: t.me/WyltekIndustriesBot/app?startapp=chain
  const startParam = tg?.initDataUnsafe?.start_param || ''
  const validTabs  = Object.keys(TABS)
  const startTab   = validTabs.includes(startParam) ? startParam : 'home'

  await navigate(startTab)
  // Logo easter egg — tap for glitch + particle burst
  document.querySelector('.logo-mark')?.addEventListener('click', () => {
    const logo = document.querySelector('.logo-mark')
    if (!logo) return
    logo.classList.remove('glitch')
    void logo.offsetWidth
    logo.classList.add('glitch')
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy')
    spawnBurst(logo.getBoundingClientRect())
  })
}

function spawnBurst(rect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top  + rect.height / 2
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('div')
    const angle = (i / 12) * Math.PI * 2
    const dist  = 30 + Math.random() * 40
    dot.style.cssText = `
      position:fixed; z-index:999; border-radius:50%;
      width:5px; height:5px;
      background:hsl(${185 + Math.random()*40},100%,65%);
      left:${cx}px; top:${cy}px;
      pointer-events:none;
      transition: transform ${0.4+Math.random()*0.3}s ease-out, opacity 0.5s ease-out;
    `
    document.body.appendChild(dot)
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(0)`
      dot.style.opacity   = '0'
    })
    setTimeout(() => dot.remove(), 800)
  }
}

boot()

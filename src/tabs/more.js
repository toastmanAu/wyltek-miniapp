/**
 * More tab — hub for Members, Fiber, Settings, About
 */
import { navigate } from '../main.js'

export async function renderMore(el, state) {
  el.innerHTML = `
    <div class="section-header">Community</div>
    <div class="settings-group">
      <div class="settings-row" data-nav="members">
        <div class="settings-icon" style="background:rgba(59,130,246,0.1)">👾</div>
        <div class="settings-text">
          <div class="settings-label">Founding Members</div>
          <div class="settings-desc">50 Spore DOBs · CKB mainnet</div>
        </div>
        <div class="settings-chevron">›</div>
      </div>
      <div class="settings-row" data-nav="fiber">
        <div class="settings-icon" style="background:rgba(139,92,246,0.1)">⚡</div>
        <div class="settings-text">
          <div class="settings-label">Fiber Network</div>
          <div class="settings-desc">Channels · payments · routing</div>
        </div>
        <div class="settings-chevron">›</div>
      </div>
    </div>

    <div class="section-header">Settings</div>
    <div class="settings-group">
      <div class="settings-row" data-nav="settings">
        <div class="settings-icon" style="background:rgba(0,212,255,0.1)">⚙️</div>
        <div class="settings-text">
          <div class="settings-label">Node Config</div>
          <div class="settings-desc">RPC endpoint, mainnet/testnet</div>
        </div>
        <div class="settings-chevron">›</div>
      </div>
    </div>

    <div class="section-header">About</div>
    <div class="settings-group">
      <div class="settings-row" data-href="https://wyltekindustries.com">
        <div class="settings-icon" style="background:rgba(16,185,129,0.1)">🌐</div>
        <div class="settings-text">
          <div class="settings-label">wyltekindustries.com</div>
          <div class="settings-desc">Full site · research · members</div>
        </div>
        <div class="settings-chevron">↗</div>
      </div>
      <div class="settings-row" data-href="https://github.com/toastmanAu/wyltek-miniapp">
        <div class="settings-icon" style="background:rgba(255,255,255,0.05)">🐙</div>
        <div class="settings-text">
          <div class="settings-label">Open Source</div>
          <div class="settings-desc">github.com/toastmanAu/wyltek-miniapp</div>
        </div>
        <div class="settings-chevron">↗</div>
      </div>
      <div class="settings-row" data-href="https://t.me/NervosUnofficial">
        <div class="settings-icon" style="background:rgba(0,136,204,0.1)">📢</div>
        <div class="settings-text">
          <div class="settings-label">Nervos Unofficial</div>
          <div class="settings-desc">Community Telegram group</div>
        </div>
        <div class="settings-chevron">↗</div>
      </div>
    </div>

    <div style="text-align:center;padding:1rem;color:var(--text3);font-size:0.72rem">
      Wyltek Industries · Built on CKB
    </div>
  `

  el.querySelectorAll('[data-nav]').forEach(row => {
    row.addEventListener('click', () => {
      navigate(row.dataset.nav)
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    })
  })

  el.querySelectorAll('[data-href]').forEach(row => {
    row.addEventListener('click', () => {
      window.Telegram?.WebApp?.openLink(row.dataset.href)
    })
  })
}

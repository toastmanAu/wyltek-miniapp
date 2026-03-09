/**
 * tools/wallet.js — CKB wallet overview (balance, recent txs, address QR)
 */
export async function renderWallet(el, state) {
  if (!state.address) {
    el.innerHTML = `
      <div class="empty-state">
        <span class="icon">💳</span>
        <p style="margin-bottom:1rem">Connect your JoyID wallet to see your balance and transactions.</p>
        <button class="btn btn-accent" id="wallet-connect-btn">Connect JoyID</button>
      </div>
    `
    document.getElementById('wallet-connect-btn')?.addEventListener('click', () => {
      document.getElementById('auth-badge')?.click()
    })
    return
  }

  const short = state.address.slice(0, 20) + '…' + state.address.slice(-10)

  el.innerHTML = `
    <div class="hero-card">
      <div class="balance-label">CKB Balance</div>
      <div style="display:flex;align-items:baseline;gap:0.3rem">
        <span class="balance-big" id="wallet-balance">—</span>
        <span class="balance-unit">CKB</span>
      </div>
      <div class="hero-address">${state.address}</div>
      <div class="hero-actions">
        <button class="btn btn-ghost btn-sm" id="wallet-copy-btn">📋 Copy Address</button>
        <button class="btn btn-ghost btn-sm" onclick="window.Telegram?.WebApp?.openLink('https://explorer.nervos.org/address/${state.address}')">🔍 Explorer</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Recent Transactions</div>
      <div id="wallet-txs">
        <div style="text-align:center;padding:1rem;color:var(--text3);font-size:0.82rem">
          Requires Wyltek Light Client — configure in Settings → Node
        </div>
      </div>
    </div>
  `

  document.getElementById('wallet-copy-btn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(state.address)
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
  })
}

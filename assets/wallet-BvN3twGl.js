async function l(t,e){var s,a;if(!e.address){t.innerHTML=`
      <div class="empty-state">
        <span class="icon">💳</span>
        <p style="margin-bottom:1rem">Connect your JoyID wallet to see your balance and transactions.</p>
        <button class="btn btn-accent" id="wallet-connect-btn">Connect JoyID</button>
      </div>
    `,(s=document.getElementById("wallet-connect-btn"))==null||s.addEventListener("click",()=>{var n;(n=document.getElementById("auth-badge"))==null||n.click()});return}e.address.slice(0,20)+""+e.address.slice(-10),t.innerHTML=`
    <div class="hero-card">
      <div class="balance-label">CKB Balance</div>
      <div style="display:flex;align-items:baseline;gap:0.3rem">
        <span class="balance-big" id="wallet-balance">—</span>
        <span class="balance-unit">CKB</span>
      </div>
      <div class="hero-address">${e.address}</div>
      <div class="hero-actions">
        <button class="btn btn-ghost btn-sm" id="wallet-copy-btn">📋 Copy Address</button>
        <button class="btn btn-ghost btn-sm" onclick="window.Telegram?.WebApp?.openLink('https://explorer.nervos.org/address/${e.address}')">🔍 Explorer</button>
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
  `,(a=document.getElementById("wallet-copy-btn"))==null||a.addEventListener("click",()=>{var n,d,i,c;(n=navigator.clipboard)==null||n.writeText(e.address),(c=(i=(d=window.Telegram)==null?void 0:d.WebApp)==null?void 0:i.HapticFeedback)==null||c.notificationOccurred("success")})}export{l as renderWallet};

import{s as r}from"./supabase-B4HPT40D.js";import{n as c}from"./index-8bSl6CIM.js";async function m(e,t){var s,o,l;if(!t.address){e.innerHTML=`
      <div class="welcome-wrap">
        <img src="/wyltek-mark.png" class="welcome-logo" alt="Wyltek">
        <h1 class="welcome-title">Wyltek Industries</h1>
        <p class="welcome-sub">CKB tools, live node data, research and community — powered by real nodes.</p>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon fi-ckb">⚡</div>
            <div class="feature-text"><strong>Live Chain Stats</strong><span>CKB + BTC real-time data</span></div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-res">🔌</div>
            <div class="feature-text"><strong>RPC Console</strong><span>Fire raw JSON-RPC at any node</span></div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-btc">🌐</div>
            <div class="feature-text"><strong>Fiber Network</strong><span>Channels, routing, payments</span></div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-chat">💬</div>
            <div class="feature-text"><strong>Community Lounge</strong><span>Real-time chat with the ecosystem</span></div>
          </div>
          <div class="feature-item">
            <div class="feature-icon fi-nft">👾</div>
            <div class="feature-text"><strong>Founding Member DOBs</strong><span>50 Spore NFTs on CKB mainnet</span></div>
          </div>
        </div>
        <button class="btn btn-accent btn-full" id="connect-btn" style="font-size:1rem;padding:0.875rem">
          Connect with JoyID
        </button>
        <p style="color:var(--text3);font-size:0.75rem;margin-top:0.875rem;text-align:center">
          Passkey wallet · no seed phrase · no password
        </p>
      </div>
    `,(s=document.getElementById("connect-btn"))==null||s.addEventListener("click",()=>{var a;(a=document.getElementById("auth-badge"))==null||a.click()});return}const i=t.address.slice(0,14)+"…"+t.address.slice(-8);e.innerHTML=`
    <div class="hero-card">
      <div class="balance-label">CKB Balance</div>
      <div style="display:flex;align-items:baseline;gap:0.3rem">
        <span class="balance-big" id="ckb-balance">—</span>
        <span class="balance-unit">CKB</span>
      </div>
      <div class="hero-address">${i}</div>
      <div class="hero-actions">
        <button class="btn btn-ghost btn-sm" id="tools-wallet-btn">💳 Wallet</button>
        <button class="btn btn-ghost btn-sm" id="tools-mint-btn">🎨 My DOB</button>
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" id="member-num" style="color:var(--accent)">—</div>
        <div class="stat-chip-label">Member #</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val" id="dob-status">—</div>
        <div class="stat-chip-label">DOB</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--green)">✓</div>
        <div class="stat-chip-label">Connected</div>
      </div>
    </div>

    <div class="section-header">Quick Access</div>
    <div class="tool-grid">
      <button class="tool-btn" data-tab="chain.ckb" data-color="rgba(0,212,255,0.12)">
        <div class="tool-icon">⚡</div>
        <div class="tool-label">CKB</div>
        <div class="tool-sub">Live stats</div>
      </button>
      <button class="tool-btn" data-tab="chain.btc" data-color="rgba(247,147,26,0.12)">
        <div class="tool-icon">₿</div>
        <div class="tool-label">Bitcoin</div>
        <div class="tool-sub">Fees · mempool</div>
      </button>
      <button class="tool-btn" data-tab="chain.fiber" data-color="rgba(139,92,246,0.12)">
        <div class="tool-icon">🌐</div>
        <div class="tool-label">Fiber</div>
        <div class="tool-sub">Channels</div>
      </button>
      <button class="tool-btn" data-tab="social.lounge" data-color="rgba(16,185,129,0.12)">
        <div class="tool-icon">💬</div>
        <div class="tool-label">Lounge</div>
        <div class="tool-sub">Chat</div>
      </button>
      <button class="tool-btn" data-tab="research.browse" data-color="rgba(139,92,246,0.12)">
        <div class="tool-icon">🔬</div>
        <div class="tool-label">Research</div>
        <div class="tool-sub">Findings</div>
      </button>
      <button class="tool-btn" data-tab="chain.rpc" data-color="rgba(16,185,129,0.12)">
        <div class="tool-icon">🔌</div>
        <div class="tool-label">RPC</div>
        <div class="tool-sub">Console</div>
      </button>
    </div>
  `,(o=document.getElementById("tools-wallet-btn"))==null||o.addEventListener("click",()=>c("tools.wallet")),(l=document.getElementById("tools-mint-btn"))==null||l.addEventListener("click",()=>c("tools.mint")),e.querySelectorAll(".tool-btn[data-href]").forEach(a=>{a.addEventListener("click",()=>{var n,d;return(d=(n=window.Telegram)==null?void 0:n.WebApp)==null?void 0:d.openLink(a.dataset.href)})}),v(t)}async function v(e){try{const{data:t}=await r.from("mint_queue").select("member_number,spore_id").eq("ckb_address",e.address).single(),i=document.getElementById("member-num"),s=document.getElementById("dob-status");i&&(i.textContent=t!=null&&t.member_number?`#${t.member_number}`:"—"),s&&(s.textContent=t!=null&&t.spore_id?"✓":"0"),s&&(t!=null&&t.spore_id)&&(s.style.color="var(--green)")}catch{}}export{m as renderHome};

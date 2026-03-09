import{n as o}from"./index-CnO4aS20.js";async function p(a,l){var c;a.innerHTML=`
    <div class="splash-wrap">

      <!-- Hero -->
      <div class="splash-hero">
        <img src="/wyltek-mark.png" class="splash-logo" alt="Wyltek">
        <div class="splash-title">Wyltek Industries</div>
        <div class="splash-sub">CKB blockchain tools · live nodes · community</div>
      </div>

      <!-- Live ticker cards -->
      <div class="ticker-row" id="ticker-row">
        <div class="ticker-card ckb-card" id="ticker-ckb">
          <div class="ticker-label"><span class="live-dot"></span>CKB</div>
          <div class="ticker-value" id="ckb-tip">…</div>
          <div class="ticker-meta" id="ckb-peers">— peers</div>
        </div>
        <div class="ticker-card btc-card" id="ticker-btc">
          <div class="ticker-label" style="color:#f7931a"><span class="live-dot" style="background:#f7931a"></span>BTC</div>
          <div class="ticker-value" id="btc-tip">…</div>
          <div class="ticker-meta" id="btc-fees">— sat/vB</div>
        </div>
      </div>

      <!-- Section tiles -->
      <div class="splash-grid">
        <div class="splash-tile" data-nav="chain.ckb" style="--tile-color:var(--accent)">
          <div class="splash-tile-icon">⛓️</div>
          <div class="splash-tile-label">Chain</div>
          <div class="splash-tile-sub">CKB · BTC · Fiber · RPC</div>
        </div>
        <div class="splash-tile" data-nav="tools.home" style="--tile-color:var(--green)">
          <div class="splash-tile-icon">🔧</div>
          <div class="splash-tile-label">Tools</div>
          <div class="splash-tile-sub">Wallet · Mint DOB</div>
        </div>
        <div class="splash-tile" data-nav="social.lounge" style="--tile-color:#3b82f6">
          <div class="splash-tile-icon">💬</div>
          <div class="splash-tile-label">Social</div>
          <div class="splash-tile-sub">Lounge · Members</div>
        </div>
        <div class="splash-tile" data-nav="research.browse" style="--tile-color:var(--purple)">
          <div class="splash-tile-icon">🔬</div>
          <div class="splash-tile-label">Research</div>
          <div class="splash-tile-sub">Findings · Queue</div>
        </div>
      </div>

      ${l.address?`
      <!-- Connected wallet strip -->
      <div class="splash-wallet" id="splash-wallet">
        <div style="font-size:0.68rem;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:0.25rem">Connected</div>
        <div style="font-family:monospace;font-size:0.75rem;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${l.address}
        </div>
      </div>
      `:`
      <button class="btn btn-accent btn-full" id="splash-connect" style="margin-top:0.5rem">
        Connect JoyID Wallet
      </button>
      `}

    </div>
  `,a.querySelectorAll(".splash-tile[data-nav]").forEach(e=>{e.addEventListener("click",()=>{var s,t,i;o(e.dataset.nav),(i=(t=(s=window.Telegram)==null?void 0:s.WebApp)==null?void 0:t.HapticFeedback)==null||i.impactOccurred("medium")})}),(c=document.getElementById("splash-connect"))==null||c.addEventListener("click",()=>{var e;(e=document.getElementById("auth-badge"))==null||e.click()}),r()}async function r(){var a,l;try{const e=await(await fetch("https://mainnet.ckbapp.dev/rpc",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"get_tip_header",params:[]})})).json(),s=parseInt((a=e.result)==null?void 0:a.number,16),t=document.getElementById("ckb-tip");t&&(t.textContent=s.toLocaleString());const n=await(await fetch("https://mainnet.ckbapp.dev/rpc",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:2,method:"get_peers",params:[]})})).json(),d=document.getElementById("ckb-peers");d&&(d.textContent=`${((l=n.result)==null?void 0:l.length)??"—"} peers`)}catch{}try{const[c,e]=await Promise.all([fetch("https://mempool.space/api/blocks/tip/height").then(i=>i.text()),fetch("https://mempool.space/api/v1/fees/recommended").then(i=>i.json())]),s=document.getElementById("btc-tip"),t=document.getElementById("btc-fees");s&&(s.textContent=parseInt(c).toLocaleString()),t&&(t.textContent=`${e.fastestFee} sat/vB fast`)}catch{}}export{p as renderSplash};

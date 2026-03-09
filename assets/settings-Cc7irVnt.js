const u={ckb:{mainnet:[{id:"wyltek-light",label:"⚡ Wyltek Light Client",desc:"Phill's CKB light client — tx history, UTXOs, verified headers",url:"https://wyltek-rpc.toastmanau.workers.dev/ckb-light",proxy:!0,lightClient:!0},{id:"wyltek",label:"🟢 Wyltek Full Node",desc:"Phill's CKB mainnet full node (via Cloudflare proxy)",url:"https://wyltek-rpc.toastmanau.workers.dev/ckb",proxy:!0},{id:"nervos-public",label:"🌐 Nervos Public RPC",desc:"Official public mainnet endpoint",url:"https://mainnet.ckbapp.dev/rpc",proxy:!1},{id:"ankr",label:"⚡ Ankr",desc:"Ankr public RPC (free tier)",url:"https://rpc.ankr.com/nervos",proxy:!1},{id:"custom",label:"✏️ Custom",desc:"Enter your own CKB RPC URL",url:"",proxy:!1}],testnet:[{id:"nervos-testnet",label:"🌐 Nervos Testnet",desc:"Official public testnet endpoint",url:"https://testnet.ckbapp.dev/rpc",proxy:!1},{id:"custom",label:"✏️ Custom",desc:"Enter your own testnet RPC URL",url:"",proxy:!1}]},btc:{mainnet:[{id:"wyltek",label:"🟢 Wyltek Node",desc:"Phill's Bitcoin mainnet node (via Cloudflare proxy)",url:"https://wyltek-rpc.toastmanau.workers.dev/btc",proxy:!0},{id:"blockstream",label:"🌐 Blockstream Esplora",desc:"Blockstream public API (read-only, Esplora format)",url:"https://blockstream.info/api",proxy:!1,apiStyle:"esplora"},{id:"custom",label:"✏️ Custom",desc:"Your own Bitcoin node RPC URL",url:"",proxy:!1}]}};function f(){try{const t=localStorage.getItem("wyltek_node_config");if(t)return JSON.parse(t)}catch{}return{ckb:{net:"mainnet",preset:"wyltek-light",customUrl:""},btc:{net:"mainnet",preset:"wyltek",customUrl:""}}}function d(t){localStorage.setItem("wyltek_node_config",JSON.stringify(t))}function v(t,s){var i,c,o,l;const e=((i=s[t])==null?void 0:i.net)||"mainnet",n=((c=s[t])==null?void 0:c.preset)||"wyltek",r=(((o=u[t])==null?void 0:o[e])||[]).find(p=>p.id===n);return r?n==="custom"?((l=s[t])==null?void 0:l.customUrl)||"":r.url:null}async function x(t,s){const e=f();t.innerHTML=`
    <div class="section-header">Settings</div>

    <!-- CKB Node -->
    <div class="card" style="margin-bottom:0.75rem">
      <div class="card-title">⚡ CKB Node</div>

      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">
        <button class="net-btn ${e.ckb.net==="mainnet"?"active":""}"
          data-chain="ckb" data-net="mainnet"
          style="flex:1;${m(e.ckb.net==="mainnet")}">Mainnet</button>
        <button class="net-btn ${e.ckb.net==="testnet"?"active":""}"
          data-chain="ckb" data-net="testnet"
          style="flex:1;${m(e.ckb.net==="testnet")}">Testnet</button>
      </div>

      <div id="ckb-presets">
        ${b("ckb",e)}
      </div>
      <div id="ckb-custom" style="${e.ckb.preset==="custom"?"":"display:none"}">
        ${y("ckb",e)}
      </div>
    </div>

    <!-- BTC Node -->
    <div class="card" style="margin-bottom:0.75rem">
      <div class="card-title">₿ Bitcoin Node</div>

      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem">
        <button class="net-btn ${e.btc.net==="mainnet"?"active":""}"
          data-chain="btc" data-net="mainnet"
          style="flex:1;${m(e.btc.net==="mainnet")}">Mainnet</button>
      </div>

      <div id="btc-presets">
        ${b("btc",e)}
      </div>
      <div id="btc-custom" style="${e.btc.preset==="custom"?"":"display:none"}">
        ${y("btc",e)}
      </div>
    </div>

    <!-- Test connection -->
    <button class="btn btn-primary btn-full" id="test-conn" style="margin-bottom:0.75rem">
      Test Connection
    </button>
    <div id="test-result" class="test-result"></div>

    <!-- About -->
    <div class="card" style="margin-top:0.75rem">
      <div class="card-title">About</div>
      <div class="stat-row">
        <span class="stat-label">App</span>
        <span class="stat-value">Wyltek Industries</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Version</span>
        <span class="stat-value">0.1.0</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Source</span>
        <a href="https://github.com/toastmanAu/wyltek-miniapp" target="_blank"
           style="color:var(--accent);font-size:0.82rem">GitHub ↗</a>
      </div>
      <div class="stat-row">
        <span class="stat-label">Site</span>
        <a href="https://wyltekindustries.com" target="_blank"
           style="color:var(--accent);font-size:0.82rem">wyltekindustries.com ↗</a>
      </div>
    </div>
  `,g(t,e)}function m(t){return t?"background:var(--accent2);color:white;border:none;border-radius:6px;padding:0.4rem;font-size:0.8rem;font-weight:600;cursor:pointer;":"background:var(--surface2);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:0.4rem;font-size:0.8rem;cursor:pointer;"}function b(t,s){var a;const e=s[t].net;return(((a=u[t])==null?void 0:a[e])||[]).map(r=>`
    <label class="preset-row" style="
      display:flex;align-items:flex-start;gap:0.6rem;
      padding:0.6rem 0;border-bottom:1px solid var(--border);
      cursor:pointer;
    ">
      <input type="radio" name="${t}-preset" value="${r.id}"
        ${s[t].preset===r.id?"checked":""}
        style="margin-top:3px;accent-color:var(--accent);">
      <div style="flex:1">
        <div style="font-size:0.875rem;color:var(--text);font-weight:500">${r.label}</div>
        <div style="font-size:0.72rem;color:var(--muted)">${r.desc}</div>
        ${r.id!=="custom"?`<div style="font-size:0.68rem;color:var(--border);margin-top:2px;font-family:monospace">${r.url}</div>`:""}
      </div>
    </label>
  `).join("")}function y(t,s){return`
    <div style="margin-top:0.5rem">
      <input id="${t}-custom-url"
        placeholder="https://your-node:8114"
        value="${s[t].customUrl||""}"
        style="width:100%;box-sizing:border-box;
          background:var(--surface2);border:1px solid var(--border);
          border-radius:6px;color:var(--text);padding:0.5rem 0.75rem;
          font-size:0.82rem;outline:none;font-family:monospace">
    </div>
  `}function g(t,s){t.querySelectorAll(".net-toggle-btn").forEach(e=>{e.addEventListener("click",()=>{var r,i,c;const n=e.dataset.chain,a=e.dataset.net;s[n].net=a,s[n].preset=((c=(i=(r=u[n])==null?void 0:r[a])==null?void 0:i[0])==null?void 0:c.id)||"wyltek",d(s),document.getElementById(`${n}-presets`).innerHTML=b(n,s),document.getElementById(`${n}-custom`).style.display="none",t.querySelectorAll(`.net-toggle-btn[data-chain="${n}"]`).forEach(o=>{o.classList.toggle("active",o.dataset.net===a)}),k(n,s)})}),["ckb","btc"].forEach(e=>k(e,s)),document.getElementById("test-conn").addEventListener("click",()=>h(s))}function k(t,s){document.querySelectorAll(`input[name="${t}-preset"]`).forEach(n=>{n.addEventListener("change",()=>{s[t].preset=n.value,d(s);const a=document.getElementById(`${t}-custom`);a.style.display=n.value==="custom"?"":"none",n.value==="custom"&&(a.innerHTML=y(t,s),document.getElementById(`${t}-custom-url`).addEventListener("input",r=>{s[t].customUrl=r.target.value.trim(),d(s)}))})});const e=document.getElementById(`${t}-custom-url`);e&&e.addEventListener("input",n=>{s[t].customUrl=n.target.value.trim(),d(s)})}async function h(t){var c;const s=document.getElementById("test-result"),e=document.getElementById("test-conn");e.disabled=!0,e.textContent="Testing…",s.textContent="";const n=v("ckb",t),a=v("btc",t),r=[];try{const l=await(await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:1,jsonrpc:"2.0",method:"get_tip_block_number",params:[]}),signal:AbortSignal.timeout(8e3)})).json(),p=parseInt(l==null?void 0:l.result,16);r.push(`⚡ CKB ✅ block ${p.toLocaleString()}`)}catch(o){r.push(`⚡ CKB ❌ ${o.message}`)}const i=(c=u.btc[t.btc.net])==null?void 0:c.find(o=>o.id===t.btc.preset);if((i==null?void 0:i.apiStyle)!=="esplora")try{const l=await(await fetch(a,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:1,jsonrpc:"1.0",method:"getblockcount",params:[]}),signal:AbortSignal.timeout(8e3)})).json();r.push(`₿ BTC ✅ block ${((l==null?void 0:l.result)||0).toLocaleString()}`)}catch(o){r.push(`₿ BTC ❌ ${o.message}`)}else r.push("₿ BTC — Esplora (no test needed)");s.innerHTML=r.join("<br>"),e.disabled=!1,e.textContent="Test Connection"}export{u as NODE_PRESETS,f as loadNodeConfig,x as renderSettings,v as resolveRpcUrl,d as saveNodeConfig};

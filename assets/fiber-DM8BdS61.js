const C="https://wyltek-rpc.toastmanau.workers.dev/fiber";async function c(e,t={}){const n=await fetch(C,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:Date.now(),method:e,params:t})});if(!n.ok)throw new Error(`HTTP ${n.status}`);const o=await n.json();if(o.error)throw new Error(o.error.message||JSON.stringify(o.error));return o.result}let d=null,u=[],x=[],b=[];async function z(e,t){e.innerHTML=`
    <div class="section-header">Fiber Network</div>

    <!-- Sub-tabs -->
    <div class="fiber-tabs">
      <button class="fiber-tab active" data-view="channels">Channels</button>
      <button class="fiber-tab" data-view="nodes">Network</button>
      <button class="fiber-tab" data-view="probe">Probe</button>
    </div>

    <div id="fiber-panel"><div class="spinner"></div></div>
  `,e.querySelectorAll(".fiber-tab").forEach(n=>{n.addEventListener("click",()=>{var o,s,a;e.querySelectorAll(".fiber-tab").forEach(i=>i.classList.toggle("active",i===n)),w(n.dataset.view),(a=(s=(o=window.Telegram)==null?void 0:o.WebApp)==null?void 0:s.HapticFeedback)==null||a.selectionChanged()})});try{[d,{channels:u},{peers:x},{nodes:b}]=await Promise.all([c("node_info"),c("list_channels",{}),c("list_peers"),c("graph_nodes",{}).catch(()=>({nodes:[]}))])}catch(n){document.getElementById("fiber-panel").innerHTML=`
      <div class="card">
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <p>Fiber RPC unreachable<br><small style="font-family:monospace">${n.message}</small></p>
          <p style="font-size:0.75rem;margin-top:0.5rem">Worker not yet deployed — run <code>wrangler deploy</code></p>
        </div>
      </div>
      ${N()}
    `;return}w("channels")}function w(e){const t=document.getElementById("fiber-panel");t&&(e==="channels"?E(t):e==="nodes"?B(t):e==="probe"&&T(t))}function E(e){var n;const t=(d==null?void 0:d.node_id)||"—";t.slice(0,12)+""+t.slice(-8),e.innerHTML=`
    <!-- Node info strip -->
    <div class="card-glow" style="margin-bottom:0.75rem;padding:0.875rem 1rem">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <div style="font-size:1.4rem">🌐</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:0.9rem">Wyltek Fiber Node</div>
          <div style="font-family:monospace;font-size:0.68rem;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t}</div>
        </div>
        <div class="chain-status ok">v${(d==null?void 0:d.version)||"—"}</div>
      </div>
    </div>

    <!-- Channel list -->
    ${u.length===0?'<div class="empty-state"><div class="icon">📭</div><p>No open channels</p></div>':u.map(o=>I(o)).join("")}

    <div style="text-align:center;margin-top:0.5rem">
      <button class="btn btn-ghost btn-sm" id="open-channel-btn">+ Open Channel</button>
    </div>
  `,(n=document.getElementById("open-channel-btn"))==null||n.addEventListener("click",()=>L())}function I(e){var r,l,m;const t=(parseInt(e.local_balance,16)/1e8).toFixed(2),n=(parseInt(e.remote_balance,16)/1e8).toFixed(2),o=(parseInt(e.local_balance,16)+parseInt(e.remote_balance,16))/1e8,s=o>0?parseInt(e.local_balance,16)/1e8/o*100:50,a=e.peer_id?e.peer_id.slice(0,8)+"…"+e.peer_id.slice(-6):"—",i=((r=e.state)==null?void 0:r.state_name)==="CHANNEL_READY"?"green":"orange";return`
    <div class="card" style="margin-bottom:0.6rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.6rem">
        <div style="font-family:monospace;font-size:0.72rem;color:var(--text2)">${a}</div>
        <div class="chain-status ${i==="green"?"ok":"sync"}" style="font-size:0.65rem">
          ${((m=(l=e.state)==null?void 0:l.state_name)==null?void 0:m.replace("_"," "))||"—"}
        </div>
      </div>

      <!-- Liquidity bar -->
      <div style="margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text2);margin-bottom:4px">
          <span>Local: <span style="color:var(--accent);font-weight:600">${t} CKB</span></span>
          <span>Remote: <span style="color:var(--text);font-weight:600">${n} CKB</span></span>
        </div>
        <div style="background:var(--surface2);border-radius:4px;height:6px;overflow:hidden">
          <div style="height:100%;width:${s.toFixed(1)}%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:4px;transition:width 0.5s"></div>
        </div>
      </div>

      <div style="display:flex;gap:0.4rem">
        <button class="btn btn-ghost btn-sm" style="flex:1" 
          onclick="window.fiberSend('${e.peer_id}','${e.channel_id}')">Send</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--red)"
          onclick="window.fiberClose('${e.channel_id}')">Close</button>
      </div>
    </div>
  `}function B(e){const t=b||[];e.innerHTML=`
    <div class="card" style="margin-bottom:0.75rem">
      <div class="stat-row"><span class="stat-label">Known Nodes</span><span class="stat-value accent">${t.length}</span></div>
      <div class="stat-row"><span class="stat-label">Connected Peers</span><span class="stat-value">${x.length}</span></div>
    </div>

    <div class="section-header" style="font-size:0.85rem">Network Nodes</div>

    ${t.length===0?'<div class="empty-state"><div class="icon">📡</div><p>No nodes in graph yet<br><small>Node is still gossiping</small></p></div>':`<div id="node-list">${t.slice(0,20).map(n=>k(n)).join("")}</div>`}
  `,e.querySelectorAll(".node-row").forEach(n=>{n.addEventListener("click",()=>{var s;const o=n.dataset.nodeId;(s=document.querySelector('.fiber-tab[data-view="probe"]'))==null||s.click(),setTimeout(()=>{const a=document.getElementById("probe-node-input");a&&(a.value=o,a.dispatchEvent(new Event("input")))},100)})})}function k(e){var i,r,l;const t=e.node_id||((i=e.node_announcement)==null?void 0:i.node_id)||"—";t.slice(0,10)+""+t.slice(-8);const n=((r=e.node_announcement)==null?void 0:r.alias)||e.alias||null,s=(((l=e.node_announcement)==null?void 0:l.addresses)||e.addresses||[])[0]||"",a=t===(d==null?void 0:d.node_id);return`
    <div class="node-row" data-node-id="${t}" style="
      display:flex;align-items:center;gap:0.6rem;
      background:var(--surface);border:1px solid ${a?"rgba(0,212,255,0.3)":"var(--border)"};
      border-radius:10px;padding:0.75rem;margin-bottom:0.4rem;cursor:pointer;
      transition:border-color 0.15s;
    ">
      <div style="font-size:1.1rem">${a?"⭐":"🔵"}</div>
      <div style="flex:1;min-width:0">
        ${n?`<div style="font-size:0.82rem;font-weight:600;color:var(--text)">${n}</div>`:""}
        <div style="font-family:monospace;font-size:0.68rem;color:var(--accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t}</div>
        ${s?`<div style="font-size:0.68rem;color:var(--text3)">${s}</div>`:""}
      </div>
      ${a?'<span style="font-size:0.65rem;color:var(--accent)">you</span>':'<span style="color:var(--text3);font-size:0.8rem">→</span>'}
    </div>
  `}function T(e){var n,o;const t=(b||[]).filter(s=>{var i;const a=s.node_id||((i=s.node_announcement)==null?void 0:i.node_id);return a&&a!==(d==null?void 0:d.node_id)}).map(s=>{var r,l;const a=s.node_id||((r=s.node_announcement)==null?void 0:r.node_id),i=((l=s.node_announcement)==null?void 0:l.alias)||s.alias;return`<option value="${a}">${i?i+" — ":""}${a.slice(0,12)}…</option>`}).join("");e.innerHTML=`
    <div class="card">
      <div class="card-title">Route Probe</div>
      <p style="font-size:0.82rem;color:var(--text2);margin:0 0 0.875rem">
        Test if a payment route exists to a node. Sends 1 shannon (≈0 CKB) to probe liquidity.
      </p>

      <div style="margin-bottom:0.75rem">
        <div style="font-size:0.75rem;color:var(--text2);margin-bottom:0.35rem;font-weight:600">Target Node</div>
        ${t.length>0?`
        <select id="probe-node-select" class="filter-dropdown" style="width:100%;margin-bottom:0.5rem;border-radius:8px;padding:0.6rem">
          <option value="">— select from network —</option>
          ${t}
        </select>`:""}
        <input id="probe-node-input" class="search-input" placeholder="Node ID or peer_id (Qm…)">
      </div>

      <div style="margin-bottom:0.875rem">
        <div style="font-size:0.75rem;color:var(--text2);margin-bottom:0.35rem;font-weight:600">Amount (CKB)</div>
        <input id="probe-amount" class="search-input" type="number" value="0.00000001" step="0.00000001" min="0.00000001">
      </div>

      <button class="btn btn-primary btn-full" id="probe-btn">🔍 Probe Route</button>
    </div>

    <div id="probe-result" style="margin-top:0.75rem"></div>
  `,(n=document.getElementById("probe-node-select"))==null||n.addEventListener("change",s=>{const a=document.getElementById("probe-node-input");a&&s.target.value&&(a.value=s.target.value)}),(o=document.getElementById("probe-btn"))==null||o.addEventListener("click",async()=>{var m,y,h,g;const s=(y=(m=document.getElementById("probe-node-input"))==null?void 0:m.value)==null?void 0:y.trim(),a=parseFloat(((h=document.getElementById("probe-amount"))==null?void 0:h.value)||"0.00000001"),i=Math.round(a*1e8),r=document.getElementById("probe-result");if(!s){r.innerHTML='<div class="card" style="color:var(--orange)">Please enter a target node ID</div>';return}const l=document.getElementById("probe-btn");l.disabled=!0,l.textContent="Probing…",r.innerHTML='<div class="spinner"></div>';try{const p=await c("build_router",{target_pubkey:s,amount:`0x${i.toString(16)}`,payment_hash:"0x"+"00".repeat(32)});if(((g=p==null?void 0:p.hops)==null?void 0:g.length)>0){const v=p.hops;r.innerHTML=`
          <div class="card" style="border-color:rgba(16,185,129,0.3)">
            <div style="color:var(--green);font-weight:700;margin-bottom:0.5rem">✅ Route found — ${v.length} hop${v.length>1?"s":""}</div>
            ${v.map((f,$)=>`
              <div class="stat-row">
                <span class="stat-label">Hop ${$+1}</span>
                <span class="stat-value" style="font-size:0.72rem">${(f.pubkey||f.node_id||"—").slice(0,14)}…</span>
              </div>
            `).join("")}
            <div class="stat-row"><span class="stat-label">Amount</span><span class="stat-value green">${a} CKB</span></div>
          </div>
        `}else r.innerHTML='<div class="card" style="border-color:rgba(239,68,68,0.3)"><div style="color:var(--red)">❌ No route found</div></div>'}catch(p){r.innerHTML=`
        <div class="card" style="border-color:rgba(239,68,68,0.2)">
          <div style="color:var(--red);font-weight:600">Probe failed</div>
          <div style="font-size:0.78rem;color:var(--text2);margin-top:0.3rem;font-family:monospace">${p.message}</div>
        </div>
      `}finally{l.disabled=!1,l.textContent="🔍 Probe Route"}})}function L(){const e=document.createElement("div");e.className="bottom-sheet",e.innerHTML=`
    <div class="bottom-sheet-handle"></div>
    <div class="bottom-sheet-content">
      <h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700">Open Channel</h3>
      <div style="margin-bottom:0.75rem">
        <div class="sheet-label">Peer ID or address</div>
        <input class="search-input" id="sheet-peer" placeholder="QmTh1V…  or  /ip4/…/p2p/Qm…">
      </div>
      <div style="margin-bottom:0.875rem">
        <div class="sheet-label">Funding amount (CKB)</div>
        <input class="search-input" id="sheet-amount" type="number" value="100" min="62">
        <div style="font-size:0.72rem;color:var(--text3);margin-top:4px">Minimum ~62 CKB</div>
      </div>
      <button class="btn btn-accent btn-full" id="sheet-open-btn">Open Channel</button>
      <button class="btn btn-ghost btn-full" id="sheet-cancel-btn" style="margin-top:0.5rem">Cancel</button>
    </div>
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("open")),document.getElementById("sheet-cancel-btn").addEventListener("click",()=>_(e)),document.getElementById("sheet-open-btn").addEventListener("click",async()=>{var s,a,i,r;const t=document.getElementById("sheet-peer").value.trim(),n=parseFloat(document.getElementById("sheet-amount").value),o="0x"+Math.round(n*1e8).toString(16);if(t){document.getElementById("sheet-open-btn").textContent="Opening…",document.getElementById("sheet-open-btn").disabled=!0;try{await c("open_channel",{peer_id:t,funding_amount:o}),_(e),(a=(s=window.Telegram)==null?void 0:s.WebApp)==null||a.showAlert("Channel opening initiated! It will appear once confirmed on-chain.")}catch(l){(r=(i=window.Telegram)==null?void 0:i.WebApp)==null||r.showAlert(`Failed: ${l.message}`),document.getElementById("sheet-open-btn").textContent="Open Channel",document.getElementById("sheet-open-btn").disabled=!1}}})}function _(e){e.classList.remove("open"),setTimeout(()=>e.remove(),300)}window.fiberSend=(e,t)=>{var n,o;(o=(n=window.Telegram)==null?void 0:n.WebApp)==null||o.showAlert("Send payment UI coming soon — requires invoice input")};window.fiberClose=async e=>{var n;const t=(n=window.Telegram)==null?void 0:n.WebApp;t==null||t.showPopup({title:"Close Channel",message:"This will initiate a cooperative channel close. Funds return on-chain.",buttons:[{id:"close",type:"destructive",text:"Close Channel"},{id:"cancel",type:"cancel"}]},async o=>{if(o==="close")try{await c("shutdown_channel",{channel_id:e,close_script:null}),t==null||t.showAlert("Channel close initiated")}catch(s){t==null||t.showAlert(`Failed: ${s.message}`)}})};function N(){return`
    <div class="card" style="border-color:rgba(0,212,255,0.15)">
      <div class="card-title">Node Info (cached)</div>
      <div class="stat-row"><span class="stat-label">Node ID</span><span class="stat-value" style="font-size:0.68rem;color:var(--accent)">026a9dd1bae2e7c9ee5…</span></div>
      <div class="stat-row"><span class="stat-label">Version</span><span class="stat-value">0.7.0</span></div>
      <div class="stat-row"><span class="stat-label">P2P Port</span><span class="stat-value">8228</span></div>
    </div>
  `}export{z as renderFiber};

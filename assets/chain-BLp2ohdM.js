import{s as q,a as W}from"./index-CnO4aS20.js";const A="https://mainnet.ckbapp.dev/rpc",x="https://mempool.space/api";async function E(e,r=[],s=A){const l=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:Date.now(),method:e,params:r})});if(!l.ok)throw new Error(`HTTP ${l.status}`);const c=await l.json();if(c.error)throw new Error(c.error.message||JSON.stringify(c.error));return c.result}let B="ckb",$=[];async function V(e,r){W(),e.innerHTML=`
    <div class="chain-seg">
      <button class="chain-seg-btn ckb active" data-chain="ckb">⚡ CKB</button>
      <button class="chain-seg-btn btc"        data-chain="btc">₿ Bitcoin</button>
      <button class="chain-seg-btn rpc"        data-chain="rpc">🔌 RPC</button>
    </div>
    <div id="chain-panel"><div class="spinner"></div></div>
  `,e.querySelectorAll(".chain-seg-btn").forEach(s=>{s.addEventListener("click",()=>{var l,c,a;e.querySelectorAll(".chain-seg-btn").forEach(p=>p.classList.toggle("active",p===s)),B=s.dataset.chain,M(B,r),(a=(c=(l=window.Telegram)==null?void 0:l.WebApp)==null?void 0:c.HapticFeedback)==null||a.selectionChanged()})}),await M(B,r)}async function M(e,r){const s=document.getElementById("chain-panel");if(s){s.innerHTML='<div class="spinner"></div>';try{e==="ckb"&&await S(s,r),e==="btc"&&await _(s),e==="rpc"&&T(s,r)}catch(l){s.innerHTML=`<div class="empty-state"><span class="icon">⚠️</span><p>${l.message}</p></div>`}}}async function S(e,r){var C,L;const[s,l,c,a]=await Promise.all([E("get_tip_header"),E("get_peers"),E("tx_pool_info"),E("get_blockchain_info")]),p=parseInt(s.number,16),o=l.length,m=parseInt(c.pending,16),d=parseInt(c.proposed,16),v=parseInt(c.min_fee_rate,16),i=parseInt(c.orphan,16),y=(parseInt(c.total_tx_size,16)/1024).toFixed(1),f=(parseInt(c.total_tx_cycles,16)/1e9).toFixed(2),u=parseInt(s.epoch,16),g=u&16777215,t=u>>24&65535,n=u>>40&65535,h=n>0?(t/n*100).toFixed(1):0,N=parseInt(s.timestamp,16),I=Math.round((Date.now()-N)/1e3),O=I<60?`${I}s ago`:`${Math.round(I/60)}m ago`,j=l.filter(b=>b.is_outbound===!1).length,R=l.filter(b=>b.is_outbound!==!1).length;e.innerHTML=`
    <div class="stat-hero ckb-hero">
      <div class="stat-hero-label"><span class="live-dot"></span>CKB MAINNET</div>
      <div class="stat-hero-value">${p.toLocaleString()}</div>
      <div class="stat-hero-sub">Block height · <span style="color:var(--accent);opacity:0.8">${O}</span></div>
    </div>

    <div class="card" style="padding:0.875rem 1rem">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.45rem">
        <div style="font-size:0.72rem;font-weight:700;color:var(--text2)">Epoch ${g.toLocaleString()}</div>
        <div style="font-size:0.72rem;color:var(--accent);font-weight:600">${t.toLocaleString()} / ${n.toLocaleString()} (${h}%)</div>
      </div>
      <div style="background:var(--surface2);border-radius:5px;height:7px;overflow:hidden">
        <div style="height:100%;width:${h}%;background:linear-gradient(90deg,var(--accent),#3b82f6);border-radius:5px"></div>
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--accent)">${o}</div>
        <div class="stat-chip-label">Peers</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${m.toLocaleString()}</div>
        <div class="stat-chip-label">Pending</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${d.toLocaleString()}</div>
        <div class="stat-chip-label">Proposed</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Chain</div>
      <div class="stat-row"><span class="stat-label">Network</span><span class="stat-value">${a.chain}</span></div>
      <div class="stat-row"><span class="stat-label">Block Hash</span><span class="stat-value" style="font-size:0.64rem">${s.hash.slice(0,20)}…</span></div>
      <div class="stat-row"><span class="stat-label">Inbound Peers</span><span class="stat-value">${j}</span></div>
      <div class="stat-row"><span class="stat-label">Outbound Peers</span><span class="stat-value">${R}</span></div>
      <div class="stat-row"><span class="stat-label">Min Fee Rate</span><span class="stat-value">${v} shannons/KB</span></div>
    </div>

    <div class="card">
      <div class="card-title">TX Pool</div>
      <div class="stat-row"><span class="stat-label">Pending</span><span class="stat-value">${m.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-label">Proposed</span><span class="stat-value">${d.toLocaleString()}</span></div>
      <div class="stat-row"><span class="stat-label">Orphan</span><span class="stat-value">${i}</span></div>
      <div class="stat-row"><span class="stat-label">Total Size</span><span class="stat-value">${y} KB</span></div>
      <div class="stat-row"><span class="stat-label">Total Cycles</span><span class="stat-value">${f}G</span></div>
    </div>

    <div class="card">
      <div class="card-title">Connected Peers (${o})</div>
      ${l.slice(0,6).map(b=>{var F,P,H;const J=((P=(F=b.addresses)==null?void 0:F[0])==null?void 0:P.address)||((H=b.node_id)==null?void 0:H.slice(0,16))||"—",K=b.is_outbound?"↑":"↓",D=b.version||"";return`<div class="stat-row">
          <span class="stat-label" style="font-family:monospace;font-size:0.66rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${J}</span>
          <span class="stat-value" style="font-size:0.68rem;color:var(--text3);flex-shrink:0">${K} ${D}</span>
        </div>`}).join("")}
      ${o>6?`<div style="font-size:0.7rem;color:var(--text3);text-align:center;padding:0.35rem">+${o-6} more</div>`:""}
    </div>

    <div style="display:flex;gap:0.5rem">
      <button class="btn btn-ghost btn-sm" style="flex:1" id="ckb-refresh">↻ Refresh</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" id="ckb-to-rpc">⌨ RPC Console</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://explorer.nervos.org')">Explorer ↗</button>
    </div>
    <div style="text-align:center;font-size:0.65rem;color:var(--text3);margin-top:0.4rem">via ckbapp.dev · ${new Date().toLocaleTimeString()}</div>
  `,(C=document.getElementById("ckb-refresh"))==null||C.addEventListener("click",()=>S(e)),(L=document.getElementById("ckb-to-rpc"))==null||L.addEventListener("click",()=>{var b;(b=document.querySelector(".chain-seg-btn.rpc"))==null||b.click()}),q(p)}async function _(e){var g;const[r,s,l,c,a]=await Promise.all([fetch(`${x}/blocks/tip/height`).then(t=>t.text()),fetch(`${x}/v1/fees/recommended`).then(t=>t.json()),fetch(`${x}/mempool`).then(t=>t.json()),fetch(`${x}/v1/mining/hashrate/3`).then(t=>t.json()).catch(()=>({})),fetch(`${x}/v1/difficulty-adjustment`).then(t=>t.json()).catch(()=>({}))]),p=parseInt(r).toLocaleString(),o=(l.count||0).toLocaleString(),m=l.vsize?(l.vsize/1e3).toFixed(0):"—",d=l.total_fee?(l.total_fee/1e8).toFixed(3):"—",v=c!=null&&c.currentHashrate?(c.currentHashrate/1e18).toFixed(1):"—",i=(a==null?void 0:a.remainingBlocks)??"—",y=(a==null?void 0:a.difficultyChange)!=null?`${a.difficultyChange>0?"+":""}${a.difficultyChange.toFixed(1)}%`:"—",f=a!=null&&a.remainingTime?U(a.remainingTime):"—",u=(a==null?void 0:a.difficultyChange)>0?"var(--green)":(a==null?void 0:a.difficultyChange)<0?"var(--orange)":"var(--text)";e.innerHTML=`
    <div class="stat-hero btc-hero">
      <div class="stat-hero-label"><span class="live-dot" style="background:#f7931a"></span>BITCOIN MAINNET</div>
      <div class="stat-hero-value">${p}</div>
      <div class="stat-hero-sub">Block height</div>
    </div>

    <div class="card" style="padding:0.875rem 1rem">
      <div class="card-title">Fee Rates (sat/vB)</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.5rem;text-align:center;margin-top:0.25rem">
        ${[{label:"~10min",val:s.fastestFee,color:"#f7931a"},{label:"~30min",val:s.halfHourFee,color:"var(--text)"},{label:"~1hr",val:s.hourFee,color:"var(--text2)"},{label:"Economy",val:s.economyFee,color:"var(--text3)"}].map(t=>`
          <div>
            <div style="font-size:1.4rem;font-weight:800;color:${t.color};letter-spacing:-0.03em">${t.val}</div>
            <div style="font-size:0.58rem;color:var(--text3);font-weight:700;text-transform:uppercase;letter-spacing:.05em">${t.label}</div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:#f7931a;font-size:0.95rem">${o}</div>
        <div class="stat-chip-label">Mempool TX</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${m}K</div>
        <div class="stat-chip-label">vBytes</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val">${v}</div>
        <div class="stat-chip-label">EH/s</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Mempool</div>
      <div class="stat-row"><span class="stat-label">Unconfirmed TXs</span><span class="stat-value">${o}</span></div>
      <div class="stat-row"><span class="stat-label">Size</span><span class="stat-value">${m} KB vsize</span></div>
      <div class="stat-row"><span class="stat-label">Total Fees</span><span class="stat-value">${d} BTC</span></div>
      <div class="stat-row"><span class="stat-label">Min Fee</span><span class="stat-value">${s.minimumFee} sat/vB</span></div>
    </div>

    <div class="card">
      <div class="card-title">Difficulty Adjustment</div>
      <div class="stat-row"><span class="stat-label">Remaining Blocks</span><span class="stat-value">${i}</span></div>
      <div class="stat-row"><span class="stat-label">ETA</span><span class="stat-value">${f}</span></div>
      <div class="stat-row"><span class="stat-label">Expected Change</span><span class="stat-value" style="color:${u}">${y}</span></div>
      <div class="stat-row"><span class="stat-label">Hashrate (3d avg)</span><span class="stat-value">${v} EH/s</span></div>
    </div>

    <div style="display:flex;gap:0.5rem">
      <button class="btn btn-ghost btn-sm" style="flex:1" id="btc-refresh">↻ Refresh</button>
      <button class="btn btn-ghost btn-sm" style="flex:1" onclick="window.Telegram?.WebApp?.openLink('https://mempool.space')">mempool.space ↗</button>
    </div>
    <div style="text-align:center;font-size:0.65rem;color:var(--text3);margin-top:0.4rem">via mempool.space · ${new Date().toLocaleTimeString()}</div>
  `,(g=document.getElementById("btc-refresh"))==null||g.addEventListener("click",()=>_(e))}function U(e){return e<3600?`${Math.round(e/60)}m`:e<86400?`${(e/3600).toFixed(1)}h`:`${(e/86400).toFixed(1)}d`}const k={ckb:[{label:"tip_header",method:"get_tip_header",params:[]},{label:"chain_info",method:"get_blockchain_info",params:[]},{label:"peers",method:"get_peers",params:[]},{label:"pool",method:"tx_pool_info",params:[]},{label:"local_node",method:"local_node_info",params:[]},{label:"get_block #1",method:"get_block_by_number",params:["0x1"]}],fiber:[{label:"node_info",method:"node_info",params:{}},{label:"channels",method:"list_channels",params:{}},{label:"peers",method:"list_peers",params:[]},{label:"graph_nodes",method:"graph_nodes",params:{}}]},w=[{label:"CKB Mainnet (public)",url:"https://mainnet.ckbapp.dev/rpc",type:"ckb"},{label:"CKB Testnet (public)",url:"https://testnet.ckbapp.dev/rpc",type:"ckb"},{label:"CKB Mainnet (nervos)",url:"https://mainnet.ckb.dev/rpc",type:"ckb"},{label:"Wyltek Fiber (Worker)",url:"https://wyltek-rpc.toastmanau.workers.dev/fiber",type:"fiber"},{label:"Custom…",url:"",type:"ckb"}];function T(e,r){var y,f,u,g;const s=localStorage.getItem("rpc_url")||w[0].url,l=localStorage.getItem("rpc_type")||"ckb",c=localStorage.getItem("rpc_method")||"get_tip_header",a=localStorage.getItem("rpc_params")||"[]",p=w.findIndex(t=>t.url===s),o=k[l]||k.ckb;e.innerHTML=`
    <div class="rpc-console">

      <div class="rpc-section">
        <div class="rpc-label">Endpoint</div>
        <select id="rpc-ep-sel" class="rpc-select">
          ${w.map((t,n)=>`<option value="${n}" ${n===p?"selected":""}>${t.label}</option>`).join("")}
        </select>
        <input id="rpc-url" class="rpc-url-input" type="url" placeholder="https://…" value="${s}">
      </div>

      <div class="rpc-section">
        <div class="rpc-label">Method</div>
        <div class="rpc-preset-bar" id="rpc-presets">
          ${o.map(t=>`
            <button class="rpc-preset-btn${t.method===c?" active":""}" data-method="${t.method}" data-params='${JSON.stringify(t.params)}'>${t.label}</button>
          `).join("")}
        </div>
        <input id="rpc-method" class="rpc-method-input" placeholder="method" value="${c}">
      </div>

      <div class="rpc-section">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="rpc-label">Params (JSON)</div>
          <button class="rpc-tiny-btn" id="rpc-fmt">↺ Format</button>
        </div>
        <textarea id="rpc-params" class="rpc-params" rows="3" spellcheck="false">${a}</textarea>
      </div>

      <button class="btn btn-accent btn-full" id="rpc-send" style="margin-bottom:0.75rem">⚡ Send</button>

      <div id="rpc-result"></div>

      ${$.length>0?`
        <div class="rpc-section" style="margin-top:0.5rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <div class="rpc-label">History</div>
            <button class="rpc-tiny-btn" id="rpc-clr">Clear</button>
          </div>
          ${$.slice().reverse().slice(0,8).map((t,n)=>`
            <div class="rpc-hist" data-i="${$.length-1-n}">
              <div style="display:flex;justify-content:space-between">
                <span class="rpc-hist-method">${t.method}</span>
                <span style="font-size:0.64rem;color:${t.ok?"var(--green)":"var(--red)"}">${t.ok?"✓":"✗"} ${t.ms}ms</span>
              </div>
              <div style="font-size:0.63rem;color:var(--text3);font-family:monospace">${t.endpoint.replace("https://","").slice(0,42)}…</div>
            </div>
          `).join("")}
        </div>
      `:""}
    </div>
  `;const m=document.getElementById("rpc-ep-sel"),d=document.getElementById("rpc-url");m.addEventListener("change",()=>{const t=w[m.value];t.url&&(d.value=t.url),localStorage.setItem("rpc_url",t.url||d.value),localStorage.setItem("rpc_type",t.type);const n=k[t.type]||k.ckb;document.getElementById("rpc-presets").innerHTML=n.map(h=>`<button class="rpc-preset-btn" data-method="${h.method}" data-params='${JSON.stringify(h.params)}'>${h.label}</button>`).join(""),v()}),d.addEventListener("input",()=>localStorage.setItem("rpc_url",d.value)),(y=document.getElementById("rpc-fmt"))==null||y.addEventListener("click",()=>{const t=document.getElementById("rpc-params");try{t.value=JSON.stringify(JSON.parse(t.value),null,2)}catch{}});function v(){document.querySelectorAll(".rpc-preset-btn").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".rpc-preset-btn").forEach(n=>n.classList.remove("active")),t.classList.add("active"),document.getElementById("rpc-method").value=t.dataset.method,document.getElementById("rpc-params").value=t.dataset.params,i()})})}v();function i(){var t,n;localStorage.setItem("rpc_method",((t=document.getElementById("rpc-method"))==null?void 0:t.value)||""),localStorage.setItem("rpc_params",((n=document.getElementById("rpc-params"))==null?void 0:n.value)||"[]")}(f=document.getElementById("rpc-method"))==null||f.addEventListener("input",()=>{const t=document.getElementById("rpc-method").value;document.querySelectorAll(".rpc-preset-btn").forEach(n=>n.classList.toggle("active",n.dataset.method===t)),i()}),(u=document.getElementById("rpc-params"))==null||u.addEventListener("input",i),document.querySelectorAll(".rpc-hist").forEach(t=>{t.addEventListener("click",()=>{const n=$[t.dataset.i];n&&(document.getElementById("rpc-url").value=n.endpoint,document.getElementById("rpc-method").value=n.method,document.getElementById("rpc-params").value=JSON.stringify(n.params,null,2),localStorage.setItem("rpc_url",n.endpoint),localStorage.setItem("rpc_method",n.method),localStorage.setItem("rpc_params",JSON.stringify(n.params)),z(document.getElementById("rpc-result"),n))})}),(g=document.getElementById("rpc-clr"))==null||g.addEventListener("click",()=>{$=[],T(e)}),document.getElementById("rpc-send").addEventListener("click",()=>X())}async function X(e,r){var v,i,y,f,u,g;const s=document.getElementById("rpc-send"),l=(i=(v=document.getElementById("rpc-url"))==null?void 0:v.value)==null?void 0:i.trim(),c=(f=(y=document.getElementById("rpc-method"))==null?void 0:y.value)==null?void 0:f.trim(),a=((g=(u=document.getElementById("rpc-params"))==null?void 0:u.value)==null?void 0:g.trim())||"[]",p=document.getElementById("rpc-result");if(!l||!c){p.innerHTML='<div class="rpc-error">Endpoint and method are required</div>';return}let o;try{o=JSON.parse(a)}catch(t){p.innerHTML=`<div class="rpc-error">Bad JSON params: ${t.message}</div>`;return}s.disabled=!0,s.textContent="Sending…",p.innerHTML='<div style="text-align:center;padding:1rem;color:var(--text3);font-size:0.82rem">⏳ Waiting…</div>';const m=Date.now();let d;try{const t=await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:c,params:o})}),n=Date.now()-m;if(!t.ok)throw new Error(`HTTP ${t.status} ${t.statusText}`);const h=await t.json();d={endpoint:l,method:c,params:o,result:h.result??h,error:h.error,ok:!h.error,ms:n,ts:Date.now()}}catch(t){const n=Date.now()-m;d={endpoint:l,method:c,params:o,result:null,error:{message:t.message},ok:!1,ms:n,ts:Date.now()}}$.push(d),z(p,d),s.disabled=!1,s.textContent="⚡ Send"}function z(e,r){var m,d;const s=r.ms,l=r.ok,c=r.error?r.error:r.result,a=JSON.stringify(c,null,2),p=a.split(`
`).length;e.innerHTML=`
    <div class="rpc-result-card ${l?"rpc-ok":"rpc-err"}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <span style="font-size:0.72rem;font-weight:700;color:${l?"var(--green)":"var(--red)"}">${l?"✓ Success":"✗ Error"}</span>
        <span style="font-size:0.68rem;color:var(--text3)">${s}ms · ${p} lines</span>
      </div>
      <div class="rpc-result-toolbar">
        <button class="rpc-tiny-btn" id="rpc-copy">Copy</button>
        <button class="rpc-tiny-btn" id="rpc-collapse">Collapse</button>
      </div>
      <pre class="rpc-output" id="rpc-output-pre">${G(a)}</pre>
    </div>
  `,(m=document.getElementById("rpc-copy"))==null||m.addEventListener("click",()=>{var v;(v=navigator.clipboard)==null||v.writeText(a).then(()=>{const i=document.getElementById("rpc-copy");i&&(i.textContent="Copied!",setTimeout(()=>i&&(i.textContent="Copy"),1500))})});let o=!1;(d=document.getElementById("rpc-collapse"))==null||d.addEventListener("click",()=>{o=!o;const v=document.getElementById("rpc-output-pre");v&&(v.style.maxHeight=o?"60px":"none");const i=document.getElementById("rpc-collapse");i&&(i.textContent=o?"Expand":"Collapse")})}function G(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function Y(e,r){return S(e)}async function Z(e,r){return _(e)}async function tt(e,r){return T(e)}export{Z as renderBTCTab,Y as renderCKBTab,V as renderChain,tt as renderRPCTab};

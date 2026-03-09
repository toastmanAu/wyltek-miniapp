const y=[{m:"get_tip_block_number",cat:"Chain",params:[]},{m:"get_tip_header",cat:"Chain",params:[]},{m:"get_blockchain_info",cat:"Chain",params:[]},{m:"get_current_epoch",cat:"Chain",params:[]},{m:"get_block_by_number",cat:"Chain",params:[{name:"block_number",type:"hex",label:"Block number (hex, e.g. 0x1)",required:!0},{name:"verbosity",type:"hex",label:"Verbosity (optional)",required:!1}]},{m:"get_block",cat:"Chain",params:[{name:"block_hash",type:"hash",label:"Block hash (0x…)",required:!0},{name:"verbosity",type:"hex",label:"Verbosity (optional)",required:!1}]},{m:"get_header",cat:"Chain",params:[{name:"block_hash",type:"hash",label:"Block hash (0x…)",required:!0}]},{m:"get_header_by_number",cat:"Chain",params:[{name:"block_number",type:"hex",label:"Block number (hex)",required:!0}]},{m:"get_epoch_by_number",cat:"Chain",params:[{name:"epoch_number",type:"hex",label:"Epoch number (hex)",required:!0}]},{m:"tx_pool_info",cat:"Pool",params:[]},{m:"get_raw_tx_pool",cat:"Pool",params:[{name:"verbose",type:"bool",label:"Verbose (true / false)",required:!1}]},{m:"get_fee_rate_statistics",cat:"Pool",params:[{name:"target",type:"hex",label:"Target blocks (hex, optional)",required:!1}]},{m:"get_transaction",cat:"Transaction",params:[{name:"tx_hash",type:"hash",label:"Transaction hash (0x…)",required:!0},{name:"verbosity",type:"hex",label:"Verbosity (optional)",required:!1},{name:"only_committed",type:"bool",label:"Only committed (true/false, optional)",required:!1}]},{m:"send_transaction",cat:"Transaction",params:[{name:"transaction",type:"json",label:"Transaction object (JSON)",required:!0},{name:"outputs_validator",type:"text",label:'"passthrough" or "well_known_scripts_only" (optional)',required:!1}]},{m:"estimate_cycles",cat:"Transaction",params:[{name:"transaction",type:"json",label:"Transaction object (JSON)",required:!0}]},{m:"get_cells",cat:"Cell",params:[{name:"search_key",type:"json",label:"Search key {script, script_type, filter?}",required:!0},{name:"order",type:"text",label:'"asc" or "desc"',required:!0},{name:"limit",type:"hex",label:"Limit (hex, e.g. 0x10)",required:!0},{name:"after_cursor",type:"text",label:"Cursor from previous page (optional)",required:!1}]},{m:"get_cells_capacity",cat:"Cell",params:[{name:"search_key",type:"json",label:"Search key (JSON)",required:!0}]},{m:"get_live_cell",cat:"Cell",params:[{name:"out_point",type:"json",label:"OutPoint {tx_hash, index}",required:!0},{name:"with_data",type:"bool",label:"Include cell data (true/false)",required:!0},{name:"verbosity",type:"hex",label:"Verbosity (optional)",required:!1}]},{m:"get_transactions",cat:"Cell",params:[{name:"search_key",type:"json",label:"Search key (JSON)",required:!0},{name:"order",type:"text",label:'"asc" or "desc"',required:!0},{name:"limit",type:"hex",label:"Limit (hex)",required:!0},{name:"after_cursor",type:"text",label:"Cursor (optional)",required:!1}]},{m:"local_node_info",cat:"Node",params:[]},{m:"get_peers",cat:"Node",params:[]},{m:"get_banned_addresses",cat:"Node",params:[]},{m:"sync_state",cat:"Node",params:[]}],k=[{m:"get_tip_header",cat:"Chain",params:[]},{m:"get_genesis_block",cat:"Chain",params:[]},{m:"get_header",cat:"Chain",params:[{name:"block_hash",type:"hash",label:"Block hash (0x…)",required:!0}]},{m:"get_header_by_number",cat:"Chain",params:[{name:"block_number",type:"hex",label:"Block number (hex)",required:!0}]},{m:"get_transaction",cat:"Transaction",params:[{name:"tx_hash",type:"hash",label:"Transaction hash (0x…)",required:!0}]},{m:"fetch_transaction",cat:"Transaction",params:[{name:"tx_hash",type:"hash",label:"Transaction hash (0x…)",required:!0}]},{m:"send_transaction",cat:"Transaction",params:[{name:"transaction",type:"json",label:"Transaction object (JSON)",required:!0}]},{m:"get_cells",cat:"Cell",params:[{name:"search_key",type:"json",label:"Search key {script, script_type}",required:!0},{name:"order",type:"text",label:'"asc" or "desc"',required:!0},{name:"limit",type:"hex",label:"Limit (hex, e.g. 0x10)",required:!0},{name:"after_cursor",type:"text",label:"Cursor (optional)",required:!1}]},{m:"get_cells_capacity",cat:"Cell",params:[{name:"search_key",type:"json",label:"Search key (JSON)",required:!0}]},{m:"get_transactions",cat:"Cell",params:[{name:"search_key",type:"json",label:"Search key (JSON)",required:!0},{name:"order",type:"text",label:'"asc" or "desc"',required:!0},{name:"limit",type:"hex",label:"Limit (hex)",required:!0},{name:"after_cursor",type:"text",label:"Cursor (optional)",required:!1}]},{m:"set_scripts",cat:"Light Client",params:[{name:"scripts",type:"json",label:"ScriptStatus array [{script, script_type, block_number}]",required:!0},{name:"command",type:"text",label:'"all" | "partial" | "delete"',required:!0}]},{m:"get_scripts",cat:"Light Client",params:[]},{m:"fetch_header",cat:"Light Client",params:[{name:"block_hash",type:"hash",label:"Block hash (0x…)",required:!0}]},{m:"local_node_info",cat:"Node",params:[]},{m:"get_peers",cat:"Node",params:[]}],q=[{m:"node_info",cat:"Node",params:[]},{m:"list_channels",cat:"Channel",params:[{name:"peer_id",type:"text",label:"Filter by peer ID (optional)",required:!1},{name:"include_closed",type:"bool",label:"Include closed (true/false, optional)",required:!1}]},{m:"open_channel",cat:"Channel",params:[{name:"peer_id",type:"text",label:"Peer multiaddr or ID",required:!0},{name:"funding_amount",type:"hex",label:"Funding (hex Shannon)",required:!0},{name:"public",type:"bool",label:"Public channel (true/false, optional)",required:!1}]},{m:"accept_channel",cat:"Channel",params:[{name:"id",type:"hash",label:"Temporary channel ID (0x…)",required:!0},{name:"funding_amount",type:"hex",label:"Funding amount (hex Shannon)",required:!0}]},{m:"list_payments",cat:"Payment",params:[]},{m:"get_payment",cat:"Payment",params:[{name:"payment_hash",type:"hash",label:"Payment hash (0x…)",required:!0}]},{m:"send_payment",cat:"Payment",params:[{name:"target_pubkey",type:"hash",label:"Target public key (0x…)",required:!0},{name:"amount",type:"hex",label:"Amount (hex Shannon)",required:!0},{name:"invoice",type:"text",label:"Invoice string (optional)",required:!1},{name:"final_cltv_delta",type:"hex",label:"CLTV delta (optional)",required:!1}]},{m:"new_invoice",cat:"Invoice",params:[{name:"amount",type:"hex",label:"Amount (hex Shannon)",required:!0},{name:"currency",type:"text",label:'"Fibt" or "Fibb"',required:!0},{name:"description",type:"text",label:"Description (optional)",required:!1},{name:"expiry",type:"hex",label:"Expiry seconds (hex, optional)",required:!1}]},{m:"parse_invoice",cat:"Invoice",params:[{name:"invoice",type:"text",label:"Invoice string",required:!0}]},{m:"list_peers",cat:"Network",params:[]},{m:"connect_peer",cat:"Network",params:[{name:"address",type:"text",label:"/ip4/…/tcp/8228/p2p/Qm…",required:!0}]},{m:"disconnect_peer",cat:"Network",params:[{name:"peer_id",type:"text",label:"Peer ID",required:!0}]},{m:"graph_nodes",cat:"Network",params:[{name:"limit",type:"hex",label:"Limit (hex, optional)",required:!1},{name:"after",type:"text",label:"Cursor (optional)",required:!1}]},{m:"graph_channels",cat:"Network",params:[{name:"limit",type:"hex",label:"Limit (hex, optional)",required:!1},{name:"after",type:"text",label:"Cursor (optional)",required:!1}]},{m:"build_router",cat:"Network",params:[{name:"source",type:"hash",label:"Source pubkey (0x…)",required:!0},{name:"target",type:"hash",label:"Target pubkey (0x…)",required:!0},{name:"amount",type:"hex",label:"Amount (hex Shannon)",required:!0}]}],b=[{id:"ckb-pub",label:"CKB Mainnet",shortLabel:"CKB ↑",url:"https://mainnet.ckbapp.dev/rpc",methods:y,rpcType:"ckb"},{id:"ckb-testnet",label:"CKB Testnet",shortLabel:"Testnet",url:"https://testnet.ckbapp.dev/rpc",methods:y,rpcType:"ckb"},{id:"ckb-light",label:"Wyltek Light Client",shortLabel:"Light ✦",url:"https://wyltek-rpc.toastmanau.workers.dev/ckb-light",methods:k,rpcType:"light"},{id:"fiber",label:"Wyltek Fiber",shortLabel:"Fiber 🌐",url:"https://wyltek-rpc.toastmanau.workers.dev/fiber",methods:q,rpcType:"fiber"},{id:"custom",label:"Custom URL",shortLabel:"Custom",url:"",methods:y,rpcType:"ckb"}];let m=[],p=b[0],o=null,h={};async function T(e,n){const a=localStorage.getItem("rpc_ep_id")||"ckb-pub";p=b.find(r=>r.id===a)||b[0],o=null,h={},e.innerHTML=`
    <div class="rpc-wrap">
      <div class="rpc-block">
        <div class="rpc-block-label">Endpoint</div>
        <div class="rpc-ep-pills" id="rpc-ep-pills">
          ${b.map(r=>`
            <button class="rpc-ep-pill${r.id===p.id?" active":""}" data-epid="${r.id}">${r.shortLabel}</button>
          `).join("")}
        </div>
        <input id="rpc-custom-url" class="rpc-input" type="url"
          style="display:${p.id==="custom"?"block":"none"};margin-top:0.4rem"
          placeholder="https://…"
          value="${localStorage.getItem("rpc_custom_url")||""}">
      </div>

      <div class="rpc-block">
        <div class="rpc-block-label">Method</div>
        <div style="position:relative">
          <input id="rpc-search" class="rpc-input" type="text"
            autocomplete="off" autocorrect="off" spellcheck="false"
            placeholder="Search or type method…"
            value="">
          <div id="rpc-dd" class="rpc-dropdown" style="display:none"></div>
        </div>
        <div id="rpc-method-meta" style="display:none;margin-top:0.4rem"></div>
      </div>

      <div id="rpc-params-block" class="rpc-block" style="display:none">
        <div class="rpc-block-label">Parameters</div>
        <div id="rpc-param-fields"></div>
      </div>

      <button id="rpc-send" class="btn btn-accent btn-full rpc-send-btn" disabled>
        Make Call
      </button>

      <div id="rpc-result"></div>
      <div id="rpc-hist-wrap"></div>
    </div>
  `,E(),C();const l=localStorage.getItem("rpc_method_"+p.id);if(l){const r=p.methods.find(t=>t.m===l);r&&_(r)}document.getElementById("rpc-send").addEventListener("click",L),g()}function E(){var e,n;(e=document.getElementById("rpc-ep-pills"))==null||e.querySelectorAll(".rpc-ep-pill").forEach(a=>{a.addEventListener("click",()=>{var s,c,i;const l=b.find(d=>d.id===a.dataset.epid);if(!l)return;p=l,o=null,h={},localStorage.setItem("rpc_ep_id",l.id),document.querySelectorAll(".rpc-ep-pill").forEach(d=>d.classList.toggle("active",d.dataset.epid===l.id));const r=document.getElementById("rpc-custom-url");r&&(r.style.display=l.id==="custom"?"block":"none");const t=document.getElementById("rpc-search");t&&(t.value=""),I(),u(),(i=(c=(s=window.Telegram)==null?void 0:s.WebApp)==null?void 0:c.HapticFeedback)==null||i.selectionChanged()})}),(n=document.getElementById("rpc-custom-url"))==null||n.addEventListener("input",a=>{localStorage.setItem("rpc_custom_url",a.target.value),u()})}function C(){const e=document.getElementById("rpc-search"),n=document.getElementById("rpc-dd");e==null||e.addEventListener("focus",()=>v(e.value)),e==null||e.addEventListener("input",()=>v(e.value)),document.addEventListener("pointerdown",a=>{e&&!e.contains(a.target)&&n&&!n.contains(a.target)&&(n.style.display="none")},{capture:!0,passive:!0})}function v(e){const n=document.getElementById("rpc-dd");if(!n)return;const a=e.trim().toLowerCase(),l=p.methods,r=a?l.filter(s=>s.m.toLowerCase().includes(a)||s.cat.toLowerCase().includes(a)):l;if(!r.length){n.style.display="none";return}const t={};r.forEach(s=>{(t[s.cat]=t[s.cat]||[]).push(s)}),n.innerHTML=Object.entries(t).map(([s,c])=>`
    <div class="rpc-dd-cat">${s}</div>
    ${c.map(i=>`
      <div class="rpc-dd-item${(o==null?void 0:o.m)===i.m?" selected":""}" data-m="${i.m}">
        <span class="rpc-dd-name">${i.m}</span>
        <span class="rpc-dd-badge${i.params.length===0?" zero":""}">
          ${i.params.length===0?"no params":i.params.filter(d=>d.required).length+"+ args"}
        </span>
      </div>
    `).join("")}
  `).join(""),n.style.display="block",n.querySelectorAll(".rpc-dd-item").forEach(s=>{s.addEventListener("pointerdown",c=>{c.preventDefault();const i=p.methods.find(d=>d.m===s.dataset.m);i&&_(i),n.style.display="none"})})}function _(e){o=e,h={},localStorage.setItem("rpc_method_"+p.id,e.m);const n=document.getElementById("rpc-search");n&&(n.value=e.m);const a=document.getElementById("rpc-method-meta");a&&(a.style.display="flex",a.innerHTML=`
      <span class="rpc-cat-badge">${e.cat}</span>
      <span style="font-size:0.72rem;color:var(--text3)">
        ${e.params.filter(t=>t.required).length} required
        · ${e.params.filter(t=>!t.required).length} optional
      </span>
    `);const l=document.getElementById("rpc-params-block"),r=document.getElementById("rpc-param-fields");if(!l||!r){u();return}e.params.length===0?(l.style.display="none",r.innerHTML=""):(l.style.display="block",r.innerHTML=e.params.map((t,s)=>`
      <div class="rpc-param-row">
        <div class="rpc-param-header">
          <span class="rpc-param-name">${t.name}</span>
          <span class="rpc-param-badge ${t.required?"req":"opt"}">${t.required?"required":"optional"}</span>
        </div>
        <div class="rpc-param-hint">${t.label}</div>
        ${t.type==="json"?`<textarea class="rpc-input rpc-pf" data-name="${t.name}" data-req="${t.required}"
               rows="3" placeholder="Enter JSON…" spellcheck="false"></textarea>`:`<input class="rpc-input rpc-pf" data-name="${t.name}" data-req="${t.required}"
               type="text" placeholder="${t.type==="hex"||t.type==="hash"?"0x…":t.type==="bool"?"true / false":"…"}">`}
      </div>
    `).join(""),r.querySelectorAll(".rpc-pf").forEach(t=>{t.addEventListener("input",()=>{h[t.dataset.name]=t.value.trim(),u()})})),u()}function I(){o=null,document.getElementById("rpc-method-meta").style.display="none",document.getElementById("rpc-params-block").style.display="none",document.getElementById("rpc-param-fields").innerHTML=""}function u(){const e=document.getElementById("rpc-send");if(!e)return;if(!o){e.disabled=!0;return}const a=o.params.filter(r=>r.required).every(r=>(h[r.name]||"").length>0),l=p.id!=="custom"||(localStorage.getItem("rpc_custom_url")||"").length>5;e.disabled=!(a&&l)}async function L(){if(!o)return;const e=document.getElementById("rpc-send"),n=document.getElementById("rpc-result");e.disabled=!0,e.textContent="…";let a;if(o.params.length===0)a=p.rpcType==="fiber"?{}:[];else{const s=o.params.map(c=>{const i=(h[c.name]||"").trim();if(i){if(c.type==="json"||c.type==="bool")try{return JSON.parse(i)}catch{return i}return i}});for(;s.length&&s[s.length-1]===void 0;)s.pop();a=s.map(c=>c===void 0?null:c)}const l=p.id==="custom"?localStorage.getItem("rpc_custom_url")||"":p.url,r=Date.now();let t;try{const c=await(await fetch(l,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:Date.now(),method:o.m,params:a})})).json();t={url:l,method:o.m,params:a,result:c.result??c,error:c.error,ok:!c.error,ms:Date.now()-r}}catch(s){t={url:l,method:o.m,params:a,result:null,error:{message:s.message},ok:!1,ms:Date.now()-r}}m.unshift(t),m.length>20&&m.pop(),x(n,t),g(),e.textContent="Make Call",u()}function x(e,n){var t,s;if(!e)return;const a=JSON.stringify(n.error||n.result,null,2),r=a.split(`
`).length>25;e.innerHTML=`
    <div class="rpc-result ${n.ok?"ok":"err"}">
      <div class="rpc-result-hdr">
        <span class="${n.ok?"rpc-ok":"rpc-err"}">${n.ok?"✓ OK":"✗ Error"} · ${n.ms}ms</span>
        <div style="display:flex;gap:0.35rem">
          ${r?'<button class="rpc-tiny-btn" id="rpc-expand">Expand</button>':""}
          <button class="rpc-tiny-btn" id="rpc-copy">Copy</button>
        </div>
      </div>
      <pre class="rpc-pre${r?" trimmed":""}">${S(a)}</pre>
    </div>
  `,(t=document.getElementById("rpc-copy"))==null||t.addEventListener("click",()=>{var c,i,d,f;(c=navigator.clipboard)==null||c.writeText(a),(f=(d=(i=window.Telegram)==null?void 0:i.WebApp)==null?void 0:d.HapticFeedback)==null||f.notificationOccurred("success")}),(s=document.getElementById("rpc-expand"))==null||s.addEventListener("click",c=>{var i;(i=e.querySelector(".rpc-pre"))==null||i.classList.remove("trimmed"),c.target.remove()})}function S(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function g(){var n;const e=document.getElementById("rpc-hist-wrap");if(!e||!m.length){e&&(e.innerHTML="");return}e.innerHTML=`
    <div class="rpc-block">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="rpc-block-label">History</div>
        <button class="rpc-tiny-btn" id="rpc-clr">Clear</button>
      </div>
      ${m.slice(0,10).map((a,l)=>`
        <div class="rpc-hist-row" data-i="${l}">
          <span class="rpc-hist-m">${a.method}</span>
          <span class="rpc-hist-s ${a.ok?"ok":"err"}">${a.ok?"✓":"✗"} ${a.ms}ms</span>
        </div>
      `).join("")}
    </div>
  `,(n=document.getElementById("rpc-clr"))==null||n.addEventListener("click",()=>{m=[],g()}),e.querySelectorAll(".rpc-hist-row").forEach(a=>{a.addEventListener("click",()=>{const l=m[a.dataset.i];if(!l)return;const r=p.methods.find(t=>t.m===l.method);r&&_(r),x(document.getElementById("rpc-result"),l)})})}export{T as renderRPCConsole};

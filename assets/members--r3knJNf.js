import{s as o}from"./supabase-B4HPT40D.js";async function v(t,s){t.innerHTML=`
    <div class="card" style="margin-bottom:1rem">
      <div class="card-title">Founding Members</div>
      <div class="stat-row">
        <span class="stat-label">DOB NFTs minted</span>
        <span class="stat-value accent" id="member-count">…</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total supply</span>
        <span class="stat-value">50</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Chain</span>
        <span class="stat-value">CKB Mainnet</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Protocol</span>
        <span class="stat-value">Spore DOB</span>
      </div>
    </div>

    ${s.address?"":`
    <div class="card" style="text-align:center;padding:1.5rem">
      <div style="font-size:2rem;margin-bottom:0.5rem">👾</div>
      <p style="color:var(--muted);font-size:0.85rem;margin:0 0 1rem">
        Connect your wallet to check your member status
      </p>
    </div>`}

    <div id="members-grid"><div class="spinner"></div></div>
  `,await c(s)}async function c(t){const s=document.getElementById("members-grid");if(s)try{const{data:a,error:l}=await o.from("mint_queue").select("member_number, ckb_address, spore_id, minted_at").not("spore_id","is",null).order("member_number",{ascending:!0}),r=a||[];document.getElementById("member-count").textContent=r.length,s.innerHTML=r.map(e=>{const n=t.address&&e.ckb_address===t.address,i=e.ckb_address?e.ckb_address.slice(0,12)+"…"+e.ckb_address.slice(-8):"—",d=e.spore_id?e.spore_id.slice(0,10)+"…":"—";return`
        <div class="member-card ${n?"you":""}" style="${n?"border-color:var(--accent);":""}">
          <div class="member-num">#${e.member_number}</div>
          <div style="flex:1;min-width:0">
            <div class="member-addr">${i} ${n?"← you":""}</div>
            <div style="font-size:0.68rem;color:var(--muted);margin-top:2px">
              Spore: ${d}
            </div>
          </div>
          ${e.spore_id?`
          <a href="https://explorer.nervos.org/transaction/${e.spore_id}" 
             target="_blank"
             style="color:var(--accent);font-size:0.75rem;text-decoration:none;flex-shrink:0">
            View ↗
          </a>`:""}
        </div>
      `}).join(""),r.length===0&&(s.innerHTML='<div class="empty-state"><div class="icon">👾</div><p>No members minted yet</p></div>')}catch(a){s.innerHTML=`<div class="empty-state"><div class="icon">⚠️</div><p>${a.message}</p></div>`}}export{v as renderMembers};

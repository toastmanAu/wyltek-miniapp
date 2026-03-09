async function v(t,n){t.innerHTML='<div class="spinner"></div>';let e=[];try{const c=(await(await fetch("https://raw.githubusercontent.com/toastmanAu/wyltek-industries/master/js/research-tasks.js")).text()).match(/const\s+TASKS\s*=\s*(\[[\s\S]*?\]);/);c&&(e=JSON.parse(c[1]))}catch(s){t.innerHTML=`<div class="empty-state"><span class="icon">⚠️</span><p>Could not load queue: ${s.message}</p></div>`;return}const a=e.filter(s=>s.status==="PENDING"),i=e.filter(s=>s.status==="IN_PROGRESS"),l=e.filter(s=>s.status==="DONE");t.innerHTML=`
    <div class="stats-strip">
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--orange)">${a.length}</div>
        <div class="stat-chip-label">Pending</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--accent)">${i.length}</div>
        <div class="stat-chip-label">Active</div>
      </div>
      <div class="stat-chip">
        <div class="stat-chip-val" style="color:var(--green)">${l.length}</div>
        <div class="stat-chip-label">Done</div>
      </div>
    </div>

    ${i.length>0?`
    <div class="section-header">In Progress</div>
    ${i.map(s=>r(s)).join("")}
    `:""}

    <div class="section-header">Pending (${a.length})</div>
    ${a.slice(0,12).map(s=>r(s)).join("")}
    ${a.length>12?`<div style="text-align:center;color:var(--text3);font-size:0.75rem;padding:0.5rem">+${a.length-12} more</div>`:""}
  `}function r(t){const n={HIGH:"🔴",MEDIUM:"🟡",LOW:"🟢",SYNTHESIS:"🔵"},e={PENDING:"var(--text3)",IN_PROGRESS:"var(--accent)",DONE:"var(--green)"};return`
    <div class="research-item">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
        <span>${n[t.priority]||"⚪"}</span>
        <div class="research-item-title" style="margin:0">${t.title||t.id}</div>
      </div>
      <div class="research-item-meta">
        <span style="color:${e[t.status]}">${t.status}</span>
        ${t.tags?t.tags.slice(0,3).map(a=>`<span class="pill blue">${a}</span>`).join(""):""}
      </div>
    </div>
  `}export{v as renderQueue};

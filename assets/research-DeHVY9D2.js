import"./supabase-B4HPT40D.js";async function f(n,c){n.innerHTML=`
    <div class="section-header">Research</div>
    <div class="search-bar">
      <input id="research-search" class="search-input" placeholder="🔍  Search findings…">
      <select id="research-filter" class="filter-dropdown">
        <option value="">All</option>
        <option value="DONE">✅ Done</option>
        <option value="IN_PROGRESS">🔄 Active</option>
        <option value="PENDING">⏳ Pending</option>
      </select>
    </div>
    <div id="research-list"><div class="spinner"></div></div>
  `,await d();let t;document.getElementById("research-search").addEventListener("input",i=>{clearTimeout(t),t=setTimeout(()=>d(i.target.value,document.getElementById("research-filter").value),280)}),document.getElementById("research-filter").addEventListener("change",i=>{d(document.getElementById("research-search").value,i.target.value)})}async function d(n="",c=""){const t=document.getElementById("research-list");if(t)try{const h=await(await fetch("https://wyltekindustries.com/js/research-tasks.js")).text();let l=[];const o=h.match(/const RESEARCH_TASKS\s*=\s*(\[[\s\S]*?\]);/);if(o)try{l=JSON.parse(o[1])}catch{}let r=l;if(n){const e=n.toLowerCase();r=r.filter(s=>{var a,p,u;return((a=s.title)==null?void 0:a.toLowerCase().includes(e))||((p=s.description)==null?void 0:p.toLowerCase().includes(e))||((u=s.tags)==null?void 0:u.some(m=>m.toLowerCase().includes(e)))})}if(c&&(r=r.filter(e=>e.status===c)),!r.length){t.innerHTML='<div class="empty-state"><div class="icon">🔬</div><p>No results found</p></div>';return}const v=e=>e==="DONE"?'<span class="status-dot done"></span>':e==="IN_PROGRESS"?'<span class="status-dot progress"></span>':'<span class="status-dot pending"></span>';t.innerHTML=r.slice(0,40).map(e=>{var s;return`
      <div class="research-item" data-id="${e.id}">
        <div class="research-item-title">${e.title||e.id}</div>
        <div class="research-item-meta">
          <span>${v(e.status)}${e.status||""}</span>
          ${e.priority?`<span>${e.priority}</span>`:""}
          ${e.date?`<span>${e.date}</span>`:""}
        </div>
        ${(s=e.tags)!=null&&s.length?`<div class="research-item-tags">
          ${e.tags.slice(0,4).map(a=>`<span class="pill">${a}</span>`).join("")}
        </div>`:""}
      </div>
    `}).join(""),t.querySelectorAll(".research-item").forEach(e=>{e.addEventListener("click",()=>{var s,a;(a=(s=window.Telegram)==null?void 0:s.WebApp)==null||a.openLink(`https://wyltekindustries.com/research.html#${e.dataset.id}`)})})}catch(i){t.innerHTML=`<div class="empty-state"><div class="icon">⚠️</div><p>${i.message}</p></div>`}}export{f as renderResearch};

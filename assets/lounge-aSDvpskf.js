import{s as l}from"./supabase-B4HPT40D.js";const r="general";let d=null,i=[];async function h(e,s){if(e.innerHTML=`
    <div class="section-header" style="margin-bottom:0.5rem">Lounge</div>
    <div class="message-list" id="message-list"></div>
    ${s.address?`
    <div class="compose-bar">
      <input class="compose-input" id="lounge-input" placeholder="Say something…" maxlength="500">
      <button class="compose-send" id="lounge-send">↑</button>
    </div>`:`
    <div style="position:fixed;bottom:calc(var(--nav-h) + env(safe-area-inset-bottom,0px));left:0;right:0;
      background:rgba(7,9,15,0.9);backdrop-filter:blur(20px);border-top:1px solid var(--border);
      padding:0.75rem 1rem;text-align:center;font-size:0.82rem;color:var(--text2)">
      Connect wallet to send messages
    </div>`}
  `,await p(),b(),s.address){const n=document.getElementById("lounge-input");document.getElementById("lounge-send").addEventListener("click",()=>m(s,n)),n.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),m(s,n))})}}async function p(){const{data:e}=await l.from("lounge_messages").select("*").eq("channel",r).eq("deleted",!1).order("created_at",{ascending:!0}).limit(50);i=e||[],u()}function u(){const e=document.getElementById("message-list");if(e){if(!i.length){e.innerHTML='<div class="empty-state"><div class="icon">🛋️</div><p>No messages yet — say hi!</p></div>';return}e.innerHTML=i.map(s=>{const n=s.address?s.address.slice(0,10)+"…"+s.address.slice(-6):"anon",t=new Date(s.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return`
      <div class="message-bubble">
        <div class="message-meta">
          <span class="message-addr">${n}</span>
          <span class="message-time">${t}</span>
        </div>
        <div class="message-body">${f(s.message||s.content||"")}</div>
      </div>
    `}).join(""),e.scrollTop=e.scrollHeight}}function b(){if(d)try{d.unsubscribe()}catch{}d=l.channel("lounge-mini").on("postgres_changes",{event:"INSERT",schema:"public",table:"lounge_messages",filter:`channel=eq.${r}`},e=>{e.new.deleted||(i.push(e.new),u())}).subscribe()}async function m(e,s){var a,o,c;const n=s.value.trim();if(!n||!e.address)return;s.value="";const t=document.getElementById("lounge-send");t&&(t.disabled=!0);try{const{error:g}=await l.from("lounge_messages").insert({address:e.address,channel:r,message:n,deleted:!1});if(g)throw g;(c=(o=(a=window.Telegram)==null?void 0:a.WebApp)==null?void 0:o.HapticFeedback)==null||c.impactOccurred("light")}catch{s.value=n}finally{t&&(t.disabled=!1)}}function f(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}export{h as renderLounge};

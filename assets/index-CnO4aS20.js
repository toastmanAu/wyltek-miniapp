const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/home-RAVHmNfo.js","assets/supabase-B4HPT40D.js","assets/mint-DZyAax8d.js","assets/lounge-aSDvpskf.js","assets/members--r3knJNf.js","assets/research-DeHVY9D2.js"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function o(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(n){if(n.ep)return;n.ep=!0;const a=o(n);fetch(n.href,a)}})();const M="modulepreload",F=function(e){return"/"+e},A={},d=function(t,o,r){let n=Promise.resolve();if(o&&o.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),c=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));n=Promise.allSettled(o.map(m=>{if(m=F(m),m in A)return;A[m]=!0;const f=m.endsWith(".css"),b=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${b}`))return;const i=document.createElement("link");if(i.rel=f?"stylesheet":M,f||(i.as="script"),i.crossOrigin="",i.href=m,c&&i.setAttribute("nonce",c),document.head.appendChild(i),f)return new Promise((p,h)=>{i.addEventListener("load",p),i.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${m}`)))})}))}function a(s){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=s,window.dispatchEvent(c),!c.defaultPrevented)throw s}return n.then(s=>{for(const c of s||[])c.status==="rejected"&&a(c.reason);return t().catch(a)})};function V(e){document.getElementById("tab-content").addEventListener("click",t=>{const o=t.target.closest(".tool-btn[data-tab]");if(!o)return;const r=o.dataset.tab;r&&(t.stopPropagation(),q(o,r,e))})}function q(e,t,o){var p,h,g;const r=document.getElementById("tab-content"),n=e.getBoundingClientRect(),a=r.getBoundingClientRect(),s=e.dataset.color||"var(--surface2)",c=document.createElement("div");c.style.cssText=`
    position: fixed;
    z-index: 50;
    border-radius: 14px;
    pointer-events: none;
    will-change: transform, border-radius;
    background: ${s};
    border: 1px solid rgba(255,255,255,0.1);
    left:   ${n.left}px;
    top:    ${n.top}px;
    width:  ${n.width}px;
    height: ${n.height}px;
    transition: none;
  `,document.body.appendChild(c),c.getBoundingClientRect();const m=a.left-n.left,f=a.top-n.top,b=a.width/n.width,i=a.height/n.height;c.style.transition="transform 0.32s cubic-bezier(0.4,0,0.2,1), border-radius 0.32s ease, opacity 0.1s 0.28s",c.style.transform=`translate(${m}px, ${f}px) scale(${b}, ${i})`,c.style.borderRadius="0px",(g=(h=(p=window.Telegram)==null?void 0:p.WebApp)==null?void 0:h.HapticFeedback)==null||g.impactOccurred("medium"),c.addEventListener("transitionend",async function x(E){E.propertyName==="transform"&&(c.removeEventListener("transitionend",x),await o(t),c.style.transition="opacity 0.18s ease",c.style.opacity="0",c.addEventListener("transitionend",()=>c.remove(),{once:!0}))},{once:!1})}function H(){const e=document.createElement("canvas");e.id="particle-canvas",e.style.cssText=`
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.45;
  `,document.getElementById("app").prepend(e);const t=e.getContext("2d");let o,r,n,a;function s(){o=e.width=window.innerWidth,r=e.height=window.innerHeight}function c(){return{x:Math.random()*o,y:Math.random()*r,r:Math.random()*1.2+.3,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,life:Math.random(),speed:Math.random()*.003+.001,hue:Math.random()>.7?200:210}}function m(){s(),n=Array.from({length:55},c)}function f(){for(let i=0;i<n.length;i++)for(let p=i+1;p<n.length;p++){const h=n[i],g=n[p],x=h.x-g.x,E=h.y-g.y,T=Math.sqrt(x*x+E*E);if(T<90){const D=(1-T/90)*.12;t.strokeStyle=`rgba(0,212,255,${D})`,t.lineWidth=.5,t.beginPath(),t.moveTo(h.x,h.y),t.lineTo(g.x,g.y),t.stroke()}}}function b(){t.clearRect(0,0,o,r),f();for(const i of n){i.x+=i.vx,i.y+=i.vy,i.life+=i.speed,i.x<0&&(i.x=o),i.x>o&&(i.x=0),i.y<0&&(i.y=r),i.y>r&&(i.y=0);const p=.3+.5*Math.sin(i.life*Math.PI*2);t.beginPath(),t.arc(i.x,i.y,i.r,0,Math.PI*2),t.fillStyle=`hsla(${i.hue},100%,70%,${p})`,t.fill()}a=requestAnimationFrame(b)}return m(),b(),window.addEventListener("resize",()=>{s(),m()}),()=>cancelAnimationFrame(a)}function W(){if(document.addEventListener("pointerdown",e=>{const t=e.target.closest(".tool-btn, .btn, .nav-btn, .chain-seg-btn, .fiber-tab");if(!t)return;const o=t.getBoundingClientRect(),r=e.clientX-o.left,n=e.clientY-o.top,a=Math.max(o.width,o.height)*2,s=document.createElement("span");s.style.cssText=`
      position: absolute;
      border-radius: 50%;
      width: ${a}px; height: ${a}px;
      left: ${r-a/2}px; top: ${n-a/2}px;
      background: rgba(255,255,255,0.12);
      pointer-events: none;
      transform: scale(0);
      animation: ripple-anim 0.5s ease-out forwards;
      z-index: 99;
    `,getComputedStyle(t).position==="static"&&(t.style.position="relative"),t.style.overflow="hidden",t.appendChild(s),s.addEventListener("animationend",()=>s.remove())}),!document.getElementById("ripple-kf")){const e=document.createElement("style");e.id="ripple-kf",e.textContent=`@keyframes ripple-anim {
      to { transform: scale(1); opacity: 0; }
    }`,document.head.appendChild(e)}}function U(){if(!document.getElementById("shimmer-kf")){const e=document.createElement("style");e.id="shimmer-kf",e.textContent=`
      @keyframes hero-sweep {
        0%   { transform: translateX(-100%) skewX(-20deg); }
        100% { transform: translateX(250%)  skewX(-20deg); }
      }
      .stat-hero::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 40%; height: 100%;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(255,255,255,0.055) 50%,
          transparent 100%
        );
        animation: hero-sweep 3.5s ease-in-out infinite;
        pointer-events: none;
      }
    `,document.head.appendChild(e)}}let P=null,k=null;function ee(e){k=e,O(),P=setInterval(async()=>{try{const o=await(await fetch("https://mainnet.ckbapp.dev/rpc",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"get_tip_block_number",params:[]})})).json(),r=parseInt(o.result,16);r!==k&&(k=r,j(r))}catch{}},8e3)}function O(){P&&clearInterval(P)}function j(e){const t=document.querySelector(".ckb-hero .stat-hero-value");if(!t)return;t.textContent=e.toLocaleString(),t.style.transition="text-shadow 0.1s",t.style.textShadow="0 0 20px rgba(0,212,255,0.9), 0 0 40px rgba(0,212,255,0.5)",setTimeout(()=>{t.style.textShadow=""},800);const o=document.querySelector(".live-dot");o&&(o.classList.remove("live-dot-ping"),o.offsetWidth,o.classList.add("live-dot-ping"))}function N(){if(document.getElementById("live-dot-kf"))return;const e=document.createElement("style");e.id="live-dot-kf",e.textContent=`
    .live-dot {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--green);
      margin-right: 5px;
      vertical-align: middle;
      position: relative;
    }
    .live-dot::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: rgba(16,185,129,0.35);
      animation: dot-ring 2s ease-out infinite;
    }
    .live-dot-ping::after {
      animation: dot-ring-fast 0.6s ease-out;
    }
    @keyframes dot-ring {
      0%   { transform: scale(0.8); opacity: 0.8; }
      70%  { transform: scale(1.8); opacity: 0; }
      100% { transform: scale(0.8); opacity: 0; }
    }
    @keyframes dot-ring-fast {
      0%   { transform: scale(0.8); opacity: 1; background: rgba(0,212,255,0.6); }
      100% { transform: scale(3);   opacity: 0; }
    }
    .glitch {
      animation: glitch 0.15s steps(2) 3;
    }
    @keyframes glitch {
      0%   { transform: translate(0,0);  }
      25%  { transform: translate(-2px,1px); filter: hue-rotate(90deg); }
      50%  { transform: translate(2px,-1px); }
      75%  { transform: translate(-1px,0); }
      100% { transform: translate(0,0); }
    }
    .fade-in-up {
      animation: fade-in-up 0.35s ease both;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .stagger > * {
      animation: fade-in-up 0.3s ease both;
    }
    .stagger > *:nth-child(1) { animation-delay: 0.04s }
    .stagger > *:nth-child(2) { animation-delay: 0.09s }
    .stagger > *:nth-child(3) { animation-delay: 0.14s }
    .stagger > *:nth-child(4) { animation-delay: 0.18s }
    .stagger > *:nth-child(5) { animation-delay: 0.22s }
    .stagger > *:nth-child(6) { animation-delay: 0.26s }
  `,document.head.appendChild(e)}const z={network:"mainnet",joyidAppURL:"https://app.joy.id",name:"Wyltek Industries",logo:"https://wyltekindustries.com/wyltek-mark.png",redirectURL:location.href};let J=null;async function X(){try{const{initConfig:e}=await d(async()=>{const{initConfig:t}=await import("./index-C9V-41FN.js").then(o=>o.i);return{initConfig:t}},[]);e(z),J=!0,console.log("[Auth] JoyID miniapp initialised")}catch(e){console.warn("[Auth] JoyID miniapp not available:",e.message)}}async function Y(){try{const{connect:e}=await d(async()=>{const{connect:o}=await import("./index-C9V-41FN.js").then(r=>r.i);return{connect:o}},[]),t=await e();return(t==null?void 0:t.address)||null}catch(e){throw console.error("[Auth] JoyID connect failed:",e),e}}const R={home:()=>d(()=>import("./splash-Ccn6vKw2.js"),[]).then(e=>e.renderSplash),"chain.ckb":()=>d(()=>import("./chain-BLp2ohdM.js"),[]).then(e=>e.renderCKBTab),"chain.btc":()=>d(()=>import("./chain-BLp2ohdM.js"),[]).then(e=>e.renderBTCTab),"chain.fiber":()=>d(()=>import("./fiber-DM8BdS61.js"),[]).then(e=>e.renderFiber),"chain.rpc":()=>d(()=>import("./chain-BLp2ohdM.js"),[]).then(e=>e.renderRPCTab),"tools.home":()=>d(()=>import("./home-RAVHmNfo.js"),__vite__mapDeps([0,1])).then(e=>e.renderHome),"tools.wallet":()=>d(()=>import("./wallet-BvN3twGl.js"),[]).then(e=>e.renderWallet),"tools.mint":()=>d(()=>import("./mint-DZyAax8d.js"),__vite__mapDeps([2,1])).then(e=>e.renderMint),"social.lounge":()=>d(()=>import("./lounge-aSDvpskf.js"),__vite__mapDeps([3,1])).then(e=>e.renderLounge),"social.members":()=>d(()=>import("./members--r3knJNf.js"),__vite__mapDeps([4,1])).then(e=>e.renderMembers),"research.browse":()=>d(()=>import("./research-DeHVY9D2.js"),__vite__mapDeps([5,1])).then(e=>e.renderResearch),"research.queue":()=>d(()=>import("./research-queue-CTWg-woz.js"),[]).then(e=>e.renderQueue),"settings.node":()=>d(()=>import("./settings-Cc7irVnt.js"),[]).then(e=>e.renderSettings),"settings.about":()=>d(()=>import("./about-DL07QELz.js"),[]).then(e=>e.renderAbout)},K={home:[],chain:[{id:"chain.ckb",icon:"⚡",label:"CKB",color:"var(--accent)"},{id:"chain.btc",icon:"₿",label:"Bitcoin",color:"#f7931a"},{id:"chain.fiber",icon:"🌐",label:"Fiber",color:"var(--purple)"},{id:"chain.rpc",icon:"🔌",label:"RPC",color:"var(--green)"}],tools:[{id:"tools.home",icon:"🏠",label:"Overview",color:"var(--accent)"},{id:"tools.wallet",icon:"💳",label:"Wallet",color:"var(--green)"},{id:"tools.mint",icon:"🎨",label:"Mint DOB",color:"var(--purple)"}],social:[{id:"social.lounge",icon:"💬",label:"Lounge",color:"var(--green)"},{id:"social.members",icon:"👾",label:"Members",color:"var(--accent2)"}],research:[{id:"research.browse",icon:"📄",label:"Findings",color:"var(--purple)"},{id:"research.queue",icon:"📋",label:"Queue",color:"var(--orange)"}],settings:[{id:"settings.node",icon:"🔗",label:"Node",color:"var(--accent)"},{id:"settings.about",icon:"ℹ️",label:"About",color:"var(--text2)"}]},w={home:"home",chain:"chain.ckb",tools:"tools.home",social:"social.lounge",research:"research.browse",settings:"settings.node"};var B;const l=(B=window.Telegram)==null?void 0:B.WebApp;l&&(l.ready(),l.expand(),l.enableClosingConfirmation(),document.documentElement.style.setProperty("--bg",l.themeParams.bg_color||"#07090f"));var S;const u={primary:"chain",sub:"chain.ckb",address:null,tgUser:((S=l==null?void 0:l.initDataUnsafe)==null?void 0:S.user)||null},v=document.getElementById("tab-content"),_=document.getElementById("sub-nav");function Q(e,t){const o=K[e]||[],r=document.getElementById("app-header");if(o.length<=1){_.innerHTML="",_.classList.remove("visible"),r.classList.remove("has-subnav");return}_.classList.add("visible"),r.classList.add("has-subnav"),_.innerHTML=o.map(n=>`
    <button class="sub-tab-btn ${n.id===t?"active":""}"
      data-sub="${n.id}"
      style="--sub-color:${n.color}">
      <span class="sub-tab-icon">${n.icon}</span>
      <span class="sub-tab-label">${n.label}</span>
    </button>
  `).join(""),_.querySelectorAll(".sub-tab-btn").forEach(n=>{n.addEventListener("click",()=>{var s;const a=n.dataset.sub;a!==u.sub&&($(a),(s=l==null?void 0:l.HapticFeedback)==null||s.selectionChanged())})})}async function y(e){e.includes(".")||(e=w[e]||e),await $(e)}async function $(e){const[t]=e.split(".");u.primary=t,u.sub=e,document.querySelectorAll(".nav-btn").forEach(r=>{r.classList.toggle("active",r.dataset.tab===t)});const o=document.getElementById("home-btn");o&&o.classList.toggle("at-home",t==="home"),Q(t,e),O(),v.innerHTML='<div class="spinner"></div>';try{const r=R[e];if(!r)throw new Error(`No renderer for ${e}`);await(await r())(v,u),v.classList.remove("stagger"),v.offsetWidth,v.classList.add("stagger")}catch(r){v.innerHTML=`<div class="empty-state">
      <div class="icon">⚠️</div>
      <p>${r.message||"Something went wrong"}</p>
    </div>`,console.error("[navigate]",e,r)}}document.querySelectorAll(".nav-btn").forEach(e=>{e.addEventListener("click",()=>{var o;const t=e.dataset.tab;t===u.primary?y(w[t]):y(t),(o=l==null?void 0:l.HapticFeedback)==null||o.selectionChanged()})});const C=document.getElementById("auth-badge"),L=document.getElementById("auth-label");async function I(){u.address?(L.textContent=u.address.slice(0,10)+"…"+u.address.slice(-6),C.classList.add("connected")):(L.textContent="Connect",C.classList.remove("connected"))}C.addEventListener("click",async()=>{var e;if(u.address){l==null||l.showPopup({title:"Connected",message:u.address,buttons:[{id:"copy",type:"default",text:"Copy Address"},{id:"dc",type:"destructive",text:"Disconnect"},{id:"x",type:"cancel"}]},t=>{t==="dc"&&(u.address=null,localStorage.removeItem("wyltek_address"),I(),y(u.sub))});return}L.textContent="...";try{const t=await Y();t&&(u.address=t,localStorage.setItem("wyltek_address",t),I(),y(u.sub),(e=l==null?void 0:l.HapticFeedback)==null||e.notificationOccurred("success"))}catch{L.textContent="Connect"}});async function G(){var r,n;const e=localStorage.getItem("wyltek_address");e&&(u.address=e),await X(),await I(),N(),H(),W(),U(),V(y),(r=document.getElementById("home-btn"))==null||r.addEventListener("click",()=>{var a,s;if(u.primary==="home"){const c=document.querySelector(".logo-mark");if(!c)return;c.classList.remove("glitch"),c.offsetWidth,c.classList.add("glitch"),(a=l==null?void 0:l.HapticFeedback)==null||a.impactOccurred("heavy"),Z(c.getBoundingClientRect())}else y("home"),(s=l==null?void 0:l.HapticFeedback)==null||s.impactOccurred("light")});const t=((n=l==null?void 0:l.initDataUnsafe)==null?void 0:n.start_param)||"",o=R[t]?t:w[t]?w[t]:"home";await y(o)}function Z(e){const t=e.left+e.width/2,o=e.top+e.height/2;for(let r=0;r<12;r++){const n=document.createElement("div"),a=r/12*Math.PI*2,s=30+Math.random()*40;n.style.cssText=`
      position:fixed;z-index:999;border-radius:50%;
      width:5px;height:5px;
      background:hsl(${185+Math.random()*40},100%,65%);
      left:${t}px;top:${o}px;pointer-events:none;
      transition:transform ${.4+Math.random()*.3}s ease-out,opacity 0.5s ease-out;
    `,document.body.appendChild(n),requestAnimationFrame(()=>{n.style.transform=`translate(${Math.cos(a)*s}px,${Math.sin(a)*s}px) scale(0)`,n.style.opacity="0"}),setTimeout(()=>n.remove(),800)}}G();export{O as a,y as n,ee as s};

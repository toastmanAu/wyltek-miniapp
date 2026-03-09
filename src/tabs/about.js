/**
 * about.js — project info, links, credits
 */
export async function renderAbout(el, state) {
  el.innerHTML = `
    <div class="card-glow" style="text-align:center;padding:1.5rem 1rem">
      <img src="/wyltek-mark.png" style="width:60px;height:60px;border-radius:14px;margin-bottom:0.875rem;box-shadow:0 4px 20px rgba(0,212,255,0.2)">
      <div style="font-size:1.15rem;font-weight:800;letter-spacing:-0.03em">Wyltek Industries</div>
      <div style="font-size:0.78rem;color:var(--text2);margin-top:0.25rem">Building on Nervos CKB · Adelaide, Australia</div>
    </div>

    <div class="section-header">Links</div>
    <div class="settings-group">
      ${[
        { icon:'🌐', label:'wyltekindustries.com',    desc:'Main site · research · members',  href:'https://wyltekindustries.com' },
        { icon:'🐙', label:'GitHub',                   desc:'toastmanAu — open source projects', href:'https://github.com/toastmanAu' },
        { icon:'📢', label:'Nervos Unofficial TG',     desc:'Community group',                  href:'https://t.me/NervosUnofficial' },
        { icon:'🔬', label:'Nervos Network',           desc:'CKB blockchain ecosystem',         href:'https://nervos.org' },
      ].map(item => `
        <div class="settings-row" onclick="window.Telegram?.WebApp?.openLink('${item.href}')">
          <div class="settings-icon" style="background:rgba(0,212,255,0.08)">${item.icon}</div>
          <div class="settings-text">
            <div class="settings-label">${item.label}</div>
            <div class="settings-desc">${item.desc}</div>
          </div>
          <div class="settings-chevron">↗</div>
        </div>
      `).join('')}
    </div>

    <div class="section-header">Mini App</div>
    <div class="card">
      <div class="stat-row"><span class="stat-label">Version</span><span class="stat-value">v4 (2026-03)</span></div>
      <div class="stat-row"><span class="stat-label">Stack</span><span class="stat-value">Vite · Vanilla JS</span></div>
      <div class="stat-row"><span class="stat-label">Auth</span><span class="stat-value">JoyID passkey</span></div>
      <div class="stat-row"><span class="stat-label">Backend</span><span class="stat-value">Supabase</span></div>
      <div class="stat-row"><span class="stat-label">Source</span>
        <span class="stat-value" style="cursor:pointer;color:var(--accent)"
          onclick="window.Telegram?.WebApp?.openLink('https://github.com/toastmanAu/wyltek-miniapp')">
          GitHub ↗
        </span>
      </div>
    </div>

    <div style="text-align:center;color:var(--text3);font-size:0.7rem;padding:0.5rem">
      Built by Kernel 🐧 on Raspberry Pi 5 · Powered by CKB
    </div>
  `
}

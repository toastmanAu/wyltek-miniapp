/**
 * tools/mint.js — Founding Member DOB minting info + queue status
 */
import { sb } from '../supabase.js'

export async function renderMint(el, state) {
  el.innerHTML = `<div class="spinner"></div>`

  let memberCount = 50
  let minted = 0
  try {
    const { count } = await sb.from('mint_queue').select('*', { count: 'exact', head: true })
    minted = count || 0
  } catch {}

  const pct = Math.round((minted / memberCount) * 100)
  const remaining = memberCount - minted
  const userMinted = state.address ? null : null

  el.innerHTML = `
    <div class="card-glow" style="text-align:center;padding:1.5rem 1rem">
      <div style="font-size:2.5rem;margin-bottom:0.5rem">👾</div>
      <div style="font-size:1.1rem;font-weight:800;margin-bottom:0.25rem">Founding Member DOBs</div>
      <div style="font-size:0.82rem;color:var(--text2);margin-bottom:1.25rem">50 Spore NFTs · CKB Mainnet · Free to members</div>

      <div style="margin-bottom:0.5rem">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:700;margin-bottom:0.35rem">
          <span style="color:var(--accent)">${minted} minted</span>
          <span style="color:var(--text3)">${remaining} remaining</span>
        </div>
        <div style="background:var(--surface2);border-radius:6px;height:8px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--purple));border-radius:6px;transition:width 0.5s"></div>
        </div>
        <div style="font-size:0.68rem;color:var(--text3);margin-top:0.3rem">${pct}% claimed</div>
      </div>
    </div>

    ${state.address ? `
    <div class="card">
      <div class="card-title">Your Status</div>
      <div id="mint-status"><div class="skeleton" style="height:1rem;margin:0.5rem 0"></div></div>
    </div>
    ` : `
    <div class="card" style="text-align:center;padding:1.25rem">
      <div style="color:var(--text2);font-size:0.875rem;margin-bottom:0.75rem">Connect wallet to check your membership status</div>
      <button class="btn btn-accent btn-sm" id="mint-connect">Connect JoyID</button>
    </div>
    `}

    <div class="card">
      <div class="card-title">Cluster Details</div>
      <div class="stat-row"><span class="stat-label">Protocol</span><span class="stat-value">Spore DOB v1</span></div>
      <div class="stat-row"><span class="stat-label">Cluster ID</span><span class="stat-value" style="font-size:0.64rem">0x54ba3ee2…979f4e8</span></div>
      <div class="stat-row"><span class="stat-label">Supply</span><span class="stat-value">50 total</span></div>
      <div class="stat-row"><span class="stat-label">Network</span><span class="stat-value green">CKB Mainnet</span></div>
    </div>

    <button class="btn btn-ghost btn-full" onclick="window.Telegram?.WebApp?.openLink('https://wyltekindustries.com/members.html')">
      View Members Page ↗
    </button>
  `

  document.getElementById('mint-connect')?.addEventListener('click', () => {
    document.getElementById('auth-badge')?.click()
  })

  if (state.address) {
    try {
      const { data } = await sb.from('mint_queue')
        .select('member_number,spore_id,status')
        .eq('ckb_address', state.address)
        .single()
      const el2 = document.getElementById('mint-status')
      if (!el2) return
      if (data?.spore_id) {
        el2.innerHTML = `
          <div class="stat-row"><span class="stat-label">Member #</span><span class="stat-value accent">#${data.member_number}</span></div>
          <div class="stat-row"><span class="stat-label">DOB Minted</span><span class="stat-value green">✓ Yes</span></div>
          <div class="stat-row"><span class="stat-label">Spore ID</span><span class="stat-value" style="font-size:0.64rem">${data.spore_id.slice(0,22)}…</span></div>
        `
      } else if (data) {
        el2.innerHTML = `
          <div class="stat-row"><span class="stat-label">Member #</span><span class="stat-value accent">#${data.member_number}</span></div>
          <div class="stat-row"><span class="stat-label">DOB Status</span><span class="stat-value orange">Pending mint</span></div>
        `
      } else {
        el2.innerHTML = `<div style="color:var(--text3);font-size:0.82rem;padding:0.5rem 0">Not yet registered — sign up at wyltekindustries.com</div>`
      }
    } catch {}
  }
}

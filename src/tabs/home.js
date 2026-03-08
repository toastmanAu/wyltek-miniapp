/**
 * Home tab — portfolio overview
 * Shows: CKB address, balance (from light client), quick links
 */
import { sb } from '../supabase.js'
import { ckbRpc, formatCKB } from '../rpc.js'

export async function renderHome(el, state) {
  if (!state.address) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem">
        <img src="/wyltek-mark.png" style="width:72px;border-radius:16px;margin-bottom:1.5rem">
        <h2 style="color:var(--text);margin:0 0 0.5rem">Wyltek Industries</h2>
        <p style="color:var(--muted);font-size:0.9rem;margin-bottom:2rem">
          CKB tools, research, and community.<br>Connect your JoyID wallet to get started.
        </p>
        <div class="card" style="text-align:left">
          <div class="card-title">What's here</div>
          <div class="stat-row"><span class="stat-label">⛓️ Chain</span><span class="stat-value">Live CKB + BTC nodes</span></div>
          <div class="stat-row"><span class="stat-label">🔬 Research</span><span class="stat-value">CKB ecosystem findings</span></div>
          <div class="stat-row"><span class="stat-label">🛋️ Lounge</span><span class="stat-value">Community chat</span></div>
          <div class="stat-row"><span class="stat-label">👾 Members</span><span class="stat-value">Founding DOB NFTs</span></div>
        </div>
        <p style="color:var(--muted);font-size:0.8rem;margin-top:1.5rem">Tap <strong style="color:var(--accent)">Connect</strong> at the top to sign in with JoyID</p>
      </div>
    `
    return
  }

  // Show address immediately, load balance async
  const short = state.address.slice(0, 16) + '…' + state.address.slice(-8)
  el.innerHTML = `
    <div class="card">
      <div class="card-title">Your CKB Wallet</div>
      <div class="hero-address">${state.address}</div>
      <div style="margin-top:0.75rem;display:flex;align-items:baseline;gap:0.5rem">
        <span class="balance-big" id="ckb-balance">…</span>
        <span class="balance-unit">CKB</span>
      </div>
    </div>

    <div class="card" id="member-status">
      <div class="card-title">Membership</div>
      <div class="stat-row">
        <span class="stat-label">Founding Member</span>
        <span class="stat-value" id="member-num">checking…</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Quick Links</div>
      <div class="stat-row">
        <span class="stat-label">🌐 Website</span>
        <a href="https://wyltekindustries.com" target="_blank" style="color:var(--accent);font-size:0.85rem">wyltekindustries.com</a>
      </div>
      <div class="stat-row">
        <span class="stat-label">💻 GitHub</span>
        <a href="https://github.com/toastmanAu" target="_blank" style="color:var(--accent);font-size:0.85rem">toastmanAu</a>
      </div>
      <div class="stat-row">
        <span class="stat-label">⛓️ CKB Explorer</span>
        <a href="https://explorer.nervos.org/address/${state.address}" target="_blank" style="color:var(--accent);font-size:0.85rem">View on Explorer</a>
      </div>
    </div>
  `

  // Load CKB balance async
  try {
    const balance = await ckbRpc('get_cells_capacity', [{
      script: {
        code_hash: '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
        hash_type: 'type',
        args: state.address, // TODO: extract blake160 from address
      },
      script_type: 'lock'
    }])
    if (balance?.capacity) {
      document.getElementById('ckb-balance').textContent = formatCKB(balance.capacity)
    }
  } catch {
    document.getElementById('ckb-balance').textContent = '—'
  }

  // Check member status
  try {
    const { data } = await sb.from('mint_queue')
      .select('member_number, spore_id')
      .eq('ckb_address', state.address)
      .single()
    const el2 = document.getElementById('member-num')
    if (data?.member_number) {
      el2.textContent = `#${data.member_number} ✅`
      el2.classList.add('green')
    } else {
      el2.textContent = 'Not a member'
    }
  } catch {
    document.getElementById('member-num').textContent = '—'
  }
}

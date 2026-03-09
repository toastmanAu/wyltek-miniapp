/**
 * Bug Bounty Leaderboard tab
 */

const WORKER = 'https://wyltek-rpc.toastman-one.workers.dev'
const MEDALS = ['🥇', '🥈', '🥉']
const POOL_CKB = 1000
const PRIZE_SPLIT = [500, 300, 200]

export async function renderBounty(el, state) {
  el.innerHTML = `
    <div class="section-header">Bug Bounty 🐛</div>

    <div class="bounty-hero">
      <div class="bounty-pool">
        <div class="bounty-pool-amount">${POOL_CKB.toLocaleString()} <span class="bounty-pool-unit">CKB</span></div>
        <div class="bounty-pool-label">Weekly Prize Pool</div>
      </div>
      <div class="bounty-split">
        ${PRIZE_SPLIT.map((ckb, i) => `
          <div class="bounty-prize">
            <div class="bounty-medal">${MEDALS[i]}</div>
            <div class="bounty-prize-ckb">${ckb}</div>
          </div>
        `).join('')}
      </div>
      <div class="bounty-countdown" id="bounty-countdown">Next payout: calculating…</div>
    </div>

    <div class="bounty-scoring">
      <div class="bounty-section-title">How Points Work</div>
      <div class="scoring-grid">
        <div class="score-row"><span class="score-event">Submit a bug</span><span class="score-pts">+2 pts</span></div>
        <div class="score-row"><span class="score-event">Bug confirmed ✅</span><span class="score-pts">+5 pts</span></div>
        <div class="score-row"><span class="score-event">Critical severity 🔴</span><span class="score-pts">+10 pts</span></div>
        <div class="score-row"><span class="score-event">High severity 🟠</span><span class="score-pts">+4 pts</span></div>
        <div class="score-row"><span class="score-event">Submit idea/praise</span><span class="score-pts">+1 pt</span></div>
        <div class="score-row"><span class="score-event">Duplicate report</span><span class="score-pts">−1 pt</span></div>
      </div>
      <div class="bounty-note">Only this week's points count for prizes. All-time points show your overall rank.</div>
    </div>

    <div class="bounty-section-title" style="margin-top:1rem">This Week's Leaderboard</div>
    <div id="bounty-board"><div class="spinner"></div></div>

    <div class="bounty-section-title" style="margin-top:1.25rem">Your Contributions</div>
    <div id="bounty-mine"><div class="spinner"></div></div>

    <div class="bounty-section-title" style="margin-top:1.25rem">Recent Payouts</div>
    <div id="bounty-payouts"><div class="spinner"></div></div>
  `

  updateCountdown()
  setInterval(updateCountdown, 60000)
  await loadBounty(state)
}

function updateCountdown() {
  const el = document.getElementById('bounty-countdown')
  if (!el) return
  const now = new Date()
  // Next Monday 00:00 UTC
  const next = new Date(now)
  next.setUTCHours(0, 0, 0, 0)
  const daysUntilMon = (8 - next.getUTCDay()) % 7 || 7
  next.setUTCDate(next.getUTCDate() + daysUntilMon)
  const diff = next - now
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  el.textContent = `Next payout in ${d}d ${h}h ${m}m`
}

function shortAddr(addr) {
  if (!addr) return '—'
  return addr.slice(0, 8) + '…' + addr.slice(-6)
}

function explorerTx(tx) {
  return `https://explorer.nervos.org/transaction/${tx}`
}

async function loadBounty(state) {
  const boardEl   = document.getElementById('bounty-board')
  const mineEl    = document.getElementById('bounty-mine')
  const payoutsEl = document.getElementById('bounty-payouts')

  try {
    const res = await fetch(`${WORKER}/leaderboard`)
    const data = await res.json()
    const { leaderboard = [], recent_payouts = [] } = data

    // ── Leaderboard ────────────────────────────────────────────────
    if (!leaderboard.length) {
      boardEl.innerHTML = `<div class="empty-state"><div class="icon">🏆</div><p>No reports yet this week.<br>Submit a bug to get on the board!</p></div>`
    } else {
      boardEl.innerHTML = leaderboard.slice(0, 10).map((row, i) => {
        const isMe = state.address && row.reporter_address === state.address
        const medal = i < 3 ? MEDALS[i] : `#${i + 1}`
        return `
          <div class="lb-row${isMe ? ' lb-me' : ''}">
            <div class="lb-rank">${medal}</div>
            <div class="lb-info">
              <div class="lb-name">${row.reporter_tg_username ? '@' + row.reporter_tg_username : shortAddr(row.reporter_address)}${isMe ? ' <span class="lb-you">YOU</span>' : ''}</div>
              <div class="lb-stats">${row.bugs_submitted} bugs · ${row.bugs_confirmed} confirmed · ${row.critical_bugs} critical</div>
            </div>
            <div class="lb-pts">
              <div class="lb-week-pts">${row.week_points} pts</div>
              <div class="lb-alltime">all-time: ${row.total_points}</div>
            </div>
          </div>
        `
      }).join('')
    }

    // ── My contributions ───────────────────────────────────────────
    if (!state.address) {
      mineEl.innerHTML = `<div class="empty-state"><p>Connect wallet to see your stats</p></div>`
    } else {
      const mine = leaderboard.find(r => r.reporter_address === state.address)
      if (!mine) {
        mineEl.innerHTML = `<div class="bounty-mine-empty">No contributions yet this week — tap 🐛 to submit a bug!</div>`
      } else {
        mineEl.innerHTML = `
          <div class="bounty-mine-card">
            <div class="mine-stat"><div class="mine-num">#${mine.week_rank}</div><div class="mine-label">Week Rank</div></div>
            <div class="mine-stat"><div class="mine-num">${mine.week_points}</div><div class="mine-label">Week Pts</div></div>
            <div class="mine-stat"><div class="mine-num">${mine.total_points}</div><div class="mine-label">All-Time</div></div>
            <div class="mine-stat"><div class="mine-num">${mine.bugs_confirmed}</div><div class="mine-label">Confirmed</div></div>
          </div>
          ${mine.week_rank <= 3 ? `<div class="bounty-on-track">🎉 You're on track for ${PRIZE_SPLIT[mine.week_rank - 1]} CKB this week!</div>` : ''}
        `
      }
    }

    // ── Recent payouts ─────────────────────────────────────────────
    if (!recent_payouts.length) {
      payoutsEl.innerHTML = `<div class="empty-state"><p>First payout coming Monday!</p></div>`
    } else {
      payoutsEl.innerHTML = recent_payouts.filter(w => w.status === 'paid').slice(0, 3).map(w => `
        <div class="payout-card">
          <div class="payout-week">Week ${w.week_number % 100} — ${w.pool_ckb} CKB distributed</div>
          ${[
            [w.first_address, w.first_ckb, w.first_tx, '🥇'],
            [w.second_address, w.second_ckb, w.second_tx, '🥈'],
            [w.third_address, w.third_ckb, w.third_tx, '🥉'],
          ].filter(([addr]) => addr).map(([addr, ckb, tx, medal]) => `
            <div class="payout-row">
              <span>${medal} ${shortAddr(addr)}</span>
              <span>${ckb} CKB${tx ? ` · <a href="${explorerTx(tx)}" target="_blank">tx ↗</a>` : ''}</span>
            </div>
          `).join('')}
        </div>
      `).join('') || `<div class="empty-state"><p>First payout coming Monday!</p></div>`
    }

  } catch (err) {
    boardEl.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`
    mineEl.innerHTML = ''
    payoutsEl.innerHTML = ''
  }
}

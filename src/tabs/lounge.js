/**
 * Lounge tab (v2) — real-time community chat
 */
import { sb } from '../supabase.js'

const CHANNEL = 'general'
let realtimeSub = null
let messages = []

export async function renderLounge(el, state) {
  el.innerHTML = `
    <div class="section-header" style="margin-bottom:0.5rem">Lounge</div>
    <div class="message-list" id="message-list"></div>
    ${state.address ? `
    <div class="compose-bar">
      <input class="compose-input" id="lounge-input" placeholder="Say something…" maxlength="500">
      <button class="compose-send" id="lounge-send">↑</button>
    </div>` : `
    <div style="position:fixed;bottom:calc(var(--nav-h) + env(safe-area-inset-bottom,0px));left:0;right:0;
      background:rgba(7,9,15,0.9);backdrop-filter:blur(20px);border-top:1px solid var(--border);
      padding:0.75rem 1rem;text-align:center;font-size:0.82rem;color:var(--text2)">
      Connect wallet to send messages
    </div>`}
  `

  await loadMessages()
  subscribeRealtime()

  if (state.address) {
    const input = document.getElementById('lounge-input')
    const btn   = document.getElementById('lounge-send')
    btn.addEventListener('click', () => sendMessage(state, input))
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(state, input) }
    })
  }
}

async function loadMessages() {
  const { data } = await sb
    .from('lounge_messages')
    .select('*')
    .eq('channel', CHANNEL)
    .eq('deleted', false)
    .order('created_at', { ascending: true })
    .limit(50)

  messages = data || []
  renderMessages()
}

function renderMessages() {
  const listEl = document.getElementById('message-list')
  if (!listEl) return

  if (!messages.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">🛋️</div><p>No messages yet — say hi!</p></div>`
    return
  }

  listEl.innerHTML = messages.map(m => {
    const short = m.address ? m.address.slice(0,10) + '…' + m.address.slice(-6) : 'anon'
    const time  = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `
      <div class="message-bubble">
        <div class="message-meta">
          <span class="message-addr">${short}</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-body">${escapeHtml(m.message || m.content || '')}</div>
      </div>
    `
  }).join('')

  listEl.scrollTop = listEl.scrollHeight
}

function subscribeRealtime() {
  if (realtimeSub) { try { realtimeSub.unsubscribe() } catch {} }
  realtimeSub = sb.channel('lounge-mini')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lounge_messages', filter: `channel=eq.${CHANNEL}` }, payload => {
      if (!payload.new.deleted) { messages.push(payload.new); renderMessages() }
    })
    .subscribe()
}

async function sendMessage(state, input) {
  const msg = input.value.trim()
  if (!msg || !state.address) return
  input.value = ''
  const btn = document.getElementById('lounge-send')
  if (btn) btn.disabled = true

  try {
    const { error } = await sb.from('lounge_messages').insert({
      address: state.address,
      channel: CHANNEL,
      message: msg,
      deleted: false,
    })
    if (error) throw error
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
  } catch {
    input.value = msg
  } finally {
    if (btn) btn.disabled = false
  }
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

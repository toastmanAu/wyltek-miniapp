/**
 * Lounge tab — real-time community chat
 * Same Supabase backend as wyltekindustries.com/lounge.html
 */
import { sb } from '../supabase.js'

const WORKER_URL = 'https://wyltek-lounge.toastmanau.workers.dev'
const CHANNEL = 'general'

let realtimeSub = null
let messages = []

export async function renderLounge(el, state) {
  el.innerHTML = `
    <div class="message-list" id="message-list" style="padding-bottom:4.5rem"></div>
    ${state.address ? `
    <div class="compose-bar">
      <input class="compose-input" id="lounge-input" placeholder="Say something…" maxlength="500">
      <button class="compose-send" id="lounge-send">Send</button>
    </div>` : `
    <div style="text-align:center;padding:1rem;color:var(--muted);font-size:0.85rem">
      Connect your wallet to send messages
    </div>`}
  `

  await loadMessages()
  subscribeRealtime()

  if (state.address) {
    const input = document.getElementById('lounge-input')
    const sendBtn = document.getElementById('lounge-send')

    sendBtn.addEventListener('click', () => sendMessage(state, input))
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage(state, input)
      }
    })
  }
}

async function loadMessages() {
  const listEl = document.getElementById('message-list')
  if (!listEl) return

  const { data, error } = await sb
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

  if (messages.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">🛋️</div><p>No messages yet — say hi!</p></div>`
    return
  }

  listEl.innerHTML = messages.map(m => {
    const short = m.address ? m.address.slice(0, 10) + '…' + m.address.slice(-6) : 'anon'
    const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `
      <div class="message-bubble">
        <div class="message-meta">
          <span class="message-addr">${short}</span>
          <span>${time}</span>
        </div>
        <div class="message-body">${escapeHtml(m.message || m.content || '')}</div>
      </div>
    `
  }).join('')

  // Scroll to bottom
  listEl.scrollTop = listEl.scrollHeight
}

function subscribeRealtime() {
  if (realtimeSub) { try { realtimeSub.unsubscribe() } catch {} }
  realtimeSub = sb.channel('lounge-miniapp')
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'lounge_messages',
      filter: `channel=eq.${CHANNEL}`,
    }, payload => {
      if (!payload.new.deleted) {
        messages.push(payload.new)
        renderMessages()
      }
    })
    .subscribe()
}

async function sendMessage(state, input) {
  const msg = input.value.trim()
  if (!msg || !state.address) return

  input.value = ''
  const sendBtn = document.getElementById('lounge-send')
  if (sendBtn) sendBtn.disabled = true

  try {
    const res = await fetch(WORKER_URL + '/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: state.address, channel: CHANNEL, message: msg }),
    })
    if (!res.ok) throw new Error('Send failed')
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
  } catch (err) {
    // Restore on fail
    input.value = msg
    console.error('[Lounge] Send failed:', err)
  } finally {
    if (sendBtn) sendBtn.disabled = false
    input.focus()
  }
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

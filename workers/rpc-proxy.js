/**
 * Wyltek RPC Proxy Worker
 * Deploy: wyltek-rpc.toastman-one.workers.dev
 *
 * Routes:
 *   POST /ckb              → CKB full node via Cloudflare Tunnel
 *   POST /ckb-light        → CKB light client via Cloudflare Tunnel
 *   POST /fiber            → Fiber node via Cloudflare Tunnel
 *   POST /btc              → Bitcoin node via Cloudflare Tunnel
 *   GET  /joyid-callback   → JoyID auth relay: store result keyed by token
 *   GET  /joyid-poll       → Mini app polls for auth result by token
 *
 * Env vars (set as Worker secrets):
 *   TUNNEL_URL        = https://51f600d8-f583-4ed5-b0b3-27015ca31349.cfargotunnel.com
 *   BTC_RPC_USER      = toastman
 *   BTC_RPC_PASS      = nervos123
 *   ALLOWED_ORIGIN    = https://wyltek-miniapp.pages.dev
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// In-memory token store — survives within an isolate lifetime (~5min idle)
// Good enough: tokens expire quickly and we only need one concurrent auth per user
const AUTH_TOKENS = new Map() // token → { address, ts }
const TOKEN_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Tunnel ingress hostnames — must match wyltek-rpc.yml ingress rules
const TUNNEL_HOSTS = {
  ckb:       'ckb-rpc.blackboxdata.xyz',
  'ckb-light': 'ckb-light.blackboxdata.xyz',
  fiber:     'fiber-rpc.blackboxdata.xyz',
  btc:       'btc-rpc.blackboxdata.xyz',
}

const TUNNEL_BASE = 'https://51f600d8-f583-4ed5-b0b3-27015ca31349.cfargotunnel.com'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname.replace(/^\//, '').split('/')[0]

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    // ── JoyID auth relay (GET) ─────────────────────────────────────
    if (path === 'joyid-callback') {
      // Dump full URL for debugging — JoyID param encoding varies
      console.log('[joyid-callback] full URL:', request.url)
      console.log('[joyid-callback] search:', url.search)

      const token = url.searchParams.get('token')

      // JoyID may use _data_ or data param; also may double-encode
      let rawData = url.searchParams.get('_data_') || url.searchParams.get('data')

      // If rawData starts with '?' JoyID appended a second query string inside the value
      // e.g. callbackURL was not properly encoded and JoyID appended ?data=... directly
      if (rawData && rawData.startsWith('?')) {
        const inner = new URLSearchParams(rawData.slice(1))
        rawData = inner.get('_data_') || inner.get('data') || rawData
      }

      // Show debug page if missing params — don't return 400, show what we got
      if (!token || !rawData) {
        return new Response(`
          <!doctype html><html><body style="background:#0f1117;color:#fff;font-family:monospace;padding:20px">
          <h3>JoyID callback debug</h3>
          <p>token: ${token || 'MISSING'}</p>
          <p>rawData: ${rawData || 'MISSING'}</p>
          <p>full search: ${url.search}</p>
          <p>full URL: ${request.url.slice(0, 500)}</p>
          </body></html>
        `, { headers: { 'Content-Type': 'text/html' } })
      }

      try {
        // JoyID encodeSearch uses qs library — produces JSON-like string
        // Outer structure: {data: {address, keyType, pubkey, ...}, error: null}
        let parsed
        const attempts = []

        // Try 1: direct JSON parse
        try { parsed = JSON.parse(rawData); attempts.push('direct') } catch {}

        // Try 2: decodeURIComponent then JSON
        if (!parsed) try { parsed = JSON.parse(decodeURIComponent(rawData)); attempts.push('decoded') } catch {}

        // Try 3: it might be qs-encoded (key=val&key=val) wrapping JSON
        if (!parsed) try {
          const inner = new URLSearchParams(rawData)
          const j = inner.get('data') || inner.get('_data_')
          if (j) { parsed = JSON.parse(j); attempts.push('qs-inner') }
        } catch {}

        // Try 4: base64
        if (!parsed) try {
          parsed = JSON.parse(atob(rawData.replace(/-/g,'+').replace(/_/g,'/')))
          attempts.push('base64')
        } catch {}

        console.log('[joyid-callback] parse attempts:', attempts, 'parsed keys:', parsed ? Object.keys(parsed) : null)

        const address = parsed?.data?.address || parsed?.address
        if (!address) {
          // Show full parsed for debugging
          throw new Error('No address in payload. Keys: ' + (parsed ? JSON.stringify(Object.keys(parsed)) : 'null') +
            ' | Sample: ' + JSON.stringify(parsed)?.slice(0, 300))
        }

        const now = Date.now()
        for (const [k, v] of AUTH_TOKENS) {
          if (now - v.ts > TOKEN_TTL_MS) AUTH_TOKENS.delete(k)
        }
        AUTH_TOKENS.set(token, { address, ts: now })
        console.log('[joyid-callback] ✅ address:', address)

        // Pass address via Telegram startapp param — no shared state needed
        // Telegram reads it as tg.initDataUnsafe.start_param in the mini app
        // startapp only allows: A-Z a-z 0-9 _ - (max 64 chars)
        // CKB address is bech32 — contains only alphanumeric + special chars
        // Safe encode: base64url (no +/ chars, use -_)
        const encoded = btoa(address).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        const tgDeeplink = `https://t.me/WyltekIndustriesBot/app?startapp=jauth_${encoded}`
        return new Response(`
          <!doctype html><html><head>
          <meta http-equiv="refresh" content="1; url=${tgDeeplink}">
          </head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f1117;color:#fff">
          <h2 style="color:#4ade80">✅ Connected!</h2>
          <p>Returning to Telegram…</p>
          <p><a href="${tgDeeplink}" style="color:#4ade80">Tap here if not redirected</a></p>
          <script>
            setTimeout(() => { window.location.href = '${tgDeeplink}' }, 800)
          </script>
          </body></html>
        `, { headers: { 'Content-Type': 'text/html' } })
      } catch (err) {
        console.error('[joyid-callback] parse error:', err.message)
        // Show debug page instead of black screen
        return new Response(`
          <!doctype html><html><body style="background:#0f1117;color:#fff;font-family:monospace;padding:20px;word-break:break-all">
          <h3 style="color:#f87171">Auth parse failed</h3>
          <p>${err.message}</p>
          <hr>
          <p><b>rawData (first 500):</b><br>${String(rawData).slice(0,500)}</p>
          <p><b>full search:</b><br>${url.search.slice(0,500)}</p>
          </body></html>
        `, { headers: { 'Content-Type': 'text/html' } })
      }
    }

    if (path === 'joyid-poll') {
      // Mini app polls: GET /joyid-poll?token=<tok>
      const token = url.searchParams.get('token')
      if (!token) return json({ error: 'Missing token' }, 400)

      const entry = AUTH_TOKENS.get(token)
      if (!entry) return json({ pending: true })

      const now = Date.now()
      if (now - entry.ts > TOKEN_TTL_MS) {
        AUTH_TOKENS.delete(token)
        return json({ error: 'Token expired' }, 410)
      }

      // Found — return address and delete token
      AUTH_TOKENS.delete(token)
      return json({ address: entry.address })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    let body
    try { body = await request.json() }
    catch { return json({ error: 'Invalid JSON' }, 400) }

    let result
    try {
      if (path === 'btc') {
        result = await callBTC(env, body)
      } else if (path === 'feedback') {
        result = await submitFeedback(env, body)
      } else {
        result = await callTunnel(path, body, env)
      }
      return json(result)
    } catch (err) {
      return json({ error: err.message }, 502)
    }
  }
}

async function callTunnel(chain, body, env) {
  const host = TUNNEL_HOSTS[chain]
  if (!host) throw new Error(`Unknown endpoint: ${chain}`)

  const tunnelUrl = env.TUNNEL_URL || TUNNEL_BASE

  const res = await fetch(tunnelUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': host,   // cloudflared routes by Host header
    },
    body: JSON.stringify(body),
  })
  if (!res.ok && res.status !== 200) {
    const txt = await res.text()
    throw new Error(`Tunnel error ${res.status}: ${txt.slice(0,200)}`)
  }
  return res.json()
}

async function callBTC(env, body) {
  // BTC also goes via tunnel
  const host = TUNNEL_HOSTS['btc']
  const tunnelUrl = env.TUNNEL_URL || TUNNEL_BASE
  const user = env.BTC_RPC_USER || 'toastman'
  const pass = env.BTC_RPC_PASS || 'nervos123'

  const res = await fetch(tunnelUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': host,
      'Authorization': 'Basic ' + btoa(`${user}:${pass}`),
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function submitFeedback(env, body) {
  const { type, message, tab, tg_user_id, tg_username, app_version } = body
  if (!type || !message?.trim()) throw new Error('type and message required')

  const repo  = env.FEEDBACK_REPO || 'toastmanAu/wyltek-miniapp'
  const token = env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN not configured')

  const emoji = type === 'bug' ? '🐛' : type === 'suggestion' ? '💡' : '👍'
  const title = `${emoji} [${type}] ${message.trim().slice(0, 72)}${message.length > 72 ? '…' : ''}`

  const userStr = tg_username
    ? `@${tg_username} (ID: ${tg_user_id})`
    : `User ID: ${tg_user_id || 'unknown'}`

  const issueBody = [
    `**Type:** ${emoji} ${type}`,
    `**Tab:** ${tab || 'unknown'}`,
    `**User:** ${userStr}`,
    `**App version:** ${app_version || 'unknown'}`,
    `**Submitted:** ${new Date().toISOString()}`,
    '',
    '---',
    '',
    message.trim(),
  ].join('\n')

  const labels = ['user-feedback', type === 'bug' ? 'bug' : type === 'suggestion' ? 'suggestion' : 'praise']

  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'wyltek-rpc-worker',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({ title, body: issueBody, labels }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub API error ${res.status}: ${err.slice(0, 200)}`)
  }

  const issue = await res.json()
  return { ok: true, issue_number: issue.number, url: issue.html_url }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

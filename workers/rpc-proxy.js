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

// In-memory token store removed — using Cloudflare KV (env.JOYID_TOKENS) instead
// KV is shared across all Worker isolates; TTL enforced at write time

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
        // JoyID encodes result in _data_ param
        // Observed format: _data_ = "?data={json}" (double-encoded, starts with ?data=)
        // OR _data_ = "{json}" (direct JSON)
        // OR _data_ = base64(json)
        let parsed
        const attempts = []

        // Unwrap ?data= or ?_data_= prefix if present
        let rawStr = rawData
        if (rawStr.startsWith('?')) {
          const inner = new URLSearchParams(rawStr.slice(1))
          rawStr = inner.get('data') || inner.get('_data_') || rawStr
        }
        // Also try URL-decoding the unwrapped string
        let rawStrDecoded = rawStr
        try { rawStrDecoded = decodeURIComponent(rawStr) } catch {}

        // Try 1: direct JSON on unwrapped string
        try { parsed = JSON.parse(rawStr); attempts.push('direct') } catch {}

        // Try 2: decoded JSON
        if (!parsed) try { parsed = JSON.parse(rawStrDecoded); attempts.push('decoded') } catch {}

        // Try 3: base64
        if (!parsed) try {
          parsed = JSON.parse(atob(rawStr.replace(/-/g,'+').replace(/_/g,'/')))
          attempts.push('base64')
        } catch {}

        console.log('[joyid-callback] parse attempts:', attempts, 'parsed keys:', parsed ? Object.keys(parsed) : null)

        // Address is at top level OR nested under .data
        const address = parsed?.address || parsed?.data?.address
        if (!address) {
          throw new Error('No address found. Keys: ' + (parsed ? JSON.stringify(Object.keys(parsed)) : 'null') +
            ' | Sample: ' + JSON.stringify(parsed)?.slice(0, 300))
        }

        console.log('[joyid-callback] ✅ address:', address)

        // Store in Cloudflare KV — shared across all isolates, 5min TTL
        if (env.JOYID_TOKENS) {
          await env.JOYID_TOKENS.put(token, address, { expirationTtl: 300 })
          console.log('[joyid-callback] stored in KV for token', token.slice(0, 8))
        }

        // Show success page — user taps "Back to Telegram" manually
        // (Can't auto-redirect into TG WebView from external browser)
        return new Response(`
          <!doctype html><html><head>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          </head><body style="font-family:-apple-system,sans-serif;text-align:center;padding:60px 20px;background:#0f1117;color:#fff;min-height:100vh;box-sizing:border-box">
          <div style="font-size:64px;margin-bottom:16px">✅</div>
          <h2 style="color:#4ade80;margin:0 0 12px">Wallet Connected!</h2>
          <p style="color:#94a3b8;margin:0 0 32px;font-size:15px">Switch back to Telegram —<br>your wallet is now linked.</p>
          <p style="color:#64748b;font-size:13px">You can close this tab.</p>
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

      if (!env.JOYID_TOKENS) return json({ error: 'KV not configured' }, 500)

      const address = await env.JOYID_TOKENS.get(token)
      if (!address) return json({ pending: true })

      // Found — delete token and return address
      await env.JOYID_TOKENS.delete(token)
      return json({ address })
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
  const pass = env.BTC_RPC_PASS
  if (!pass) throw new Error('BTC_RPC_PASS not configured')

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

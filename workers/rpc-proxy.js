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

        // Redirect to Telegram via t.me/BotName?startapp= deeplink
        // (No shortname needed — works for any bot with a menu button)
        // Telegram intercepts this link, opens the bot, passes startapp to mini app
        const encoded = btoa(address).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        const tgLink = `https://t.me/WyltekIndustriesBot?startapp=jauth_${encoded}`
        return new Response(`<!doctype html><html><head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <meta http-equiv="refresh" content="1; url=${tgLink}">
          <style>
            body { margin:0; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f1117; color:#fff; font-family:-apple-system,BlinkMacSystemFont,sans-serif; padding:40px 20px; box-sizing:border-box; }
            .logo { width:72px; height:72px; border-radius:18px; object-fit:cover; margin-bottom:20px; box-shadow:0 0 32px rgba(74,222,128,0.3); }
            h2 { color:#4ade80; margin:0 0 10px; font-size:22px; }
            p { color:#94a3b8; margin:0 0 32px; font-size:15px; }
            .brand { color:#64748b; font-size:12px; margin-top:40px; letter-spacing:0.05em; text-transform:uppercase; }
            a.btn { display:inline-block; padding:13px 28px; background:#4ade80; color:#0f1117; border-radius:10px; text-decoration:none; font-weight:700; font-size:15px; }
          </style>
          </head><body>
          <img class="logo" src="https://wyltekindustries.com/wyltek-mark.png" alt="Wyltek">
          <h2>Wallet Connected!</h2>
          <p>Returning to Telegram&#x2026;</p>
          <a class="btn" href="${tgLink}">Open Telegram</a>
          <div class="brand">Wyltek Industries</div>
          <script>setTimeout(() => { window.location.href = '${tgLink}' }, 800)</script>
          </body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
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

    // ── Research finding fetch (GET) ──────────────────────────────
    if (path === 'research-finding') {
      const id = url.searchParams.get('id')
      if (!id || !/^[a-z0-9-]+$/.test(id)) return json({ error: 'Invalid id' }, 400)
      const mdUrl = `https://wyltekindustries.com/research/${id}.md`
      const res = await fetch(mdUrl)
      if (!res.ok) return json({ error: 'Not found' }, 404)
      const md = await res.text()
      return new Response(md, {
        headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
      })
    }

    // ── Leaderboard (GET) ─────────────────────────────────────────
    if (path === 'leaderboard') {
      const data = await handleLeaderboard(env)
      return json(data)
    }

    // ── GitHub webhook (POST, no JSON pre-read) ───────────────────
    if (path === 'github-webhook') {
      return handleGithubWebhook(request, env)
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

// Methods blocked from public access (write/spend operations)
const BLOCKED_METHODS = new Set([
  // Fiber — payment/channel write ops
  'send_payment', 'init_payment', 'open_channel', 'close_channel',
  'shutdown_channel', 'update_channel', 'add_tlc', 'remove_tlc',
  'accept_channel', 'abandon_channel',
  // CKB — nothing dangerous here since no key, but block debug/miner
  'generate_block', 'generate_block_with_template', 'submit_block',
  'local_node_info', 'get_raw_tx_pool',
  // BTC write ops
  'sendrawtransaction', 'sendtoaddress', 'sendmany',
  'walletpassphrase', 'importprivkey', 'dumpprivkey',
])

async function callTunnel(chain, body, env) {
  // Block dangerous write methods
  const method = body?.method?.toLowerCase?.() || ''
  if (BLOCKED_METHODS.has(method)) {
    throw new Error(`Method '${body.method}' is not available via public API`)
  }

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

// ── Supabase helper ───────────────────────────────────────────────
async function sbInsert(env, table, row) {
  if (!env.SUPABASE_SERVICE_KEY) return null
  const res = await fetch(`https://yhntwgjzrzyhyxpiqcts.supabase.co/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(row),
  })
  if (!res.ok) console.error(`[sb] insert ${table} failed:`, await res.text())
  return res.ok ? res.json() : null
}

async function sbPatch(env, table, match, patch) {
  if (!env.SUPABASE_SERVICE_KEY) return null
  const qs = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&')
  const res = await fetch(`https://yhntwgjzrzyhyxpiqcts.supabase.co/rest/v1/${table}?${qs}`, {
    method: 'PATCH',
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) console.error(`[sb] patch ${table} failed:`, await res.text())
  return res.ok ? res.json() : null
}

async function sbSelect(env, table, qs = '') {
  if (!env.SUPABASE_SERVICE_KEY) return []
  const res = await fetch(`https://yhntwgjzrzyhyxpiqcts.supabase.co/rest/v1/${table}?${qs}`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  })
  return res.ok ? res.json() : []
}

function isoWeek(d = new Date()) {
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7))
  const jan1 = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return tmp.getUTCFullYear() * 100 + Math.ceil(((tmp - jan1) / 86400000 + 1) / 7)
}

async function submitFeedback(env, body) {
  const { type, message, tab, tg_user_id, tg_username, ckb_address, app_version } = body
  if (!type || !message?.trim()) throw new Error('type and message required')

  const repo  = env.FEEDBACK_REPO || 'toastmanAu/wyltek-bug-reports'
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
    `**CKB Address:** ${ckb_address ? `\`${ckb_address}\`` : '_not signed in_'}`,
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

  // Record in Supabase for bounty tracking (fire-and-forget)
  if (ckb_address) {
    const basePoints = type === 'bug' ? 2 : 1
    sbInsert(env, 'bug_reports', {
      github_issue_number: issue.number,
      github_issue_url: issue.html_url,
      reporter_address: ckb_address,
      reporter_tg_id: tg_user_id || null,
      reporter_tg_username: tg_username || null,
      type,
      status: 'open',
      title: title,
      week_number: isoWeek(),
      points_awarded: basePoints,
    })
  }

  return { ok: true, issue_number: issue.number, url: issue.html_url }
}

// ── GitHub webhook — label changes → update Supabase ─────────────
async function handleGithubWebhook(request, env) {
  // Verify signature
  const sig = request.headers.get('x-hub-signature-256') || ''
  const secret = env.GITHUB_WEBHOOK_SECRET
  if (secret) {
    const body = await request.clone().text()
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    const expected = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2,'0')).join('')
    if (expected !== sig) return new Response('Unauthorized', { status: 401 })
  }

  const event = request.headers.get('x-github-event')
  const payload = await request.json()

  if (event === 'issues' && (payload.action === 'labeled' || payload.action === 'unlabeled' || payload.action === 'closed' || payload.action === 'reopened')) {
    const issue = payload.issue
    const labels = issue.labels.map(l => l.name)

    // Determine status from labels
    let status = 'open'
    let severity = null
    if (labels.includes('confirmed') || labels.includes('bug') && issue.state === 'closed') status = 'confirmed'
    if (labels.includes('duplicate')) status = 'duplicate'
    if (labels.includes('wontfix') || labels.includes('invalid')) status = 'wontfix'
    if (issue.state === 'closed' && status === 'open') status = 'closed'

    if (labels.includes('critical')) severity = 'critical'
    else if (labels.includes('high')) severity = 'high'
    else if (labels.includes('medium')) severity = 'medium'
    else if (labels.includes('low')) severity = 'low'

    // Recalculate points
    const type = labels.includes('suggestion') ? 'suggestion' : labels.includes('praise') ? 'praise' : 'bug'
    let pts = type === 'bug' ? 2 : 1
    if (status === 'confirmed') pts += 5
    if (status === 'duplicate') pts = Math.max(pts - 1, 0)
    if (status === 'confirmed' && severity === 'critical') pts += 10
    if (status === 'confirmed' && severity === 'high') pts += 4

    await sbPatch(env, 'bug_reports', { github_issue_number: issue.number }, {
      status,
      severity,
      points_awarded: pts,
      resolved_at: issue.state === 'closed' ? new Date().toISOString() : null,
    })
  }

  return new Response('ok')
}

// ── Leaderboard endpoint ──────────────────────────────────────────
async function handleLeaderboard(env) {
  const rows = await sbSelect(env, 'leaderboard', 'order=week_rank.asc&limit=20')
  const weeks = await sbSelect(env, 'bounty_weeks', 'order=week_number.desc&limit=3')
  return { leaderboard: rows, recent_payouts: weeks, current_week: isoWeek() }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

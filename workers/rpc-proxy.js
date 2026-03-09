/**
 * Wyltek RPC Proxy Worker
 * Deploy: wyltek-rpc.toastman-one.workers.dev
 *
 * Routes:
 *   POST /ckb        → CKB full node via Cloudflare Tunnel
 *   POST /ckb-light  → CKB light client via Cloudflare Tunnel
 *   POST /fiber      → Fiber node via Cloudflare Tunnel
 *   POST /btc        → Bitcoin node via Cloudflare Tunnel
 *
 * Env vars (set as Worker secrets):
 *   TUNNEL_URL        = https://51f600d8-f583-4ed5-b0b3-27015ca31349.cfargotunnel.com
 *   BTC_RPC_USER      = toastman
 *   BTC_RPC_PASS      = nervos123
 *   ALLOWED_ORIGIN    = https://wyltek-miniapp.pages.dev
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

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
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const url   = new URL(request.url)
    const chain = url.pathname.replace(/^\//, '').split('/')[0]

    let body
    try { body = await request.json() }
    catch { return json({ error: 'Invalid JSON' }, 400) }

    try {
      if (chain === 'btc') {
        result = await callBTC(env, body)
      } else if (chain === 'feedback') {
        result = await submitFeedback(env, body)
      } else {
        result = await callTunnel(chain, body, env)
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

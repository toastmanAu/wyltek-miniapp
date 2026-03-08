/**
 * Wyltek RPC Proxy Worker
 * Deploy to Cloudflare Workers as: wyltek-rpc.toastmanau.workers.dev
 *
 * Routes:
 *   POST /ckb  → your CKB node RPC
 *   POST /btc  → your Bitcoin node RPC
 *
 * Env vars to set in Cloudflare dashboard:
 *   CKB_RPC_URL       = http://100.115.197.42:8114   (Pi Tailscale — full node)
 *   CKB_LIGHT_RPC_URL = http://100.115.197.42:9001   (Pi Tailscale — light client)
 *   BTC_RPC_URL       = http://192.168.68.106:8332
 *   BTC_RPC_USER      = toastman
 *   BTC_RPC_PASS      = nervos123
 *   ALLOWED_ORIGIN    = https://wyltek-miniapp.pages.dev
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',   // Tighten to your domain in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const url = new URL(request.url)
    const chain = url.pathname.replace('/', '').split('/')[0]

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }

    try {
      let result

      if (chain === 'ckb') {
        result = await callCKB(env, body)
      } else if (chain === 'ckb-light') {
        result = await callCKBLight(env, body)
      } else if (chain === 'fiber') {
        result = await callFiber(env, body)
      } else if (chain === 'btc') {
        result = await callBTC(env, body)
      } else {
        return json({ error: `Unknown chain: ${chain}` }, 400)
      }

      return json(result)

    } catch (err) {
      return json({ error: err.message }, 502)
    }
  }
}

async function callCKB(env, body) {
  const url = env.CKB_RPC_URL || 'http://100.115.197.42:8114'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function callCKBLight(env, body) {
  // CKB light client RPC — set_scripts, get_cells, get_transactions, send_transaction
  const url = env.CKB_LIGHT_RPC_URL || 'http://100.115.197.42:9001'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function callFiber(env, body) {
  // SSH tunnel: autossh N100:8237 → ckbnode:127.0.0.1:8227
  // No auth (biscuit key removed, localhost-only RPC)
  const url = env.FIBER_RPC_URL || 'http://192.168.68.79:8237'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function callBTC(env, body) {
  const url  = env.BTC_RPC_URL  || 'http://192.168.68.106:8332'
  const user = env.BTC_RPC_USER || 'toastman'
  const pass = env.BTC_RPC_PASS || 'nervos123'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${user}:${pass}`),
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

/**
 * rpc.js — Node RPC helpers
 * Routes through a Cloudflare Worker proxy to keep node credentials private
 * and handle CORS.
 *
 * Worker URL: set in .env or hardcoded below
 * Worker source: workers/rpc-proxy.js in this repo
 */

// Cloudflare Worker proxy — deploy workers/rpc-proxy.js to this URL
const WORKER_BASE = 'https://wyltek-rpc.toastmanau.workers.dev'

async function rpcCall(chain, method, params = []) {
  const res = await fetch(`${WORKER_BASE}/${chain}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, params, id: 1, jsonrpc: '2.0' }),
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error))
  return json.result
}

export const ckbRpc = (method, params) => rpcCall('ckb', method, params)
export const btcRpc = (method, params) => rpcCall('btc', method, params)

export function formatCKB(shannon) {
  // shannon is hex string from CKB RPC
  const n = BigInt(shannon)
  const ckb = Number(n) / 1e8
  return ckb.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

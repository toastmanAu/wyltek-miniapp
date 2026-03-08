/**
 * rpc.js — Node RPC helpers
 * URL resolved from user's node config (Settings tab).
 * Falls back to Wyltek Cloudflare proxy if no config saved.
 */

import { loadNodeConfig, resolveRpcUrl } from './tabs/settings.js'

async function rpcCall(chain, method, params = []) {
  const cfg = loadNodeConfig()
  const url = resolveRpcUrl(chain, cfg)
  if (!url) throw new Error(`No RPC URL configured for ${chain}`)

  const res = await fetch(url, {
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

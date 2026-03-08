/**
 * light-client.js — CKB Light Client helpers
 * Talks to your Pi's light client via the Cloudflare Worker proxy.
 *
 * The light client (port 9001) provides:
 *   - set_scripts   : register lock scripts to track
 *   - get_cells     : UTXOs for a script (with capacity)
 *   - get_transactions : full tx history for a script
 *   - send_transaction : broadcast a signed tx
 *   - get_tip_header   : current chain tip (verified headers)
 *
 * This is meaningfully different from the full node RPC:
 *   - Tx history without a separate indexer
 *   - Header verification (not just trusting the node)
 *   - Script watching across any lock/type combo
 */

import { loadNodeConfig } from './tabs/settings.js'

const WORKER_BASE = 'https://wyltek-rpc.toastmanau.workers.dev'

async function lightRpc(method, params = []) {
  const cfg = loadNodeConfig()
  // Use light client route if on Wyltek preset, else fall back to full node
  const isWyltek = cfg.ckb?.preset === 'wyltek'
  const route = isWyltek ? 'ckb-light' : 'ckb'

  // For custom nodes, hit light client port directly if URL ends in :9001
  let url
  if (cfg.ckb?.preset === 'custom') {
    url = cfg.ckb?.customUrl || `${WORKER_BASE}/ckb-light`
  } else {
    url = `${WORKER_BASE}/${route}`
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  if (!res.ok) throw new Error(`Light client HTTP ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error))
  return json.result
}

/**
 * Register a CKB address's lock script with the light client.
 * Must be called after JoyID connect so the light client starts
 * syncing headers + cells for this address.
 *
 * @param {string} lockScript - { code_hash, hash_type, args }
 */
export async function registerScript(lockScript) {
  return lightRpc('set_scripts', [[{
    script: lockScript,
    script_type: 'lock',
    block_number: '0x0',  // sync from genesis (light client will fast-forward)
  }], 'partial'])  // 'partial' = add without removing existing scripts
}

/**
 * Get UTXOs (live cells) for a lock script.
 * Returns capacity sum and cell list.
 */
export async function getCells(lockScript, limit = 50) {
  return lightRpc('get_cells', [{
    script: lockScript,
    script_type: 'lock',
    filter: null,
  }, 'asc', `0x${limit.toString(16)}`, null])
}

/**
 * Get transaction history for a lock script.
 * Returns array of { tx_hash, block_number, io_type, io_index }
 */
export async function getTransactions(lockScript, limit = 20) {
  return lightRpc('get_transactions', [{
    script: lockScript,
    script_type: 'lock',
    filter: null,
  }, 'desc', `0x${limit.toString(16)}`, null])
}

/**
 * Get the current chain tip (light-client verified header).
 */
export async function getTipHeader() {
  return lightRpc('get_tip_header', [])
}

/**
 * Broadcast a signed transaction.
 */
export async function sendTransaction(tx) {
  return lightRpc('send_transaction', [tx])
}

/**
 * Get sync status for registered scripts.
 */
export async function getScripts() {
  return lightRpc('get_scripts', [])
}

/**
 * Parse a CKB address into its lock script components.
 * Handles secp256k1 (most common) for now.
 * TODO: full address parser for JoyID/Omnilock
 */
export function addressToLockScript(address) {
  // Placeholder — real impl needs bech32m decode
  // CCC handles this properly; wire in when CCC is added
  throw new Error('addressToLockScript: use CCC signer.getAddressObj() instead')
}

/**
 * Sum capacity from a get_cells response.
 * Returns CKB as a number (from shannon).
 */
export function sumCapacity(cellsResult) {
  const cells = cellsResult?.objects || []
  const totalShannon = cells.reduce((acc, cell) => {
    return acc + BigInt(cell.output?.capacity || '0x0')
  }, 0n)
  return Number(totalShannon) / 1e8
}

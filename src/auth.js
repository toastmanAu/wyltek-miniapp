/**
 * auth.js — JoyID auth via Cloudflare Worker relay
 *
 * Problem: JoyID's redirect flow sends result to redirectURL in the EXTERNAL browser.
 * Telegram Mini App WebView never sees those URL params.
 *
 * Solution: relay via Worker
 *   1. Generate sessionToken
 *   2. Open JoyID with redirectURL = Worker /joyid-callback?token=<sessionToken>
 *   3. JoyID redirects to Worker with ?_data_=<result>&joyid-redirect=true&token=<sessionToken>
 *   4. Worker parses address, stores it keyed by token (5min TTL, in-memory)
 *   5. Mini app polls Worker /joyid-poll?token=<sessionToken> every 2s
 *   6. Worker returns {address} → mini app saves to localStorage, updates UI
 */

import { initConfig } from '@joyid/miniapp'
import { buildJoyIDAuthURL } from '@joyid/common'

const WORKER_URL = 'https://wyltek-rpc.toastman-one.workers.dev'
const APP_URL = 'https://wyltek-miniapp.pages.dev/'

const JOYID_CONFIG = {
  network: 'mainnet',
  joyidAppURL: 'https://app.joy.id',
  name: 'Wyltek Industries',
  logo: 'https://wyltekindustries.com/wyltek-mark.png',
}

export function initJoyID() {
  try {
    initConfig(JOYID_CONFIG)
    console.log('[Auth] JoyID config set')
  } catch (err) {
    console.warn('[Auth] JoyID init failed:', err.message)
  }
}

let _pollInterval = null

export function authWithJoyID(onSuccess, onError) {
  const tg = window.Telegram?.WebApp
  try {
    // Generate a session token for this auth attempt
    const sessionToken = crypto.randomUUID()
    const callbackURL = `${WORKER_URL}/joyid-callback?token=${sessionToken}`

    const request = {
      ...JOYID_CONFIG,
      redirectURL: callbackURL,
      requestNetwork: 'nervos',
    }
    const url = buildJoyIDAuthURL(request, 'redirect')
    console.log('[Auth] Session token:', sessionToken)
    console.log('[Auth] Callback URL:', callbackURL)
    console.log('[Auth] Opening JoyID:', url.slice(0, 120))

    if (tg?.openLink) {
      tg.openLink(url, { try_instant_view: false })
    } else {
      window.open(url, '_blank')
    }

    // Store token globally so activated handler can re-poll on TG resume
    window._joyidPendingToken = sessionToken
    _startPolling(sessionToken, onSuccess, onError)
  } catch (err) {
    console.error('[Auth] JoyID connect failed:', err)
    if (onError) onError(err)
  }
}

export function cancelAuth() {
  if (_pollInterval) {
    clearInterval(_pollInterval)
    _pollInterval = null
  }
}

export function getConnectedAddress() {
  return localStorage.getItem('wyltek_address') || null
}

export function disconnect() {
  localStorage.removeItem('wyltek_address')
  cancelAuth()
}

function _startPolling(token, onSuccess, onError) {
  cancelAuth() // clear any existing poll

  let attempts = 0
  const MAX_ATTEMPTS = 90 // 3 minutes at 2s intervals

  console.log('[Auth] Polling for token', token.slice(0, 8), '...')
  _pollInterval = setInterval(async () => {
    attempts++
    if (attempts > MAX_ATTEMPTS) {
      cancelAuth()
      console.warn('[Auth] Poll timed out after 3 minutes')
      if (onError) onError(new Error('Auth timed out'))
      return
    }

    try {
      const res = await fetch(`${WORKER_URL}/joyid-poll?token=${token}`)
      const data = await res.json()

      if (data.address) {
        cancelAuth()
        window._joyidPendingToken = null
        localStorage.setItem('wyltek_address', data.address)
        console.log('[Auth] ✅ Got address from relay:', data.address)
        if (onSuccess) onSuccess(data.address)
      } else if (data.error) {
        cancelAuth()
        window._joyidPendingToken = null
        console.error('[Auth] Poll error:', data.error)
        if (onError) onError(new Error(data.error))
      }
      // data.pending = true → keep polling
    } catch (err) {
      console.warn('[Auth] Poll request failed:', err.message)
      // Network error — keep trying
    }
  }, 2000)
}

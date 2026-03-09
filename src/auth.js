/**
 * auth.js — JoyID miniapp SDK integration
 * 
 * Flow: buildCkbConnectUrl → tg.openLink → JoyID auth → redirects back to app URL
 * On return: _processCallback() reads result from URL params set by JoyID
 * 
 * NOTE: Telegram Mini App browsers don't auto-close after redirect.
 * User must manually return to Telegram after JoyID auth completes.
 * The redirect URL lands back on the mini app with ?_data_= in the query string.
 */

import { buildCkbConnectUrl, initConfig } from '@joyid/miniapp'

// Base URL of the mini app — JoyID will redirect here after auth
const APP_URL = 'https://wyltek-miniapp.pages.dev/'

const JOYID_CONFIG = {
  network: 'mainnet',
  joyidAppURL: 'https://app.joy.id',
  name: 'Wyltek Industries',
  logo: 'https://wyltekindustries.com/wyltek-mark.png',
  redirectURL: APP_URL,
}

export function initJoyID() {
  try {
    initConfig(JOYID_CONFIG)
    console.log('[Auth] JoyID miniapp config set')
    // Check if we got a callback result in the URL (from redirect after auth)
    _processCallback()
  } catch (err) {
    console.warn('[Auth] JoyID init failed:', err.message)
  }
}

export function authWithJoyID() {
  const tg = window.Telegram?.WebApp
  try {
    const url = buildCkbConnectUrl({
      ...JOYID_CONFIG,
      redirectURL: APP_URL,
    })
    console.log('[Auth] Opening JoyID — redirect back to:', APP_URL)
    console.log('[Auth] JoyID URL:', url.slice(0, 120))

    if (tg?.openLink) {
      // Open JoyID in Telegram's browser
      // User will auth, JoyID redirects to APP_URL with ?_data_= result
      // User must then tap "Back to Telegram" or switch back manually
      tg.openLink(url, { try_instant_view: false })
    } else {
      window.open(url, '_blank')
    }
  } catch (err) {
    console.error('[Auth] JoyID connect failed:', err)
    throw err
  }
}

export function getConnectedAddress() {
  return localStorage.getItem('wyltek_address') || null
}

export function disconnect() {
  localStorage.removeItem('wyltek_address')
}

// Called on app load — checks if JoyID redirected back with auth result
function _processCallback() {
  try {
    const params = new URLSearchParams(location.search)
    const data = params.get('_data_')
    if (!data) return

    console.log('[Auth] JoyID callback data found, decoding...')
    
    // JoyID encodes result as base64 JSON in _data_ param
    let decoded
    try {
      decoded = JSON.parse(atob(data))
    } catch {
      // Try URL-safe base64
      decoded = JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')))
    }

    console.log('[Auth] JoyID decoded result:', decoded)

    // CKB address is in decoded.address or decoded.ckbAddress
    const address = decoded?.address || decoded?.ckbAddress
    if (address) {
      localStorage.setItem('wyltek_address', address)
      console.log('[Auth] Saved address:', address)
      // Clean the URL so refresh doesn't reprocess
      history.replaceState(null, '', location.pathname)
      // Dispatch event so wallet UI can update
      window.dispatchEvent(new CustomEvent('joyid-auth', { detail: { address } }))
    }
  } catch (err) {
    console.warn('[Auth] JoyID callback parse failed:', err.message)
  }
}

/**
 * auth.js — JoyID auth via /auth redirect flow
 *
 * Bypasses /auth-mini-app (which shows a green "Sign" button confirmation page).
 * Uses /auth with type=redirect directly from @joyid/common — auto-proceeds through auth,
 * then redirects back to APP_URL with ?_data_=<result>&joyid-redirect=true.
 *
 * On return: boot() calls initJoyID() → _processCallback() reads result via SDK's authCallback().
 */

import { initConfig, getConfig } from '@joyid/miniapp'
import { buildJoyIDAuthURL, isRedirectFromJoyID, authCallback, encodeSearch } from '@joyid/common'

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
    console.log('[Auth] JoyID config set')
    _processCallback()
  } catch (err) {
    console.warn('[Auth] JoyID init failed:', err.message)
  }
}

export function authWithJoyID() {
  const tg = window.Telegram?.WebApp
  try {
    // Build /auth redirect URL directly — skips /auth-mini-app green button page
    const request = {
      ...JOYID_CONFIG,
      redirectURL: APP_URL,
      requestNetwork: 'nervos',
    }
    const url = buildJoyIDAuthURL(request, 'redirect')
    console.log('[Auth] Opening JoyID /auth redirect:', url.slice(0, 120))

    if (tg?.openLink) {
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

// Called at boot — if returning from JoyID redirect, parse the result
function _processCallback() {
  try {
    if (!isRedirectFromJoyID()) return

    console.log('[Auth] JoyID redirect detected, parsing callback...')
    const result = authCallback()
    console.log('[Auth] authCallback result:', JSON.stringify(result))

    const address = result?.address
    if (address) {
      localStorage.setItem('wyltek_address', address)
      console.log('[Auth] Saved CKB address:', address)
      history.replaceState(null, '', location.pathname)
      window.dispatchEvent(new CustomEvent('joyid-auth', { detail: { address } }))
    } else {
      console.warn('[Auth] authCallback returned no address:', result)
    }
  } catch (err) {
    console.warn('[Auth] JoyID callback parse failed:', err.message)
  }
}

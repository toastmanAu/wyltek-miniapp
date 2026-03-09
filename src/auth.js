/**
 * auth.js — JoyID miniapp SDK integration
 * Flow: buildCkbConnectUrl → tg.openLink → JoyID redirects back with address in hash
 */

import { buildCkbConnectUrl, initConfig } from '@joyid/miniapp'

const JOYID_CONFIG = {
  network: 'mainnet',
  joyidAppURL: 'https://app.joy.id',
  name: 'Wyltek Industries',
  logo: 'https://wyltekindustries.com/wyltek-mark.png',
  redirectURL: location.href,
}

export function initJoyID() {
  try {
    initConfig(JOYID_CONFIG)
    console.log('[Auth] JoyID miniapp config set')
    // Check if we got a callback result in the URL hash
    _processCallback()
  } catch (err) {
    console.warn('[Auth] JoyID init failed:', err.message)
  }
}

export function authWithJoyID() {
  try {
    const tg = window.Telegram?.WebApp
    // Build the CKB connect URL — redirectURL brings user back here
    const url = buildCkbConnectUrl({
      ...JOYID_CONFIG,
      redirectURL: location.href,
    })
    console.log('[Auth] Opening JoyID URL:', url.slice(0, 80))
    // Open in Telegram's in-app browser
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

// JoyID redirects back with result encoded in URL hash/params
function _processCallback() {
  try {
    // JoyID puts result in location.hash as base64 or in ?_data_= param
    const hash = location.hash
    const params = new URLSearchParams(location.search)
    const data = params.get('_data_') || hash.replace('#', '')
    if (!data) return

    const decoded = JSON.parse(atob(data))
    if (decoded?.address) {
      localStorage.setItem('wyltek_address', decoded.address)
      console.log('[Auth] JoyID callback — address:', decoded.address)
      // Clean URL
      history.replaceState(null, '', location.pathname)
    }
  } catch {}
}

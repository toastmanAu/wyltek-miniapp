/**
 * auth.js — JoyID miniapp SDK integration
 *
 * Flow: buildCkbConnectUrl → tg.openLink → JoyID auth → redirects back with ?_data_=&joyid-redirect=true
 * On return: boot() calls initJoyID() → _processCallback() reads result via SDK's authCallback()
 */

import { buildCkbConnectUrl, initConfig } from '@joyid/miniapp'
import { isRedirectFromJoyID, authCallback } from '@joyid/common'

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
    const url = buildCkbConnectUrl({
      ...JOYID_CONFIG,
      redirectURL: APP_URL,
      // type must be redirect for the miniapp redirect flow
      type: 'redirect',
    })
    console.log('[Auth] Opening JoyID URL:', url.slice(0, 120))
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

// Called at boot — if we're returning from JoyID redirect, parse the result
function _processCallback() {
  try {
    if (!isRedirectFromJoyID()) return

    console.log('[Auth] JoyID redirect detected, parsing callback...')
    const result = authCallback()
    console.log('[Auth] authCallback result:', result)

    const address = result?.address
    if (address) {
      localStorage.setItem('wyltek_address', address)
      console.log('[Auth] Saved CKB address:', address)
      // Clean redirect params from URL
      history.replaceState(null, '', location.pathname)
      // Signal to main.js that auth completed
      window.dispatchEvent(new CustomEvent('joyid-auth', { detail: { address } }))
    } else {
      console.warn('[Auth] authCallback returned no address:', result)
    }
  } catch (err) {
    console.warn('[Auth] JoyID callback parse failed:', err.message)
  }
}

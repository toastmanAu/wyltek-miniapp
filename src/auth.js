/**
 * auth.js — JoyID miniapp SDK integration
 * Uses @joyid/miniapp for Telegram Mini App environment
 */

// Config
const JOYID_CONFIG = {
  // Mainnet
  network: 'mainnet',
  joyidAppURL: 'https://app.joy.id',
  // Your app identity
  name: 'Wyltek Industries',
  logo: 'https://wyltekindustries.com/wyltek-mark.png',
  redirectURL: location.href,
}

let joyid = null

export async function initJoyID() {
  try {
    const { initConfig } = await import('@joyid/miniapp')
    initConfig(JOYID_CONFIG)
    joyid = true
    console.log('[Auth] JoyID miniapp initialised')
  } catch (err) {
    console.warn('[Auth] JoyID miniapp not available:', err.message)
  }
}

export async function authWithJoyID() {
  try {
    const { connect } = await import('@joyid/miniapp')
    const result = await connect()
    // result.address = CKB mainnet address
    return result?.address || null
  } catch (err) {
    console.error('[Auth] JoyID connect failed:', err)
    throw err
  }
}

export function getConnectedAddress() {
  return localStorage.getItem('wyltek_address') || null
}

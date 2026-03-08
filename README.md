# Wyltek Industries — Telegram Mini App

Full-featured Telegram Mini App for the Wyltek Industries ecosystem.

## Features

- 🏠 **Home** — CKB wallet balance, member status, quick links
- ⛓️ **Chain** — Live CKB + Bitcoin node stats (your own nodes)
- 🔬 **Research** — Browse findings, search, filter
- 🛋️ **Lounge** — Real-time community chat (same Supabase as website)
- 👾 **Members** — Founding member DOB NFT viewer
- 🔐 **JoyID** — Passkey wallet auth via `@joyid/miniapp`

## Architecture

```
Telegram Mini App (Vite + vanilla JS)
  ↕ @joyid/miniapp (auth)
  ↕ Supabase (research, lounge, members)
  ↕ Cloudflare Worker RPC proxy
       ↕ CKB node (192.168.68.87:8114)
       ↕ Bitcoin node (192.168.68.106:8332)
```

## Setup

### 1. Create Telegram Bot
- Message @BotFather → `/newbot`
- Set bot name and username
- Copy the token

### 2. Set Mini App URL in BotFather
```
/newapp → your bot → set URL to your deployed app
```

### 3. Deploy the RPC proxy Worker
```bash
cd workers/
npx wrangler deploy rpc-proxy.js --name wyltek-rpc
# Set env vars in Cloudflare dashboard:
#   CKB_RPC_URL, BTC_RPC_URL, BTC_RPC_USER, BTC_RPC_PASS
```

Note: CKB/BTC nodes need to be reachable from Cloudflare Workers.
Options: Tailscale (recommended), VPN, or expose via Cloudflare Tunnel.

### 4. Build and deploy the Mini App
```bash
npm install
npm run build
# Deploy dist/ to Cloudflare Pages, GitHub Pages, or any static host
```

### 5. Wire up BotFather
```
/mybots → your bot → Bot Settings → Menu Button → set URL
```

## Development

```bash
npm install
npm run dev
# Opens at http://localhost:3000
# Use Telegram's test environment or BotFather test bot for local dev
```

## Bot Token
Set in environment or `src/config.js` (never commit).

## Roadmap
- [ ] Push notifications via bot (new lounge messages, DOB mint alerts)
- [ ] CKB transaction builder (send CKB directly from mini app)
- [ ] Fiber channel management
- [ ] WyVault signing request relay

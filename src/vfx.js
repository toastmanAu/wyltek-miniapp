/**
 * vfx.js — visual effects layer
 * - Particle canvas background (subtle floating nodes)
 * - Live block ticker with pulse
 * - Ripple on any .tool-btn press
 * - Glow sweep on hero cards
 */

// ── Particle Canvas ───────────────────────────────────────────────
export function initParticles() {
  const canvas = document.createElement('canvas')
  canvas.id = 'particle-canvas'
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.45;
  `
  document.getElementById('app').prepend(canvas)

  const ctx = canvas.getContext('2d')
  let W, H, particles, animId

  function resize() {
    W = canvas.width  = window.innerWidth
    H = canvas.height = window.innerHeight
  }

  function makeParticle() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.2 + 0.3,
      vx:   (Math.random() - 0.5) * 0.18,
      vy:   (Math.random() - 0.5) * 0.18,
      life: Math.random(),        // 0–1
      speed: Math.random() * 0.003 + 0.001,
      hue:  Math.random() > 0.7 ? 200 : 210,   // mostly cyan-blue
    }
  }

  function init() {
    resize()
    particles = Array.from({ length: 55 }, makeParticle)
  }

  // Connection lines between nearby particles
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 90) {
          const alpha = (1 - dist / 90) * 0.12
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H)

    drawLines()

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy
      p.life += p.speed

      // Wrap edges
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0

      const alpha = 0.3 + 0.5 * Math.sin(p.life * Math.PI * 2)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${alpha})`
      ctx.fill()
    }

    animId = requestAnimationFrame(frame)
  }

  init()
  frame()
  window.addEventListener('resize', () => { resize(); init() })

  return () => cancelAnimationFrame(animId)
}

// ── Ripple on press ───────────────────────────────────────────────
export function initRipple() {
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.tool-btn, .btn, .nav-btn, .chain-seg-btn, .fiber-tab')
    if (!btn) return

    const r   = btn.getBoundingClientRect()
    const x   = e.clientX - r.left
    const y   = e.clientY - r.top
    const max = Math.max(r.width, r.height) * 2

    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      width: ${max}px; height: ${max}px;
      left: ${x - max/2}px; top: ${y - max/2}px;
      background: rgba(255,255,255,0.12);
      pointer-events: none;
      transform: scale(0);
      animation: ripple-anim 0.5s ease-out forwards;
      z-index: 99;
    `
    // Ensure btn has position for absolute child
    const pos = getComputedStyle(btn).position
    if (pos === 'static') btn.style.position = 'relative'
    btn.style.overflow = 'hidden'
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  })

  // Inject keyframe once
  if (!document.getElementById('ripple-kf')) {
    const s = document.createElement('style')
    s.id = 'ripple-kf'
    s.textContent = `@keyframes ripple-anim {
      to { transform: scale(1); opacity: 0; }
    }`
    document.head.appendChild(s)
  }
}

// ── Hero card shimmer sweep ───────────────────────────────────────
export function initHeroShimmer() {
  if (!document.getElementById('shimmer-kf')) {
    const s = document.createElement('style')
    s.id = 'shimmer-kf'
    s.textContent = `
      @keyframes hero-sweep {
        0%   { transform: translateX(-100%) skewX(-20deg); }
        100% { transform: translateX(250%)  skewX(-20deg); }
      }
      .stat-hero::after {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 40%; height: 100%;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(255,255,255,0.055) 50%,
          transparent 100%
        );
        animation: hero-sweep 3.5s ease-in-out infinite;
        pointer-events: none;
      }
    `
    document.head.appendChild(s)
  }
}

// ── Live block pulse ticker ───────────────────────────────────────
let _blockPulseEl   = null
let _blockPulseInt  = null
let _lastBlockNum   = null

export function startBlockPulse(initialBlock) {
  _lastBlockNum = initialBlock
  stopBlockPulse()

  // Poll CKB tip every 8s
  _blockPulseInt = setInterval(async () => {
    try {
      const r = await fetch('https://mainnet.ckbapp.dev/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc:'2.0',id:1, method:'get_tip_block_number', params:[] }),
      })
      const j = await r.json()
      const newBlock = parseInt(j.result, 16)
      if (newBlock !== _lastBlockNum) {
        _lastBlockNum = newBlock
        fireBlockPulse(newBlock)
      }
    } catch {}
  }, 8000)
}

export function stopBlockPulse() {
  if (_blockPulseInt) clearInterval(_blockPulseInt)
}

function fireBlockPulse(blockNum) {
  // Find the hero value element and flash it
  const el = document.querySelector('.ckb-hero .stat-hero-value')
  if (!el) return

  el.textContent = blockNum.toLocaleString()

  // Flash glow
  el.style.transition = 'text-shadow 0.1s'
  el.style.textShadow = '0 0 20px rgba(0,212,255,0.9), 0 0 40px rgba(0,212,255,0.5)'
  setTimeout(() => {
    el.style.textShadow = ''
  }, 800)

  // Pulse the dot if present
  const dot = document.querySelector('.live-dot')
  if (dot) {
    dot.classList.remove('live-dot-ping')
    void dot.offsetWidth
    dot.classList.add('live-dot-ping')
  }
}

// ── Live dot CSS ──────────────────────────────────────────────────
export function injectLiveDotCSS() {
  if (document.getElementById('live-dot-kf')) return
  const s = document.createElement('style')
  s.id = 'live-dot-kf'
  s.textContent = `
    .live-dot {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--green);
      margin-right: 5px;
      vertical-align: middle;
      position: relative;
    }
    .live-dot::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      background: rgba(16,185,129,0.35);
      animation: dot-ring 2s ease-out infinite;
    }
    .live-dot-ping::after {
      animation: dot-ring-fast 0.6s ease-out;
    }
    @keyframes dot-ring {
      0%   { transform: scale(0.8); opacity: 0.8; }
      70%  { transform: scale(1.8); opacity: 0; }
      100% { transform: scale(0.8); opacity: 0; }
    }
    @keyframes dot-ring-fast {
      0%   { transform: scale(0.8); opacity: 1; background: rgba(0,212,255,0.6); }
      100% { transform: scale(3);   opacity: 0; }
    }
    .glitch {
      animation: glitch 0.15s steps(2) 3;
    }
    @keyframes glitch {
      0%   { transform: translate(0,0);  }
      25%  { transform: translate(-2px,1px); filter: hue-rotate(90deg); }
      50%  { transform: translate(2px,-1px); }
      75%  { transform: translate(-1px,0); }
      100% { transform: translate(0,0); }
    }
    .fade-in-up {
      animation: fade-in-up 0.35s ease both;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .stagger > * {
      animation: fade-in-up 0.3s ease both;
    }
    .stagger > *:nth-child(1) { animation-delay: 0.04s }
    .stagger > *:nth-child(2) { animation-delay: 0.09s }
    .stagger > *:nth-child(3) { animation-delay: 0.14s }
    .stagger > *:nth-child(4) { animation-delay: 0.18s }
    .stagger > *:nth-child(5) { animation-delay: 0.22s }
    .stagger > *:nth-child(6) { animation-delay: 0.26s }
  `
  document.head.appendChild(s)
}

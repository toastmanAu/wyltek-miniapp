/**
 * transition.js — hero expand transition
 * Click a .tool-btn → it expands to fill #tab-content, then the new tab renders.
 */

export function initTransitions(navigateFn) {
  // Delegate on tab-content — wire up any .tool-btn with data-tab
  document.getElementById('tab-content').addEventListener('click', e => {
    const btn = e.target.closest('.tool-btn[data-tab]')
    if (!btn) return
    const tab = btn.dataset.tab
    if (!tab) return

    e.stopPropagation()
    heroExpand(btn, tab, navigateFn)
  })
}

function heroExpand(btn, tab, navigateFn) {
  const content = document.getElementById('tab-content')

  // Measure button rect relative to viewport
  const r   = btn.getBoundingClientRect()
  const cR  = content.getBoundingClientRect()

  // Capture accent colour from data-color attr or fall back to surface
  const accentBg = btn.dataset.color || 'var(--surface2)'

  // Create the expanding overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    z-index: 50;
    border-radius: 14px;
    pointer-events: none;
    will-change: transform, border-radius;
    background: ${accentBg};
    border: 1px solid rgba(255,255,255,0.1);
    left:   ${r.left}px;
    top:    ${r.top}px;
    width:  ${r.width}px;
    height: ${r.height}px;
    transition: none;
  `
  document.body.appendChild(overlay)

  // Force reflow so the starting position is painted
  overlay.getBoundingClientRect()

  // Target: fill the content area
  const tx = cR.left - r.left
  const ty = cR.top  - r.top
  const sx = cR.width  / r.width
  const sy = cR.height / r.height

  overlay.style.transition = 'transform 0.32s cubic-bezier(0.4,0,0.2,1), border-radius 0.32s ease, opacity 0.1s 0.28s'
  overlay.style.transform  = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`
  overlay.style.borderRadius = '0px'

  // Haptic
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium')

  // After expand finishes: navigate + fade overlay out
  overlay.addEventListener('transitionend', async function handler(ev) {
    if (ev.propertyName !== 'transform') return
    overlay.removeEventListener('transitionend', handler)

    // Navigate (renders content behind overlay)
    await navigateFn(tab)

    // Fade the overlay away to reveal new content
    overlay.style.transition = 'opacity 0.18s ease'
    overlay.style.opacity    = '0'

    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true })
  }, { once: false })
}

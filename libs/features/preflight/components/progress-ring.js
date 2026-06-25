/**
 * Creates an animated SVG progress ring element used as a loading indicator.
 * @returns {HTMLElement}
 */
export function createProgressRing() {
  const wrap = document.createElement('span');
  wrap.className = 'preflight-progress-ring';
  wrap.setAttribute('aria-label', 'Loading');
  wrap.setAttribute('role', 'status');
  wrap.innerHTML = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-dasharray="40 12" stroke-linecap="round"/>
  </svg>`;
  return wrap;
}

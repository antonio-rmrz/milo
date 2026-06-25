/**
 * Injects a fixed 'Back to Preflight' popover in the top-left corner.
 * Clicking it calls the provided reopenFn.  Auto-removes after 30 s or on
 * the next user interaction outside the popover.
 *
 * @param {Function} reopenFn  Called when the user clicks the popover.
 * @returns {HTMLElement}  The popover element (already appended to body).
 */
export function injectBackPopover(reopenFn) {
  // Remove any existing popover first
  removeBackPopover();

  const el = document.createElement('div');
  el.className = 'preflight-back-popover';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', 'Back to Preflight');
  el.dataset.preflightBackPopover = 'true';
  el.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Back to Preflight</span>
  `;

  let removed = false;
  function remove() {
    if (removed) return;
    removed = true;
    el.remove();
    document.removeEventListener('click', outsideHandler, true);
    document.removeEventListener('keydown', outsideHandler, true);
    clearTimeout(timer);
  }

  function outsideHandler(e) {
    if (!el.contains(e.target)) remove();
  }

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    remove();
    reopenFn();
  });

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      remove();
      reopenFn();
    }
  });

  document.body.appendChild(el);

  // Auto-remove after 30 s
  const timer = setTimeout(remove, 30000);

  // Remove on next outside interaction
  setTimeout(() => {
    document.addEventListener('click', outsideHandler, true);
    document.addEventListener('keydown', outsideHandler, true);
  }, 0);

  return el;
}

/**
 * Removes any existing back-popover from the DOM.
 */
export function removeBackPopover() {
  document.querySelectorAll('[data-preflight-back-popover]').forEach((el) => el.remove());
}

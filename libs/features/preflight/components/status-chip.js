/**
 * StatusChip — maps a status string to a .preflight-chip--* variant element.
 * @param {string} status  'error' | 'warning' | 'success' | 'info'
 * @param {string} label   Text content of the chip
 * @returns {HTMLElement}
 */
export function createStatusChip(status, label) {
  const chip = document.createElement('span');
  chip.className = `preflight-chip preflight-chip--${status}`;
  chip.textContent = label;
  chip.setAttribute('data-status', status);
  return chip;
}

/**
 * Returns the chip variant string for a given numeric count.
 * @param {number} errors
 * @param {number} warnings
 * @returns {'error'|'warning'|'success'}
 */
export function chipVariantFromCounts(errors, warnings) {
  if (errors > 0) return 'error';
  if (warnings > 0) return 'warning';
  return 'success';
}

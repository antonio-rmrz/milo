/**
 * Martech tab — reads martech-metadata block and renders a styled table.
 */

/**
 * Collects martech metadata key/value pairs from the page.
 * @returns {Array<{key:string, value:string}>}
 */
export function collectMartechData() {
  const rows = [];
  // Standard meta tags relevant to martech
  const metaNames = [
    'adobe-target',
    'audience-manager',
    'analytics',
    'launch',
    'dtm',
    'martech',
    'personalization',
    'experiment',
    'campaign',
  ];
  metaNames.forEach((name) => {
    const el = document.querySelector(`meta[name="${name}"]`);
    if (el) rows.push({ key: name, value: el.content || '' });
  });

  // martech-metadata block
  document.querySelectorAll('.martech-metadata td, .martech-metadata th').forEach((cell) => {
    const row = cell.closest('tr');
    if (!row) return;
    const cells = Array.from(row.querySelectorAll('td, th'));
    if (cells.length >= 2) {
      rows.push({ key: cells[0].textContent.trim(), value: cells[1].textContent.trim() });
    }
  });

  return rows;
}

/**
 * Builds the martech tab content.
 * @returns {HTMLElement}
 */
export function buildMartechContent() {
  const data = collectMartechData();
  const wrap = document.createElement('div');

  if (data.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'preflight-card-body';
    empty.textContent = 'No martech metadata found on this page.';
    wrap.appendChild(empty);
    return wrap;
  }

  const table = document.createElement('table');
  table.className = 'preflight-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Key', 'Value'].forEach((h) => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(({ key, value }) => {
    const tr = document.createElement('tr');
    const tdKey = document.createElement('td');
    tdKey.textContent = key;
    const tdVal = document.createElement('td');
    tdVal.textContent = value;
    tr.appendChild(tdKey);
    tr.appendChild(tdVal);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);

  return wrap;
}

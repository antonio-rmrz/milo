import { html, signal, useEffect } from '../../../deps/htm-preact.js';

const martechRows = signal([]);
const copiedTimeout = signal(null);
const btnText = signal('Copy Table');

/**
 * Determine a simple present/missing status for a martech string.
 * Strings that look like URLs or are very long are flagged as 'present';
 * empty strings are 'missing'.
 */
function getRowStatus(str) {
  if (!str || !str.trim()) return 'missing';
  return 'present';
}

async function checkMartechMeta() {
  const elementList = 'h1, h2, h3, h4, h5, h6, a, .tracking-header, .click-link, .con-button';
  const strings = [...document.querySelectorAll(`main :is(${elementList})`)
  ]
    .filter((el) => !el.closest('[class*="metadata"]') && !el.innerText.startsWith('http')
      && !el.querySelector(elementList))
    .reduce((acc, curr) => {
      const str = curr.innerText.trim();
      if (str) acc.push(str);
      return acc;
    }, []);

  const unique = [...new Set(strings)];
  martechRows.value = unique.map((str) => ({
    label: str,
    value: str,
    status: getRowStatus(str),
  }));
}

function getClipboardHtml(rows) {
  const tableRows = rows.map((row) => `
    <tr>
      <td><h3>${row.label}</h3></td>
      <td><h3 data-ccp-parastyle="DNT">${row.value}</h3></td>
    </tr>`).join('');
  return `<table border="1"><tr><th colspan="2" style="width:100%">martech metadata</th></tr>${tableRows}</table>`;
}

function copyTable() {
  const html2 = getClipboardHtml(martechRows.value);
  try {
    /* global ClipboardItem */
    const clipboardData = [new ClipboardItem({ 'text/html': new Blob([html2], { type: 'text/html' }) })];
    navigator.clipboard.write(clipboardData);
    btnText.value = '✔ Copied!';
  } catch (e) {
    btnText.value = 'ⓧ Error Copying';
    /* eslint-disable-next-line no-console */
    console.error(e);
  }
  if (copiedTimeout.value) clearTimeout(copiedTimeout.value);
  copiedTimeout.value = setTimeout(() => {
    btnText.value = 'Copy Table';
  }, 5000);
}

function StatusChip({ status }) {
  const chipClass = status === 'present' ? 'preflight-chip chip-success'
    : status === 'missing' ? 'preflight-chip chip-error'
      : 'preflight-chip chip-warning';
  const label = status === 'present' ? 'Present'
    : status === 'missing' ? 'Missing' : 'Invalid';
  return html`<span class=${chipClass}>${label}</span>`;
}

function MartechRow({ row, idx }) {
  return html`
    <div class="martech-table-row" role="row" tabindex="0">
      <div role="cell">${row.label}</div>
      <div class="martech-value" role="cell">${row.value}</div>
      <div class="martech-status" role="cell">
        <${StatusChip} status=${row.status} />
      </div>
    </div>`;
}

export default function Martech() {
  useEffect(() => { checkMartechMeta(); }, []);

  return html`
    <div class="access-columns martech">
      ${martechRows.value.length > 0 && html`
        <button class="preflight-action" style="margin-bottom: 12px" onclick=${copyTable}>${btnText.value}</button>
        <div class="martech-table-wrapper">
          <div class="martech-table" role="table" aria-label="Martech metadata">
            <div class="martech-table-header" role="row">
              <div role="columnheader">Label</div>
              <div role="columnheader">Value</div>
              <div role="columnheader">Status</div>
            </div>
            ${martechRows.value.map((row, idx) => html`<${MartechRow} row=${row} idx=${idx} />`)}
          </div>
        </div>
      `}
    </div>`;
}

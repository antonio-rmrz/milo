import { html, signal, useEffect } from '../../../deps/htm-preact.js';

const martechRows = signal(null);
const copiedTimeout = signal(null);
const btnText = signal('Copy Table');

function getClipboardHtml(rows) {
  const table = document.createElement('table');
  table.setAttribute('border', 1);
  const headerRow = document.createElement('tr');
  const th = document.createElement('th');
  th.setAttribute('colspan', 2);
  th.setAttribute('style', 'width: 100%');
  th.textContent = 'martech metadata';
  headerRow.append(th);
  table.append(headerRow);
  rows.forEach(([str]) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const h3a = document.createElement('h3');
    h3a.textContent = str;
    td1.append(h3a);
    const td2 = document.createElement('td');
    const h3b = document.createElement('h3');
    h3b.setAttribute('data-ccp-parastyle', 'DNT');
    h3b.textContent = str;
    td2.append(h3b);
    tr.append(td1, td2);
    table.append(tr);
  });
  return table.outerHTML;
}

async function checkMartechMeta() {
  const elementList = 'h1, h2, h3, h4, h5, h6, a, .tracking-header, .click-link, .con-button';
  const strings = [...document.querySelectorAll(`main :is(${elementList})`)]
    .filter((el) => !el.closest('[class*="metadata"]') && !el.innerText.startsWith('http')
      && !el.querySelector(elementList))
    .reduce((acc, curr) => {
      const str = curr.innerText.trim();
      if (str) acc.push(str);
      return acc;
    }, []);
  martechRows.value = [...new Set(strings)].map((str) => [str]);
}

function copyTable() {
  if (!martechRows.value) return;
  try {
    const clipboardData = [new ClipboardItem({ 'text/html': new Blob([getClipboardHtml(martechRows.value)], { type: 'text/html' }) })];
    navigator.clipboard.write(clipboardData);
    btnText.value = 'Copied!';
  } catch (e) {
    btnText.value = 'Error Copying';
    /* eslint-disable-next-line no-console */
    console.error(e);
  }
  if (copiedTimeout.value) clearTimeout(copiedTimeout.value);
  copiedTimeout.value = setTimeout(() => {
    btnText.value = 'Copy Table';
  }, 5000);
}

export default function Martech() {
  useEffect(() => { checkMartechMeta(); }, []);

  return html`
    <div class="preflight .martech">
      ${martechRows.value && html`
        <div class="preflight-section-header">
          <h2 class="preflight-section-title">Martech Metadata</h2>
          <button class="preflight-action" onclick=${copyTable}>${btnText.value}</button>
        </div>
        <div class="preflight-martech-scroll">
          <table class="preflight-martech-table">
            <thead>
              <tr>
                <th>String</th>
                <th>DNT</th>
              </tr>
            </thead>
            <tbody>
              ${martechRows.value.map(([str]) => html`
                <tr>
                  <td>${str}</td>
                  <td>${str}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      `}
    </div>`;
}

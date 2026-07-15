import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { createTag } from '../../../utils/utils.js';

const martechBlock = signal(null);
const copiedTimeout = signal(null);
const btnText = signal('Copy Table');

function getTable(strings) {
  const table = document.createElement('table');
  table.className = 'preflight-martech-table';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const th1 = createTag('th', {}, 'Text');
  const th2 = createTag('th', {}, 'DNT Copy');
  headerRow.append(th1, th2);
  thead.append(headerRow);
  table.append(thead);
  const tbody = document.createElement('tbody');
  [...strings].forEach((str) => {
    const tr = document.createElement('tr');
    tr.append(createTag('td', {}, str));
    tr.append(createTag('td', { 'data-ccp-parastyle': 'DNT' }, str));
    tbody.append(tr);
  });
  table.append(tbody);
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
  martechBlock.value = getTable(new Set(strings));
}

function copyTable() {
  try {
    const clipboardData = [new ClipboardItem({ 'text/html': new Blob([martechBlock.value], { type: 'text/html' }) })];
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

export default function Martech() {
  useEffect(() => { checkMartechMeta(); }, []);

  return html`
  <div class="martech">
    ${martechBlock.value && html`
      <button class="preflight-action" onclick=${copyTable}>${btnText.value}</button>
      <div dangerouslySetInnerHTML="${{ __html: martechBlock.value }}"></div>
    `}
  </div>`;
}

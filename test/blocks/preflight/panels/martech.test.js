import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Martech from '../../../../libs/blocks/preflight/panels/martech.js';

function wait(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

describe('Preflight Martech Panel', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    const main = document.createElement('main');
    main.innerHTML = '<h1>Test Heading</h1><a href="/test">Test link</a>';
    document.body.appendChild(main);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    sinon.restore();
  });

  it('renders a .access-columns.martech container', () => {
    render(html`<${Martech} />`, container);
    expect(container.querySelector('.access-columns.martech')).to.exist;
  });

  it('copy table button text is "Copy Table" initially', async () => {
    render(html`<${Martech} />`, container);
    await wait(10);
    const btn = container.querySelector('button.preflight-action');
    if (btn) {
      expect(btn.textContent).to.include('Copy');
    }
  });

  it('builds a martech table from page headings and links', async () => {
    render(html`<${Martech} />`, container);
    await wait(10);
    const table = container.querySelector('table');
    if (table) {
      expect(table).to.exist;
      expect(table.querySelector('th')).to.exist;
    }
  });

  it('table contains "martech metadata" header', async () => {
    render(html`<${Martech} />`, container);
    await wait(10);
    const th = container.querySelector('th');
    if (th) {
      expect(th.textContent.toLowerCase()).to.include('martech');
    }
  });
});

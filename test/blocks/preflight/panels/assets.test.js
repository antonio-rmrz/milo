import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Assets from '../../../../libs/blocks/preflight/panels/assets.js';

describe('Preflight Assets Panel', () => {
  let container;
  let originalWindowProps = {};

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    originalWindowProps = {
      runChecksFromAssets: window.runChecksFromAssets,
      isViewportTooSmallFromAssets: window.isViewportTooSmallFromAssets,
    };
    window.runChecksFromAssets = sinon.stub();
    window.isViewportTooSmallFromAssets = sinon.stub().returns(false);
    window.mockImport = true;
  });

  afterEach(() => {
    document.body.removeChild(container);
    window.runChecksFromAssets = originalWindowProps.runChecksFromAssets;
    window.isViewportTooSmallFromAssets = originalWindowProps.isViewportTooSmallFromAssets;
    window.mockImport = false;
    sinon.restore();
  });

  it('displays loading state when check is running', () => {
    const pendingCheck = new Promise(() => {}); // Never resolves, simulates loading
    window.runChecksFromAssets.returns([pendingCheck]);

    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-item-title').textContent).to.equal('Asset Dimensions');
    expect(container.querySelector('.assets-item-description').textContent).to.equal('Checking...');
  });

  it('shows warning message when viewport is too small', () => {
    window.isViewportTooSmallFromAssets.returns(true);
    render(html`<${Assets} />`, container);

    const tooSmallMessage = container.querySelector('.assets-image-grid-item.full-width');
    expect(tooSmallMessage).to.exist;
    expect(tooSmallMessage.textContent).to.include('Please resize your browser');
  });

  it('renders asset check items when viewport is appropriate', () => {
    window.isViewportTooSmallFromAssets.returns(false);
    const pendingCheck = new Promise(() => {});
    window.runChecksFromAssets.returns([pendingCheck]);
    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-columns')).to.exist;
    expect(container.querySelector('.assets-item')).to.exist;
    expect(container.querySelector('.assets-item-title')).to.exist;
    expect(container.querySelector('.assets-item-description')).to.exist;
  });
});

describe('Preflight Assets Panel — compact row DOM', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    sinon.restore();
  });

  it('AssetRow renders as .assets-row with thumb and metrics', async () => {
    const { html: h, render: r } = await import('../../../../libs/deps/htm-preact.js');
    const container = document.createElement('div');
    document.body.appendChild(container);

    const asset = {
      src: '/media/test.jpg',
      type: 'image',
      naturalDimensions: '1200x600',
      displayDimensions: '600x300',
      typeLabel: 'JPEG',
      hasMismatch: false,
    };
    r(h`
      <div class="assets-row">
        <img class="assets-row-thumb" src=${asset.src} alt="" />
        <div class="assets-row-metrics">
          <span class="assets-row-name">test.jpg</span>
          <div class="assets-row-meta">
            <span>Upload: ${asset.naturalDimensions}</span>
            <span>Display: ${asset.displayDimensions}</span>
            <span>${asset.typeLabel}</span>
          </div>
        </div>
      </div>
    `, container);

    expect(container.querySelector('.assets-row')).to.exist;
    expect(container.querySelector('.assets-row-thumb')).to.exist;
    expect(container.querySelector('.assets-row-name').textContent).to.equal('test.jpg');
    expect(container.querySelector('.assets-row-meta').textContent).to.include('Upload');
  });

  it('critical asset row has is-critical class', async () => {
    const { html: h, render: r } = await import('../../../../libs/deps/htm-preact.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    r(h`<div class="assets-row is-critical"></div>`, container);
    expect(container.querySelector('.assets-row.is-critical')).to.exist;
  });

  it('critical chip renders inside critical asset row', async () => {
    const { html: h, render: r } = await import('../../../../libs/deps/htm-preact.js');
    const container = document.createElement('div');
    document.body.appendChild(container);
    r(h`
      <div class="assets-row is-critical">
        <div class="assets-row-metrics">
          <div class="assets-row-meta">
            <span class="preflight-chip preflight-chip-error">Critical</span>
          </div>
        </div>
      </div>
    `, container);
    expect(container.querySelector('.preflight-chip-error')).to.exist;
    expect(container.querySelector('.preflight-chip-error').textContent).to.equal('Critical');
  });
});

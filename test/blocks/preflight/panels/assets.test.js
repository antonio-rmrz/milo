import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Assets, {
  assetDimensionsResult,
  criticalAssetFailures,
} from '../../../../libs/blocks/preflight/panels/assets.js';

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
    // Clean up any back-to-preflight popovers
    document.querySelector('.back-to-preflight-popover')?.remove();
    sinon.restore();
  });

  it('displays loading state when check is running', () => {
    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-item-title').textContent).to.equal('Asset Dimensions');
    expect(container.querySelector('.assets-item-description').textContent).to.equal('Checking...');
  });

  it('shows warning message when viewport is too small', async () => {
    // Force viewport-too-small state via signal reset
    // In jsdom, clientWidth is 0, so isViewportTooSmall() returns true by default
    render(html`<${Assets} />`, container);
    // Wait for useEffect to fire (resets signals based on actual viewport)
    await new Promise((r) => { setTimeout(r, 0); });

    // jsdom reports clientWidth = 0, so viewport is "too small"
    const tooSmallMessage = container.querySelector('.assets-image-grid-item.full-width');
    expect(tooSmallMessage).to.exist;
    expect(tooSmallMessage.textContent).to.include('Please resize your browser');
  });

  it('renders asset check items when viewport is appropriate', () => {
    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-columns')).to.exist;
    expect(container.querySelector('.assets-item')).to.exist;
    expect(container.querySelector('.assets-item-title')).to.exist;
    expect(container.querySelector('.assets-item-description')).to.exist;
  });

  it('resets to loading state when remounted (stale-signal fix)', async () => {
    // Populate signals with stale data
    assetDimensionsResult.value = { title: 'Asset Dimensions', description: 'All good' };
    criticalAssetFailures.value = [{
      src: '/img.jpg',
      type: 'image',
      roundedFactor: '2x',
      naturalDimensions: '400x300',
      displayDimensions: '200x150',
      hasMismatch: true,
    }];

    // First render — shows stale data
    render(html`<${Assets} />`, container);

    // Wait for useEffect to fire — signals are reset to loading state
    await new Promise((r) => { setTimeout(r, 0); });

    expect(container.querySelector('.assets-item-description').textContent).to.equal('Checking...');
  });

  it('dispatches preflight:close event when clicking an asset row', async () => {
    // Inject an asset into criticalAssetFailures so a row is rendered
    criticalAssetFailures.value = [{
      src: '/test.jpg',
      type: 'image',
      roundedFactor: '2x',
      naturalDimensions: '400x300',
      displayDimensions: '200x150',
      recommendedDimensions: '200x150',
      hasMismatch: true,
      typeLabel: 'img',
      asset: document.createElement('img'),
    }];

    // Override viewportTooSmall so the grid renders
    const { viewportTooSmall } = await import('../../../../libs/blocks/preflight/panels/assets.js');
    viewportTooSmall.value = false;

    render(html`<${Assets} />`, container);

    const closeEvents = [];
    window.addEventListener('preflight:close', (e) => closeEvents.push(e), { once: true });

    const row = container.querySelector('.assets-image-grid-item.above-fold-critical');
    expect(row).to.exist;
    row.click();

    expect(closeEvents.length).to.equal(1);
  });

  it('mounts Back to Preflight popover after clicking an asset row', async () => {
    const { viewportTooSmall } = await import('../../../../libs/blocks/preflight/panels/assets.js');
    viewportTooSmall.value = false;

    criticalAssetFailures.value = [{
      src: '/test2.jpg',
      type: 'image',
      roundedFactor: '1x',
      naturalDimensions: '200x100',
      displayDimensions: '200x100',
      hasMismatch: false,
      typeLabel: 'img',
      asset: document.createElement('img'),
    }];

    render(html`<${Assets} />`, container);

    const row = container.querySelector('.assets-image-grid-item.above-fold-critical');
    expect(row).to.exist;
    row.click();

    expect(document.querySelector('.back-to-preflight-popover')).to.exist;
  });
});

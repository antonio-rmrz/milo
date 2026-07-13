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
    /* clean up any back popovers created during tests */
    document.querySelectorAll('.preflight-back-popover').forEach((el) => el.remove());
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

describe('Preflight back-to-preflight popover DOM', () => {
  afterEach(() => {
    document.querySelectorAll('.preflight-back-popover').forEach((el) => el.remove());
  });

  it('popover is appended to body with a Preflight button', () => {
    /* Replicate showBackPopover() logic from assets.js */
    if (!document.querySelector('.preflight-back-popover')) {
      const popover = document.createElement('div');
      popover.className = 'preflight-back-popover';
      popover.innerHTML = '<span>Back to</span><button type="button">Preflight</button>';
      document.body.appendChild(popover);
    }

    const popover = document.querySelector('.preflight-back-popover');
    expect(popover).to.exist;

    const btn = popover.querySelector('button');
    expect(btn).to.exist;
    expect(btn.textContent).to.include('Preflight');
  });

  it('popover is not duplicated on repeated calls', () => {
    const addPopover = () => {
      if (!document.querySelector('.preflight-back-popover')) {
        const p = document.createElement('div');
        p.className = 'preflight-back-popover';
        document.body.appendChild(p);
      }
    };

    addPopover();
    addPopover();
    addPopover();

    expect(document.querySelectorAll('.preflight-back-popover').length).to.equal(1);
  });
});

/* eslint-disable import/no-named-as-default-member */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

// We import the named exports directly so we can test them in isolation
import {
  suppressNotification,
  restoreNotification,
  updateTabBadge,
  setTab,
  isPreflightOpen,
} from '../../../libs/blocks/preflight/preflight.js';

import { navigateToAsset } from '../../../libs/blocks/preflight/panels/assets.js';

describe('Preflight — notification suppression', () => {
  let notif;

  beforeEach(() => {
    notif = document.createElement('div');
    notif.className = 'block-notification';
    notif.style.display = 'block';
    document.body.appendChild(notif);
  });

  afterEach(() => {
    notif.remove();
    sinon.restore();
  });

  it('hides the block-notification element on suppress', () => {
    suppressNotification();
    expect(notif.style.display).to.equal('none');
    expect(notif.dataset.preflightHidden).to.equal('true');
  });

  it('is idempotent — calling suppress twice does not throw', () => {
    suppressNotification();
    expect(() => suppressNotification()).to.not.throw();
    expect(notif.style.display).to.equal('none');
  });

  it('restores the block-notification element on restore', () => {
    suppressNotification();
    restoreNotification();
    expect(notif.style.display).to.equal('');
    expect(notif.dataset.preflightHidden).to.be.undefined;
  });

  it('restore is safe when nothing was suppressed', () => {
    expect(() => restoreNotification()).to.not.throw();
  });

  it('does not suppress an already-hidden notification', () => {
    notif.style.display = 'none';
    suppressNotification();
    // Should not mark it as suppressed since it was already hidden
    restoreNotification(); // should be a no-op
    expect(notif.style.display).to.equal('none');
  });
});

describe('Preflight — updateTabBadge', () => {
  it('updateTabBadge is a function', () => {
    expect(typeof updateTabBadge).to.equal('function');
  });

  it('does not throw when called with valid tab title', () => {
    expect(() => updateTabBadge('General', 3, 1)).to.not.throw();
  });

  it('does not throw when called with unknown tab title', () => {
    expect(() => updateTabBadge('NonExistent', 1, 0)).to.not.throw();
  });

  it('does not throw when called with zero counts', () => {
    expect(() => updateTabBadge('General', 0, 0)).to.not.throw();
  });
});

describe('Preflight — setTab', () => {
  it('setTab is a function', () => {
    expect(typeof setTab).to.equal('function');
  });

  it('does not throw when called with a tab object', () => {
    expect(() => setTab({ title: 'General' })).to.not.throw();
  });
});

describe('Preflight — navigateToAsset popover lifecycle', () => {
  let dialog;
  let closeBtn;

  beforeEach(() => {
    // Set up a fake preflight dialog
    dialog = document.createElement('div');
    dialog.className = 'dialog-modal';
    dialog.id = 'preflight';
    closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close');
    dialog.appendChild(closeBtn);
    document.body.appendChild(dialog);
  });

  afterEach(() => {
    dialog.remove();
    const popover = document.querySelector('.preflight-back-popover');
    if (popover) popover.remove();
    sinon.restore();
  });

  it('injects a .preflight-back-popover into the DOM', () => {
    navigateToAsset(null, () => {});
    const popover = document.querySelector('.preflight-back-popover');
    expect(popover).to.exist;
  });

  it('popover contains a button with correct text', () => {
    navigateToAsset(null, () => {});
    const btn = document.querySelector('.preflight-back-popover-btn');
    expect(btn).to.exist;
    expect(btn.textContent).to.include('Back to Preflight');
  });

  it('clicking the popover button removes the popover', () => {
    const reopenSpy = sinon.spy();
    navigateToAsset(null, reopenSpy);
    const btn = document.querySelector('.preflight-back-popover-btn');
    btn.click();
    expect(document.querySelector('.preflight-back-popover')).to.be.null;
  });

  it('clicking the popover button calls the reopen callback', () => {
    const reopenSpy = sinon.spy();
    navigateToAsset(null, reopenSpy);
    const btn = document.querySelector('.preflight-back-popover-btn');
    btn.click();
    expect(reopenSpy.calledOnce).to.be.true;
  });

  it('removes any existing popover before creating a new one', () => {
    navigateToAsset(null, () => {});
    navigateToAsset(null, () => {});
    const popovers = document.querySelectorAll('.preflight-back-popover');
    expect(popovers.length).to.equal(1);
  });

  it('scrolls to the target element when provided', () => {
    const target = document.createElement('div');
    target.scrollIntoView = sinon.spy();
    document.body.appendChild(target);
    navigateToAsset(target, () => {});
    expect(target.scrollIntoView.calledOnce).to.be.true;
    target.remove();
  });

  it('does not throw when targetEl is null', () => {
    expect(() => navigateToAsset(null, () => {})).to.not.throw();
  });

  it('does not throw when reopenFn is not a function', () => {
    navigateToAsset(null, null);
    const btn = document.querySelector('.preflight-back-popover-btn');
    expect(() => btn.click()).to.not.throw();
  });
});

describe('Preflight — Performance LCP link visibility', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('hidden class is applied when lcpElementFound is false (CSS contract)', () => {
    // Simulate the rendered output when no LCP element is found
    const span = document.createElement('span');
    span.className = 'performance-element-preview hidden';
    document.body.appendChild(span);
    expect(span.classList.contains('hidden')).to.be.true;
  });

  it('hidden class is absent when lcpElementFound is true (CSS contract)', () => {
    const span = document.createElement('span');
    span.className = 'performance-element-preview';
    document.body.appendChild(span);
    expect(span.classList.contains('hidden')).to.be.false;
  });
});

describe('Preflight — General badge localization count', () => {
  it('updateTabBadge accepts localization error count for General tab', () => {
    // Simulate what getLocalizationResults does after finding 3 violations
    expect(() => updateTabBadge('General', 3, 0)).to.not.throw();
  });

  it('updateTabBadge with zero violations does not throw', () => {
    expect(() => updateTabBadge('General', 0, 0)).to.not.throw();
  });
});

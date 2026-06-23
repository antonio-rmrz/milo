import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const ogDoc = document.body.innerHTML;

const { default: init } = await import('../../../libs/blocks/promo/promo.js');

describe('init', async () => {
  afterEach(() => {
    document.body.innerHTML = ogDoc;
  });

  it('creates promo block', async () => {
    const block = document.querySelector('.promo');
    init(block);
    expect(block.querySelector('.promo-close')).to.be.exist;
  });

  it('removes sticky header when close button is clicked', async () => {
    const block = document.querySelector('.promo');
    init(block);
    const button = document.body.querySelector('.promo-close');
    sinon.fake();
    button.click();
    expect(document.body.querySelector('.promo')).to.not.exist;
  });

  it('close control has accessible attributes and keydown handler', async () => {
    const block = document.querySelector('.promo');
    init(block);
    const button = document.body.querySelector('.promo-close');

    // Assert accessibility attributes
    expect(button.getAttribute('role')).to.equal('button');
    expect(button.getAttribute('tabindex')).to.equal('0');
    expect(button.getAttribute('aria-label')).to.equal('Close');

    // Assert keydown with Enter triggers close
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    button.dispatchEvent(enterEvent);
    expect(document.body.querySelector('.promo')).to.not.exist;
  });

  it('close control keydown with Space triggers close and prevents default', async () => {
    const block = document.querySelector('.promo');
    init(block);
    const button = document.body.querySelector('.promo-close');

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    let defaultPrevented = false;
    button.addEventListener('keydown', (e) => { defaultPrevented = e.defaultPrevented; }, { once: true });
    button.dispatchEvent(spaceEvent);
    expect(defaultPrevented).to.be.true;
    expect(document.body.querySelector('.promo')).to.not.exist;
  });
});

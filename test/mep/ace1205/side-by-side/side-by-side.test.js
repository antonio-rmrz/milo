import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const { default: init } = await import('../../../../libs/mep/ace1205/side-by-side/side-by-side.js');

describe('side-by-side', () => {
  let block;

  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    block = document.querySelector('.side-by-side');
    init(block);
  });

  it('calls scrollIntoView on play-pause-button when it receives focus', () => {
    const btn = document.createElement('button');
    btn.className = 'play-pause-button';

    let scrollCalled = false;
    let scrollOptions;
    btn.scrollIntoView = (opts) => {
      scrollCalled = true;
      scrollOptions = opts;
    };

    block.querySelector('.card-overlay .media')?.appendChild(btn);

    btn.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(scrollCalled).to.be.true;
    expect(scrollOptions).to.deep.equal({ block: 'nearest', inline: 'nearest' });
  });

  it('does not call scrollIntoView for focus on non-play-pause elements', () => {
    const link = document.createElement('a');
    link.href = '#';

    let scrollCalled = false;
    link.scrollIntoView = () => { scrollCalled = true; };

    block.appendChild(link);
    link.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

    expect(scrollCalled).to.be.false;
  });

  it('decorates cards into card-overlay and card-stacked structure', () => {
    expect(block.querySelector('.card-overlay')).to.exist;
    expect(block.querySelector('.card-stacked')).to.exist;
  });

  it('adds dark class to card-overlay when block is not dark', () => {
    expect(block.querySelector('.card-overlay').classList.contains('dark')).to.be.true;
  });
});

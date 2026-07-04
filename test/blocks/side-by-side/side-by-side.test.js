import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { setConfig } from '../../../libs/utils/utils.js';

setConfig({ codeRoot: '/libs' });

const { default: init } = await import('../../../libs/mep/ace1205/side-by-side/side-by-side.js');

describe('side-by-side', () => {
  beforeEach(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/default.html' });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('decorates media and text rows into overlay and stacked cards', () => {
    const block = document.querySelector('.side-by-side');
    init(block);
    expect(block.querySelector('.card.card-overlay')).to.exist;
    expect(block.querySelector('.card.card-stacked')).to.exist;
  });

  it('scrolls the play/pause button into view when it receives focus', () => {
    const block = document.querySelector('.side-by-side');
    init(block);
    const btn = block.querySelector('.play-pause-button');
    expect(btn).to.exist;
    const spy = sinon.spy(btn, 'scrollIntoView');
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(spy.calledOnce).to.be.true;
    expect(spy.firstCall.args[0]).to.include({ block: 'nearest', inline: 'nearest' });
  });

  it('does not scroll when focus lands on other elements', () => {
    const block = document.querySelector('.side-by-side');
    init(block);
    const btn = block.querySelector('.play-pause-button');
    const spy = sinon.spy(btn, 'scrollIntoView');
    const heading = block.querySelector('p strong');
    heading.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(spy.called).to.be.false;
  });

  it('has a visible :focus-visible outline for the play/pause button', async () => {
    const css = await readFile({ path: '../../../libs/mep/ace1205/side-by-side/side-by-side.css' });
    expect(css).to.match(/play-pause-button:focus-visible\s*\{[^}]*outline:/);
    expect(css).to.not.match(/outline:\s*(none|0)[\s;]/);
  });
});

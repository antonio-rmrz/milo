import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

const { default: init } = await import('../../../libs/mep/ace1205/side-by-side/side-by-side.js');
const body = await readFile({ path: './mocks/body.html' });

describe('side-by-side', () => {
  beforeEach(() => {
    document.body.innerHTML = body;
    const block = document.querySelector('.side-by-side');
    init(block);
  });

  it('creates two card children', () => {
    const block = document.querySelector('.side-by-side');
    expect(block.children.length).to.equal(2);
  });

  it('first card has card-overlay class', () => {
    const block = document.querySelector('.side-by-side');
    expect(block.children[0].classList.contains('card-overlay')).to.be.true;
  });

  it('second card has card-stacked class', () => {
    const block = document.querySelector('.side-by-side');
    expect(block.children[1].classList.contains('card-stacked')).to.be.true;
  });

  it('adds dark class to card-overlay when block is not dark', () => {
    const overlay = document.querySelector('.card-overlay');
    expect(overlay.classList.contains('dark')).to.be.true;
  });

  it('does not add dark to card-overlay when block already has dark class', () => {
    document.body.innerHTML = body;
    const block = document.querySelector('.side-by-side');
    block.classList.add('dark');
    init(block);
    const overlay = document.querySelector('.card-overlay');
    expect(overlay.classList.contains('dark')).to.be.false;
  });

  describe('WCAG 2.4.11 — play-pause button focus visibility', () => {
    it('scrolls play-pause button into view when focused and off-screen', () => {
      const block = document.querySelector('.side-by-side');

      const btn = document.createElement('button');
      btn.className = 'play-pause-button';
      block.querySelector('.card-overlay')?.append(btn);

      let scrollCalled = false;
      btn.scrollIntoView = () => { scrollCalled = true; };

      Object.defineProperty(btn, 'getBoundingClientRect', {
        value: () => ({
          top: -50,
          bottom: -10,
          left: 0,
          right: 100,
          width: 100,
          height: 40,
        }),
        configurable: true,
      });

      btn.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

      expect(scrollCalled).to.be.true;
    });

    it('does not scroll play-pause button when already fully in view', () => {
      const block = document.querySelector('.side-by-side');

      const btn = document.createElement('button');
      btn.className = 'play-pause-button';
      block.querySelector('.card-overlay')?.append(btn);

      let scrollCalled = false;
      btn.scrollIntoView = () => { scrollCalled = true; };

      Object.defineProperty(btn, 'getBoundingClientRect', {
        value: () => ({
          top: 100,
          bottom: 140,
          left: 0,
          right: 100,
          width: 100,
          height: 40,
        }),
        configurable: true,
      });

      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      Object.defineProperty(window, 'innerWidth', { value: 1366, configurable: true });

      btn.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

      expect(scrollCalled).to.be.false;
    });

    it('focus listener only activates for play-pause-button, not other focusable elements', () => {
      const block = document.querySelector('.side-by-side');

      const other = document.createElement('a');
      other.href = '#';
      other.className = 'some-link';
      block.append(other);

      let scrollCalled = false;
      other.scrollIntoView = () => { scrollCalled = true; };

      other.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

      expect(scrollCalled).to.be.false;
    });
  });
});

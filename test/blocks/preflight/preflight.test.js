import { expect } from '@esm-bundle/chai';

const { default: init } = await import('../../../libs/blocks/preflight/preflight.js');

const el = document.createElement('div');
el.className = 'preflight';
document.body.append(el);
init(el);

describe('preflight theme-c2', () => {
  it('adds the theme-c2 class to the block', () => {
    expect(el.classList.contains('theme-c2')).to.be.true;
  });

  it('loads the preflight-c2.css stylesheet', () => {
    const link = document.head.querySelector('link[rel="stylesheet"][href$="/blocks/preflight/preflight-c2.css"]');
    expect(link).to.exist;
  });
});

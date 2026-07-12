// to run E2E tests:
// npm run nala stage tag=opt41963 mode=headed

import { features } from './opt-41963.spec.js';

describe('OPT-41963: Acrobat Express Merchandising V2 — spec validation', () => {
  it('has 4 test cases', () => {
    if (features.length !== 4) throw new Error(`Expected 4 features, got ${features.length}`);
  });

  it('IND control path targets default mep variant', () => {
    if (!features[0].path.includes('--default')) throw new Error('IND control missing --default');
  });

  it('IND treatment has expressCardTitle', () => {
    if (features[1].data.expressCardTitle !== 'Acrobat Express') throw new Error('IND expressCardTitle mismatch');
  });

  it('IND treatment has expressCTAText', () => {
    if (features[1].data.expressCTAText !== 'Get started') throw new Error('IND expressCTAText mismatch');
  });

  it('DCT control path targets default mep variant', () => {
    if (!features[2].path.includes('--default')) throw new Error('DCT control missing --default');
  });

  it('DCT treatment has expressCardTitle', () => {
    if (features[3].data.expressCardTitle !== 'Acrobat Express') throw new Error('DCT expressCardTitle mismatch');
  });

  it('DCT treatment has expressCTAText', () => {
    if (features[3].data.expressCTAText !== 'Get started') throw new Error('DCT expressCTAText mismatch');
  });

  it('all features have required tags', () => {
    features.forEach((f) => {
      if (!f.tags.includes('@opt41963')) throw new Error(`Missing @opt41963 tag in ${f.name}`);
      if (!f.tags.includes('@mep')) throw new Error(`Missing @mep tag in ${f.name}`);
    });
  });
});

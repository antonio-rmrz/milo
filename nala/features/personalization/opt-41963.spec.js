export const FeatureName = 'OPT-41963 Acrobat Express Merchandising V2';
export const features = [
  {
    tcid: '0',
    name: '@OPT-41963 IND default (control)',
    path: '/acrobat/acrobat-pdf-pack.html?mep=%2Fblocks%2Fmerch%2Fopt-41963%2Fopt-41963.json--default',
    data: {},
    tags: '@opt41963 @opt41963-ind @mep @smoke @regression @milo',
  },
  {
    tcid: '1',
    name: '@OPT-41963 IND treatment — Acrobat Express card visible',
    path: '/acrobat/acrobat-pdf-pack.html',
    data: {
      expressCardTitle: 'Acrobat Express',
      expressCTAText: 'Get started',
    },
    tags: '@opt41963 @opt41963-ind @mep @smoke @regression @milo',
  },
  {
    tcid: '2',
    name: '@OPT-41963 DCT default (control)',
    path: '/acrobat/business/acrobat-pro-dc.html?mep=%2Fblocks%2Fmerch%2Fopt-41963%2Fopt-41963.json--default',
    data: {},
    tags: '@opt41963 @opt41963-dct @mep @smoke @regression @milo',
  },
  {
    tcid: '3',
    name: '@OPT-41963 DCT treatment — Acrobat Express card visible',
    path: '/acrobat/business/acrobat-pro-dc.html',
    data: {
      expressCardTitle: 'Acrobat Express',
      expressCTAText: 'Get started',
    },
    tags: '@opt41963 @opt41963-dct @mep @smoke @regression @milo',
  },
];

export default { FeatureName, features };

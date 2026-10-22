import { twitterImageMeta } from './socialImage';

it('repeats the configured social preview image as twitter:image', () => {
  expect(twitterImageMeta('https://example.com/og.png')).toEqual([
    { content: 'https://example.com/og.png', name: 'twitter:image' },
  ]);
});

it('emits no twitter:image without a configured image', () => {
  expect(twitterImageMeta(undefined)).toEqual([]);
  expect(twitterImageMeta('')).toEqual([]);
});

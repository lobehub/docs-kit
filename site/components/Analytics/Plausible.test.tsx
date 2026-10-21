import { render } from '@testing-library/react';
import siteConfig from 'virtual:lobedocs/site-config';

import { Plausible } from './Plausible';

vi.mock('virtual:lobedocs/site-config', () => ({
  default: {
    description: 'Test site.',
    favicons: {},
    navSections: {},
    siteUrl: 'https://example.com',
    themeConfig: {
      analytics: {
        plausible: {
          domain: 'docs.example.com',
          source: 'https://plausible.example.com/js/script.js',
        },
      },
    },
    title: 'Test Docs',
  },
}));

it('emits the exact production-only deferred script attributes', () => {
  const { container } = render(<Plausible enabled />);
  const script = container.querySelector('script');

  expect(script?.getAttribute('data-domain')).toBe(
    siteConfig.themeConfig?.analytics?.plausible?.domain,
  );
  expect(script?.getAttribute('src')).toBe(siteConfig.themeConfig?.analytics?.plausible?.source);
  expect(script?.defer).toBe(true);
  expect(script?.hasAttribute('async')).toBe(false);
});

it('is absent outside production', () => {
  const { container } = render(<Plausible />);
  expect(container.querySelector('script')).toBeNull();
});

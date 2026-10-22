import type { MetaDescriptor } from 'react-router';

import { siteMetadata } from '../../content/siteMetadata';
import type { DocumentManifestEntry } from '../../types/content';
import { meta } from './document';
import { meta as notFoundMeta } from './not-found';

const document: DocumentManifestEntry = {
  category: 'General',
  description: 'Triggers an action.',
  pathname: '/components/button',
  source: 'src/Button/index.mdx',
  title: 'Button',
};

vi.mock('../content/registry', () => ({
  contentManifest: {
    documents: [],
    get navigation() {
      return [{ categories: [{ documents: [document], title: 'General' }], title: 'Components' }];
    },
  },
  findDocument: (pathname: string) => {
    if (pathname === '/components/button') return document;
    if (pathname === '/guide/overview') {
      return { ...document, pathname, source: 'docs/guide/overview.mdx', title: 'Lobe Docs Kit' };
    }
    return undefined;
  },
  loadDocument: vi.fn(),
}));

const readDescriptors = (value: ReturnType<typeof meta>): MetaDescriptor[] =>
  Array.isArray(value) ? value : [];

it('emits absolute canonical, Open Graph, and Twitter metadata for a document', () => {
  const descriptors = readDescriptors(
    meta({ location: { pathname: '/components/button' } } as never),
  );

  expect(descriptors).toEqual(
    expect.arrayContaining([
      { title: 'Button - Lobe Docs Kit' },
      { content: 'Triggers an action.', name: 'description' },
      {
        href: `${siteMetadata.origin}/components/button`,
        rel: 'canonical',
        tagName: 'link',
      },
      {
        href: `${siteMetadata.origin}/llms.txt`,
        rel: 'describedby',
        tagName: 'link',
      },
      { content: 'website', property: 'og:type' },
      { content: siteMetadata.name, property: 'og:site_name' },
      { content: 'Button - Lobe Docs Kit', property: 'og:title' },
      { content: 'Triggers an action.', property: 'og:description' },
      { content: `${siteMetadata.origin}/components/button`, property: 'og:url' },
      {
        content: siteMetadata.openGraphImage,
        property: 'og:image',
      },
      { content: 'summary_large_image', name: 'twitter:card' },
    ]),
  );
  expect(
    descriptors.filter((descriptor) => 'name' in descriptor && descriptor.name === 'twitter:image'),
  ).toEqual(
    siteMetadata.openGraphImage
      ? [{ content: siteMetadata.openGraphImage, name: 'twitter:image' }]
      : [],
  );
});

it('shows the site title once when a page is titled after the site', () => {
  const descriptors = readDescriptors(meta({ location: { pathname: '/guide/overview' } } as never));

  expect(descriptors).toEqual(
    expect.arrayContaining([
      { title: 'Lobe Docs Kit' },
      { content: 'Lobe Docs Kit', property: 'og:title' },
    ]),
  );
});

it('marks the prerendered not-found document as noindex', () => {
  const descriptors = readDescriptors(notFoundMeta({} as never));

  expect(descriptors).toEqual(
    expect.arrayContaining([
      { title: 'Documentation not found - Lobe Docs Kit' },
      { content: 'noindex, nofollow', name: 'robots' },
    ]),
  );
});

it('marks an unknown document matched by the components wildcard as noindex', () => {
  const descriptors = readDescriptors(
    meta({ location: { pathname: '/components/missing' } } as never),
  );

  expect(descriptors).toEqual(
    expect.arrayContaining([{ content: 'noindex, nofollow', name: 'robots' }]),
  );
});

it('describes section and category overview pages', () => {
  expect(
    readDescriptors(meta({ location: { pathname: '/sections/components' } } as never)),
  ).toEqual(
    expect.arrayContaining([
      { title: 'Components - Lobe Docs Kit' },
      { href: `${siteMetadata.origin}/sections/components`, rel: 'canonical', tagName: 'link' },
    ]),
  );
  expect(
    readDescriptors(meta({ location: { pathname: '/sections/components/general' } } as never)),
  ).toEqual(expect.arrayContaining([{ title: 'General - Components - Lobe Docs Kit' }]));
});

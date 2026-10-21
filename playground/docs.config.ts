import legacyRedirects from './compatibility.json';

export default {
  atomDirs: [{ dir: 'src' }],
  description: 'A sandbox consumer that exercises every docs-kit feature end to end.',
  legacyRedirects,
  publicDocs: ['docs/guide.mdx'],
  siteUrl: 'https://docs-kit.lobehub.com',
  themeConfig: {
    apiHeader: {
      docUrl: '{github}/edit/main/playground/{atomId}',
      github: 'https://github.com/lobehub/docs-kit',
      sourceUrl: '{github}/tree/main/playground/{atomId}',
    },
    navItems: [{ href: '/guide', icon: 'book-open', label: 'Guide' }],
    prefersColor: 'auto',
    socialLinks: [{ href: 'https://github.com/lobehub/docs-kit', icon: 'github', label: 'GitHub' }],
  },
  title: 'Docs Kit Playground',
};

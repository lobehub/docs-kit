import legacyRedirects from './compatibility.json';

const github = 'https://github.com/lobehub/docs-kit';

export default {
  atomDirs: [{ dir: 'src' }],
  description:
    'Static documentation sites for React component libraries, driven by MDX and one config file.',
  homePage: './docs/home/home.tsx',
  legacyRedirects,
  publicDocs: [
    'docs/getting-started/introduction.mdx',
    'docs/getting-started/installation.mdx',
    'docs/getting-started/cli.mdx',
    'docs/file-conventions/project-structure.mdx',
    'docs/file-conventions/docs-config.mdx',
    'docs/file-conventions/component-pages.mdx',
    'docs/guide/markdown.mdx',
    'docs/guide/demos.mdx',
    'docs/guide/api-tables.mdx',
    'docs/guide/guide-pages.mdx',
    'docs/guide/home-page.mdx',
    'docs/guide/theming.mdx',
    'docs/guide/search.mdx',
    'docs/guide/ai-docs.mdx',
    'docs/guide/integrations.mdx',
    'docs/guide/build-and-deploy.mdx',
    'docs/advanced/validations.mdx',
    'docs/advanced/react-router.mdx',
    'docs/advanced/migrating-from-dumi.mdx',
  ],
  siteUrl: 'https://docs-kit.lobehub.com',
  themeConfig: {
    apiHeader: {
      docUrl: '{github}/edit/main/playground/{atomId}',
      github,
      match: ['/components/'],
      sourceUrl: '{github}/tree/main/playground/{atomId}',
    },
    navItems: [
      {
        external: true,
        href: 'https://ui.lobehub.com',
        icon: 'external-link',
        label: 'Live Example: Lobe UI',
      },
    ],
    prefersColor: 'auto',
    sidebarGroups: [
      { dir: 'docs/getting-started', icon: 'rocket', order: -4, title: 'Getting Started' },
      { dir: 'docs/file-conventions', icon: 'folder-tree', order: -3, title: 'File Conventions' },
      { dir: 'docs/guide', icon: 'book-open', order: -2, title: 'Guide' },
      { dir: 'docs/advanced', icon: 'wrench', order: -1, title: 'Advanced' },
    ],
    socialLinks: [
      { href: github, icon: 'github', label: 'GitHub' },
      { href: 'https://www.npmjs.com/package/@lobehub/docs-kit', icon: 'npm', label: 'NPM' },
    ],
  },
  title: 'Lobe Docs Kit',
};

// @vitest-environment node

import { resolve } from 'node:path';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer, type ViteDevServer } from 'vite';

import { kitRoot } from '../../../tests/roots';

let server: ViteDevServer | undefined;

afterEach(async () => {
  await server?.close();
  server = undefined;
});

it('renders a stable target for every changelog back-to-top link', async () => {
  server = await createServer({
    configFile: resolve(kitRoot, 'vite.config.ts'),
    logLevel: 'silent',
    server: { middlewareMode: true },
  });

  const module = await server.ssrLoadModule('/docs/changelog.mdx');
  const html = renderToStaticMarkup(createElement(module.default));

  expect(html).toContain('id="readme-top"');
  expect(html).toContain('href="#readme-top"');
}, 120_000);

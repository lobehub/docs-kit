// @vitest-environment node

import { resolve } from 'node:path';

import { motion } from 'motion/react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer, type ViteDevServer } from 'vite';

import { kitRoot } from '../../../tests/roots';

let server: ViteDevServer | undefined;

afterEach(async () => {
  await server?.close();
  server = undefined;
});

const renderDocument = async (source: string) => {
  server = await createServer({
    configFile: resolve(kitRoot, 'vite.config.ts'),
    logLevel: 'silent',
    server: { middlewareMode: true },
  });

  const module = await server.ssrLoadModule(source);
  // The mdx module lives in vite's SSR graph, so its React context instances only
  // match a provider loaded through the same graph — a top-level import gives a
  // different MotionComponent context and the controls still read it as unset.
  const { MotionProvider } = await server.ssrLoadModule('@lobehub/ui');
  return renderToStaticMarkup(
    createElement(MotionProvider, { motion }, createElement(module.default)),
  );
};

it('compiles GFM markdown tables in component docs into real table markup', async () => {
  const html = await renderDocument('/src/Button/index.mdx');

  expect(html).toContain('<table>');
  expect(html).toContain('<thead>');
  expect(html).toContain('<tbody>');
  expect(html).toContain('htmlType');
  expect(html).toContain('variant');
  expect(html).not.toMatch(/\| Property\s+\| Description/);
}, 120_000);

it('preserves escaped pipes inside GFM table cells', async () => {
  const html = await renderDocument('/src/Button/index.mdx');

  expect(html).toContain('&#x27;button&#x27; | &#x27;reset&#x27; | &#x27;submit&#x27;');
  expect(html).toContain('Omit&lt;ButtonHTMLAttributes, &#x27;type&#x27;&gt;');
  expect(html).not.toMatch(/\\\|/);
}, 120_000);

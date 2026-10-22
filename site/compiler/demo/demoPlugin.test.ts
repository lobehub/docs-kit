// @vitest-environment node

import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { createLogger, createServer, type Plugin, type ViteDevServer } from 'vite';

import { fixturesRoot, playgroundRoot } from '../../../tests/roots';
import type { DemoModule } from '../../types/demo';
import { demoPlugin } from './demoPlugin';

let server: ViteDevServer | undefined;
const temporaryRoots: string[] = [];

const writeFixture = (root: string, path: string, contents: string): string => {
  const absolutePath = resolve(root, path);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
  return absolutePath;
};

const createTemporaryProject = (files: Record<string, string>): string => {
  // Vite >= 8.3 realpaths `root`, and macOS tmpdir lives behind the
  // /var -> /private/var symlink, so watcher events only match canonical paths.
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'lobe-ui-demo-plugin-')));
  temporaryRoots.push(root);
  for (const [path, contents] of Object.entries(files)) writeFixture(root, path, contents);
  return root;
};

const compatibilitySource = (legacyId: string, legacyRouteId: string) =>
  `${JSON.stringify(
    {
      demoReferences: [
        {
          document: 'docs/index.mdx',
          legacyId,
          legacyRouteId,
          options: { inline: false, isolated: false, layout: 'default' },
          pathname: '/',
          source: 'demo.tsx',
        },
      ],
      documents: [],
    },
    null,
    2,
  )}\n`;

const waitForValue = async <T>(read: () => Promise<T | undefined>): Promise<T> => {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const value = await read();
    if (value !== undefined) return value;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 20));
  }
  throw new Error('Timed out waiting for Vite HMR state');
};

const loadDescriptor = async (source: string): Promise<DemoModule> => {
  server ??= await createServer({
    configFile: false,
    logLevel: 'silent',
    plugins: [demoPlugin({ root: playgroundRoot })],
    root: playgroundRoot,
    server: { middlewareMode: true },
  });

  const module = await server.ssrLoadModule(source);
  return module.default as DemoModule;
};

beforeEach(() => {
  (globalThis as any).__lobeDemoEmptyImportLog = [];
  (globalThis as any).__lobeDemoExecutionLog = [];
  (globalThis as any).__lobeDemoScopeLog = [];
});

afterEach(async () => {
  await server?.close();
  server = undefined;
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
  delete (globalThis as any).__lobeDemoEmptyImportLog;
  delete (globalThis as any).__lobeDemoExecutionLog;
  delete (globalThis as any).__lobeDemoScopeLog;
});

it('keeps the canonical demo and editable dependency scope independently lazy', async () => {
  const descriptor = await loadDescriptor(`/@fs${fixturesRoot}/demos/simple.tsx?demo`);

  expect((globalThis as any).__lobeDemoExecutionLog).toEqual([]);
  expect((globalThis as any).__lobeDemoScopeLog).toEqual([]);

  await descriptor.load();

  expect((globalThis as any).__lobeDemoExecutionLog).toEqual(['simple']);
  expect((globalThis as any).__lobeDemoScopeLog).toEqual([]);
});

it('loads the editable scope without evaluating the selected demo entry', async () => {
  const descriptor = await loadDescriptor(`/@fs${fixturesRoot}/demos/local-import.tsx?demo`);

  await descriptor.loadScope();

  expect((globalThis as any).__lobeDemoExecutionLog).toEqual([]);
  expect((globalThis as any).__lobeDemoScopeLog).toEqual(['helper']);
});

it('resolves repository aliases from virtual editable scope modules', async () => {
  const root = createTemporaryProject({
    'compatibility.json': compatibilitySource('legacy-alias', 'docs/alias'),
    'demo.tsx':
      "import { Flexbox } from '@/Flex';\nimport { SelfFlexbox } from '@example/editor/SelfFlex';\nexport default () => [Flexbox, SelfFlexbox];\n",
    'package.json': '{"name":"@example/editor","type":"module"}\n',
    'src/Flex.ts': "export const Flexbox = () => 'flexbox';\n",
    'src/SelfFlex.ts': "export const SelfFlexbox = () => 'self-flexbox';\n",
  });
  server = await createServer({
    configFile: false,
    logLevel: 'silent',
    plugins: [demoPlugin({ compatibilityPath: resolve(root, 'compatibility.json'), root })],
    root,
    server: { middlewareMode: true },
  });
  const descriptor = (await server.ssrLoadModule('/demo.tsx?demo')).default as DemoModule;

  const scope = await descriptor.loadScope();

  expect(scope.Flexbox).toBeTypeOf('function');
  expect(scope.SelfFlexbox).toBeTypeOf('function');
});

it('preserves empty JavaScript imports as editable-scope side effects', async () => {
  const descriptor = await loadDescriptor(`/@fs${fixturesRoot}/demos/empty-import-entry.js?demo`);

  expect((globalThis as any).__lobeDemoEmptyImportLog).toEqual([]);

  await descriptor.loadScope();

  expect((globalThis as any).__lobeDemoEmptyImportLog).toEqual(['empty-import-helper']);
  expect((globalThis as any).__lobeDemoExecutionLog).toEqual([]);
});

it('preserves every frozen alias by source, including repeated and punctuation-bearing IDs', async () => {
  const repeated = await loadDescriptor('/src/Button/demos/index.tsx?demo');
  const punctuated = await loadDescriptor('/src/Button/demos/Variant.tsx?demo');

  expect(repeated.legacyIds).toEqual(['src-button-demo-demos', 'src-base-ui-button-demo-demos']);
  expect(repeated.routeId).toBe('components/Button/index');
  expect(punctuated.legacyIds).toEqual(['button, variant-demo-demos']);
});

it('does not execute browser-only entries during descriptor evaluation or hide editability', async () => {
  const descriptor = await loadDescriptor(`/@fs${fixturesRoot}/demos/browser-only.tsx?demo`);

  expect(descriptor.editable).toBe(true);
  expect((globalThis as any).__lobeDemoExecutionLog).toEqual([]);
});

it('keeps the demo route when an importing MDX document does not reference the demo', async () => {
  const rootImporter = resolve(playgroundRoot, 'src/Button/index.mdx');
  const baseImporter = resolve(playgroundRoot, 'docs/guide/demos.mdx');
  const importers = new Map([
    ['virtual:root-button-demo', rootImporter],
    ['virtual:guide-button-demo', baseImporter],
  ]);
  const contextualImporters: Plugin = {
    load(id) {
      if (id !== rootImporter && id !== baseImporter) return;
      return `import demo from '/src/Button/demos/index.tsx?demo'; export default demo;`;
    },
    name: 'contextual-demo-importers',
    resolveId(id) {
      return importers.get(id);
    },
  };
  server = await createServer({
    configFile: false,
    logLevel: 'silent',
    plugins: [contextualImporters, demoPlugin({ root: playgroundRoot })],
    root: playgroundRoot,
    server: { middlewareMode: true },
  });

  const rootDescriptor = (await server.ssrLoadModule('virtual:root-button-demo'))
    .default as DemoModule;
  const baseDescriptor = (await server.ssrLoadModule('virtual:guide-button-demo'))
    .default as DemoModule;

  expect(rootDescriptor.routeId).toBe('components/Button/index');
  expect(baseDescriptor.routeId).toBe('components/Button/index');
  expect(baseDescriptor.legacyIds).toEqual(rootDescriptor.legacyIds);
});

it('refreshes descriptor, scope, diagnostics, and compatibility metadata across Vite HMR', async () => {
  const initialEntry = `import { helperValue } from './barrel';
export const sourceMarker = 'initial-entry';
export default () => helperValue;
`;
  const updatedEntry = `import { helperValue } from './barrel';
import { secondaryValue } from './secondary';
export const sourceMarker = 'updated-entry';
export default () => helperValue + secondaryValue;
`;
  const safeHelper = (value: string) => `export const helperValue = '${value}';\n`;
  const dynamicHelper = (value: string) => `${safeHelper(value)}
export const loadHelper = () => import('./secondary');
`;
  const root = createTemporaryProject({
    'barrel.ts': "export { helperValue } from './helper';\n",
    'compatibility.json': compatibilitySource('legacy-initial', 'docs/initial'),
    'demo.tsx': initialEntry,
    'helper.ts': safeHelper('first'),
    'secondary.ts': "export const secondaryValue = 'second';\n",
  });
  const compatibilityPath = resolve(root, 'compatibility.json');
  const entryPath = resolve(root, 'demo.tsx');
  const helperPath = resolve(root, 'helper.ts');
  const logger = createLogger('silent');
  const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  const diagnosticWarnings = () =>
    warn.mock.calls.filter(([message]) => String(message).includes('editable={false}')).length;
  server = await createServer({
    configFile: false,
    customLogger: logger,
    plugins: [demoPlugin({ compatibilityPath, root })],
    root,
    // inotify events are unreliable on loaded CI runners (watch registration
    // races and descriptor exhaustion drop them permanently); polling the tiny
    // temp project is cheap and deterministic.
    server: { middlewareMode: true, watch: { interval: 50, usePolling: true } },
  });
  const loadCurrentDescriptor = async () =>
    (await server!.ssrLoadModule('/demo.tsx?demo')).default as DemoModule;
  const changeFile = async (path: string, contents: string) => {
    const observed = new Promise<void>((resolveObserved, rejectObserved) => {
      const timeout = setTimeout(() => {
        server!.watcher.off('change', onChange);
        rejectObserved(new Error(`Timed out waiting for Vite watcher: ${path}`));
      }, 120_000);
      const onChange = (changedPath: string) => {
        if (resolve(changedPath) !== resolve(path)) return;
        clearTimeout(timeout);
        server!.watcher.off('change', onChange);
        resolveObserved();
      };
      server!.watcher.on('change', onChange);
    });
    writeFileSync(path, contents);
    // A write landing while chokidar's poll baseline is being (re)established is
    // swallowed forever; rewriting the same contents bumps mtime so a lost event
    // self-heals on the next poll cycle.
    const rewrite = setInterval(() => writeFileSync(path, contents), 1000);
    try {
      await observed;
    } finally {
      clearInterval(rewrite);
    }
  };

  const initialDescriptor = await loadCurrentDescriptor();
  expect(initialDescriptor.source).toContain('initial-entry');
  expect(await initialDescriptor.loadScope()).toMatchObject({ helperValue: 'first' });
  expect(diagnosticWarnings()).toBe(0);

  await changeFile(entryPath, updatedEntry);
  const entryDescriptor = await waitForValue(async () => {
    const descriptor = await loadCurrentDescriptor();
    if (!descriptor.source.includes('updated-entry')) return;
    const scope = await descriptor.loadScope();
    return scope.secondaryValue === 'second' ? descriptor : undefined;
  });
  expect(entryDescriptor.source).toContain('updated-entry');

  await changeFile(helperPath, dynamicHelper('changed'));
  const changedScope = await waitForValue(async () => {
    const descriptor = await loadCurrentDescriptor();
    const scope = await descriptor.loadScope();
    return scope.helperValue === 'changed' && diagnosticWarnings() === 1 ? scope : undefined;
  });
  expect(changedScope.helperValue).toBe('changed');

  await changeFile(helperPath, safeHelper('fixed'));
  await waitForValue(async () => {
    const scope = await (await loadCurrentDescriptor()).loadScope();
    return scope.helperValue === 'fixed' ? scope : undefined;
  });
  expect(diagnosticWarnings()).toBe(1);

  await changeFile(helperPath, dynamicHelper('reintroduced'));
  await waitForValue(async () => {
    const scope = await (await loadCurrentDescriptor()).loadScope();
    return scope.helperValue === 'reintroduced' && diagnosticWarnings() === 2 ? scope : undefined;
  });

  await changeFile(compatibilityPath, compatibilitySource('legacy-updated', 'docs/updated'));
  const metadataDescriptor = await waitForValue(async () => {
    const descriptor = await loadCurrentDescriptor();
    return descriptor.legacyIds[0] === 'legacy-updated' ? descriptor : undefined;
  });
  expect(metadataDescriptor.legacyIds).toEqual(['legacy-updated']);
  expect(metadataDescriptor.routeId).toBe('docs/updated');
}, 180_000);

// @vitest-environment node

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { ConfigEnv, Plugin } from 'vite';

import { clearDocsConfigCache, getDocsConfig } from './config';
import {
  applyDocsVitePluginGate,
  defineDocsVite,
  loadDocsViteExtension,
  resolveDocsViteModulePath,
  shouldApplyDocsViteExtension,
} from './viteExtension';

const temporaryRoots: string[] = [];

const createFixtureRoot = (): string => {
  const root = mkdtempSync(path.join(tmpdir(), 'lobedocs-vite-ext-'));
  temporaryRoots.push(root);
  writeFileSync(path.join(root, 'package.json'), '{ "name": "fixture", "type": "module" }\n');
  return root;
};

const serveEnv: ConfigEnv = { command: 'serve', mode: 'development' };
const buildEnv: ConfigEnv = { command: 'build', mode: 'production', isSsrBuild: false };
const ssrBuildEnv: ConfigEnv = { command: 'build', mode: 'production', isSsrBuild: true };

afterEach(() => {
  clearDocsConfigCache();
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe('defineDocsVite', () => {
  it('returns the extension unchanged', () => {
    const extension = defineDocsVite({
      apply: 'serve',
      plugins: [{ name: 'fixture', enforce: 'pre' }],
    });
    expect(extension.apply).toBe('serve');
    expect(extension.plugins).toEqual([{ name: 'fixture', enforce: 'pre' }]);
  });
});

describe('resolveDocsViteModulePath', () => {
  it('returns undefined when nothing is configured or present', () => {
    const root = createFixtureRoot();
    expect(resolveDocsViteModulePath(root)).toBeUndefined();
  });

  it('prefers docs.config vite path over convention files', () => {
    const root = createFixtureRoot();
    writeFileSync(path.join(root, 'docs.vite.mjs'), 'export default [];\n');
    writeFileSync(path.join(root, 'custom-vite.mjs'), 'export default [];\n');
    expect(resolveDocsViteModulePath(root, './custom-vite.mjs')).toBe(
      path.join(root, 'custom-vite.mjs'),
    );
  });

  it('discovers docs.vite.* then docs.kit-plugins.cjs', () => {
    const root = createFixtureRoot();
    writeFileSync(path.join(root, 'docs.kit-plugins.cjs'), 'module.exports = [];\n');
    expect(resolveDocsViteModulePath(root)).toBe(path.join(root, 'docs.kit-plugins.cjs'));

    writeFileSync(path.join(root, 'docs.vite.mjs'), 'export default [];\n');
    expect(resolveDocsViteModulePath(root)).toBe(path.join(root, 'docs.vite.mjs'));
  });

  it('throws when a configured path is missing', () => {
    const root = createFixtureRoot();
    expect(() => resolveDocsViteModulePath(root, './missing.mjs')).toThrow(
      /vite" module not found/,
    );
  });
});

describe('loadDocsViteExtension shapes', () => {
  it('loads a CJS zero-arg factory like docs.kit-plugins.cjs', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.kit-plugins.cjs'),
      `module.exports = function plugins() {
        return [{ name: 'from-cjs', enforce: 'pre', transform() { return null; } }];
      };
`,
    );

    const loaded = await loadDocsViteExtension(root, undefined, serveEnv);
    expect(loaded.sourcePath).toBe(path.join(root, 'docs.kit-plugins.cjs'));
    expect(loaded.plugins).toHaveLength(1);
    expect(loaded.plugins[0]).toMatchObject({ name: 'from-cjs', enforce: 'pre' });
    expect(typeof (loaded.plugins[0] as Plugin).transform).toBe('function');
  });

  it('loads a bare Plugin default export', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.mjs'),
      `export default { name: 'bare-plugin', enforce: 'pre' };\n`,
    );
    const loaded = await loadDocsViteExtension(root);
    expect(loaded.plugins).toEqual([{ name: 'bare-plugin', enforce: 'pre' }]);
  });

  it('loads a Plugin array default export', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.mjs'),
      `export default [{ name: 'a' }, { name: 'b' }];\n`,
    );
    const loaded = await loadDocsViteExtension(root);
    expect(loaded.plugins).toEqual([{ name: 'a' }, { name: 'b' }]);
  });

  it('loads an ESM extension object with optimizeDeps and apply', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.mjs'),
      `export default {
        apply: 'serve',
        optimizeDeps: { include: ['xterm'] },
        plugins: [{ name: 'from-esm' }],
        ssr: { external: ['xterm'] },
      };
`,
    );

    const loaded = await loadDocsViteExtension(root);
    expect(loaded.apply).toBe('serve');
    expect(loaded.optimizeDeps).toEqual({ include: ['xterm'] });
    expect(loaded.ssr).toEqual({ external: ['xterm'] });
    expect(loaded.plugins).toEqual([{ name: 'from-esm' }]);
  });

  it('loads a TypeScript module via tsx', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.ts'),
      `import type { Plugin } from 'vite';
const plugin: Plugin = { name: 'from-ts' };
export default { plugins: [plugin] };
`,
    );

    const loaded = await loadDocsViteExtension(root);
    expect(loaded.plugins).toEqual([{ name: 'from-ts' }]);
  });

  it('passes the full ConfigEnv into module and plugins factories', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.mjs'),
      `export default function factory(env) {
        return {
          plugins: [
            (inner) => ({
              name: 'env-aware',
              transform(_code, _id, options) {
                return {
                  code: 'export default ' + JSON.stringify({
                    command: env.command,
                    mode: env.mode,
                    isSsrBuild: env.isSsrBuild ?? null,
                    innerCommand: inner.command,
                    ssrFlag: options?.ssr ?? null,
                  }),
                  map: null,
                };
              },
            }),
          ],
        };
      };
`,
    );

    const loaded = await loadDocsViteExtension(root, undefined, ssrBuildEnv);
    expect(loaded.plugins).toHaveLength(1);
    const plugin = loaded.plugins[0] as Plugin;
    expect(plugin.name).toBe('env-aware');
    const transform = plugin.transform as (
      code: string,
      id: string,
      options?: { ssr?: boolean },
    ) => Promise<{ code: string; map: null }>;
    const result = await transform('x', '/demo.tsx', { ssr: true });
    expect(JSON.parse(result.code.replace('export default ', ''))).toEqual({
      command: 'build',
      mode: 'production',
      isSsrBuild: true,
      innerCommand: 'build',
      ssrFlag: true,
    });
  });

  it('preserves the vite path through docs.config JSON loading', () => {
    const root = createFixtureRoot();
    writeFileSync(path.join(root, 'extra-vite.mjs'), 'export default [];\n');
    writeFileSync(
      path.join(root, 'docs.config.ts'),
      `export default {
  atomDirs: [{ dir: 'src' }],
  description: 'Fixture',
  siteUrl: 'https://fixture.example.test',
  title: 'Fixture',
  vite: './extra-vite.mjs',
};
`,
    );

    const config = getDocsConfig(root);
    expect(config.vite).toBe('./extra-vite.mjs');
  });
});

describe('apply gating vs SSR-safe transforms', () => {
  it('gates serve-only extensions on build without removing build-time SSR guards', () => {
    expect(shouldApplyDocsViteExtension('serve', serveEnv)).toBe(true);
    expect(shouldApplyDocsViteExtension('serve', buildEnv)).toBe(false);
    expect(shouldApplyDocsViteExtension('serve', ssrBuildEnv)).toBe(false);
    expect(shouldApplyDocsViteExtension(undefined, ssrBuildEnv)).toBe(true);
    expect(shouldApplyDocsViteExtension('build', ssrBuildEnv)).toBe(true);
  });

  it('copies extension apply onto plugins that omit it', () => {
    const gated = applyDocsVitePluginGate([{ name: 'a' }, { name: 'b', apply: 'build' }], 'serve');
    expect(gated[0]).toMatchObject({ name: 'a', apply: 'serve' });
    expect(gated[1]).toMatchObject({ name: 'b', apply: 'build' });
  });

  it('keeps dual-apply plugins available for client+SSR builds; SSR skip is the transform guard', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.mjs'),
      `export default {
        // no apply: registered for both serve and build (client + SSR pipeline)
        plugins: [{
          name: 'demo-swap',
          enforce: 'pre',
          transform(code, id, options) {
            if (options?.ssr) return null; // prerender must keep Node-safe module graph
            if (!id.includes('/demos/')) return null;
            return { code: 'export default function Demo(){return null}', map: null };
          },
        }],
      };
`,
    );

    const forBuild = await loadDocsViteExtension(root, undefined, buildEnv);
    expect(shouldApplyDocsViteExtension(forBuild.apply, buildEnv)).toBe(true);
    expect(shouldApplyDocsViteExtension(forBuild.apply, ssrBuildEnv)).toBe(true);
    const plugin = forBuild.plugins[0] as Plugin;
    const transform = plugin.transform as (
      code: string,
      id: string,
      options?: { ssr?: boolean },
    ) => Promise<{ code: string; map: null } | null>;
    expect(
      await transform.call({}, 'src', '/src/Button/demos/index.tsx', { ssr: true }),
    ).toBeNull();
    const client = await transform.call({}, 'src', '/src/Button/demos/index.tsx', { ssr: false });
    expect(client).not.toBeNull();
    expect(client!.code).toContain('function Demo');
  });

  it('apply: serve drops plugins for build/SSR so live WS hooks do not run in prerender', async () => {
    const root = createFixtureRoot();
    writeFileSync(
      path.join(root, 'docs.vite.mjs'),
      `export default {
        apply: 'serve',
        plugins: [{ name: 'live-ws', configureServer() {} }],
      };
`,
    );
    const loaded = await loadDocsViteExtension(root, undefined, serveEnv);
    expect(shouldApplyDocsViteExtension(loaded.apply, serveEnv)).toBe(true);
    expect(shouldApplyDocsViteExtension(loaded.apply, buildEnv)).toBe(false);
    expect(shouldApplyDocsViteExtension(loaded.apply, ssrBuildEnv)).toBe(false);
  });
});

describe('public package entry', () => {
  it('re-exports helpers from @lobehub/docs-kit/vite-extension path surface', async () => {
    const pub = await import('../vite-extension');
    expect(typeof pub.defineDocsVite).toBe('function');
    expect(typeof pub.loadDocsViteExtension).toBe('function');
    expect(pub.DOCS_VITE_CONVENTION_FILES[0]).toBe('docs.vite.ts');
    const identity = pub.defineDocsVite({ plugins: [{ name: 'via-public-entry' }] });
    expect(identity.plugins).toEqual([{ name: 'via-public-entry' }]);
  });
});

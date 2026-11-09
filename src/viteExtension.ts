import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { ConfigEnv, PluginOption, UserConfig } from 'vite';

/**
 * Consumer Vite extension for `@lobehub/docs-kit`.
 *
 * `docs.config.ts` is JSON-serialized out of a subprocess, so plugin hooks cannot
 * live there. Point `vite` at a module path (or drop a convention file) and the
 * kit loads it **in-process** from `vite.config.ts`, preserving functions.
 *
 * Plugins are prepended ahead of docs-kit's own plugins so `enforce: 'pre'`
 * transforms run first (e.g. browser demo modules vs source kept for code display).
 *
 * SSR / prerender: `configureServer` only runs in `lobedocs dev`. Transforms that
 * inject client-only code (Ink, xterm, browser WebSocket clients) must no-op when
 * Vite reports SSR — check `options?.ssr` on `transform` or
 * `this.environment?.config.consumer === 'server'` — otherwise prerender pulls
 * Node-incompatible modules into the server bundle.
 */

export type DocsVitePluginFactory = (
  env?: ConfigEnv,
) => PluginOption | PluginOption[] | Promise<PluginOption | PluginOption[]>;

/** Plugin, plugin list, or factory (optionally receiving Vite `ConfigEnv`). */
export type DocsVitePluginsExport =
  PluginOption | Array<PluginOption | DocsVitePluginFactory> | DocsVitePluginFactory;

export interface DocsViteExtension {
  /**
   * Restrict when `plugins` are registered. Default: both serve and build.
   * Use `'serve'` for live WebSocket / `configureServer` hooks that must not
   * participate in `lobedocs build` prerender. Demo `transform` that should
   * also run in the client build usually stays on both, with an SSR guard inside.
   */
  apply?: 'serve' | 'build' | ((this: void, config: UserConfig, env: ConfigEnv) => boolean);
  /** Merged into Vite `optimizeDeps` (client pre-bundle). */
  optimizeDeps?: UserConfig['optimizeDeps'];
  /**
   * Consumer plugins. Prepended before docs-kit plugins (order among themselves
   * is preserved). Prefer `enforce: 'pre'` when replacing modules early.
   */
  plugins?: DocsVitePluginsExport;
  /** Merged into Vite `ssr` options. */
  ssr?: UserConfig['ssr'];
}

export type DocsViteModuleExport =
  | DocsVitePluginsExport
  | DocsViteExtension
  | ((env?: ConfigEnv) => DocsViteModuleExport | Promise<DocsViteModuleExport>);

export interface ResolvedDocsViteExtension {
  apply?: DocsViteExtension['apply'];
  optimizeDeps?: UserConfig['optimizeDeps'];
  plugins: PluginOption[];
  /** Absolute path of the module that was loaded, if any. */
  sourcePath?: string;
  ssr?: UserConfig['ssr'];
}

/** Convention files probed when `docs.config.ts` omits `vite`. First hit wins. */
export const DOCS_VITE_CONVENTION_FILES = [
  'docs.vite.ts',
  'docs.vite.mts',
  'docs.vite.mjs',
  'docs.vite.js',
  'docs.vite.cjs',
  // Unofficial pre-API filename used by a consumer pnpm patch; kept as a
  // drop-in so upgrading docs-kit alone can retire the patch without a rename.
  'docs.kit-plugins.cjs',
] as const;

export function defineDocsVite(extension: DocsViteExtension): DocsViteExtension {
  return extension;
}

export function resolveDocsViteModulePath(
  root: string,
  configuredPath?: string,
): string | undefined {
  if (configuredPath) {
    const absolute = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(root, configuredPath);
    if (!existsSync(absolute)) {
      throw new Error(
        `docs.config.ts "vite" module not found at ${absolute}. ` +
          `Pass a path relative to the repository root.`,
      );
    }
    return absolute;
  }

  for (const name of DOCS_VITE_CONVENTION_FILES) {
    const candidate = path.join(root, name);
    if (existsSync(candidate)) return candidate;
  }
  return undefined;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const looksLikeExtensionObject = (value: unknown): value is DocsViteExtension => {
  if (!isPlainObject(value)) return false;
  // Vite plugins are objects with a `name` string; extension bags use known keys.
  if (typeof value.name === 'string' && value.name.length > 0) return false;
  return 'plugins' in value || 'optimizeDeps' in value || 'ssr' in value || 'apply' in value;
};

const unwrapDefault = (mod: unknown): unknown => {
  if (!isPlainObject(mod)) return mod;
  if (!('default' in mod)) return mod;
  const exported = mod.default;
  // CJS interop / double-default from tsx-style loaders.
  if (
    exported &&
    typeof exported === 'object' &&
    'default' in (exported as Record<string, unknown>) &&
    Object.keys(exported as object).length === 1
  ) {
    return (exported as { default: unknown }).default;
  }
  return exported;
};

async function importDocsViteModule(absolutePath: string): Promise<unknown> {
  const extension = path.extname(absolutePath).toLowerCase();
  if (extension === '.cjs' || extension === '.cts') {
    // Filename only anchors resolution; the file itself is required next.
    const require = createRequire(absolutePath);
    return unwrapDefault(require(absolutePath));
  }

  // Vite loads this file through esbuild, but a runtime `import()` of consumer
  // TypeScript (same pattern as `stylex: './config/stylex.ts'`) needs tsx.
  if (extension === '.ts' || extension === '.mts' || extension === '.tsx') {
    const { tsImport } = await import('tsx/esm/api');
    return unwrapDefault(await tsImport(absolutePath, import.meta.url));
  }

  const imported = await import(pathToFileURL(absolutePath).href);
  return unwrapDefault(imported);
}

async function normalizePluginList(
  plugins: DocsVitePluginsExport | undefined,
  env?: ConfigEnv,
): Promise<PluginOption[]> {
  if (plugins == null) return [];
  let value: unknown = plugins;
  if (typeof value === 'function') {
    // A single Vite plugin is a plain object; a function here is a factory.
    value = await (value as (env?: ConfigEnv) => unknown)(env);
  }
  if (value == null) return [];
  if (Array.isArray(value)) {
    const items: PluginOption[] = [];
    for (const item of value) {
      if (typeof item === 'function') {
        // Convenience: allow `[() => plugin]` factories; Vite itself does not.
        const resolved = await (item as (env?: ConfigEnv) => unknown)(env);
        if (resolved == null) continue;
        if (Array.isArray(resolved)) items.push(...(resolved as PluginOption[]));
        else items.push(resolved as PluginOption);
      } else {
        items.push(item as PluginOption);
      }
    }
    return items;
  }
  return [value as PluginOption];
}

async function expandModuleExport(
  exported: unknown,
  env: ConfigEnv | undefined,
  depth = 0,
): Promise<Omit<ResolvedDocsViteExtension, 'sourcePath'>> {
  if (depth > 4) {
    throw new Error('docs vite module export resolved too many nested functions.');
  }

  let value = exported;
  while (typeof value === 'function') {
    // Factories may be zero-arg (legacy CJS hooks) or receive Vite ConfigEnv
    // (`{ command, mode, isSsrBuild, ... }`) to branch serve vs build.
    value = await (value as (env?: ConfigEnv) => unknown)(env);
    depth += 1;
    if (depth > 4) {
      throw new Error('docs vite module export resolved too many nested functions.');
    }
  }

  if (value == null) {
    return { plugins: [] };
  }

  if (looksLikeExtensionObject(value)) {
    const plugins = await normalizePluginList(value.plugins, env);
    return {
      apply: value.apply,
      optimizeDeps: value.optimizeDeps,
      plugins,
      ssr: value.ssr,
    };
  }

  return { plugins: await normalizePluginList(value as DocsVitePluginsExport, env) };
}

/**
 * Load the consumer Vite extension for `root`.
 * Returns empty plugins when neither `configuredPath` nor a convention file exists.
 * Pass Vite `ConfigEnv` so default-export / `plugins` factories can branch on
 * `command` / `mode` / `isSsrBuild` (zero-arg factories remain supported).
 */
export async function loadDocsViteExtension(
  root: string,
  configuredPath?: string,
  env?: ConfigEnv,
): Promise<ResolvedDocsViteExtension> {
  const sourcePath = resolveDocsViteModulePath(root, configuredPath);
  if (!sourcePath) {
    return { plugins: [] };
  }

  const exported = await importDocsViteModule(sourcePath);
  const resolved = await expandModuleExport(exported, env);
  return { ...resolved, sourcePath };
}

export function shouldApplyDocsViteExtension(
  apply: DocsViteExtension['apply'] | undefined,
  env: ConfigEnv,
  config: UserConfig = {},
): boolean {
  if (!apply) return true;
  if (typeof apply === 'function') return apply(config, env);
  if (apply === 'serve') return env.command === 'serve';
  if (apply === 'build') return env.command === 'build';
  return true;
}

/** Attach extension-level `apply` onto plugins that do not already set it. */
export function applyDocsVitePluginGate(
  plugins: PluginOption[],
  apply: DocsViteExtension['apply'] | undefined,
): PluginOption[] {
  if (!apply) return plugins;
  return plugins.map((plugin) => {
    if (!plugin || typeof plugin !== 'object' || Array.isArray(plugin)) return plugin;
    if ('then' in plugin) return plugin; // Promise<Plugin>
    if ('apply' in plugin && plugin.apply != null) return plugin;
    return { ...plugin, apply };
  });
}

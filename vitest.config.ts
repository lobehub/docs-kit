import { fileURLToPath } from 'node:url';

import stylex from '@stylexjs/unplugin/vite';
import { defineConfig } from 'vitest/config';

import { lobeDocsSiteConfigPlugin } from './site/compiler/vitePlugin';

const playgroundRoot = fileURLToPath(new URL('./playground', import.meta.url));
const docsKitRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    stylex({
      classNamePrefix: 'ld',
      runtimeInjection: true,
      unstable_moduleResolution: { rootDir: docsKitRoot, type: 'commonJS' },
    }),
    lobeDocsSiteConfigPlugin(playgroundRoot),
  ],
  test: {
    css: { include: [/\/site\/.+\.css$/] },
    environment: 'jsdom',
    exclude: ['**/node_modules/**', 'playground/**'],
    globals: true,
    hookTimeout: 30_000,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 120_000,
  },
});

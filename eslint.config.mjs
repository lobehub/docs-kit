import { defineConfig } from '@lobehub/lint';
import stylex from '@stylexjs/eslint-plugin';

export default defineConfig(
  {
    ignores: [
      '**/node_modules',
      'coverage',
      '**/dist',
      '**/.react-router',
      '.vitest',
      'site/compiler/.cache',
    ],
    react: true,
    regexp: false,
    typescript: true,
  },
  {
    rules: {
      '@eslint-react/jsx-key-before-spread': 'off',
      '@eslint-react/jsx-no-key-after-spread': 'off',
      '@eslint-react/no-children-only': 'off',
      '@eslint-react/no-children-to-array': 'off',
      '@eslint-react/no-clone-element': 'off',
      '@eslint-react/no-nested-component-definitions': 'off',
      '@eslint-react/no-unnecessary-use-prefix': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'off',
      'import-x/consistent-type-specifier-style': 'off',
      'no-undef': 'off',
      'unicorn/better-regex': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/prefer-logical-operator-over-ternary': 'off',
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
    },
  },
  {
    // React Router framework mode requires default exports from route modules,
    // root, server entry, and the route config; the .d.ts mirrors a virtual
    // module's default export shape; home page components must default-export
    // to satisfy the virtual:lobedocs/home-page module contract.
    files: [
      'site/app/routes/*.tsx',
      'site/root.tsx',
      'site/entry.server.tsx',
      'site/routes.ts',
      'site/types/*.d.ts',
      'site/components/Home/DefaultHome.tsx',
      'playground/**',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['site/**/*{style,Style}.ts'],
    plugins: { '@stylexjs': stylex },
    rules: {
      '@stylexjs/no-unused': 'error',
      '@stylexjs/sort-keys': 'error',
      '@stylexjs/valid-shorthands': 'error',
      '@stylexjs/valid-styles': 'error',
      'no-restricted-syntax': [
        'error',
        {
          message: 'Default export is not allowed. Use named exports instead.',
          selector: 'ExportDefaultDeclaration',
        },
        {
          message:
            'StyleX 0.19 silently drops this shorthand; use longhands (backgroundColor, animationName, borderWidth/borderStyle/borderColor).',
          selector:
            "CallExpression[callee.object.name='stylex'][callee.property.name='create'] Property[key.name=/^(animation|background|border)$/], CallExpression[callee.object.name='stylex'][callee.property.name='create'] Property[key.value=/^(animation|background|border)$/]",
        },
      ],
    },
  },
);

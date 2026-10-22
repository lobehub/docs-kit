<a name="readme-top"></a>

<div align="center">

![](https://github.com/lobehub/docs-kit/raw/main/.github/assets/banner.png)

<h1>LobeHub Docs Kit</h1>

<h3>The Docs Kit for Component Libraries</h3>

LobeHub's documentation toolkit and `lobedocs` CLI for React component library sites.

[Live Example](https://ui.lobehub.com) · [Changelog](./CHANGELOG.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

<!-- SHIELD GROUP -->

[![][npm-release-shield]][npm-release-link]
[![][discord-shield]][discord-link]
[![][npm-downloads-shield]][npm-downloads-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [✨ Why Docs Kit?](#-why-docs-kit)
- [🚀 Getting Started](#-getting-started)
- [📝 Writing Docs](#-writing-docs)
- [⚙️ Configuration](#️-configuration)
- [🤖 AI-Native Docs](#-ai-native-docs)
- [🏗️ Architecture](#️-architecture)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🩷 Sponsor](#-sponsor)
- [🔗 Links](#-links)

####

</details>

## ✨ Why Docs Kit?

Docs Kit is the documentation stack behind [ui.lobehub.com](https://ui.lobehub.com). It takes over from `dumi` + `dumi-theme-lobehub` as one installable package: a React Router + Vite static site that your repo only feeds with content and a config file.

- **Zero build config**: no `vite.config.ts` or `react-router.config.ts` in your repo; the `lobedocs` CLI owns them.
- **Docs next to code**: every `src/**/index.mdx` becomes a component page, with live, editable `<Demo />` blocks and standalone `/~demos/:id` routes.
- **API tables from TypeScript**: `<Api name="Button" />` reads props, JSDoc and `@default` from your types, and the build fails when a default drifts from runtime.
- **Static and fast**: every page is prerendered, with Pagefind search, a sitemap and Open Graph tags built in.
- **AI-native**: `/llms.txt` and `/skills.md` are generated from the same MDX, so coding agents read the docs your users read.
- **LobeHub look**: built on [`@lobehub/ui`](https://github.com/lobehub/lobe-ui) with light and dark themes; giscus comments and Plausible analytics are one config field away.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🚀 Getting Started

[![][pnpm-shield]][pnpm-link]

```bash
$ pnpm add -D @lobehub/docs-kit @react-router/dev react-router vite tsx
```

Docs Kit needs Node.js >= 22.22, React 19, React Router 8.2+ and Vite 8.1+. Add the scripts:

```json
{
  "scripts": {
    "docs:dev": "lobedocs dev",
    "docs:build": "lobedocs build",
    "postinstall": "lobedocs typegen"
  }
}
```

A consumer repo holds only content and a config file:

```
<repo>/
  docs.config.ts         # site config, see Configuration
  src/**/index.mdx       # component docs, per configured atomDirs
  src/**/demos/*.tsx     # demos embedded with <Demo />
  docs/**                # guide pages (docs/index.mdx -> "/", docs/changelog.mdx -> "/changelog")
  public/                # static assets served at "/"
  CHANGELOG.md           # rendered at "/changelog" when docs/changelog.mdx is absent
```

```ts
// docs.config.ts
export default {
  atomDirs: [{ dir: 'src' }],
  title: 'Lobe UI',
  description: 'A modern React component library for building LobeHub products.',
  siteUrl: 'https://ui.lobehub.com',
  themeConfig: {
    socialLinks: [{ href: 'https://github.com/lobehub/lobe-ui', icon: 'github', label: 'GitHub' }],
  },
};
```

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `lobedocs dev`     | Start the dev server                                            |
| `lobedocs build`   | Build and prerender the static site into `dist/`, then audit it |
| `lobedocs typegen` | Generate React Router route types                               |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📝 Writing Docs

A component page is an `index.mdx` next to the component. `Demo` and `Api` are available in every MDX file without an import:

```mdx
---
title: Button
description: Button triggers an action. Supports variants, sizes, loading and icon slots.
category: General
---

import Basic from './demos/index.tsx?demo';
import Variants from './demos/Variants.tsx?demo';

<Demo of={Basic} title="Basic usage" />

## Variants

<Demo of={Variants} title="Variants" />

## API

<Api name="Button" />
```

- Only files named `index.mdx` under an `atomDirs` root become pages; the URL comes from the folder (`src/chat/ChatItem` → `/components/chat/chat-item`).
- Each demo file has one default export and lives under `src/**/demos/`.
- `<Api>` resolves the component through the nearest `index.ts`; write JSDoc and a matching `@default` on every prop.
- Guide pages under `docs/` need a `title` and `description`, and must be listed in `publicDocs`.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⚙️ Configuration

| Field                                  | Type                                                 | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atomDirs`                             | `{ dir: string; type?: string; subType?: string }[]` | Scan roots for component docs (multiple roots support per-repo layouts, e.g. `src/react`, `src/plugins`)                                                                                                                                                                                                                                                                                                                                                            |
| `title` / `description`                | `string`                                             | Site metadata, used in `<title>`/meta tags and OpenGraph                                                                                                                                                                                                                                                                                                                                                                                                            |
| `siteUrl`                              | `string`                                             | Canonical origin, used for sitemap/OG/canonical links                                                                                                                                                                                                                                                                                                                                                                                                               |
| `navSections?`                         | `Record<string, string>`                             | Section overrides keyed by doc source. Sections are derived from the document's directory, so this is only for a page sitting outside its section's namespace                                                                                                                                                                                                                                                                                                       |
| `legacyRedirects`                      | `DocumentationInventory`                             | Optional old-URL -> new-URL redirect map (replaces `compatibility.json`)                                                                                                                                                                                                                                                                                                                                                                                            |
| `alias`                                | `Record<string, string>`                             | Module aliases forwarded to Vite                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `favicons`                             | `Record<string, string>`                             | Favicon link hrefs, keyed `icon` / `icon16` / `icon32` / `appleTouchIcon`. Each key defaults to the LobeHub favicon if omitted.                                                                                                                                                                                                                                                                                                                                     |
| `themeConfig.navItems`                 | `DocsNavItem[]`                                      | Extra top-level sidebar links, after Home and before the skills.md, llms.txt and Changelog links. `external: true` opens in a new tab. `icon` takes a lucide icon name in kebab-case (`'palette'`), loaded on demand; without it the link gets a document icon.                                                                                                                                                                                                     |
| `themeConfig.actions`                  | `DocsNavItem[]`                                      | Extra text links rendered in the top bar's tools, before the theme switcher.                                                                                                                                                                                                                                                                                                                                                                                        |
| `themeConfig.socialLinks`              | `DocsSocialLink[]`                                   | The entry with `icon: 'github'` renders as the top bar's icon-only GitHub button.                                                                                                                                                                                                                                                                                                                                                                                   |
| `themeConfig.giscus`                   | `{ repo, repoId, category, categoryId }`             | Giscus comments shown at the end of every page.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `themeConfig.analytics.plausible`      | `{ domain, source }`                                 | Plausible analytics script injection                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `themeConfig.apiHeader`                | `{ docUrl?, sourceUrl?, github?, match?: string[] }` | Derives each component doc's "Source" and "Edit" links. `docUrl`/`sourceUrl` are templates supporting `{github}` (the `github` field, a repo base URL) and `{atomId}` (the doc's source path for `docUrl`, its containing directory for `sourceUrl`) placeholders — default to `{github}/edit/master/{atomId}` and `{github}/tree/master/{atomId}`. `match` optionally scopes which document pathnames get Source/Edit links (defaults to every `src/**` document). |
| `themeConfig.prefersColor`             | `'auto' \| 'dark' \| 'light'`                        | Default color scheme. `'auto'` (default) follows system preference and shows the top bar's light/dark/system switcher; `'dark'`/`'light'` forces that scheme and hides the switcher.                                                                                                                                                                                                                                                                                |
| `themeConfig.metadata.openGraph.image` | `string`                                             | Default OG image                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

`docs.config.ts` is loaded once per process (in a `node --import tsx` subprocess) and reaches the app through Vite virtual modules, so restart `lobedocs dev` after editing it.

### React Router overrides

The CLI supplies a React Router config for the lifetime of each command, guarded by cross-process leases when several `lobedocs` commands run at once. To change it, add a `react-router.config.ts` built from the exported defaults; a consumer-authored config always wins and is never modified:

```ts
import { defineLobeDocsReactRouterConfig } from '@lobehub/docs-kit/react-router-config';

export default defineLobeDocsReactRouterConfig({
  basename: '/docs',
});
```

The `lobedocs` CLI and `@lobehub/docs-kit/react-router-config` are the supported entry points; other deep imports are not stable yet.

### Changelog

`/changelog` renders `docs/changelog.mdx` when it exists. Without it, the kit renders the root `CHANGELOG.md` directly, with no frontmatter or nav config needed.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤖 AI-Native Docs

Every site serves two generated text routes, rebuilt from `docs.config.ts`, the folder layout under `atomDirs` and the MDX source of each page:

| Route        | What it contains                                                                                                                                                                                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/llms.txt`  | [llms.txt](https://llmstxt.org/) index. The title and summary come from config. Sections follow atom directories and component folders (`navSections` overrides a folder). Each entry links to the assembled markdown and records the MDX description, category, heading outline, and rendered docs URL. |
| `/skills.md` | Agent skill for the same corpus: config, folder architecture, and the MDX prose for every page. Import lines and component tags such as `<Demo />` and `<Api />` are left out; headings, paragraphs, tables, and fenced code stay.                                                                       |

Both routes work in `lobedocs dev` and are prerendered into the static build. HTML pages link to `/llms.txt` with `rel="describedby"`.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🏗️ Architecture

| Path               | What it is                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `bin/`, `src/cli/` | The `lobedocs` CLI                                                                                    |
| `src/config.ts`    | `docs.config.ts` types, loading and caching                                                           |
| `site/compiler/`   | Content inventory, demo pipeline, TypeScript API extraction, Pagefind search, SEO, build finalization |
| `site/app/`        | Routes, providers and the docs shell; reads the consumer config through virtual modules               |
| `site/components/` | Docs UI: layout, demos, API tables, search, table of contents                                         |
| `playground/`      | A minimal consumer used for local development, compiler tests and the CI build                        |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][codespaces-shield]][codespaces-link]

Or clone it for local development (Node.js >= 22.22 and pnpm):

```bash
$ git clone https://github.com/lobehub/docs-kit.git
$ cd docs-kit
$ pnpm install
$ pnpm dev
```

| Command                 | What it does                                       |
| ----------------------- | -------------------------------------------------- |
| `pnpm dev`              | `lobedocs dev` against `playground/`               |
| `pnpm build:playground` | Full static build of `playground/`                 |
| `pnpm test`             | Vitest, run with `playground/` as the consumer cwd |
| `pnpm lint`             | ESLint                                             |
| `pnpm type-check`       | TypeScript                                         |

Commits follow gitmoji + conventional commits; semantic-release publishes to npm from `main`.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome, if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]

[![][contributors-contrib]][contributors-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🩷 Sponsor

Every bit counts and your one-time donation sparkles in our galaxy of support! You're a shooting star, making a swift and bright impact on our journey. Thank you for believing in us – your generosity guides us toward our mission, one brilliant flash at a time.

<a href="https://opencollective.com/lobehub" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/lobehub/.github/blob/main/static/sponsor-dark.png?raw=true">
    <img  src="https://github.com/lobehub/.github/blob/main/static/sponsor-light.png?raw=true">
  </picture>
</a>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Links

- **[🍭 Lobe UI](https://github.com/lobehub/lobe-ui)** - React component library for AI apps
- **[🥨 Lobe Icons](https://github.com/lobehub/lobe-icons)** - AI / LLM brand logos and icons
- **[📊 Lobe Charts](https://github.com/lobehub/lobe-charts)** - React chart components
- **[✒️ Lobe Editor](https://github.com/lobehub/lobe-editor)** - Lexical-based rich text editor for React, with Markdown, plugins and a chat composer
- **[🎤 Lobe TTS](https://github.com/lobehub/lobe-tts)** - TTS / STT speech library
- **[📐 Lobe Lint](https://github.com/lobehub/lobe-lint)** - ESLint, Prettier, Stylelint, Commitlint and more lint configs
- **[😀 Fluent Emoji](https://github.com/lobehub/fluent-emoji)** - Fluent Emoji assets
- **[📖 Docs Kit](https://github.com/lobehub/docs-kit)** - Reusable documentation toolkit and lobedocs CLI for LobeHub component libraries
- **[🌊 Streamdown](https://github.com/lobehub/streamdown)** - Headless streaming markdown engine for React

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

<details><summary><h4>📝 License</h4></summary>

[![][fossa-license-shield]][fossa-license-link]

</details>

Copyright © 2026 [LobeHub][profile-link]. <br />
This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[codespaces-link]: https://codespaces.new/lobehub/docs-kit
[codespaces-shield]: https://github.com/codespaces/badge.svg
[contributors-contrib]: https://contrib.rocks/image?repo=lobehub/docs-kit
[contributors-link]: https://github.com/lobehub/docs-kit/graphs/contributors
[discord-link]: https://discord.gg/AYFPHvv2jT
[discord-shield]: https://img.shields.io/discord/1127171173982154893?color=5865F2&label=discord&labelColor=black&logo=discord&logoColor=white&style=flat-square
[fossa-license-link]: https://app.fossa.com/projects/git%2Bgithub.com%2Flobehub%2Fdocs-kit
[fossa-license-shield]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Flobehub%2Fdocs-kit.svg?type=large
[github-action-release-link]: https://github.com/lobehub/docs-kit/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/docs-kit/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/lobehub/docs-kit/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/docs-kit/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-contributors-link]: https://github.com/lobehub/docs-kit/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/docs-kit?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/docs-kit/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/docs-kit?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/lobehub/docs-kit/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/docs-kit?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/lobehub/docs-kit/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/lobehub/docs-kit?color=white&labelColor=black&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/docs-kit/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/docs-kit?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/docs-kit/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/docs-kit?color=ffcb47&labelColor=black&style=flat-square
[npm-downloads-link]: https://www.npmjs.com/package/@lobehub/docs-kit
[npm-downloads-shield]: https://img.shields.io/npm/dt/@lobehub/docs-kit?labelColor=black&style=flat-square
[npm-release-link]: https://www.npmjs.com/package/@lobehub/docs-kit
[npm-release-shield]: https://img.shields.io/npm/v/@lobehub/docs-kit?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pnpm-link]: https://pnpm.io
[pnpm-shield]: https://img.shields.io/badge/-pnpm-F69220?logo=pnpm&style=for-the-badge
[pr-welcome-link]: https://github.com/lobehub/docs-kit/pulls
[pr-welcome-shield]: https://img.shields.io/badge/🤯_pr_welcome-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub

<a name="readme-top"></a>

<div align="center">

![](https://github.com/lobehub/docs-kit/raw/main/.github/assets/banner.png)

<h1>📖 Docs Kit</h1>

<h3>The Documentation Kit for React Component Libraries</h3>

LobeHub's documentation toolkit and `lobedocs` CLI. Write MDX next to your React components and get a prerendered docs site with live demos, API tables, search, `skills.md` and `llms.txt`.

[Live Example](https://docs-kit.lobehub.com) · [Changelog](./CHANGELOG.md) · [Report Bug][github-issues-link] · [Request Feature][github-issues-link]

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
- [⌨️ lobedocs CLI](#️-lobedocs-cli)
- [🤖 AI-Powered Development](#-ai-powered-development)
- [🛠️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🩷 Sponsor](#-sponsor)
- [🔗 Links](#-links)

####

</details>

## ✨ Why Docs Kit?

Docs Kit is the documentation stack behind [ui.lobehub.com](https://ui.lobehub.com) and the other LobeHub component library sites. It replaces `dumi` + `dumi-theme-lobehub` with one installable package: your repo keeps the content and a config file, and the `lobedocs` CLI does the rest.

- **Zero build config**: no `vite.config.ts` or `react-router.config.ts` in your repo; the CLI owns them.
- **Docs next to code**: every `src/**/index.mdx` becomes a component page with live, editable `<Demo />` blocks.
- **API tables from TypeScript**: `<Api name="Button" />` reads props, JSDoc and `@default` from your types, and the build fails when a default drifts from runtime.
- **Static and fast**: every page is prerendered, with Pagefind search, a sitemap and Open Graph tags built in.
- **Audited builds**: broken links, missing demos and wrong API defaults fail `lobedocs build` instead of reaching readers.
- **AI-native docs**: coding agents read every page through [skills.md][skills-md-link] and [llms.txt][llms-txt-link], generated from the same MDX your users read.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🚀 Getting Started

[![][pnpm-shield]][pnpm-link]

```bash
$ pnpm add -D @lobehub/docs-kit @react-router/dev react-router vite tsx
```

Docs Kit needs Node.js >= 22.22, React 19, React Router 8.2+ and Vite 8.1+. Add the scripts to your component library's `package.json`:

```json
{
  "scripts": {
    "docs:dev": "lobedocs dev",
    "docs:build": "lobedocs build",
    "postinstall": "lobedocs typegen"
  }
}
```

Then add a `docs.config.ts` at the repo root and a `docs/index.mdx` with `title` and `description` frontmatter:

```ts
// docs.config.ts
export default {
  atomDirs: [{ dir: 'src' }],
  title: 'Lobe Editor',
  description: 'One sentence describing the library.',
  siteUrl: 'https://editor.lobehub.com',
  alias: { '@lobehub/editor': 'src' }, // demos import the package by name, run from source
  themeConfig: {
    apiHeader: { packageName: '@lobehub/editor', github: 'https://github.com/lobehub/lobe-editor' },
    socialLinks: [
      { href: 'https://github.com/lobehub/lobe-editor', icon: 'github', label: 'GitHub' },
    ],
  },
};
```

Run `pnpm docs:dev` and open the printed URL. Every config field, including the sidebar, home page, theme, giscus and analytics options, is typed in [`src/config.ts`](./src/config.ts).

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

<Demo of={Basic} title="Basic usage" />

## API

<Api name="Button" />
```

- Only files named `index.mdx` under an `atomDirs` root become pages; the URL comes from the folder (`src/chat/ChatItem` → `/components/chat/chat-item`).
- Each demo file has one default export and lives under `src/**/demos/`.
- Guide pages are `docs/**/*.mdx` files listed in `publicDocs`; `themeConfig.sidebarGroups` gives them a sidebar section.
- A custom landing page is any module set as `homePage`, for example one built from `@lobehub/ui/awesome`.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ lobedocs CLI

| Command            | What it does                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `lobedocs dev`     | Start the dev server with hot reload for MDX, demos and components                            |
| `lobedocs build`   | Prerender every page, build the search index and agent files, audit the result, write `dist/` |
| `lobedocs typegen` | Generate React Router route types into `.react-router/types`                                  |

Extra arguments are forwarded to React Router, e.g. `lobedocs dev --port 3000`. `dist/` is plain static HTML that any static host can serve. Restart `lobedocs dev` after editing `docs.config.ts`.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤖 AI-Powered Development

Docs Kit's docs are generated for coding agents as well as people. `lobedocs dev` serves them live, and `lobedocs build` writes them into `dist/`:

| Resource                                                                                  | What it does                                                                                      |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [skills.md][skills-md-link]                                                               | Agent skill entry point: site config, folder architecture and a Markdown reference for every page |
| [llms.txt][llms-txt-link]                                                                 | Page index with outlines for [llms.txt](https://llmstxt.org)-aware tools                          |
| [Button skill](https://docs-kit.lobehub.com/skills/components/button.md)                  | Example per-page Markdown reference (`/skills/<page>.md`), with usage, demos and props            |
| [Introduction skill](https://docs-kit.lobehub.com/skills/getting-started/introduction.md) | Example guide-page skill for getting started                                                      |

Paste this into Cursor, Claude Code, Codex or any other coding agent:

```text
Read https://docs-kit.lobehub.com/skills.md, then use @lobehub/docs-kit to set up a documentation site for my React component library. Follow the installation, docs.config.ts and component-page conventions documented there.
```

Works with Cursor, Claude Code, Windsurf, GitHub Copilot and other llms.txt-aware tools.

Working on this repository with an agent? Start from [AGENTS.md](./AGENTS.md).

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🛠️ Local Development

You can use Github Codespaces for online development:

[![][codespaces-shield]][codespaces-link]

Or clone it for local development (Node.js >= 22.22 and pnpm):

```bash
$ git clone https://github.com/lobehub/docs-kit.git
$ cd docs-kit
$ pnpm install
$ pnpm dev
```

`pnpm dev` runs `lobedocs dev` against [`playground/`](./playground), a consumer site that documents how to use the kit. `pnpm build:playground`, `pnpm test`, `pnpm lint` and `pnpm type-check` are what CI runs.

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
[llms-txt-link]: https://docs-kit.lobehub.com/llms.txt
[profile-link]: https://github.com/lobehub
[skills-md-link]: https://docs-kit.lobehub.com/skills.md

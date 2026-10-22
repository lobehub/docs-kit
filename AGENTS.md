# AGENTS.md

Guidance for coding agents working in this repository.

## Overview

`@lobehub/docs-kit` is LobeHub's documentation toolkit: the `lobedocs` CLI plus a React Router 8 + Vite 8 static docs site that consumer repos (lobe-ui, lobe-icons, lobe-charts, lobe-editor, streamdown, ...) feed with `docs.config.ts` and MDX. The package ships TypeScript source (no build step): `bin/`, `src/`, `site/`, `vite.config.ts` and `react-router-config.ts` are published as-is. pnpm workspace, Node >= 22.22.

| Path                              | What it is                                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `bin/lobedocs.mjs`, `src/cli/`    | The `lobedocs` CLI: `commands.ts` holds `dev`, `build`, `typegen`; React Router config leasing                                    |
| `src/config.ts`                   | `DocsConfig` / `DocsThemeConfig` types and `docs.config.ts` loading (tsx subprocess, cached per process)                          |
| `vite.config.ts`                  | The kit-owned Vite config every consumer builds with (aliases, StyleX, MDX, docs plugins)                                         |
| `site/routes.ts`, `site/root.tsx` | Route table and document shell                                                                                                    |
| `site/app/`                       | Route modules (`routes/`), providers (theme, `ConfigProvider`), `mdx-components.tsx` (MDX globals)                                |
| `site/components/`                | Docs UI: `DocsShell`, `DocsLayout`, `Demo`, `Api`, `Search`, `TableOfContents`, `Home`, `Feedback`, ...                           |
| `site/compiler/`                  | Build-time pipeline: `content/`, `demo/`, `api/`, `search/`, `seo/`, `agent/` (skills.md, llms.txt), `audit/`, `finalizeBuild.ts` |
| `site/content/`, `site/search/`   | Navigation, page chrome, section overviews; runtime search engines (Pagefind + manifest fallback)                                 |
| `site/styles/`                    | Global CSS, StyleX globals, syntax theme                                                                                          |
| `playground/`                     | Consumer site that documents the kit; the end-to-end fixture for tests and the CI build                                           |
| `tests/`                          | Vitest setup (`setup.ts` chdirs into `playground/`), shared roots, `fixtures/site/`                                               |
| `.agents/skills/`                 | Agent skills (see below)                                                                                                          |

## Using Skills

Skills live in `.agents/skills/<name>/SKILL.md`. The folder is currently **not tracked by git** in this repo (it is untracked, not ignored), so it only exists in local checkouts that copied it in; lobe-ui tracks its own copy of `using-docs-kit`. Read the matching `SKILL.md` and its `reference/` files before the task it covers.

| Skill                   | Use when                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `using-docs-kit`        | Writing `index.mdx` pages, demos, `<Api>` tables, `docs.config.ts`, or fixing a failing `lobedocs build` (`reference/validations.md`) |
| `building-landing-home` | Composing a home page from `@lobehub/ui/awesome` (`playground/docs/home/home.tsx`, or a consumer's `homePage`)                        |

The skill text was written for consumers; when it disagrees with `src/config.ts` or `site/`, the source wins (for example `themeConfig.sidebarGroups` and `stylex` exist in `DocsConfig` but are missing from the skill's config reference). Update the skill when you change consumer-facing behaviour.

`/skills.md`, `/skills/<page>.md` and `/llms.txt` are generated for every consumer site by `site/app/routes/` (dev) and `site/compiler/finalizeBuild.ts` (written into `dist/`), from `site/compiler/agent/`. They describe a site's content, not how to work on this repo.

## Writing Docs

The user-facing docs are the playground site (`pnpm dev`):

- **Guides**: `playground/docs/<group>/<page>.mdx` with `title` + `description` (+ `order`), listed in `publicDocs` in `playground/docs.config.ts`. Groups are `getting-started`, `file-conventions`, `guide`, `advanced` (structure modeled on nextra.site/docs), each a `themeConfig.sidebarGroups` entry.
- **Sample components**: `playground/src/<Name>/` (`index.ts`, `type.ts` with JSDoc, `index.mdx`, `demos/`). They are fixtures too: `Button` and `compatibility.json` back `buttonPilot`, `inventory`, `readLegacyMap`, `demoPlugin` and `liveTransform` tests, and `site/compiler/inventory.test.ts` lists every playground document, so update it when you add or remove a page.
- **Home**: `playground/docs/home/home.tsx` (follow `building-landing-home`).
- **Facts**: verify every documented field, command and route against the source before writing it. Only `Demo` and `Api` are MDX globals; no `:::` callouts (the playground imports `src/Callout`).
- **Agent docs caveat**: `site/compiler/agent/mdxProse.ts` strips anything that looks like a capitalized JSX tag, even inside inline code. In prose, write "the `Demo` block" rather than `` `<Demo of={X}>` ``; code fences are safe.
- Keep `README.md` short (intro and usage); detailed reference belongs in the playground.

## Adding Things

- **Config field**: add it to `DocsConfig` / `DocsThemeConfig` in `src/config.ts`; if the browser needs it, it reaches the app through `virtual:lobedocs/site-config` (`ClientSiteConfig`). Values must survive JSON (the config is serialized out of a subprocess); pass functions as a module path, like `stylex`. Add a test, document it in `playground/docs/file-conventions/docs-config.mdx`, and update the `using-docs-kit` reference.
- **CLI command**: add a handler to `commands` in `src/cli/commands.ts` (usage text is derived from its keys), cover it in `src/cli/commands.test.ts`, and document it in `playground/docs/getting-started/cli.mdx` and the README table.
- **Docs UI component**: `site/components/<Name>/<Name>.tsx` with a StyleX `style.ts` (named exports only; StyleX longhands such as `backgroundColor`, enforced by ESLint) and a colocated `<Name>.test.tsx`. To expose it in MDX, register it in `site/app/mdx-components.tsx` and update the "only `Demo` and `Api` are global" statements in docs and skills.
- **Theme or appearance**: providers and the theme bootstrap live in `site/app/providers/`; global styles in `site/styles/`. Colors come from `@lobehub/ui` tokens, not hard-coded values.
- **Route or generated file**: register it in `site/routes.ts`, add it to `getPrerenderPaths` in `site/compiler/manifests.ts`, and make `site/compiler/audit/artifactAudit.ts` check it.
- **Build rule**: content validation in `site/compiler/content/`, demo rules in `site/compiler/demo/`, API rules in `site/compiler/api/`; error messages name the file and the fix. Add the rule to `playground/docs/advanced/validations.mdx` and the skill's `reference/validations.md`.

## Conventions & Checks

```bash
pnpm dev                  # lobedocs dev against playground/
pnpm build:playground     # full static build + artifact audit of playground/ (what CI runs)
pnpm test                 # vitest run (cwd = playground/)
pnpm exec vitest run <path>
pnpm lint                 # eslint .
pnpm type-check           # tsc --noEmit
```

- CI (`.github/workflows/test.yml`) runs `pnpm install --frozen-lockfile`, lint, type-check, `test:coverage` and `build:playground`. Commit `pnpm-lock.yaml` with any dependency change.
- Restart `pnpm dev` after editing `playground/docs.config.ts`.
- The only git hook is `commit-msg` (commitlint). Never use `--no-verify`.
- Commits: gitmoji + conventional commit with a lowercase scope, enforced by commitlint, e.g. `✨ feat(cli): ...`, `🐛 fix(search): ...`, `📝 docs: ...`, `✨ feat(playground): ...`. semantic-release publishes to npm from `main`; never bump versions by hand.

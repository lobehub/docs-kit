import { FeatureGrid, type FeatureGridItem } from '@lobehub/ui/awesome';
import { Blocks, Bot, Rocket, Search, Shield, SunMoon } from 'lucide-react';

import { renderLink } from './renderLink';

const FEATURES: FeatureGridItem[] = [
  {
    description:
      'The CLI owns the Vite and React Router config, so your repository keeps only content.',
    href: '/getting-started/installation',
    icon: Blocks,
    title: 'Zero build config',
  },
  {
    description:
      'Every page, overview and demo is prerendered to HTML that any static host can serve.',
    href: '/guide/build-and-deploy',
    icon: Rocket,
    title: 'Static output',
  },
  {
    description:
      'Broken links, missing demos and drifting API defaults fail the build, not the reader.',
    href: '/advanced/validations',
    icon: Shield,
    title: 'Audited builds',
  },
  {
    description: 'A Pagefind index is built from the rendered pages, in dev and in production.',
    href: '/guide/search',
    icon: Search,
    title: 'Full-text search',
  },
  {
    description: 'llms.txt, skills.md and per-page markdown come from the same MDX as the pages.',
    href: '/guide/ai-docs',
    icon: Bot,
    title: 'Docs for agents',
  },
  {
    description: 'The LobeHub look in light and dark, with a per-demo appearance switch.',
    href: '/guide/theming',
    icon: SunMoon,
    title: 'Light and dark',
  },
];

export function FeatureSection() {
  return <FeatureGrid items={FEATURES} renderLink={renderLink} />;
}

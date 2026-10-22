import {
  Aws,
  Azure,
  Cloudflare,
  DigitalOcean,
  Github,
  GoogleCloud,
  Vercel,
  Zeabur,
} from '@lobehub/icons';
import {
  AgentSkillCard,
  InstallBanner,
  LandingHero,
  LandingSection,
  LogoMarquee,
} from '@lobehub/ui/awesome';
import { GithubIcon } from '@lobehub/ui/icons';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { BentoGallery } from './BentoGallery';
import { CodeShowcaseSection } from './CodeShowcaseSection';
import { FeatureSection } from './FeatureSection';
import { renderLink } from './renderLink';

const SITE_URL = 'https://docs-kit.lobehub.com';
const GITHUB_URL = 'https://github.com/lobehub/docs-kit';
const INSTALL_COMMAND = 'pnpm add -D @lobehub/docs-kit @react-router/dev react-router vite tsx';

const STATIC_HOSTS = [
  { icon: Vercel, label: 'Vercel' },
  { icon: Cloudflare, label: 'Cloudflare' },
  { icon: Github, label: 'GitHub Pages' },
  { icon: Aws, label: 'AWS' },
  { icon: Azure, label: 'Azure' },
  { icon: GoogleCloud, label: 'Google Cloud' },
  { icon: Zeabur, label: 'Zeabur' },
  { icon: DigitalOcean, label: 'DigitalOcean' },
];

export default function Home({
  description,
  getStartedPathname,
}: {
  description: string;
  getStartedPathname: string;
}) {
  const navigate = useNavigate();

  return (
    <>
      <LandingHero
        accent="Docs Kit"
        description={<span data-pagefind-meta="description">{description}</span>}
        renderLink={renderLink}
        title={<span data-pagefind-meta="title">LobeHub</span>}
        actions={[
          {
            href: getStartedPathname,
            icon: ArrowRight,
            iconPlacement: 'end',
            label: 'Get Started',
            primary: true,
          },
          { href: GITHUB_URL, icon: GithubIcon, label: 'GitHub' },
        ]}
        aside={
          <AgentSkillCard
            agent={{
              code: `Read ${SITE_URL}/skills.md and follow it to set up docs with @lobehub/docs-kit.`,
              description: 'Send this prompt to your agent to set up and write docs',
            }}
            footer={
              <>
                <a href="/skills.md" rel="noreferrer" target="_blank">
                  skills.md
                </a>
                <a href="/llms.txt" rel="noreferrer" target="_blank">
                  llms.txt
                </a>
              </>
            }
            human={{
              code: INSTALL_COMMAND,
              description: 'Install the kit and its peer dependencies',
            }}
          />
        }
        onNavigate={navigate}
      >
        <LogoMarquee
          items={STATIC_HOSTS}
          caption={
            <Link to="/guide/build-and-deploy">Static HTML in dist/, ready for any host</Link>
          }
        />
      </LandingHero>

      <LandingSection
        description="Every tile is rendered by this site: the demo block, search, theme switch and the llms.txt it serves."
        eyebrow="Features"
        eyebrowColor="blue"
        id="home-gallery"
        renderLink={renderLink}
        title="What a docs page gets"
        actions={[
          {
            href: '/sections/guide',
            icon: ArrowRight,
            iconPlacement: 'end',
            label: 'Read the guide',
          },
        ]}
        onNavigate={navigate}
      >
        <BentoGallery />
      </LandingSection>

      <LandingSection
        actions={[{ href: '/components/button', label: 'See the Button page' }]}
        description="Switch tabs: each file on the left renders live on the right."
        eyebrow="Workflow"
        eyebrowColor="green"
        id="home-showcase"
        renderLink={renderLink}
        title="Files in, pages out"
        onNavigate={navigate}
      >
        <CodeShowcaseSection />
      </LandingSection>

      <LandingSection
        actions={[{ href: '/file-conventions/docs-config', label: 'Configuration' }]}
        description="What the kit takes care of so your repository doesn't have to."
        eyebrow="Foundations"
        eyebrowColor="orange"
        id="home-features"
        renderLink={renderLink}
        title="Built in, not bolted on"
        onNavigate={navigate}
      >
        <FeatureSection />
      </LandingSection>

      <InstallBanner
        command={INSTALL_COMMAND}
        title="Document your library today"
        footnote={
          <>
            Open source · MIT license · <Link to={getStartedPathname}>Get Started →</Link>
          </>
        }
      />
    </>
  );
}

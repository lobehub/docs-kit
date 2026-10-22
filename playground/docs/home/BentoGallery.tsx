import { Flexbox, Highlighter, Hotkey, Segmented, Snippet } from '@lobehub/ui';
import { BentoCard, BentoGrid } from '@lobehub/ui/awesome';
import { useTheme } from 'next-themes';
import { useEffect, useState, useSyncExternalStore } from 'react';

import DemoPreview from './DemoPreview.mdx';
import { renderLink } from './renderLink';

const FRONTMATTER_SAMPLE = `---
title: Button
description: Button triggers an action.
category: General
---`;

const subscribeToNothing = () => () => {};

function ThemeSwitchTile() {
  const { setTheme, theme } = useTheme();
  // false while prerendering and hydrating, true afterwards: the stored theme is only known in the browser
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const preference = mounted && (theme === 'light' || theme === 'dark') ? theme : 'system';

  return (
    <Segmented
      value={preference}
      options={[
        { label: 'Light', value: 'light' },
        { label: 'System', value: 'system' },
        { label: 'Dark', value: 'dark' },
      ]}
      onChange={(value) => setTheme(String(value))}
    />
  );
}

function LlmsTxtTile() {
  const [excerpt, setExcerpt] = useState('Loading /llms.txt…');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/llms.txt', { signal: controller.signal })
      .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
      .then((text) => setExcerpt(text.split('\n').slice(0, 7).join('\n').trim()))
      .catch(() => {
        if (!controller.signal.aborted) {
          setExcerpt('Open /llms.txt to read the index of this site.');
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <Highlighter language={'markdown'} style={{ fontSize: 12, width: '100%' }} variant={'filled'}>
      {excerpt}
    </Highlighter>
  );
}

export function BentoGallery() {
  return (
    <BentoGrid>
      <BentoCard
        colSpan={2}
        hint="live · editable · isolated"
        href="/guide/demos"
        renderLink={renderLink}
        rowSpan={2}
        title="Demo blocks"
      >
        <div style={{ width: '100%' }}>
          <DemoPreview />
        </div>
      </BentoCard>
      <BentoCard hint="Pagefind" href="/guide/search" renderLink={renderLink} title="Search">
        <Hotkey keys={'mod+k'} variant={'outlined'} />
      </BentoCard>
      <BentoCard hint="try it" href="/guide/theming" renderLink={renderLink} title="Light and dark">
        <ThemeSwitchTile />
      </BentoCard>
      <BentoCard
        colSpan={2}
        hint="three commands"
        href="/getting-started/cli"
        renderLink={renderLink}
        title="lobedocs CLI"
      >
        <Flexbox gap={8} style={{ width: '100%' }}>
          <Snippet language={'bash'}>lobedocs dev</Snippet>
          <Snippet language={'bash'}>lobedocs build</Snippet>
        </Flexbox>
      </BentoCard>
      <BentoCard
        colSpan={2}
        hint="fetched from this site"
        href="/guide/ai-docs"
        renderLink={renderLink}
        title="llms.txt"
      >
        <LlmsTxtTile />
      </BentoCard>
      <BentoCard
        colSpan={2}
        hint="sidebar from frontmatter"
        href="/file-conventions/component-pages"
        renderLink={renderLink}
        title="Frontmatter"
      >
        <Highlighter language={'yaml'} style={{ fontSize: 12, width: '100%' }} variant={'filled'}>
          {FRONTMATTER_SAMPLE}
        </Highlighter>
      </BentoCard>
    </BentoGrid>
  );
}

import { CodeShowcase, type CodeShowcaseItem } from '@lobehub/ui/awesome';

import Playground from '../../src/Button/demos/Playground';
import Variant from '../../src/Button/demos/Variant';
import ApiPreview from './ApiPreview.mdx';

const EXAMPLES: CodeShowcaseItem[] = [
  {
    code: `---
title: Button
description: Button triggers an action.
category: General
---

import Variants from './demos/Variant.tsx?demo';

<Demo of={Variants} title="Variants" />`,
    key: 'page',
    label: 'index.mdx',
    language: 'mdx',
    preview: <Variant />,
  },
  {
    code: `import { StoryBook, useControls, useCreateStore } from '@lobehub/ui/storybook';

import Button from '../Button';

export default () => {
  const store = useCreateStore();
  const props = useControls({ children: 'Click me', disabled: false }, { store });
  return (
    <StoryBook levaStore={store}>
      <Button {...props} />
    </StoryBook>
  );
};`,
    key: 'playground',
    label: 'demos/Playground.tsx',
    preview: <Playground />,
  },
  {
    code: `export interface ButtonProps {
  /**
   * Native button type.
   * @default 'button'
   */
  htmlType?: 'button' | 'reset' | 'submit';
  /**
   * Visual weight of the button.
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'text';
}`,
    key: 'api',
    label: 'type.ts',
    language: 'ts',
    preview: (
      <div style={{ width: '100%' }}>
        <ApiPreview />
      </div>
    ),
  },
];

export function CodeShowcaseSection() {
  return <CodeShowcase items={EXAMPLES} />;
}

import { StoryBook, useControls, useCreateStore } from '@lobehub/ui/storybook';

import Button from '../Button';
import type { ButtonProps } from '../type';

export default () => {
  const store = useCreateStore();
  const control = useControls(
    {
      children: 'Click me',
      disabled: false,
      variant: {
        options: ['default', 'primary', 'text'],
        value: 'primary',
      },
    },
    { store },
  ) as ButtonProps;

  return (
    <StoryBook levaStore={store}>
      <Button {...control} />
    </StoryBook>
  );
};

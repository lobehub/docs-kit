import { Flexbox } from '@lobehub/ui';

import Button from '../Button';

export default () => (
  <Flexbox horizontal gap={8}>
    <Button variant="primary">Primary</Button>
    <Button>Default</Button>
    <Button variant="text">Text</Button>
  </Flexbox>
);

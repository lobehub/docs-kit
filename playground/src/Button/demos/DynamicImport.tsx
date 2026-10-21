import { useEffect, useState } from 'react';

import Button from '../Button';

export default () => {
  const [label, setLabel] = useState('Loading…');

  useEffect(() => {
    void import('./labels').then(({ greeting }) => setLabel(greeting));
  }, []);

  return <Button>{label}</Button>;
};

import type { HTMLAttributes, ReactNode } from 'react';

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Body of the callout.
   */
  children?: ReactNode;
  /**
   * Bold heading shown above the body.
   */
  title?: ReactNode;
  /**
   * Tone of the callout, which sets the accent colour.
   * @default 'info'
   */
  type?: 'info' | 'tip' | 'warning';
}

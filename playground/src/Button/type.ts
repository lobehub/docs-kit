import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * Content rendered inside the button.
   */
  children?: ReactNode;
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
}

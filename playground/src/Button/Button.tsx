import type { ButtonProps } from './type';

const variantStyles = {
  default: { background: 'transparent', border: '1px solid currentColor' },
  primary: { background: '#1677ff', border: '1px solid #1677ff', color: '#fff' },
  text: { background: 'transparent', border: '1px solid transparent' },
} as const;

const Button = ({
  children,
  htmlType = 'button',
  style,
  variant = 'default',
  ...rest
}: ButtonProps) => (
  <button
    style={{ borderRadius: 6, padding: '4px 12px', ...variantStyles[variant], ...style }}
    type={htmlType}
    {...rest}
  >
    {children}
  </button>
);

export default Button;

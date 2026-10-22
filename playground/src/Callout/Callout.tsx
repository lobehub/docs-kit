import type { CalloutProps } from './type';

const accents = {
  info: '#1677ff',
  tip: '#52c41a',
  warning: '#faad14',
} as const;

const Callout = ({ children, style, title, type = 'info', ...rest }: CalloutProps) => (
  <div
    role="note"
    style={{
      background: `color-mix(in srgb, ${accents[type]} 8%, transparent)`,
      borderInlineStart: `3px solid ${accents[type]}`,
      borderRadius: 6,
      lineHeight: 1.6,
      margin: '16px 0',
      padding: '10px 14px',
      ...style,
    }}
    {...rest}
  >
    {title ? <strong style={{ display: 'block', marginBlockEnd: 2 }}>{title}</strong> : null}
    {children}
  </div>
);

export default Callout;

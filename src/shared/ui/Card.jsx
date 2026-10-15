import { cn } from '@/shared/lib/cn';

/**
 * Clean surface card with 1px border, no shadow, and default radius.
 * @param {Object} props
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 * @param {import('react').ElementType} [props.as]
 */
export function Card({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag
      className={cn(
        'rounded border border-border bg-surface p-4 text-text',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

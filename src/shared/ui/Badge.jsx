import { cn } from '@/shared/lib/cn';

const variants = {
  default: 'border-border bg-bg text-text',
  success: 'border-border bg-surface text-text font-semibold',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  accent: 'border-accent bg-accent text-accent-fg',
};

/**
 * Clean status badge with 1px border.
 * @param {Object} props
 * @param {'default'|'success'|'danger'|'accent'} [props.variant]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({ variant = 'default', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

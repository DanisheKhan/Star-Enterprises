import { cn } from '@/shared/lib/cn';

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded px-4 text-base font-semibold ' +
  'transition-opacity duration-150 focus-visible:outline focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-accent ' +
  'disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

const variants = {
  solid: 'bg-accent text-accent-fg hover:opacity-90 active:opacity-80',
  outline: 'border border-border text-text bg-surface hover:opacity-80 active:opacity-70',
  danger: 'bg-danger text-accent-fg hover:opacity-90 active:opacity-80',
  subtle: 'bg-bg text-text border border-border hover:opacity-80',
};

const sizes = {
  sm: 'min-h-8 px-3 text-sm',
  md: 'min-h-11 px-4 text-base',
  lg: 'min-h-12 px-6 text-base',
};

/**
 * @param {Object} props
 * @param {'solid'|'outline'|'danger'|'subtle'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {boolean} [props.pending]
 * @param {import('react').ElementType} [props.as]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} [props.children]
 */
export function Button({
  variant = 'solid',
  size = 'md',
  pending = false,
  as: Tag = 'button',
  className,
  children,
  ...rest
}) {
  const isButton = Tag === 'button';
  return (
    <Tag
      className={cn(base, variants[variant], sizes[size], className)}
      {...(isButton ? { type: rest.type ?? 'button', disabled: pending || rest.disabled } : {})}
      aria-busy={pending || undefined}
      {...rest}
    >
      {pending ? (
        <span className="inline-block animate-spin mr-2">⟳</span>
      ) : null}
      {children}
    </Tag>
  );
}

import { cn } from '@/shared/lib/cn';

/**
 * Centered responsive container without horizontal scroll.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export function Container({ size = 'xl', className, children, ...rest }) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6', sizes[size], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

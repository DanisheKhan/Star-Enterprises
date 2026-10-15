import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {string} [props.error]
 * @param {string} [props.className]
 * @param {Array<{value: string, label: string}>} [props.options]
 */
export const Select = forwardRef(function Select(
  { id, label, hint, error, options = [], className, children, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-text uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full min-h-11 rounded-2xl border bg-surface px-4 py-2.5 text-sm text-text transition-colors',
          'border-border',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
          error && 'border-danger focus-visible:outline-danger',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

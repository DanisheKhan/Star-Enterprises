import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
export const Input = forwardRef(function Input(
  { id, label, hint, error, className, ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full min-h-11 rounded border bg-surface px-3 py-2 text-base text-text',
          'border-border placeholder:text-muted',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent',
          error && 'border-danger focus-visible:outline-danger',
          className
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger font-medium">
          {error}
        </p>
      )}
    </div>
  );
});

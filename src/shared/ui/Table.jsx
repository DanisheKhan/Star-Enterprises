import { cn } from '@/shared/lib/cn';

/**
 * Responsive data table wrapper that isolates horizontal scrolling to its container.
 * @param {Object} props
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export function Table({ className, children, ...rest }) {
  return (
    <div className="w-full overflow-x-auto rounded border border-border bg-surface min-w-0">
      <table className={cn('w-full text-left border-collapse text-sm', className)} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, children, ...rest }) {
  return (
    <thead className={cn('bg-bg border-b border-border text-xs uppercase font-semibold text-muted', className)} {...rest}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...rest }) {
  return (
    <tbody className={cn('divide-y divide-border text-text', className)} {...rest}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...rest }) {
  return (
    <tr className={cn('hover:bg-bg/40 transition-colors', className)} {...rest}>
      {children}
    </tr>
  );
}

export function TableCell({ className, children, ...rest }) {
  return (
    <td className={cn('px-4 py-3 align-middle', className)} {...rest}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ className, children, ...rest }) {
  return (
    <th className={cn('px-4 py-3 align-middle font-semibold', className)} {...rest}>
      {children}
    </th>
  );
}

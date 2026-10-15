import { useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import { X } from 'lucide-react';

/**
 * Clean accessible modal dialog without glassmorphism or heavy shadows.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export function Modal({ isOpen, onClose, title, className, children }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-lg rounded border border-border bg-surface p-6 text-text',
          'max-h-[90vh] overflow-y-auto min-w-0',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted hover:text-text rounded transition-opacity cursor-pointer ml-auto"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

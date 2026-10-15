import { useEffect } from 'react';
import { cn } from '@/shared/lib/cn';
import { X } from 'lucide-react';

/**
 * Clean accessible modal dialog with modern rounded-2xl curves.
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
          'relative w-full max-w-lg rounded-3xl border border-border bg-surface text-text',
          'max-h-[90vh] flex flex-col overflow-hidden min-w-0 shadow-sm',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-border bg-surface shrink-0">
            {title ? (
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            ) : (
              <div />
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-muted hover:text-text rounded-full hover:bg-bg transition-colors cursor-pointer ml-auto"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

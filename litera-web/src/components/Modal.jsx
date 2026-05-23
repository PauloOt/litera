import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Modal — overlay escuro com card centralizado.
 * isOpen: boolean
 * onClose: função
 * title: string (opcional)
 * children: conteúdo
 */
export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-cream rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-walnut hover:text-espresso transition-colors"
        >
          <X size={20} />
        </button>

        {title && (
          <h2 className="font-display font-semibold text-xl text-espresso mb-4 pr-6">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}

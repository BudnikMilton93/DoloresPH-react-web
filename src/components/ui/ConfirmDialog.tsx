import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '🗑️',
      color: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: '⚠️',
      color: 'text-orange-600',
      buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
    info: {
      icon: 'ℹ️',
      color: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{style.icon}</span>
            <h3 className={`text-lg font-semibold ${style.color}`} style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h3>
          </div>
          
          <p className="text-[var(--color-text)]/80 leading-relaxed mb-6 whitespace-pre-line">
            {message}
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${style.buttonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
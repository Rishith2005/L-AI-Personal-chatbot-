import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="space-y-5">
        {variant === 'danger' && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-xs text-rose-200 font-medium leading-relaxed">{message}</p>
          </div>
        )}

        {variant === 'default' && (
          <p className="text-sm text-white/70 leading-relaxed">{message}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <Button
            onClick={handleConfirm}
            variant={variant === 'danger' ? 'secondary' : 'primary'}
            className={`px-4 py-2 text-xs font-bold cursor-pointer ${
              variant === 'danger'
                ? '!bg-rose-600 !text-white hover:!bg-rose-500 !border-rose-500/30'
                : ''
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const cancelButton = useRef(null);
  const cancelAction = useRef(onCancel);

  useEffect(() => {
    cancelAction.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') cancelAction.current?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    cancelButton.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className={`confirm-dialog__icon confirm-dialog__icon--${tone}`}><AlertTriangle size={20} /></div>
        <div className="confirm-dialog__copy">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog__actions">
          <button ref={cancelButton} className="btn btn--secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className={`btn confirm-dialog__confirm confirm-dialog__confirm--${tone}`} type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body
  );
}
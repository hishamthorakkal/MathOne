import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Make the safe choice (cancel) the big, focused button. */
  safeDefault?: boolean;
}

/**
 * In-app confirmation dialog. Used instead of window.confirm, which some
 * browsers and in-app web views block silently (it just returns false).
 */
export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, safeDefault = false }: Props) {
  const focusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    focusRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="dialog-title">{title}</h2>
        {message && <p>{message}</p>}
        <div className="dialog-actions">
          {safeDefault ? (
            <>
              <button type="button" className="btn btn-soft" onClick={onConfirm}>
                {confirmLabel}
              </button>
              <button type="button" className="btn btn-primary btn-big" onClick={onCancel} ref={focusRef}>
                {cancelLabel}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-soft" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button type="button" className="btn btn-primary btn-big" onClick={onConfirm} ref={focusRef}>
                {confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

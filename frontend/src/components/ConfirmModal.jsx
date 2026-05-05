import { useEffect, useRef } from 'react';

/**
 * Reusable confirmation modal.
 *
 * Props:
 *   open      – boolean, controls visibility
 *   title     – string, modal heading
 *   message   – string, body text
 *   onConfirm – () => void, called when user clicks the confirm button
 *   onCancel  – () => void, called when user dismisses
 *   confirmLabel – string (default "Delete")
 *   confirmStyle – "danger" | "primary" (default "danger")
 */
const ConfirmModal = ({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  confirmStyle = 'danger',
}) => {
  const cancelRef = useRef(null);

  // Focus the cancel button when the modal opens (accessibility)
  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmBg = confirmStyle === 'danger'
    ? { background: '#ef4444', border: '1px solid #dc2626' }
    : { background: 'linear-gradient(135deg,#AA367C,#4A2FBD)', border: 'none' };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      {/* Panel */}
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl p-6 space-y-4"
        style={{ background: '#fff', border: '1px solid #e2e8f0' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="space-y-1">
          <h2 id="confirm-modal-title" className="text-base font-bold" style={{ color: '#1e293b' }}>
            {title}
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>{message}</p>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
            style={{ color: '#64748b', borderColor: '#e2e8f0' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={confirmBg}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

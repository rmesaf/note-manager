import Button from '@/components/Button';

/**
 * Reusable confirmation dialog rendered inside the global ModalWrapper.
 * @description Decouples the "are you sure?" interaction pattern from individual
 * features. The caller provides the message and action callbacks; this component
 * handles only the visual layout and button wiring. By always calling onClose after
 * the user action, it guarantees the modal is dismissed regardless of whether the
 * callback succeeds, preventing stuck-open modals on async errors.
 * @param {Object} props
 * @param {string} props.message - The confirmation question shown to the user.
 * @param {Function} props.onAccept - Callback executed when the user confirms.
 * @param {Function} [props.onCancel] - Callback executed when the user cancels.
 * @param {Function} props.onClose - Injected by ModalProvider to close the dialog.
 * @param {string} [props.acceptText='Aceptar'] - Label for the confirm button.
 * @param {string} [props.cancelText='Cancelar'] - Label for the cancel button.
 * @returns {JSX.Element}
 */
const ConfirmModal = ({
  message,
  onAccept,
  onCancel,
  onClose,
  acceptText = 'Aceptar',
  cancelText = 'Cancelar',
}) => {
  const handleAccept = () => {
    onAccept?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative font-workSans">
      {/* Close icon */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 text-doveGray hover:text-ink transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Message */}
      <p className="text-ink text-base leading-relaxed pr-6 font-literata">{message}</p>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button variant="full" onClick={handleAccept}>
          {acceptText}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmModal;

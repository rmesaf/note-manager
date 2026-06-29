'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Portal-based structural shell for all modals.
 * @description Renders its children outside the normal React tree (into the dedicated
 * `<div id="modal-root">` element defined in the root layout) via createPortal,
 * preventing z-index conflicts with any stacking context in the app. Using a dedicated
 * portal root instead of document.body keeps the DOM semantically clean and makes
 * portal content trivially identifiable in DevTools and tests.
 * Manages three cross-cutting accessibility concerns so individual modal components
 * don't need to re-implement them: scroll lock, Escape key dismissal, and backdrop click.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The modal component to render inside the wrapper.
 * @param {Function} props.onClose - Callback to close the modal, injected by ModalProvider.
 * @returns {React.Portal|null}
 */
const ModalWrapper = ({ children, onClose }) => {
  const portalRoot = document.getElementById('modal-root');
  useEffect(() => {
    /**
     * Locks background scroll while the modal is mounted.
     * @description Without this, users can scroll the page behind the backdrop,
     * which creates a disorienting UX. The class is cleaned up on unmount to
     * restore normal scroll behavior regardless of how the modal is closed.
     */
    document.body.classList.add('overflow-hidden');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!portalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      {children}
    </div>,
    portalRoot
  );
};

export default ModalWrapper;

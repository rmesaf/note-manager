'use client';

import { createContext, useContext, useState } from 'react';
import ModalWrapper from '@/components/ModalWrapper';

/**
 * @typedef {Object} ModalContextValue
 * @property {Function} openModal - Opens a modal with a given component and props.
 * @property {Function} closeModal - Closes the currently active modal.
 */

const ModalContext = createContext(null);

/**
 * Global modal state provider.
 * @description Centralizes modal lifecycle management in a single context so any
 * component in the tree can open or close a modal without prop-drilling or local
 * state duplication. Stores the modal component and its props separately to allow
 * ModalWrapper to instantiate it dynamically with an injected onClose callback.
 * @param {Object} props
 * @param {React.ReactNode} props.children - The application subtree.
 * @returns {JSX.Element}
 */
export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalProps, setModalProps] = useState({});

  /**
   * Opens a modal by registering its component and props in context state.
   * @description Accepts a component reference (not JSX) so ModalWrapper can inject
   * the onClose prop at render time, keeping the caller decoupled from close logic.
   * @param {React.ComponentType} content - The modal component to render.
   * @param {Object} [props={}] - Props to pass to the modal component.
   * @returns {void}
   */
  const openModal = (content, props = {}) => {
    setModalContent(() => content);
    setModalProps(props);
    setIsOpen(true);
  };

  /**
   * Closes the active modal and resets context state.
   * @description Called either by ModalWrapper's backdrop/Escape handler or by the
   * modal component itself via the injected onClose prop.
   * @returns {void}
   */
  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <ModalWrapper onClose={closeModal}>
          {modalContent && (() => {
            const ModalComponent = modalContent;
            return <ModalComponent {...modalProps} onClose={closeModal} />;
          })()}
        </ModalWrapper>
      )}
    </ModalContext.Provider>
  );
};

/**
 * Consumes the global modal context.
 * @description Must be used within a ModalProvider. Throws a descriptive error when
 * called outside the provider tree so misconfiguration is caught early during development.
 * @returns {ModalContextValue} Object exposing openModal and closeModal.
 */
export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider.');
  }

  return context;
};

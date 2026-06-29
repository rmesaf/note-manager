/**
 * Unit tests for ModalContext — ModalProvider and useModal hook.
 *
 * @description Tests the lifecycle management logic of the global modal system
 * without examining the visual internals of any specific modal component.
 * "No UI testing" is interpreted as: do not assert on ConfirmModal buttons,
 * typography, or design tokens. Asserting whether a portal/dialog landmark is
 * mounted or unmounted IS valid — it is the observable side-effect of context
 * state changes (isOpen), not a UI styling concern.
 *
 * Strategy:
 *  - renderHook(() => useModal(), { wrapper }) gives access to openModal /
 *    closeModal without rendering a full React tree.
 *  - act() batches state updates so hook results are stable before asserting.
 *  - Minimal stub components (TestModal) are used only to verify that
 *    ModalProvider correctly forwards props and injects onClose — they render
 *    a single data-testid div with no visual assertions.
 *
 * Test tool chain:
 *  - Vitest       — test runner and assertion engine.
 *  - renderHook   — exercises the hook in a controlled React tree.
 *  - act          — flushes React state updates synchronously.
 *  - screen       — queries the full document (including portals).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { ModalProvider, useModal } from './ModalContext';

// ---------------------------------------------------------------------------
// Lifecycle: ModalWrapper (used inside ModalProvider) now portals into
// <div id="modal-root">. The element must exist before any test that calls
// openModal, otherwise createPortal returns null and the modal never renders.
// ---------------------------------------------------------------------------

let modalRoot;

beforeEach(() => {
  modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
});

afterEach(() => {
  document.body.removeChild(modalRoot);
});

// ---------------------------------------------------------------------------
// Shared wrapper: mounts every hook inside a ModalProvider.
// ---------------------------------------------------------------------------

/**
 * Wraps the rendered hook in the global ModalProvider so context is available.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const wrapper = ({ children }) => <ModalProvider>{children}</ModalProvider>;

// ---------------------------------------------------------------------------
// Minimal stub modal — renders only a testid so tests can assert on
// mount/unmount without testing any visual UI.
// ---------------------------------------------------------------------------

const TestModal = ({ message, onClose }) => (
  <div data-testid="test-modal" data-message={message}>
    <button onClick={onClose} data-testid="modal-close-btn">
      Close
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// useModal — guard: must be inside ModalProvider
// ---------------------------------------------------------------------------

describe('useModal — provider guard', () => {
  it('throws a descriptive error when called outside ModalProvider', () => {
    // Silence the React error boundary console output for this test.
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => renderHook(() => useModal())).toThrow(
      'useModal must be used within a ModalProvider.'
    );

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// useModal — return value
// ---------------------------------------------------------------------------

describe('useModal — return value', () => {
  it('returns an openModal function', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    expect(typeof result.current.openModal).toBe('function');
  });

  it('returns a closeModal function', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    expect(typeof result.current.closeModal).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// openModal — mounts the modal in the DOM
// ---------------------------------------------------------------------------

describe('useModal — openModal', () => {
  it('mounts a dialog landmark in the document after openModal is called', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(TestModal, {});
    });

    // ModalWrapper renders the backdrop with role="dialog".
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('mounts the modal component returned by the content factory', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(TestModal, {});
    });

    expect(screen.getByTestId('test-modal')).toBeInTheDocument();
  });

  it('forwards the props object to the modal component', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(TestModal, { message: 'confirm-payload' });
    });

    expect(screen.getByTestId('test-modal')).toHaveAttribute(
      'data-message',
      'confirm-payload'
    );
  });

  it('injects onClose into the modal component as a function prop', () => {
    let capturedOnClose;

    const SpyModal = ({ onClose }) => {
      capturedOnClose = onClose;
      return <div data-testid="spy-modal" />;
    };

    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(SpyModal, {});
    });

    expect(typeof capturedOnClose).toBe('function');
  });

  it('replaces any previously open modal when called a second time', () => {
    const ModalA = () => <div data-testid="modal-a" />;
    const ModalB = () => <div data-testid="modal-b" />;

    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(ModalA, {});
    });

    act(() => {
      result.current.openModal(ModalB, {});
    });

    expect(screen.queryByTestId('modal-a')).not.toBeInTheDocument();
    expect(screen.getByTestId('modal-b')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// closeModal — unmounts the modal from the DOM
// ---------------------------------------------------------------------------

describe('useModal — closeModal', () => {
  it('removes the dialog landmark after closeModal is called', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(TestModal, {});
    });

    act(() => {
      result.current.closeModal();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes the modal component from the document after closeModal', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(TestModal, {});
    });

    act(() => {
      result.current.closeModal();
    });

    expect(screen.queryByTestId('test-modal')).not.toBeInTheDocument();
  });

  it('injected onClose from the provider calls closeModal correctly', () => {
    let injectedOnClose;

    const CapturingModal = ({ onClose }) => {
      injectedOnClose = onClose;
      return <div data-testid="capturing-modal" />;
    };

    const { result } = renderHook(() => useModal(), { wrapper });

    act(() => {
      result.current.openModal(CapturingModal, {});
    });

    // Call the onClose injected into the modal — should dismiss it.
    act(() => {
      injectedOnClose();
    });

    expect(screen.queryByTestId('capturing-modal')).not.toBeInTheDocument();
  });

  it('calling closeModal when no modal is open does not throw', () => {
    const { result } = renderHook(() => useModal(), { wrapper });

    expect(() => {
      act(() => {
        result.current.closeModal();
      });
    }).not.toThrow();
  });
});

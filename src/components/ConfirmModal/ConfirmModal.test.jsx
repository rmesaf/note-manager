/**
 * Unit tests for the ConfirmModal component.
 *
 * @description Covers every behavioral scenario defined in specs/ConfirmModal.md.
 * Tests are split into two layers matching the two-component architecture:
 *
 *  1. ConfirmModal in isolation — tests the card UI, message text, button labels,
 *     and callback wiring (onAccept / onCancel / onClose) without any portal.
 *
 *  2. ModalWrapper integration — mounts ConfirmModal inside ModalWrapper to test
 *     the behaviors ModalWrapper owns: ARIA dialog landmark, Escape key dismissal,
 *     and backdrop click. createPortal works in JSDOM (it appends to document.body)
 *     and RTL's `screen` searches the entire document, so portal content is found
 *     by the same queries used for non-portal content.
 *
 * Test tool chain:
 *  - Vitest    — test runner and assertion engine.
 *  - RTL       — component rendering in JSDOM.
 *  - userEvent — realistic keyboard and pointer event simulation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';
import ModalWrapper from '@/components/ModalWrapper';

// ---------------------------------------------------------------------------
// Lifecycle: the integration tests (Section 2) render ModalWrapper, which now
// portals into <div id="modal-root">. The element must be present in JSDOM
// before those tests run. It is safe to create it for every test — the isolated
// Section 1 tests never mount ModalWrapper so the div is unused but harmless.
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
// Shared defaults used across multiple tests.
// ---------------------------------------------------------------------------

const DEFAULT_PROPS = {
  message: 'Are you sure you want to delete this note?',
  onAccept: vi.fn(),
  onCancel: vi.fn(),
  onClose: vi.fn(),
};

// ---------------------------------------------------------------------------
// SECTION 1 — ConfirmModal in isolation
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Message rendering
// Gherkin: "Modal card displays the confirmation message"
// ---------------------------------------------------------------------------

describe('ConfirmModal — message', () => {
  it('renders the message prop as visible text', () => {
    render(<ConfirmModal {...DEFAULT_PROPS} />);

    expect(
      screen.getByText('Are you sure you want to delete this note?')
    ).toBeInTheDocument();
  });

  it('message is rendered inside a <p> element', () => {
    render(<ConfirmModal {...DEFAULT_PROPS} />);

    expect(
      screen.getByText('Are you sure you want to delete this note?').tagName
    ).toBe('P');
  });
});

// ---------------------------------------------------------------------------
// Default button labels
// Gherkin: "Modal card shows default button labels"
// ---------------------------------------------------------------------------

describe('ConfirmModal — default button labels', () => {
  it('renders a button labelled "Aceptar" by default', () => {
    render(<ConfirmModal {...DEFAULT_PROPS} />);

    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
  });

  it('renders a button labelled "Cancelar" by default', () => {
    render(<ConfirmModal {...DEFAULT_PROPS} />);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Custom button labels
// Gherkin: "Modal card shows custom button labels"
// ---------------------------------------------------------------------------

describe('ConfirmModal — custom button labels', () => {
  it('renders the custom acceptText label', () => {
    render(
      <ConfirmModal {...DEFAULT_PROPS} acceptText="Delete" cancelText="Keep" />
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('renders the custom cancelText label', () => {
    render(
      <ConfirmModal {...DEFAULT_PROPS} acceptText="Delete" cancelText="Keep" />
    );

    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Close (X) icon button
// ---------------------------------------------------------------------------

describe('ConfirmModal — close icon button', () => {
  it('renders a button with aria-label="Close modal"', () => {
    render(<ConfirmModal {...DEFAULT_PROPS} />);

    expect(
      screen.getByRole('button', { name: 'Close modal' })
    ).toBeInTheDocument();
  });

  it('close icon SVG has aria-hidden="true"', () => {
    const { container } = render(<ConfirmModal {...DEFAULT_PROPS} />);

    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Accept interaction
// Gherkin: "User confirms the action"
// ---------------------------------------------------------------------------

describe('ConfirmModal — accept interaction', () => {
  it('calls onAccept once when the accept button is clicked', async () => {
    const onAccept = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal {...DEFAULT_PROPS} onAccept={onAccept} onClose={onClose} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onClose once after clicking the accept button', async () => {
    const onAccept = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal {...DEFAULT_PROPS} onAccept={onAccept} onClose={onClose} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onAccept before onClose', async () => {
    const callOrder = [];
    const onAccept = vi.fn(() => callOrder.push('accept'));
    const onClose = vi.fn(() => callOrder.push('close'));
    render(
      <ConfirmModal {...DEFAULT_PROPS} onAccept={onAccept} onClose={onClose} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Aceptar' }));

    expect(callOrder).toEqual(['accept', 'close']);
  });
});

// ---------------------------------------------------------------------------
// Cancel interaction
// Gherkin: "User cancels the action"
// ---------------------------------------------------------------------------

describe('ConfirmModal — cancel interaction', () => {
  it('calls onCancel once when the cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal {...DEFAULT_PROPS} onCancel={onCancel} onClose={onClose} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onClose once after clicking the cancel button', async () => {
    const onCancel = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal {...DEFAULT_PROPS} onCancel={onCancel} onClose={onClose} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Close icon click
// Gherkin: "User closes via the X icon button"
// ---------------------------------------------------------------------------

describe('ConfirmModal — close icon click', () => {
  it('calls onClose once when the X button is clicked', async () => {
    const onClose = vi.fn();
    const onAccept = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        {...DEFAULT_PROPS}
        onClose={onClose}
        onAccept={onAccept}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onAccept when the X button is clicked', async () => {
    const onClose = vi.fn();
    const onAccept = vi.fn();
    render(
      <ConfirmModal {...DEFAULT_PROPS} onClose={onClose} onAccept={onAccept} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onAccept).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Optional onCancel
// Gherkin: "Cancel is optional — no error when onCancel is not provided"
// ---------------------------------------------------------------------------

describe('ConfirmModal — optional onCancel', () => {
  it('does not throw when onCancel is undefined and cancel is clicked', async () => {
    const onClose = vi.fn();
    render(
      <ConfirmModal
        message="Confirm?"
        onAccept={vi.fn()}
        onClose={onClose}
        // onCancel intentionally omitted
      />
    );

    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    ).resolves.not.toThrow();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// SECTION 2 — ModalWrapper integration
// Tests behaviors owned by ModalWrapper: ARIA, Escape key, backdrop click.
// ---------------------------------------------------------------------------

/**
 * Renders ConfirmModal inside ModalWrapper and returns the onClose mock.
 * @param {Object} [overrides] - Additional ConfirmModal props.
 * @returns {{ onClose: Function }} The mocked onClose spy.
 */
const renderWithWrapper = (overrides = {}) => {
  const onClose = vi.fn();
  render(
    <ModalWrapper onClose={onClose}>
      <ConfirmModal
        message="Confirm?"
        onAccept={vi.fn()}
        onClose={onClose}
        {...overrides}
      />
    </ModalWrapper>
  );
  return { onClose };
};

// ---------------------------------------------------------------------------
// ARIA dialog landmark
// Gherkin: "Modal backdrop has the correct ARIA attributes"
// ---------------------------------------------------------------------------

describe('ConfirmModal + ModalWrapper — ARIA attributes', () => {
  it('backdrop overlay has role="dialog"', () => {
    renderWithWrapper();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('backdrop overlay has aria-modal="true"', () => {
    renderWithWrapper();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

// ---------------------------------------------------------------------------
// Escape key dismissal
// Gherkin: "User dismisses the modal by pressing Escape"
// ---------------------------------------------------------------------------

describe('ConfirmModal + ModalWrapper — Escape key', () => {
  it('calls onClose once when the Escape key is pressed', async () => {
    const { onClose } = renderWithWrapper();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Backdrop click dismissal
// Gherkin: "User dismisses the modal by clicking the backdrop"
// ---------------------------------------------------------------------------

describe('ConfirmModal + ModalWrapper — backdrop click', () => {
  it('calls onClose when the user clicks directly on the backdrop overlay', async () => {
    const { onClose } = renderWithWrapper();

    // The dialog element IS the backdrop overlay. Clicking it directly (not
    // a child element) satisfies the e.target === e.currentTarget guard in
    // ModalWrapper's handleBackdropClick handler.
    await userEvent.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when the user clicks inside the card', async () => {
    const { onClose } = renderWithWrapper();

    // Clicking the message paragraph (a child of the card, not the backdrop)
    // does NOT satisfy e.target === e.currentTarget, so onClose is not called.
    await userEvent.click(screen.getByText('Confirm?'));

    expect(onClose).not.toHaveBeenCalled();
  });
});

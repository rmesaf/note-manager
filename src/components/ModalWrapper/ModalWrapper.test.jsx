/**
 * Unit tests for the ModalWrapper component.
 *
 * @description ModalWrapper is the portal-based structural shell for all modals.
 * It uses createPortal(children, document.body) — the portal target IS document.body
 * itself, so no custom #modal-root element needs to be injected. However, the
 * beforeEach/afterEach blocks below explicitly track body class state and ensure
 * each test starts from a clean DOM, guarding against overflow-hidden leakage
 * between tests if a previous test fails to unmount cleanly.
 *
 * createPortal behaviour in JSDOM:
 *  The portal appends its content to document.body as a sibling of RTL's container
 *  div. RTL's `screen` queries the entire document, so portal content is found by
 *  getByRole, getByText, etc. — no special configuration needed.
 *
 * Responsibilities under test:
 *  ✓ Children are rendered and visible.
 *  ✓ Backdrop carries role="dialog" and aria-modal="true".
 *  ✓ Escape key calls onClose.
 *  ✓ Clicking the backdrop directly calls onClose.
 *  ✓ Clicking inside a child element does NOT call onClose.
 *  ✓ document.body receives overflow-hidden on mount.
 *  ✓ document.body loses overflow-hidden on unmount.
 *
 * Test tool chain:
 *  - Vitest    — test runner and assertion engine.
 *  - RTL       — component rendering in JSDOM.
 *  - userEvent — realistic keyboard and pointer simulation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalWrapper from './ModalWrapper';

// ---------------------------------------------------------------------------
// Lifecycle: create and destroy the dedicated portal root before every test.
// ModalWrapper now portals into <div id="modal-root"> instead of document.body,
// so the element must exist in JSDOM before ModalWrapper mounts.
// ---------------------------------------------------------------------------

let modalRoot;

beforeEach(() => {
  modalRoot = document.createElement('div');
  modalRoot.setAttribute('id', 'modal-root');
  document.body.appendChild(modalRoot);
  document.body.classList.remove('overflow-hidden');
});

afterEach(() => {
  document.body.removeChild(modalRoot);
  document.body.classList.remove('overflow-hidden');
});

// ---------------------------------------------------------------------------
// Children rendering
// ---------------------------------------------------------------------------

describe('ModalWrapper — children rendering', () => {
  it('renders children content in the document', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <div data-testid="modal-card">Modal content</div>
      </ModalWrapper>
    );

    expect(screen.getByTestId('modal-card')).toBeInTheDocument();
  });

  it('renders text children visible to the user', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <p>Are you sure?</p>
      </ModalWrapper>
    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders multiple children inside the backdrop', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <div data-testid="child-a">A</div>
        <div data-testid="child-b">B</div>
      </ModalWrapper>
    );

    expect(screen.getByTestId('child-a')).toBeInTheDocument();
    expect(screen.getByTestId('child-b')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// ARIA dialog landmark
// ---------------------------------------------------------------------------

describe('ModalWrapper — ARIA dialog', () => {
  it('backdrop overlay has role="dialog"', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <div>Content</div>
      </ModalWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('backdrop overlay has aria-modal="true"', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <div>Content</div>
      </ModalWrapper>
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('children are nested inside the dialog landmark', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <div data-testid="card">Card</div>
      </ModalWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toContainElement(screen.getByTestId('card'));
  });
});

// ---------------------------------------------------------------------------
// Escape key dismissal
// ---------------------------------------------------------------------------

describe('ModalWrapper — Escape key', () => {
  it('calls onClose once when the Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(
      <ModalWrapper onClose={onClose}>
        <div>Content</div>
      </ModalWrapper>
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when a non-Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(
      <ModalWrapper onClose={onClose}>
        <div>Content</div>
      </ModalWrapper>
    );

    await userEvent.keyboard('{Enter}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes the keydown listener after unmount', async () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <ModalWrapper onClose={onClose}>
        <div>Content</div>
      </ModalWrapper>
    );

    unmount();

    // After unmount the listener is cleaned up — pressing Escape has no effect.
    await userEvent.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Backdrop click dismissal
// ---------------------------------------------------------------------------

describe('ModalWrapper — backdrop click', () => {
  it('calls onClose when the user clicks directly on the backdrop', async () => {
    const onClose = vi.fn();
    render(
      <ModalWrapper onClose={onClose}>
        <div data-testid="card">Card</div>
      </ModalWrapper>
    );

    // Click the dialog element itself (backdrop) — satisfies e.target === e.currentTarget.
    await userEvent.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the user clicks inside a child element', async () => {
    const onClose = vi.fn();
    render(
      <ModalWrapper onClose={onClose}>
        <div data-testid="card">Card content</div>
      </ModalWrapper>
    );

    // Click a child — e.target !== e.currentTarget, guard not satisfied.
    await userEvent.click(screen.getByTestId('card'));

    expect(onClose).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Scroll lock
// ---------------------------------------------------------------------------

describe('ModalWrapper — scroll lock', () => {
  it('adds overflow-hidden to document.body on mount', () => {
    render(
      <ModalWrapper onClose={vi.fn()}>
        <div>Content</div>
      </ModalWrapper>
    );

    expect(document.body.classList.contains('overflow-hidden')).toBe(true);
  });

  it('removes overflow-hidden from document.body on unmount', () => {
    const { unmount } = render(
      <ModalWrapper onClose={vi.fn()}>
        <div>Content</div>
      </ModalWrapper>
    );

    unmount();

    expect(document.body.classList.contains('overflow-hidden')).toBe(false);
  });
});

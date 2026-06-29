/**
 * Unit tests for the EmptyState component.
 *
 * @description Covers every behavioral scenario defined in specs/EmptyState.md,
 * derived through reverse engineering of EmptyState.jsx.
 *
 * Dependency notes:
 *  - Button (@/components/Button) is rendered as-is (no mock). Its own test
 *    suite validates its internals; here we only care that it renders a clickable
 *    element labelled "New Note" and wires onClick correctly.
 *  - next/link is imported inside EmptyState.jsx but is UNUSED in the JSX.
 *    It is mocked here as a safety net to prevent any accidental Next.js
 *    runtime context requirement from leaking into the JSDOM environment.
 *
 * DOM structure:
 *   <div class="flex flex-col ...">          ← root wrapper (no ARIA role/testid)
 *     <svg aria-hidden="true" .../>          ← decorative illustration
 *     <h2>No notes yet.</h2>
 *     <p>Start writing your masterpiece!</p>
 *     <button>New Note</button>              ← rendered by Button component
 *   </div>
 *
 * Test tool chain:
 *  - Vitest    — test runner and assertion engine.
 *  - RTL       — component rendering in JSDOM.
 *  - userEvent — realistic click simulation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from './EmptyState';

// ---------------------------------------------------------------------------
// Mock next/link (unused inside EmptyState but present as a dead import).
// ---------------------------------------------------------------------------

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ---------------------------------------------------------------------------
// Decorative SVG illustration
// Gherkin: "Decorative illustration is rendered with correct accessibility attributes"
// ---------------------------------------------------------------------------

describe('EmptyState — decorative SVG', () => {
  it('renders an SVG element in the DOM', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('SVG has aria-hidden="true" so screen readers skip the decoration', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('SVG has the expected size classes (w-16 h-16)', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.querySelector('svg')).toHaveClass('w-16', 'h-16');
  });

  it('SVG uses the sand color class', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.querySelector('svg')).toHaveClass('text-sand');
  });
});

// ---------------------------------------------------------------------------
// Main heading
// Gherkin: "Main heading is displayed"
// ---------------------------------------------------------------------------

describe('EmptyState — main heading', () => {
  it('renders a level-2 heading', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('heading text reads "No notes yet."', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'No notes yet.' })
    ).toBeInTheDocument();
  });

  it('heading has the expected typography classes', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    const heading = screen.getByRole('heading', { level: 2 });

    expect(heading).toHaveClass('text-xl', 'font-semibold', 'text-ink', 'font-workSans');
  });
});

// ---------------------------------------------------------------------------
// Subtitle paragraph
// Gherkin: "Descriptive subtitle is displayed"
// ---------------------------------------------------------------------------

describe('EmptyState — subtitle', () => {
  it('renders the subtitle paragraph', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(
      screen.getByText('Start writing your masterpiece!')
    ).toBeInTheDocument();
  });

  it('subtitle is a <p> element', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(
      screen.getByText('Start writing your masterpiece!').tagName
    ).toBe('P');
  });

  it('subtitle has the expected typography classes', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(
      screen.getByText('Start writing your masterpiece!')
    ).toHaveClass('text-sm', 'text-doveGray', 'font-workSans');
  });
});

// ---------------------------------------------------------------------------
// Call-to-action button
// Gherkin: "Call-to-action button is rendered with the correct label"
// ---------------------------------------------------------------------------

describe('EmptyState — CTA button', () => {
  it('renders a button labelled "New Note"', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'New Note' })).toBeInTheDocument();
  });

  it('CTA button is visible (not disabled by default)', () => {
    render(<EmptyState onCreateClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'New Note' })).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// CTA click interaction
// Gherkin: "User clicks the call-to-action button"
// ---------------------------------------------------------------------------

describe('EmptyState — CTA click interaction', () => {
  it('calls onCreateClick once when "New Note" is clicked', async () => {
    const handleCreate = vi.fn();
    render(<EmptyState onCreateClick={handleCreate} />);

    await userEvent.click(screen.getByRole('button', { name: 'New Note' }));

    expect(handleCreate).toHaveBeenCalledTimes(1);
  });

  it('does not call onCreateClick before the button is clicked', () => {
    const handleCreate = vi.fn();
    render(<EmptyState onCreateClick={handleCreate} />);

    expect(handleCreate).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Root wrapper layout
// Gherkin: "Container applies vertical centering layout"
// ---------------------------------------------------------------------------

describe('EmptyState — root wrapper layout', () => {
  it('root wrapper has flex and flex-col classes', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.firstChild).toHaveClass('flex', 'flex-col');
  });

  it('root wrapper has items-center and justify-center classes', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.firstChild).toHaveClass('items-center', 'justify-center');
  });

  it('root wrapper has text-center class', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.firstChild).toHaveClass('text-center');
  });

  it('root wrapper has py-20 for generous vertical padding', () => {
    const { container } = render(<EmptyState onCreateClick={vi.fn()} />);

    expect(container.firstChild).toHaveClass('py-20');
  });
});

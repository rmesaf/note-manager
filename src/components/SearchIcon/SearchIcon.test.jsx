/**
 * Unit tests for the SearchIcon component.
 *
 * @description Covers every scenario defined in specs/SearchIcon.md.
 * SearchIcon renders an inline SVG whose accessibility role and aria attributes
 * switch dynamically based on whether an aria-label prop is supplied.
 *
 * Query strategy:
 *  - Decorative mode (no aria-label): SVG has role="presentation".
 *    getByRole('presentation') does not exist in RTL (presentation is not a
 *    widget role recognised by the accessibility tree), so the element is
 *    located via container.querySelector('svg') and attributes are asserted
 *    directly.
 *  - Descriptive mode (aria-label provided): SVG has role="img" and can be
 *    reached with getByRole('img', { name: '...' }).
 *
 * No mocks required — SearchIcon has no external dependencies.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchIcon from './SearchIcon';

// ---------------------------------------------------------------------------
// Helper: renders SearchIcon and returns the SVG node.
// ---------------------------------------------------------------------------

/**
 * Renders SearchIcon with the given props and returns the root SVG element.
 * @param {Object} [props] - Props forwarded to SearchIcon.
 * @returns {{ container: HTMLElement, svg: SVGElement }}
 */
const renderIcon = (props = {}) => {
  const { container } = render(<SearchIcon {...props} />);
  return { container, svg: container.querySelector('svg') };
};

// ---------------------------------------------------------------------------
// Default rendering
// ---------------------------------------------------------------------------

describe('SearchIcon — default rendering', () => {
  it('renders an SVG element in the DOM', () => {
    const { svg } = renderIcon();

    expect(svg).toBeInTheDocument();
  });

  it('SVG contains the expected circle path element', () => {
    const { container } = renderIcon();

    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('SVG contains the diagonal line path element', () => {
    const { container } = renderIcon();

    expect(container.querySelector('path')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Decorative mode (no aria-label)
// Gherkin: "Icon is decorative by default (no aria-label)"
// ---------------------------------------------------------------------------

describe('SearchIcon — decorative mode (no aria-label)', () => {
  it('has aria-hidden="true" when no aria-label is provided', () => {
    const { svg } = renderIcon();

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('has role="presentation" when no aria-label is provided', () => {
    const { svg } = renderIcon();

    expect(svg).toHaveAttribute('role', 'presentation');
  });

  it('does not have an aria-label attribute in decorative mode', () => {
    const { svg } = renderIcon();

    expect(svg).not.toHaveAttribute('aria-label');
  });
});

// ---------------------------------------------------------------------------
// Descriptive mode (aria-label provided)
// Gherkin: "Icon becomes descriptive when aria-label is provided"
// ---------------------------------------------------------------------------

describe('SearchIcon — descriptive mode (aria-label provided)', () => {
  it('has role="img" when aria-label is provided', () => {
    renderIcon({ 'aria-label': 'Search' });

    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument();
  });

  it('has the correct aria-label value', () => {
    const { svg } = renderIcon({ 'aria-label': 'Search notes' });

    expect(svg).toHaveAttribute('aria-label', 'Search notes');
  });

  it('does not have aria-hidden when aria-label is provided', () => {
    const { svg } = renderIcon({ 'aria-label': 'Search' });

    // aria-hidden is explicitly set to undefined — it should be absent from DOM.
    expect(svg).not.toHaveAttribute('aria-hidden');
  });
});

// ---------------------------------------------------------------------------
// Custom className
// Gherkin: "Consumer applies a custom className to the SVG"
// ---------------------------------------------------------------------------

describe('SearchIcon — custom className', () => {
  it('applies a single extra class to the SVG element', () => {
    const { svg } = renderIcon({ className: 'text-red-500' });

    expect(svg).toHaveClass('text-red-500');
  });

  it('applies multiple extra classes to the SVG element', () => {
    const { svg } = renderIcon({ className: 'w-5 h-5 text-doveGray' });

    expect(svg).toHaveClass('w-5', 'h-5', 'text-doveGray');
  });
});

// ---------------------------------------------------------------------------
// Prop spreading
// Gherkin: "Consumer forwards additional SVG props"
// ---------------------------------------------------------------------------

describe('SearchIcon — prop spreading', () => {
  it('forwards data-testid to the SVG element', () => {
    renderIcon({ 'data-testid': 'search-icon' });

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('forwards a style prop to the SVG element', () => {
    const { svg } = renderIcon({ style: { opacity: 0.5 } });

    expect(svg).toHaveStyle({ opacity: '0.5' });
  });
});

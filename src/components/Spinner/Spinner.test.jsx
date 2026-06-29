/**
 * Unit tests for the Spinner component.
 *
 * @description Covers every behavioral scenario defined in specs/Spinner.md,
 * including the extended Gherkin scenarios for all size variants, all color
 * variants, custom className merging, and accessibility attributes.
 *
 * Query strategy:
 *  - The wrapper <div> is queried via getByRole('status') — it is the ARIA
 *    landmark that screen readers announce when the spinner is mounted.
 *  - The <svg> has aria-hidden="true", so it is invisible to the accessibility
 *    tree. It is reached via container.querySelector('svg') from RTL's render
 *    return value.
 *  - The two <path> elements (track ring and spinning segment) are accessed via
 *    querySelectorAll('path')[0] and [1] respectively, matching the render order
 *    in Spinner.jsx.
 *
 * No mocks are required — Spinner is a stateless RSC with no external deps
 * beyond the `cn` utility.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from './Spinner';

// ---------------------------------------------------------------------------
// Helper: extracts the SVG and both path elements from a rendered Spinner.
// ---------------------------------------------------------------------------

/**
 * Renders a Spinner with the given props and returns the key DOM nodes.
 * @param {Object} [props] - Props forwarded to the Spinner component.
 * @returns {{ container: HTMLElement, svg: SVGElement, track: SVGPathElement, segment: SVGPathElement }}
 */
const renderSpinner = (props = {}) => {
  const { container } = render(<Spinner {...props} />);
  const svg = container.querySelector('svg');
  const paths = container.querySelectorAll('path');

  return { container, svg, track: paths[0], segment: paths[1] };
};

// ---------------------------------------------------------------------------
// Default rendering
// Gherkin: "Component renders with default properties"
// ---------------------------------------------------------------------------

describe('Spinner — default rendering', () => {
  it('renders the status wrapper in the DOM', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies animate-spin to the SVG', () => {
    const { svg } = renderSpinner();

    expect(svg).toHaveClass('animate-spin');
  });

  it('applies inline display class to the SVG', () => {
    const { svg } = renderSpinner();

    expect(svg).toHaveClass('inline');
  });

  it('defaults to "md" size — applies w-8 and h-8 classes', () => {
    const { svg } = renderSpinner();

    expect(svg).toHaveClass('w-8', 'h-8');
  });

  it('defaults to "cocoa" color — track has fill-cocoa/20', () => {
    const { track } = renderSpinner();

    expect(track).toHaveClass('fill-cocoa/20');
  });

  it('defaults to "cocoa" color — segment has fill-cocoa', () => {
    const { segment } = renderSpinner();

    expect(segment).toHaveClass('fill-cocoa');
  });
});

// ---------------------------------------------------------------------------
// Size variants
// Gherkin: "Component renders with custom size and color" /
//          "Component renders with large size variant" /
//          "Component renders with extra-large size variant"
// ---------------------------------------------------------------------------

describe('Spinner — size variants', () => {
  it('size "sm" applies w-4 and h-4 to the SVG', () => {
    const { svg } = renderSpinner({ size: 'sm' });

    expect(svg).toHaveClass('w-4', 'h-4');
  });

  it('size "md" applies w-8 and h-8 to the SVG', () => {
    const { svg } = renderSpinner({ size: 'md' });

    expect(svg).toHaveClass('w-8', 'h-8');
  });

  it('size "lg" applies w-12 and h-12 to the SVG', () => {
    const { svg } = renderSpinner({ size: 'lg' });

    expect(svg).toHaveClass('w-12', 'h-12');
  });

  it('size "xl" applies w-16 and h-16 to the SVG', () => {
    const { svg } = renderSpinner({ size: 'xl' });

    expect(svg).toHaveClass('w-16', 'h-16');
  });
});

// ---------------------------------------------------------------------------
// Color variants
// Gherkin: "Component renders with custom size and color" /
//          "Component renders with ink color scheme" /
//          "Component renders with doveGray color scheme"
// ---------------------------------------------------------------------------

describe('Spinner — color variants', () => {
  it('color "clay" — track has fill-clay/20 and segment has fill-clay', () => {
    const { track, segment } = renderSpinner({ color: 'clay' });

    expect(track).toHaveClass('fill-clay/20');
    expect(segment).toHaveClass('fill-clay');
  });

  it('color "cocoa" — track has fill-cocoa/20 and segment has fill-cocoa', () => {
    const { track, segment } = renderSpinner({ color: 'cocoa' });

    expect(track).toHaveClass('fill-cocoa/20');
    expect(segment).toHaveClass('fill-cocoa');
  });

  it('color "ink" — track has fill-ink/20 and segment has fill-ink', () => {
    const { track, segment } = renderSpinner({ color: 'ink' });

    expect(track).toHaveClass('fill-ink/20');
    expect(segment).toHaveClass('fill-ink');
  });

  it('color "doveGray" — track has fill-doveGray/20 and segment has fill-doveGray', () => {
    const { track, segment } = renderSpinner({ color: 'doveGray' });

    expect(track).toHaveClass('fill-doveGray/20');
    expect(segment).toHaveClass('fill-doveGray');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// Gherkin: "Screen reader support and accessibility" /
//          "SVG is hidden from the accessibility tree"
// ---------------------------------------------------------------------------

describe('Spinner — accessibility', () => {
  it('wrapper div has role="status"', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a visually hidden span with text "Loading..."', () => {
    render(<Spinner />);

    // getByText targets text in the DOM even when visually hidden via sr-only.
    const srSpan = screen.getByText('Loading...');

    expect(srSpan).toBeInTheDocument();
    expect(srSpan.tagName).toBe('SPAN');
  });

  it('visually hidden span has the sr-only class', () => {
    render(<Spinner />);

    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('SVG has aria-hidden="true" so screen readers ignore the decorative graphic', () => {
    const { svg } = renderSpinner();

    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});

// ---------------------------------------------------------------------------
// Custom className merging
// Gherkin: "Consumer applies additional classes via className"
// ---------------------------------------------------------------------------

describe('Spinner — custom className', () => {
  it('merges extra classes onto the SVG element', () => {
    const { svg } = renderSpinner({ className: 'mx-auto' });

    expect(svg).toHaveClass('mx-auto');
  });

  it('preserves animate-spin alongside the extra class', () => {
    const { svg } = renderSpinner({ className: 'mx-auto' });

    expect(svg).toHaveClass('animate-spin');
  });
});

/**
 * Unit tests for the Link component.
 *
 * @description Covers every behavioral scenario defined in specs/Link.md,
 * including the extended Gherkin scenarios for external link security
 * (rel="noopener noreferrer" injection), children rendering, and Next.js
 * prop forwarding.
 *
 * next/link is mocked with a plain <a> element so tests run in JSDOM without
 * requiring the Next.js App Router. The mock preserves all prop forwarding
 * (href, target, rel, className, prefetch…) so we can assert on them normally.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Link from './Link';

// ---------------------------------------------------------------------------
// Mock next/link
// Replaces the Next.js Link with a plain <a> that forwards all props.
// This lets us test href, target, rel, className, and arbitrary prop spreading
// without spinning up the Next.js App Router.
// ---------------------------------------------------------------------------

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ---------------------------------------------------------------------------
// Default rendering and styles
// Gherkin: "Component renders with default styles and required href"
// ---------------------------------------------------------------------------

describe('Link — default rendering', () => {
  it('renders an anchor element in the DOM', () => {
    render(<Link href="/notes">Notes</Link>);

    expect(screen.getByRole('link', { name: 'Notes' })).toBeInTheDocument();
  });

  it('forwards the href prop to the underlying anchor', () => {
    render(<Link href="/notes">Notes</Link>);

    expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute(
      'href',
      '/notes'
    );
  });

  it('applies cocoa text color and underline classes by default', () => {
    render(<Link href="/notes">Notes</Link>);

    const anchor = screen.getByRole('link', { name: 'Notes' });

    expect(anchor).toHaveClass('text-cocoa');
    expect(anchor).toHaveClass('underline');
  });

  it('applies no padding (p-0) and transition classes by default', () => {
    render(<Link href="/notes">Notes</Link>);

    const anchor = screen.getByRole('link', { name: 'Notes' });

    expect(anchor).toHaveClass('p-0');
    expect(anchor).toHaveClass('transition-colors', 'duration-200');
  });
});

// ---------------------------------------------------------------------------
// Children rendering
// Gherkin: "Link renders its children content"
// ---------------------------------------------------------------------------

describe('Link — children', () => {
  it('renders text children inside the anchor', () => {
    render(<Link href="/about">About us</Link>);

    expect(screen.getByRole('link')).toHaveTextContent('About us');
  });

  it('renders element children inside the anchor', () => {
    render(
      <Link href="/about">
        <span data-testid="icon" /> Read more
      </Link>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveTextContent('Read more');
  });
});

// ---------------------------------------------------------------------------
// className override
// Gherkin: "Consumer overrides the default underline styling"
// ---------------------------------------------------------------------------

describe('Link — className override', () => {
  it('merges additional classes onto the anchor element', () => {
    render(
      <Link href="/" className="font-bold">
        Bold link
      </Link>
    );

    expect(screen.getByRole('link')).toHaveClass('font-bold');
  });

  it('allows tailwind-merge to override the default underline class', () => {
    render(
      <Link href="/" className="no-underline">
        No underline
      </Link>
    );

    const anchor = screen.getByRole('link', { name: 'No underline' });

    // tailwind-merge removes "underline" when "no-underline" is passed.
    expect(anchor).not.toHaveClass('underline');
    expect(anchor).toHaveClass('no-underline');
  });

  it('preserves base classes when a custom class is provided', () => {
    render(
      <Link href="/" className="font-bold">
        Styled
      </Link>
    );

    const anchor = screen.getByRole('link', { name: 'Styled' });

    expect(anchor).toHaveClass('text-cocoa');
    expect(anchor).toHaveClass('p-0');
  });
});

// ---------------------------------------------------------------------------
// Next.js prop forwarding
// Gherkin: "Consumer passes specific Next.js routing properties"
// ---------------------------------------------------------------------------

describe('Link — Next.js prop forwarding', () => {
  it('forwards arbitrary props to the underlying component via spread', () => {
    // We verify the ...props spread using a data-* attribute, which React
    // always forwards to the DOM regardless of its value. next/link-specific
    // props like `prefetch` are framework-level hints consumed by Next.js
    // internally; they are not reflected as DOM attributes and therefore
    // cannot be asserted via toHaveAttribute in a JSDOM environment.
    render(
      <Link href="/notes" data-analytics="nav-link">
        Notes
      </Link>
    );

    expect(screen.getByRole('link', { name: 'Notes' })).toHaveAttribute(
      'data-analytics',
      'nav-link'
    );
  });
});

// ---------------------------------------------------------------------------
// target="_blank" — rendering
// Gherkin: "Link opens in a new tab with target='_blank'"
// ---------------------------------------------------------------------------

describe('Link — target="_blank" rendering', () => {
  it('sets the target attribute on the anchor', () => {
    render(
      <Link href="https://example.com" target="_blank">
        External
      </Link>
    );

    expect(screen.getByRole('link', { name: 'External' })).toHaveAttribute(
      'target',
      '_blank'
    );
  });
});

// ---------------------------------------------------------------------------
// Security: rel="noopener noreferrer" auto-injection
// Gherkin: "Link automatically injects rel=noopener noreferrer for external links"
// ---------------------------------------------------------------------------

describe('Link — security (rel injection for target="_blank")', () => {
  it('automatically adds "noopener" to rel when target="_blank"', () => {
    render(
      <Link href="https://example.com" target="_blank">
        External
      </Link>
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    );
  });

  it('automatically adds "noreferrer" to rel when target="_blank"', () => {
    render(
      <Link href="https://example.com" target="_blank">
        External
      </Link>
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer')
    );
  });

  it('preserves a consumer-provided rel value alongside security tokens', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="sponsored">
        Sponsored
      </Link>
    );

    const rel = screen.getByRole('link').getAttribute('rel');

    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
    expect(rel).toContain('sponsored');
  });

  it('does not add rel tokens when target is not "_blank"', () => {
    render(<Link href="/notes">Internal</Link>);

    // When no target is provided the component should not inject any rel value.
    expect(screen.getByRole('link')).not.toHaveAttribute('rel');
  });
});

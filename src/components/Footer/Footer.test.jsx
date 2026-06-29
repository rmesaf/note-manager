/**
 * Unit tests for the Footer component.
 *
 * @description Covers every behavioral scenario defined in specs/Footer.md,
 * derived through reverse engineering of Footer.jsx.
 *
 * No mocks are required — Footer has no Next.js image/link dependencies.
 * The copyright year (2026) is hardcoded in the component source, NOT
 * computed from the system clock, so no vi.setSystemTime mock is needed.
 * The static string "© 2026 SoftCraft — Artisanal Minimalism" can be
 * asserted directly and will never break due to a calendar year rollover.
 *
 * The root <footer> element carries the implicit ARIA role "contentinfo"
 * when it is a direct descendant of <body> (JSDOM satisfies this). Tests
 * use getByRole('contentinfo') as the primary semantic query.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

// ---------------------------------------------------------------------------
// Semantic landmark
// Gherkin: "Footer renders as a semantic landmark element"
// ---------------------------------------------------------------------------

describe('Footer — semantic landmark', () => {
  it('renders a contentinfo landmark element', () => {
    render(<Footer />);

    // <footer> inside <body> carries the implicit ARIA role "contentinfo".
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders exactly one footer element', () => {
    render(<Footer />);

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Copyright notice
// Gherkin: "Footer displays the full copyright notice" /
//          "Copyright year is the hardcoded value 2026"
// ---------------------------------------------------------------------------

describe('Footer — copyright notice', () => {
  it('renders the full copyright paragraph text', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2026 SoftCraft — Artisanal Minimalism')
    ).toBeInTheDocument();
  });

  it('copyright text contains the hardcoded year 2026', () => {
    render(<Footer />);

    expect(
      screen.getByText(/2026/)
    ).toBeInTheDocument();
  });

  it('copyright text contains the brand name SoftCraft', () => {
    render(<Footer />);

    expect(
      screen.getByText(/SoftCraft/)
    ).toBeInTheDocument();
  });

  it('copyright notice is rendered inside a <p> element', () => {
    render(<Footer />);

    const paragraph = screen.getByText('© 2026 SoftCraft — Artisanal Minimalism');

    expect(paragraph.tagName).toBe('P');
  });

  it('copyright paragraph is nested inside the footer landmark', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    const paragraph = screen.getByText('© 2026 SoftCraft — Artisanal Minimalism');

    expect(footer).toContainElement(paragraph);
  });
});

// ---------------------------------------------------------------------------
// Default footer styles
// Gherkin: "Footer applies default layout and border styles"
// ---------------------------------------------------------------------------

describe('Footer — default styles', () => {
  it('has the full-width class', () => {
    render(<Footer data-testid="footer" />);

    expect(screen.getByTestId('footer')).toHaveClass('w-full');
  });

  it('has border-t and border-sand classes', () => {
    render(<Footer data-testid="footer" />);

    expect(screen.getByTestId('footer')).toHaveClass('border-t', 'border-sand');
  });

  it('has the py-6 vertical padding class', () => {
    render(<Footer data-testid="footer" />);

    expect(screen.getByTestId('footer')).toHaveClass('py-6');
  });

  it('has flex, items-center and justify-center layout classes', () => {
    render(<Footer data-testid="footer" />);

    expect(screen.getByTestId('footer')).toHaveClass(
      'flex',
      'items-center',
      'justify-center'
    );
  });
});

// ---------------------------------------------------------------------------
// Copyright paragraph typography styles
// Gherkin: "Copyright paragraph applies brand typography styles"
// ---------------------------------------------------------------------------

describe('Footer — copyright paragraph styles', () => {
  it('copyright paragraph has font-literata class', () => {
    render(<Footer />);

    const paragraph = screen.getByText('© 2026 SoftCraft — Artisanal Minimalism');

    expect(paragraph).toHaveClass('font-literata');
  });

  it('copyright paragraph has text-cocoa class', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2026 SoftCraft — Artisanal Minimalism')
    ).toHaveClass('text-cocoa');
  });

  it('copyright paragraph has text-xs class', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2026 SoftCraft — Artisanal Minimalism')
    ).toHaveClass('text-xs');
  });

  it('copyright paragraph has italic class', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2026 SoftCraft — Artisanal Minimalism')
    ).toHaveClass('italic');
  });
});

// ---------------------------------------------------------------------------
// Custom className
// Gherkin: "Consumer extends styles via className prop"
// ---------------------------------------------------------------------------

describe('Footer — custom className', () => {
  it('applies extra class to the root footer element', () => {
    render(<Footer className="bg-paper" data-testid="footer" />);

    expect(screen.getByTestId('footer')).toHaveClass('bg-paper');
  });

  it('preserves base classes alongside the extra class', () => {
    render(<Footer className="bg-paper" data-testid="footer" />);

    const footer = screen.getByTestId('footer');

    expect(footer).toHaveClass('w-full');
    expect(footer).toHaveClass('border-t');
    expect(footer).toHaveClass('border-sand');
  });
});

// ---------------------------------------------------------------------------
// Native prop spreading
// Gherkin: "Consumer passes native HTML attributes via prop spreading"
// ---------------------------------------------------------------------------

describe('Footer — native prop spreading', () => {
  it('forwards data-testid to the root footer element', () => {
    render(<Footer data-testid="site-footer" />);

    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
  });

  it('forwards aria-label to the root footer element', () => {
    render(<Footer aria-label="Site footer" data-testid="footer" />);

    expect(screen.getByTestId('footer')).toHaveAttribute(
      'aria-label',
      'Site footer'
    );
  });

  it('forwards id to the root footer element', () => {
    render(<Footer id="main-footer" />);

    expect(document.getElementById('main-footer')).toBeInTheDocument();
  });
});

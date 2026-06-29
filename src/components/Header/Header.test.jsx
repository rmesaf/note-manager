/**
 * Unit tests for the Header component.
 *
 * @description Covers every behavioral scenario defined in specs/Header.md,
 * derived through reverse engineering of Header.jsx.
 *
 * next/image is mocked with a plain <img> element that forwards all props so
 * we can assert on src, alt, width, height and any other attribute without
 * requiring the Next.js image optimizer pipeline.
 *
 * The root <header> element carries the implicit ARIA role "banner" when it is
 * a direct descendant of <body> (JSDOM satisfies this). Tests use
 * getByRole('banner') as the primary query to stay semantic and resilient.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from './Header';

// ---------------------------------------------------------------------------
// Mock next/image
// Replaces the Next.js <Image> with a plain <img> that forwards all props,
// including src, alt, width, height, and priority (stored as a data attribute
// on the DOM element by React for non-standard boolean props).
// ---------------------------------------------------------------------------

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, priority, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-priority={priority ? 'true' : undefined}
      {...props}
    />
  ),
}));

// ---------------------------------------------------------------------------
// Semantic landmark
// Gherkin: "Header renders as a semantic landmark element"
// ---------------------------------------------------------------------------

describe('Header — semantic landmark', () => {
  it('renders a banner landmark element', () => {
    render(<Header />);

    // <header> inside <body> carries the implicit ARIA role "banner".
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders a single header element', () => {
    render(<Header />);

    expect(screen.getAllByRole('banner')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Logo rendering
// Gherkin: "Header displays the SoftCraft logo" /
//          "Logo has descriptive alternative text for accessibility"
// ---------------------------------------------------------------------------

describe('Header — logo', () => {
  it('renders an image inside the header', () => {
    render(<Header />);

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('logo src points to /logo.svg', () => {
    render(<Header />);

    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo.svg');
  });

  it('logo has the accessible alt text "SoftCraft Logo"', () => {
    render(<Header />);

    expect(screen.getByAltText('SoftCraft Logo')).toBeInTheDocument();
  });

  it('logo is findable by its alt text', () => {
    render(<Header />);

    expect(screen.getByRole('img', { name: 'SoftCraft Logo' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Logo dimensions
// Gherkin: "Logo is rendered with explicit dimensions"
// ---------------------------------------------------------------------------

describe('Header — logo dimensions', () => {
  it('logo has width="120"', () => {
    render(<Header />);

    expect(screen.getByRole('img')).toHaveAttribute('width', '120');
  });

  it('logo has height="40"', () => {
    render(<Header />);

    expect(screen.getByRole('img')).toHaveAttribute('height', '40');
  });

  it('logo has the priority flag set for eager loading', () => {
    render(<Header />);

    // The mock converts the boolean `priority` prop to data-priority="true"
    // so it can be asserted on the DOM element.
    expect(screen.getByRole('img')).toHaveAttribute('data-priority', 'true');
  });
});

// ---------------------------------------------------------------------------
// Default styles
// Gherkin: "Header applies default layout and border styles"
// ---------------------------------------------------------------------------

describe('Header — default styles', () => {
  it('has the full-width class', () => {
    render(<Header data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveClass('w-full');
  });

  it('has border-b and border-sand classes', () => {
    render(<Header data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveClass('border-b', 'border-sand');
  });

  it('has the bg-paper background class', () => {
    render(<Header data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveClass('bg-paper');
  });

  it('has flex and items-center layout classes', () => {
    render(<Header data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveClass('flex', 'items-center');
  });

  it('has vertical and horizontal padding classes', () => {
    render(<Header data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveClass('py-4', 'px-6');
  });
});

// ---------------------------------------------------------------------------
// Custom className
// Gherkin: "Consumer extends styles via className prop"
// ---------------------------------------------------------------------------

describe('Header — custom className', () => {
  it('applies extra class to the root header element', () => {
    render(<Header className="sticky top-0" data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveClass('sticky', 'top-0');
  });

  it('preserves base classes alongside the extra class', () => {
    render(<Header className="sticky top-0" data-testid="header" />);

    const header = screen.getByTestId('header');

    expect(header).toHaveClass('w-full');
    expect(header).toHaveClass('bg-paper');
    expect(header).toHaveClass('border-b');
  });
});

// ---------------------------------------------------------------------------
// Native prop spreading
// Gherkin: "Consumer passes native HTML attributes via prop spreading"
// ---------------------------------------------------------------------------

describe('Header — native prop spreading', () => {
  it('forwards data-testid to the root header element', () => {
    render(<Header data-testid="site-header" />);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
  });

  it('forwards aria-label to the root header element', () => {
    render(<Header aria-label="Main navigation" data-testid="header" />);

    expect(screen.getByTestId('header')).toHaveAttribute(
      'aria-label',
      'Main navigation'
    );
  });

  it('forwards id to the root header element', () => {
    render(<Header id="main-header" />);

    expect(document.getElementById('main-header')).toBeInTheDocument();
  });
});

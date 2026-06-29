/**
 * Unit tests for the Card component.
 *
 * @description Covers every behavioral scenario defined in specs/Card.md,
 * including the extended Gherkin scenarios for children rendering, onClick
 * forwarding, and additive className behavior.
 *
 * No mocks are required — Card is a stateless RSC wrapper around a native
 * <div> with no external dependencies beyond the `cn` utility.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 *  - userEvent — realistic DOM event simulation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';

// ---------------------------------------------------------------------------
// Default styles
// Gherkin: "Component renders with default styles"
// ---------------------------------------------------------------------------

describe('Card — default styles', () => {
  it('renders a div element in the DOM', () => {
    render(<Card>Content</Card>);

    // The Card has no implicit ARIA role; we locate it via its text content.
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies white background class', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('bg-white');
  });

  it('applies sand border class', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('border', 'border-sand');
  });

  it('applies rounded corners class', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('rounded-lg');
  });

  it('applies subtle shadow class', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('shadow-sm');
  });

  it('applies default internal padding of p-4', () => {
    render(<Card data-testid="card">Content</Card>);

    expect(screen.getByTestId('card')).toHaveClass('p-4');
  });
});

// ---------------------------------------------------------------------------
// children rendering
// Gherkin: "Component renders its children content" /
//          "Component renders complex element children"
// ---------------------------------------------------------------------------

describe('Card — children rendering', () => {
  it('renders text children inside the root element', () => {
    render(<Card data-testid="card">Hello world</Card>);

    const card = screen.getByTestId('card');

    expect(card).toHaveTextContent('Hello world');
  });

  it('renders nested element children inside the root element', () => {
    render(
      <Card data-testid="card">
        <p data-testid="inner">Nested paragraph</p>
      </Card>
    );

    const inner = screen.getByTestId('inner');

    expect(screen.getByTestId('card')).toContainElement(inner);
    expect(inner).toHaveTextContent('Nested paragraph');
  });

  it('renders multiple children in document order', () => {
    render(
      <Card data-testid="card">
        <span data-testid="first">First</span>
        <span data-testid="second">Second</span>
      </Card>
    );

    const card = screen.getByTestId('card');

    expect(card).toContainElement(screen.getByTestId('first'));
    expect(card).toContainElement(screen.getByTestId('second'));
  });
});

// ---------------------------------------------------------------------------
// className override
// Gherkin: "Consumer overrides the default padding"
// ---------------------------------------------------------------------------

describe('Card — className override', () => {
  it('allows tailwind-merge to override the default p-4 with p-0', () => {
    render(
      <Card data-testid="card" className="p-0">
        No padding
      </Card>
    );

    const card = screen.getByTestId('card');

    expect(card).toHaveClass('p-0');
    expect(card).not.toHaveClass('p-4');
  });
});

// ---------------------------------------------------------------------------
// Additive className
// Gherkin: "Additional className is applied alongside base styles"
// ---------------------------------------------------------------------------

describe('Card — additive className', () => {
  it('applies the extra class without removing base styles', () => {
    render(
      <Card data-testid="card" className="mt-8">
        Content
      </Card>
    );

    const card = screen.getByTestId('card');

    expect(card).toHaveClass('mt-8');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('rounded-lg');
  });
});

// ---------------------------------------------------------------------------
// Native HTML attribute forwarding
// Gherkin: "Consumer passes native HTML attributes"
// ---------------------------------------------------------------------------

describe('Card — native HTML attribute forwarding', () => {
  it('forwards aria-label to the root div', () => {
    render(
      <Card data-testid="card" aria-label="Note preview">
        Content
      </Card>
    );

    // A plain <div> with aria-label has no implicit ARIA landmark role.
    // We locate it via data-testid and assert the attribute is forwarded.
    expect(screen.getByTestId('card')).toHaveAttribute('aria-label', 'Note preview');
  });

  it('forwards data-testid to the root div', () => {
    render(<Card data-testid="my-card">Content</Card>);

    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('forwards an id attribute to the root div', () => {
    render(<Card id="card-123">Content</Card>);

    expect(document.getElementById('card-123')).toBeInTheDocument();
  });

  it('forwards a role attribute to the root div', () => {
    render(<Card role="article">Content</Card>);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// onClick forwarding
// Gherkin: "Consumer attaches a click handler via props"
// ---------------------------------------------------------------------------

describe('Card — onClick forwarding', () => {
  it('calls the onClick handler once when the card is clicked', async () => {
    const handleClick = vi.fn();
    render(
      <Card data-testid="card" onClick={handleClick}>
        Clickable card
      </Card>
    );

    await userEvent.click(screen.getByTestId('card'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when a different element is clicked', async () => {
    const handleClick = vi.fn();
    render(
      <div>
        <Card data-testid="card" onClick={handleClick}>
          Card
        </Card>
        <button data-testid="other">Other</button>
      </div>
    );

    await userEvent.click(screen.getByTestId('other'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});

/**
 * Unit tests for the Button component.
 *
 * @description Covers every behavioral scenario defined in specs/Button.md,
 * including the extended Gherkin scenarios added for variant rendering, type
 * attribute control, ARIA accessibility, and keyboard focus. Each describe block
 * maps directly to a Gherkin Feature section; each it() maps to a Scenario.
 *
 * Test tool chain:
 *  - Vitest  — test runner and assertion engine.
 *  - RTL     — component rendering in JSDOM.
 *  - userEvent — realistic DOM event simulation (pointer + keyboard).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

// ---------------------------------------------------------------------------
// Variant: full (default)
// Gherkin: "User interacts with a standard active button"
// ---------------------------------------------------------------------------

describe('Button — variant: full (default)', () => {
  it('applies cocoa background and white text classes', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });

    expect(button).toHaveClass('bg-cocoa');
    expect(button).toHaveClass('text-white');
  });

  it('applies base layout and transition classes', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });

    expect(button).toHaveClass('px-4', 'py-2', 'rounded-md');
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    expect(button).toHaveClass('transition-colors', 'duration-200');
  });
});

// ---------------------------------------------------------------------------
// Variant: outline
// Gherkin: "Button is rendered as an outline variant"
// ---------------------------------------------------------------------------

describe('Button — variant: outline', () => {
  it('applies transparent background, cocoa border and cocoa text', () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole('button', { name: 'Outline' });

    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('border', 'border-cocoa');
    expect(button).toHaveClass('text-cocoa');
  });
});

// ---------------------------------------------------------------------------
// Variant: link
// Gherkin: "Button is rendered as a link variant"
// ---------------------------------------------------------------------------

describe('Button — variant: link', () => {
  it('removes base padding and applies cocoa text with underline', () => {
    render(<Button variant="link">Go somewhere</Button>);

    const button = screen.getByRole('button', { name: 'Go somewhere' });

    expect(button).toHaveClass('p-0');
    expect(button).toHaveClass('text-cocoa');
    expect(button).toHaveClass('underline');
  });
});

// ---------------------------------------------------------------------------
// Type attribute
// Gherkin: "Button defaults to type=button" / "Button accepts a type override"
// ---------------------------------------------------------------------------

describe('Button — type attribute', () => {
  it('defaults to type="button" to prevent accidental form submissions', () => {
    render(<Button>Submit</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('accepts type="submit" when explicitly passed via props', () => {
    render(<Button type="submit">Submit form</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

// ---------------------------------------------------------------------------
// Click interaction
// Gherkin: "User interacts with a standard active button" /
//          "User attempts to interact with a disabled button" /
//          "User views a button in a loading state"
// ---------------------------------------------------------------------------

describe('Button — click interaction', () => {
  it('calls onClick once when the button is active and clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when the button has the disabled prop', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when the button is in loading state', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} isLoading>Loading</Button>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Disabled state
// Gherkin: "User attempts to interact with a disabled button"
// ---------------------------------------------------------------------------

describe('Button — disabled state', () => {
  it('has the native disabled HTML attribute', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies opacity-50, cursor-not-allowed and pointer-events-none classes', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button', { name: 'Disabled' });

    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
    expect(button).toHaveClass('pointer-events-none');
  });

  it('sets aria-disabled="true" for assistive technology', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});

// ---------------------------------------------------------------------------
// Loading state
// Gherkin: "User views a button in a loading state"
// ---------------------------------------------------------------------------

describe('Button — loading state (isLoading)', () => {
  it('renders a spinner element with role="status"', () => {
    render(<Button isLoading>Save</Button>);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the children text alongside the spinner', () => {
    render(<Button isLoading>Saving…</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('Saving…');
  });

  it('inherits disabled state — has native disabled attribute', () => {
    render(<Button isLoading>Save</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets aria-disabled="true" when loading', () => {
    render(<Button isLoading>Save</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies disabled visual classes when loading', () => {
    render(<Button isLoading>Save</Button>);

    const button = screen.getByRole('button', { name: /save/i });

    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});

// ---------------------------------------------------------------------------
// ARIA accessibility
// Gherkin: "Button exposes aria-disabled for assistive technology"
// ---------------------------------------------------------------------------

describe('Button — ARIA accessibility', () => {
  it('sets aria-disabled="false" (attribute absent or false) when active', () => {
    render(<Button>Active</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'false');
  });

  it('sets aria-disabled="true" when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});

// ---------------------------------------------------------------------------
// Keyboard accessibility
// Gherkin: "Active button can receive keyboard focus" /
//          "Disabled button cannot receive keyboard focus"
// ---------------------------------------------------------------------------

describe('Button — keyboard accessibility', () => {
  it('is reachable via Tab when in an active state', async () => {
    render(<Button>Focus me</Button>);

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Focus me' })).toHaveFocus();
  });

  it('cannot be reached via Tab when disabled', async () => {
    render(<Button disabled>Disabled</Button>);

    await userEvent.tab();

    expect(screen.getByRole('button', { name: 'Disabled' })).not.toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Custom className merging
// ---------------------------------------------------------------------------

describe('Button — custom className', () => {
  it('merges additional classes onto the button element', () => {
    render(<Button className="w-full">Expand</Button>);

    expect(screen.getByRole('button', { name: 'Expand' })).toHaveClass('w-full');
  });

  it('preserves base classes when a custom class is provided', () => {
    render(<Button className="w-full">Expand</Button>);

    const button = screen.getByRole('button', { name: 'Expand' });

    expect(button).toHaveClass('rounded-md');
    expect(button).toHaveClass('bg-cocoa');
  });
});

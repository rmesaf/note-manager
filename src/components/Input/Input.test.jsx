/**
 * Unit tests for the Input component.
 *
 * @description Covers every behavioral scenario defined in specs/Input.md,
 * including the extended Gherkin scenarios for user typing, disabled state,
 * placeholder, forwardRef, and inputClassName prop.
 *
 * DOM structure reminder (affects how nodes are queried):
 *
 *   <div class="wrapper ...">          ← variant border classes live here
 *     [<svg role="presentation" />]    ← only rendered when type="search"
 *     <input class="inner ..." />      ← size, inputClassName classes live here
 *   </div>
 *
 * Query strategy:
 *  - getByRole('textbox')   → native input for type="text" (default)
 *  - getByRole('searchbox') → native input for type="search"
 *  - input.closest('div')   → reaches the wrapper from the input node
 *
 * SearchIcon is a decorative SVG (aria-hidden, role="presentation").
 * It is queried via container.querySelector('svg[role="presentation"]').
 *
 * Test tool chain:
 *  - Vitest    — test runner and assertion engine.
 *  - RTL       — component rendering in JSDOM.
 *  - userEvent — realistic keyboard event simulation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import Input from './Input';

// ---------------------------------------------------------------------------
// Helper: resolves the wrapper div from the rendered input element.
// ---------------------------------------------------------------------------

/**
 * Renders an Input with the given props and returns the key DOM nodes.
 * @param {Object} [props] - Props forwarded to the Input component.
 * @returns {{ container: HTMLElement, input: HTMLInputElement, wrapper: HTMLElement }}
 */
const renderInput = (props = {}) => {
  const type = props.type ?? 'text';
  const role = type === 'search' ? 'searchbox' : 'textbox';
  const { container } = render(<Input {...props} />);
  const input = screen.getByRole(role);
  const wrapper = input.closest('div');

  return { container, input, wrapper };
};

// ---------------------------------------------------------------------------
// Default rendering
// Gherkin: "Component renders with default 'full' border variant"
// ---------------------------------------------------------------------------

describe('Input — default rendering', () => {
  it('renders a native textbox in the DOM', () => {
    render(<Input />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('wrapper has full border, sand color and rounded-md classes by default', () => {
    const { wrapper } = renderInput();

    expect(wrapper).toHaveClass('border', 'border-sand', 'rounded-md');
  });

  it('wrapper has focus-within:border-clay for the full variant', () => {
    const { wrapper } = renderInput();

    expect(wrapper).toHaveClass('focus-within:border-clay');
  });

  it('inner input has bg-transparent and outline-none', () => {
    const { input } = renderInput();

    expect(input).toHaveClass('bg-transparent', 'outline-none');
  });

  it('inner input defaults to base size classes (text-base, py-2)', () => {
    const { input } = renderInput();

    expect(input).toHaveClass('text-base', 'py-2');
  });
});

// ---------------------------------------------------------------------------
// Variant: bottom
// Gherkin: "User focuses on a standard input"
// ---------------------------------------------------------------------------

describe('Input — variant: bottom', () => {
  it('wrapper has bottom border and no rounded corners', () => {
    const { wrapper } = renderInput({ variant: 'bottom' });

    expect(wrapper).toHaveClass('border-b', 'border-sand', 'rounded-none');
  });

  it('wrapper has focus-within:border-clay for the bottom variant', () => {
    const { wrapper } = renderInput({ variant: 'bottom' });

    expect(wrapper).toHaveClass('focus-within:border-clay');
  });

  it('inner input has outline-none so the native focus ring is suppressed', () => {
    const { input } = renderInput({ variant: 'bottom' });

    expect(input).toHaveClass('outline-none');
  });
});

// ---------------------------------------------------------------------------
// Variant: none + inputSize: large
// Gherkin: "Component renders a borderless large title input"
// ---------------------------------------------------------------------------

describe('Input — variant: none + inputSize: large', () => {
  it('wrapper has border-transparent and rounded-none', () => {
    const { wrapper } = renderInput({ variant: 'none', inputSize: 'large' });

    expect(wrapper).toHaveClass('border-transparent', 'rounded-none');
  });

  it('inner input has large typography classes (text-3xl, py-4, font-bold)', () => {
    const { input } = renderInput({ variant: 'none', inputSize: 'large' });

    expect(input).toHaveClass('text-3xl', 'py-4', 'font-bold');
  });

  it('placeholder is styled with subdued color class', () => {
    const { input } = renderInput({
      variant: 'none',
      inputSize: 'large',
      placeholder: 'Note title…',
    });

    expect(input).toHaveClass('placeholder:text-doveGray/60');
  });
});

// ---------------------------------------------------------------------------
// inputSize variants
// ---------------------------------------------------------------------------

describe('Input — inputSize variants', () => {
  it('size "small" applies text-sm and py-1', () => {
    const { input } = renderInput({ inputSize: 'small' });

    expect(input).toHaveClass('text-sm', 'py-1');
  });

  it('size "base" applies text-base and py-2', () => {
    const { input } = renderInput({ inputSize: 'base' });

    expect(input).toHaveClass('text-base', 'py-2');
  });

  it('size "medium" applies text-lg and py-3', () => {
    const { input } = renderInput({ inputSize: 'medium' });

    expect(input).toHaveClass('text-lg', 'py-3');
  });

  it('size "large" applies text-3xl, py-4 and font-bold', () => {
    const { input } = renderInput({ inputSize: 'large' });

    expect(input).toHaveClass('text-3xl', 'py-4', 'font-bold');
  });
});

// ---------------------------------------------------------------------------
// Search type — icon rendering and padding
// Gherkin: "Component renders as a search input"
// ---------------------------------------------------------------------------

describe('Input — type="search"', () => {
  it('renders a searchbox role element', () => {
    render(<Input type="search" />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('renders the decorative magnifying glass SVG icon', () => {
    const { container } = render(<Input type="search" />);

    // SearchIcon is aria-hidden with role="presentation" — queried directly.
    expect(
      container.querySelector('svg[role="presentation"]')
    ).toBeInTheDocument();
  });

  it('inner input has left padding to avoid overlapping the icon (pl-9)', () => {
    const { input } = renderInput({ type: 'search' });

    expect(input).toHaveClass('pl-9');
  });

  it('no icon is rendered for the default text type', () => {
    const { container } = render(<Input type="text" />);

    expect(
      container.querySelector('svg[role="presentation"]')
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// placeholder prop
// Gherkin: "Input renders with a placeholder attribute"
// ---------------------------------------------------------------------------

describe('Input — placeholder', () => {
  it('forwards the placeholder attribute to the native input', () => {
    const { input } = renderInput({ placeholder: 'Search notes…' });

    expect(input).toHaveAttribute('placeholder', 'Search notes…');
  });
});

// ---------------------------------------------------------------------------
// User interaction — typing
// Gherkin: "User types into the input and onChange is triggered"
// ---------------------------------------------------------------------------

describe('Input — user typing', () => {
  it('reflects typed text in the input value', async () => {
    render(<Input defaultValue="" />);
    const input = screen.getByRole('textbox');

    await userEvent.type(input, 'Hello');

    expect(input).toHaveValue('Hello');
  });

  it('calls onChange for each keystroke', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'Hi');

    // 'H' and 'i' = 2 keystrokes → 2 onChange calls.
    expect(handleChange).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Disabled state
// Gherkin: "Input is disabled via props spreading"
// ---------------------------------------------------------------------------

describe('Input — disabled state', () => {
  it('native input has the disabled attribute', () => {
    const { input } = renderInput({ disabled: true });

    expect(input).toBeDisabled();
  });

  it('user cannot type when the input is disabled', async () => {
    const { input } = renderInput({ disabled: true });

    await userEvent.type(input, 'blocked');

    expect(input).toHaveValue('');
  });
});

// ---------------------------------------------------------------------------
// forwardRef
// Gherkin: "Forwarded ref is attached to the native input element"
// ---------------------------------------------------------------------------

describe('Input — forwardRef', () => {
  it('ref.current points to the native input DOM node', () => {
    const ref = createRef();
    render(<Input ref={ref} />);

    expect(ref.current).toBe(screen.getByRole('textbox'));
  });
});

// ---------------------------------------------------------------------------
// Custom className and inputClassName
// Gherkin: "inputClassName applies additional classes to the inner input only"
// ---------------------------------------------------------------------------

describe('Input — custom className and inputClassName', () => {
  it('className is applied to the wrapper div', () => {
    const { wrapper } = renderInput({ className: 'w-full' });

    expect(wrapper).toHaveClass('w-full');
  });

  it('inputClassName is applied to the inner input element', () => {
    const { input } = renderInput({ inputClassName: 'font-bold' });

    expect(input).toHaveClass('font-bold');
  });

  it('inputClassName does not affect the wrapper div', () => {
    const { wrapper } = renderInput({ inputClassName: 'font-bold' });

    expect(wrapper).not.toHaveClass('font-bold');
  });

  it('className does not affect the inner input element', () => {
    const { input } = renderInput({ className: 'sentinel-wrapper' });

    expect(input).not.toHaveClass('sentinel-wrapper');
  });
});

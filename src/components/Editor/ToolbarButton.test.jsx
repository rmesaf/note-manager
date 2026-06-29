/**
 * Unit tests for the ToolbarButton component.
 * Purely presentational — tests rendering, interaction, and active state styling.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToolbarButton from './ToolbarButton';

describe('ToolbarButton — rendering', () => {
  it('renders the button element in the DOM', () => {
    render(<ToolbarButton onClick={vi.fn()}>B</ToolbarButton>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders children inside the button', () => {
    render(<ToolbarButton onClick={vi.fn()}>Bold</ToolbarButton>);
    expect(screen.getByRole('button')).toHaveTextContent('Bold');
  });

  it('has type="button" to prevent accidental form submission', () => {
    render(<ToolbarButton onClick={vi.fn()}>B</ToolbarButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('forwards the title attribute for accessibility', () => {
    render(
      <ToolbarButton onClick={vi.fn()} title="Bold">
        B
      </ToolbarButton>
    );
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
  });
});

describe('ToolbarButton — click interaction', () => {
  it('calls onClick once when the button is clicked', async () => {
    const handleClick = vi.fn();
    render(<ToolbarButton onClick={handleClick}>B</ToolbarButton>);

    await userEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick before the button is clicked', () => {
    const handleClick = vi.fn();
    render(<ToolbarButton onClick={handleClick}>B</ToolbarButton>);

    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('ToolbarButton — active state', () => {
  it('applies bg-sand and text-cocoa classes when isActive=true', () => {
    render(
      <ToolbarButton onClick={vi.fn()} isActive={true}>
        B
      </ToolbarButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-sand', 'text-cocoa');
  });

  it('applies text-doveGray class when isActive=false (default)', () => {
    render(<ToolbarButton onClick={vi.fn()}>B</ToolbarButton>);
    expect(screen.getByRole('button')).toHaveClass('text-doveGray');
  });

  it('does not apply bg-sand when isActive=false', () => {
    render(<ToolbarButton onClick={vi.fn()} isActive={false}>B</ToolbarButton>);
    expect(screen.getByRole('button')).not.toHaveClass('bg-sand');
  });
});

describe('ToolbarButton — base layout classes', () => {
  it('always has flex and rounded classes regardless of active state', () => {
    render(<ToolbarButton onClick={vi.fn()}>B</ToolbarButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'justify-center', 'rounded');
  });
});

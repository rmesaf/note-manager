/**
 * Unit tests for the ToolbarSelect component.
 * Tests dropdown open/close, option rendering, option selection, and backdrop.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToolbarSelect from './ToolbarSelect';

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

const buildOptions = () => [
  { label: 'Normal', onClick: vi.fn(), isActive: false },
  { label: 'Heading 1', onClick: vi.fn(), isActive: false },
  { label: 'Heading 2', onClick: vi.fn(), isActive: true },
];

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('ToolbarSelect — rendering', () => {
  it('renders the trigger button', () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);
    expect(screen.getByTitle('Heading')).toBeInTheDocument();
  });

  it('shows displayValue on the trigger when buttonIcon is not provided', () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);
    expect(screen.getByTitle('Heading')).toHaveTextContent('Hd');
  });

  it('shows buttonIcon on the trigger when provided', () => {
    render(
      <ToolbarSelect
        title="Lists"
        options={buildOptions()}
        buttonIcon={<span data-testid="icon">☰</span>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('does not show the dropdown by default', () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);
    expect(screen.queryByRole('button', { name: 'Normal' })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Dropdown open/close
// ---------------------------------------------------------------------------

describe('ToolbarSelect — dropdown open/close', () => {
  it('opens the dropdown when the trigger is clicked', async () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));

    expect(screen.getByRole('button', { name: 'Normal' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Heading 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Heading 2' })).toBeInTheDocument();
  });

  it('closes the dropdown when the trigger is clicked a second time', async () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));
    await userEvent.click(screen.getByTitle('Heading'));

    expect(screen.queryByRole('button', { name: 'Normal' })).not.toBeInTheDocument();
  });

  it('trigger has bg-sand class when dropdown is open', async () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));

    expect(screen.getByTitle('Heading')).toHaveClass('bg-sand');
  });

  it('trigger does not have bg-sand when dropdown is closed', () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);
    expect(screen.getByTitle('Heading')).not.toHaveClass('bg-sand');
  });
});

// ---------------------------------------------------------------------------
// Option selection
// ---------------------------------------------------------------------------

describe('ToolbarSelect — option selection', () => {
  it('calls option.onClick when an option is selected', async () => {
    const options = buildOptions();
    render(<ToolbarSelect title="Heading" options={options} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));
    await userEvent.click(screen.getByRole('button', { name: 'Normal' }));

    expect(options[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('closes the dropdown after an option is selected', async () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));
    await userEvent.click(screen.getByRole('button', { name: 'Heading 1' }));

    expect(screen.queryByRole('button', { name: 'Normal' })).not.toBeInTheDocument();
  });

  it('applies active styles to an option when isActive=true', async () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));

    // buildOptions()[2] has isActive:true → "Heading 2"
    expect(screen.getByRole('button', { name: 'Heading 2' })).toHaveClass('bg-sand', 'text-cocoa');
  });

  it('applies inactive styles to options when isActive=false', async () => {
    render(<ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));

    expect(screen.getByRole('button', { name: 'Normal' })).toHaveClass('text-ink');
    expect(screen.getByRole('button', { name: 'Normal' })).not.toHaveClass('bg-sand');
  });
});

// ---------------------------------------------------------------------------
// Option icon rendering
// ---------------------------------------------------------------------------

describe('ToolbarSelect — option icons', () => {
  it('renders the option icon when provided', async () => {
    const options = [
      {
        label: 'Normal',
        icon: <span data-testid="para-icon">¶</span>,
        onClick: vi.fn(),
        isActive: false,
      },
    ];
    render(<ToolbarSelect title="Heading" options={options} displayValue="Hd" />);

    await userEvent.click(screen.getByTitle('Heading'));

    expect(screen.getByTestId('para-icon')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Backdrop click to close
// ---------------------------------------------------------------------------

describe('ToolbarSelect — backdrop', () => {
  it('renders a backdrop div when the dropdown is open', async () => {
    const { container } = render(
      <ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />
    );

    await userEvent.click(screen.getByTitle('Heading'));

    // The backdrop is a fixed inset div with z-0.
    expect(container.querySelector('.fixed.inset-0.z-0')).toBeInTheDocument();
  });

  it('closes the dropdown when the backdrop is clicked', async () => {
    const { container } = render(
      <ToolbarSelect title="Heading" options={buildOptions()} displayValue="Hd" />
    );

    await userEvent.click(screen.getByTitle('Heading'));

    const backdrop = container.querySelector('.fixed.inset-0.z-0');
    await userEvent.click(backdrop);

    expect(screen.queryByRole('button', { name: 'Normal' })).not.toBeInTheDocument();
  });
});

/**
 * Unit tests for the EditorToolbar component.
 * Verifies that toolbar actions are rendered correctly based on the actions prop.
 * Does NOT test Tiptap editor internals — actions are plain mock functions.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorToolbar from './EditorToolbar';

// ---------------------------------------------------------------------------
// Action fixtures
// ---------------------------------------------------------------------------

const buildButtonAction = (title, isActive = false) => ({
  onClick: vi.fn(),
  isActive,
  title,
  children: <span>{title[0]}</span>,
});

const buildSeparator = () => ({ separator: true });

const buildSelectAction = (title) => ({
  type: 'select',
  title,
  displayValue: title.slice(0, 2),
  options: [
    { label: 'Option A', onClick: vi.fn(), isActive: false },
    { label: 'Option B', onClick: vi.fn(), isActive: true },
  ],
});

// ---------------------------------------------------------------------------
// Rendering — button actions
// ---------------------------------------------------------------------------

describe('EditorToolbar — button actions', () => {
  it('renders a ToolbarButton for each button action', () => {
    render(
      <EditorToolbar
        actions={[buildButtonAction('Bold'), buildButtonAction('Italic')]}
      />
    );
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
  });

  it('renders no buttons when actions array is empty', () => {
    render(<EditorToolbar actions={[]} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('calls the action onClick when a toolbar button is clicked', async () => {
    const boldAction = buildButtonAction('Bold');
    render(<EditorToolbar actions={[boldAction]} />);

    await userEvent.click(screen.getByTitle('Bold'));

    expect(boldAction.onClick).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Rendering — separators
// ---------------------------------------------------------------------------

describe('EditorToolbar — separators', () => {
  it('renders a visual separator element for separator actions', () => {
    const { container } = render(
      <EditorToolbar
        actions={[buildButtonAction('Bold'), buildSeparator(), buildButtonAction('Italic')]}
      />
    );
    // The separator is a div with class "w-px"
    expect(container.querySelector('.w-px')).toBeInTheDocument();
  });

  it('marks the separator as aria-hidden', () => {
    const { container } = render(
      <EditorToolbar actions={[buildSeparator()]} />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Rendering — select actions
// ---------------------------------------------------------------------------

describe('EditorToolbar — select actions', () => {
  it('renders a ToolbarSelect for select-type actions', () => {
    render(<EditorToolbar actions={[buildSelectAction('Heading')]} />);
    expect(screen.getByTitle('Heading')).toBeInTheDocument();
  });

  it('opens the select dropdown when triggered', async () => {
    render(<EditorToolbar actions={[buildSelectAction('Heading')]} />);

    await userEvent.click(screen.getByTitle('Heading'));

    expect(screen.getByRole('button', { name: 'Option A' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Mixed actions
// ---------------------------------------------------------------------------

describe('EditorToolbar — mixed actions', () => {
  it('renders a combination of buttons, separators and selects', () => {
    const { container } = render(
      <EditorToolbar
        actions={[
          buildButtonAction('Bold'),
          buildSeparator(),
          buildSelectAction('Heading'),
          buildButtonAction('Italic'),
        ]}
      />
    );

    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Heading')).toBeInTheDocument();
    expect(container.querySelector('.w-px')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Container layout
// ---------------------------------------------------------------------------

describe('EditorToolbar — container layout', () => {
  it('applies border-b and flex layout classes to the container', () => {
    const { container } = render(<EditorToolbar actions={[]} />);
    const toolbar = container.firstChild;
    expect(toolbar).toHaveClass('border-b', 'border-sand', 'flex', 'items-center');
  });
});

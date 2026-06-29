/**
 * Unit tests for the Editor component.
 *
 * @description Tiptap is treated as a black box. All @tiptap/* packages are
 * mocked so no real ProseMirror document is created in JSDOM. Tests verify:
 *  - The EditorToolbar is rendered with an actions array.
 *  - EditorContent is rendered inside a Controller.
 *  - The onUpdate prop is called with the editor's JSON when content changes.
 *  - The editor instance is forwarded via ref.
 *  - Toolbar button clicks dispatch the correct Tiptap chain commands.
 *
 * vi.hoisted() is used to declare mock variables that must be available inside
 * vi.mock() factories — factories are hoisted to the top of the file before
 * regular variable declarations, so any variable referenced inside a factory
 * must be hoisted along with it.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

// ---------------------------------------------------------------------------
// Hoisted mock variables
// vi.hoisted() runs before vi.mock() factories so these values are available
// inside the factory closures below.
// ---------------------------------------------------------------------------

const { mockRun, chainResult, mockEditor } = vi.hoisted(() => {
  const mockRun = vi.fn();
  const chainResult = {
    focus: vi.fn(),
    toggleBold: vi.fn(),
    toggleItalic: vi.fn(),
    toggleUnderline: vi.fn(),
    toggleStrike: vi.fn(),
    toggleCode: vi.fn(),
    setParagraph: vi.fn(),
    toggleHeading: vi.fn(),
    toggleBulletList: vi.fn(),
    toggleOrderedList: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    run: mockRun,
  };
  // Each method returns chainResult so the chain is fluent.
  Object.keys(chainResult).forEach((key) => {
    if (key !== 'run') {
      chainResult[key].mockReturnValue(chainResult);
    }
  });
  const mockEditor = {
    chain: vi.fn(() => chainResult),
    isActive: vi.fn(() => false),
    getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
    commands: { setContent: vi.fn() },
  };
  return { mockRun, chainResult, mockEditor };
});

// ---------------------------------------------------------------------------
// Tiptap mocks — all factories reference the hoisted variables above.
// ---------------------------------------------------------------------------

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: vi.fn(({ editor }) => (
    <div data-testid="editor-content" data-has-editor={String(!!editor)} />
  )),
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock('@tiptap/extension-underline', () => ({ default: {} }));
vi.mock('@tiptap/extension-placeholder', () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock('@tiptap/extension-link', () => ({
  default: { configure: vi.fn(() => ({})) },
}));
vi.mock('@tiptap/extension-text-align', () => ({
  default: { configure: vi.fn(() => ({})) },
}));

// Mock Controller to render its child immediately so no FormProvider is needed.
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Controller: ({ render: renderFn }) =>
      renderFn({ field: { onChange: vi.fn(), value: null } }),
  };
});

// Dynamic import AFTER mocks are registered.
// Editor.jsx uses `export default` — use .default to get the component.
const Editor = (await import('./Editor')).default;
const { useEditor } = await import('@tiptap/react');

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

const mockOnUpdate = vi.fn();
const mockControl = {};

const renderEditor = (props = {}) =>
  render(<Editor control={mockControl} onUpdate={mockOnUpdate} {...props} />);

beforeEach(() => {
  vi.clearAllMocks();
  // Re-wire chain methods after clearAllMocks resets them.
  Object.keys(chainResult).forEach((key) => {
    if (key !== 'run') {
      chainResult[key].mockReturnValue(chainResult);
    }
  });
  mockEditor.chain.mockReturnValue(chainResult);
  mockEditor.isActive.mockReturnValue(false);
  mockEditor.getJSON.mockReturnValue({ type: 'doc', content: [] });
});

// ---------------------------------------------------------------------------
// Structural rendering
// ---------------------------------------------------------------------------

describe('Editor — structural rendering', () => {
  it('renders the EditorContent area', () => {
    renderEditor();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('passes the editor instance to EditorContent', () => {
    renderEditor();
    expect(screen.getByTestId('editor-content')).toHaveAttribute(
      'data-has-editor',
      'true'
    );
  });

  it('renders toolbar buttons (Undo, Bold, etc.)', () => {
    renderEditor();
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Undo')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// onUpdate propagation
// ---------------------------------------------------------------------------

describe('Editor — onUpdate propagation', () => {
  it('calls onUpdate with the editor JSON when useEditor triggers onUpdate', () => {
    renderEditor();
    const [options] = useEditor.mock.calls[0];
    options.onUpdate({ editor: mockEditor });
    expect(mockOnUpdate).toHaveBeenCalledWith({ type: 'doc', content: [] });
  });

  it('does not throw when onUpdate prop is not provided', () => {
    render(<Editor control={mockControl} />);
    const [options] = useEditor.mock.calls[0];
    expect(() => options.onUpdate({ editor: mockEditor })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Ref forwarding
// ---------------------------------------------------------------------------

describe('Editor — ref forwarding', () => {
  it('exposes the editor instance via a callback ref', () => {
    let capturedRef = null;
    render(
      <Editor
        control={mockControl}
        ref={(instance) => { capturedRef = instance; }}
      />
    );
    expect(capturedRef).toBe(mockEditor);
  });

  it('exposes the editor instance via createRef', () => {
    const ref = createRef();
    render(<Editor control={mockControl} ref={ref} />);
    expect(ref.current).toBe(mockEditor);
  });
});

// ---------------------------------------------------------------------------
// Toolbar command dispatch
// ---------------------------------------------------------------------------

describe('Editor — toolbar commands', () => {
  it('calls chain().focus().toggleBold().run() when Bold is clicked', async () => {
    renderEditor();
    await userEvent.click(screen.getByTitle('Bold'));
    expect(chainResult.focus).toHaveBeenCalled();
    expect(chainResult.toggleBold).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  it('calls chain().focus().toggleItalic().run() when Italic is clicked', async () => {
    renderEditor();
    await userEvent.click(screen.getByTitle('Italic'));
    expect(chainResult.toggleItalic).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  it('calls chain().focus().toggleUnderline().run() when Underline is clicked', async () => {
    renderEditor();
    await userEvent.click(screen.getByTitle('Underline'));
    expect(chainResult.toggleUnderline).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  it('calls chain().focus().undo().run() when Undo is clicked', async () => {
    renderEditor();
    await userEvent.click(screen.getByTitle('Undo'));
    expect(chainResult.undo).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  it('calls chain().focus().redo().run() when Redo is clicked', async () => {
    renderEditor();
    await userEvent.click(screen.getByTitle('Redo'));
    expect(chainResult.redo).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });
});

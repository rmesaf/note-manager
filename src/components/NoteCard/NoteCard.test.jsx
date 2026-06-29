/**
 * Unit tests for the NoteCard component.
 *
 * @description Covers every behavioral scenario defined in specs/NoteCard.md,
 * derived through reverse engineering of NoteCard.jsx.
 *
 * Mocking strategy:
 *  - useNotes (@/hooks/useNotes): returns { deleteNote: vi.fn() }. Dexie is
 *    never accessed in tests — the hook is fully intercepted at the module level.
 *  - useModal (@/context/ModalContext): returns { openModal: vi.fn() }. The
 *    modal is never rendered; only the call to openModal is asserted.
 *  - sonner: toast.success is mocked to prevent console noise and to allow
 *    asserting that it is not called directly by NoteCard (it is called inside
 *    the onAccept callback registered in the modal, not by NoteCard itself).
 *  - next/link: replaced with a plain <a> to remove the Next.js router
 *    dependency from the JSDOM environment.
 *
 * Date stability: the note's updatedAt is set to noon UTC on a specific date
 * (2026-06-15T12:00:00Z). Noon UTC guarantees the local calendar day is June 15
 * in every timezone from UTC-11 to UTC+11, making the assertion timezone-safe.
 *
 * Test tool chain:
 *  - Vitest    — test runner and assertion engine.
 *  - RTL       — component rendering in JSDOM.
 *  - userEvent — realistic pointer event simulation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import NoteCard from './NoteCard';
import ConfirmModal from '@/components/ConfirmModal';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

const mockDeleteNote = vi.fn();
const mockOpenModal = vi.fn();

vi.mock('@/hooks/useNotes', () => ({
  useNotes: () => ({ deleteNote: mockDeleteNote }),
}));

vi.mock('@/context/ModalContext', () => ({
  useModal: () => ({ openModal: mockOpenModal }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ---------------------------------------------------------------------------
// Shared test fixture
// ---------------------------------------------------------------------------

/**
 * A realistic note fixture with a Tiptap JSON description and a timezone-safe
 * updatedAt timestamp (noon UTC on 15 Jun 2026 → always "15/06/2026").
 */
const NOTE = {
  id: 'note-42',
  title: 'My First Note',
  description: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello world from Tiptap.' }],
      },
    ],
  },
  updatedAt: new Date('2026-06-15T12:00:00Z').getTime(),
};

/** Note with an empty description to trigger the fallback text. */
const EMPTY_NOTE = {
  ...NOTE,
  id: 'note-empty',
  description: { type: 'doc', content: [] },
};

beforeEach(() => {
  mockDeleteNote.mockClear();
  mockOpenModal.mockClear();
});

// ---------------------------------------------------------------------------
// Title rendering
// Gherkin: "NoteCard renders the note title"
// ---------------------------------------------------------------------------

describe('NoteCard — title', () => {
  it('renders the note title as an h2 heading', () => {
    render(<NoteCard note={NOTE} />);

    expect(
      screen.getByRole('heading', { name: 'My First Note', level: 2 })
    ).toBeInTheDocument();
  });

  it('heading has layout and typography classes', () => {
    render(<NoteCard note={NOTE} />);

    const heading = screen.getByRole('heading', { level: 2 });

    expect(heading).toHaveClass('font-semibold', 'line-clamp-2', 'min-h-12');
  });
});

// ---------------------------------------------------------------------------
// Date rendering
// Gherkin: "NoteCard renders the formatted date"
// ---------------------------------------------------------------------------

describe('NoteCard — date', () => {
  it('renders the updatedAt timestamp formatted as DD/MM/YYYY', () => {
    render(<NoteCard note={NOTE} />);

    // Intl.DateTimeFormat('es-ES') on 2026-06-15T12:00:00Z → "15/06/2026"
    expect(screen.getByText('15/06/2026')).toBeInTheDocument();
  });

  it('date is rendered in a <span> element', () => {
    render(<NoteCard note={NOTE} />);

    expect(screen.getByText('15/06/2026').tagName).toBe('SPAN');
  });
});

// ---------------------------------------------------------------------------
// Description preview
// Gherkin: "NoteCard renders the plain-text description preview"
// ---------------------------------------------------------------------------

describe('NoteCard — description preview', () => {
  it('renders the plain text extracted from the Tiptap JSON', () => {
    render(<NoteCard note={NOTE} />);

    expect(
      screen.getByText('Hello world from Tiptap.')
    ).toBeInTheDocument();
  });

  it('description paragraph has truncation classes', () => {
    render(<NoteCard note={NOTE} />);

    const preview = screen.getByText('Hello world from Tiptap.');

    expect(preview).toHaveClass('line-clamp-3', 'min-h-18');
  });
});

// ---------------------------------------------------------------------------
// Empty description fallback
// Gherkin: "NoteCard shows a fallback when description produces no text"
// ---------------------------------------------------------------------------

describe('NoteCard — empty description fallback', () => {
  it('shows "No content yet." when the description is empty', () => {
    render(<NoteCard note={EMPTY_NOTE} />);

    expect(screen.getByText('No content yet.')).toBeInTheDocument();
  });

  it('does not show "No content yet." when description has text', () => {
    render(<NoteCard note={NOTE} />);

    expect(screen.queryByText('No content yet.')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Edit link
// Gherkin: "NoteCard renders the Edit link pointing to the note's page"
// ---------------------------------------------------------------------------

describe('NoteCard — edit link', () => {
  it('renders a link labelled "Edit →"', () => {
    render(<NoteCard note={NOTE} />);

    expect(screen.getByRole('link', { name: 'Edit →' })).toBeInTheDocument();
  });

  it('edit link href points to /notes/<id>', () => {
    render(<NoteCard note={NOTE} />);

    expect(screen.getByRole('link', { name: 'Edit →' })).toHaveAttribute(
      'href',
      '/notes/note-42'
    );
  });
});

// ---------------------------------------------------------------------------
// Delete button accessibility
// Gherkin: "NoteCard renders the delete button with an accessible label"
// ---------------------------------------------------------------------------

describe('NoteCard — delete button', () => {
  it('renders a button with aria-label="Delete note"', () => {
    render(<NoteCard note={NOTE} />);

    expect(
      screen.getByRole('button', { name: 'Delete note' })
    ).toBeInTheDocument();
  });

  it('delete button SVG icon is aria-hidden', () => {
    const { container } = render(<NoteCard note={NOTE} />);

    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Delete interaction — opens confirmation modal
// Gherkin: "User clicks the delete button — confirmation modal opens"
// ---------------------------------------------------------------------------

describe('NoteCard — delete interaction', () => {
  it('calls openModal once when delete button is clicked', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('passes ConfirmModal as the first argument to openModal', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    expect(mockOpenModal.mock.calls[0][0]).toBe(ConfirmModal);
  });

  it('passes the correct confirmation message to openModal', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    const modalProps = mockOpenModal.mock.calls[0][1];

    expect(modalProps.message).toBe(
      'Are you sure you want to delete this note?'
    );
  });

  it('passes an onAccept callback to openModal', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    const modalProps = mockOpenModal.mock.calls[0][1];

    expect(typeof modalProps.onAccept).toBe('function');
  });

  it('does NOT call deleteNote directly on delete button click', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    // deleteNote is only called inside the onAccept callback (after user confirms).
    expect(mockDeleteNote).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Event isolation — delete click does not activate the edit link
// Gherkin: "Clicking the delete button does not fire a card-level navigation"
// ---------------------------------------------------------------------------

describe('NoteCard — event isolation', () => {
  it('clicking delete does not trigger edit link navigation', async () => {
    const handleLinkClick = vi.fn();
    render(<NoteCard note={NOTE} />);

    // Attach a click listener to the edit link to detect unwanted activation.
    const editLink = screen.getByRole('link', { name: 'Edit →' });
    editLink.addEventListener('click', handleLinkClick);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    expect(handleLinkClick).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// onAccept callback — calls deleteNote and toast.success
// HomeView §5 + Scenario 3: "note should be removed … success toast displayed"
// ---------------------------------------------------------------------------

describe('NoteCard — onAccept callback (modal confirm logic)', () => {
  it('onAccept calls deleteNote with the note id when invoked', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    const { onAccept } = mockOpenModal.mock.calls[0][1];

    await onAccept();

    expect(mockDeleteNote).toHaveBeenCalledWith('note-42');
  });

  it('onAccept calls toast.success with the correct message', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    const { onAccept } = mockOpenModal.mock.calls[0][1];

    await onAccept();

    expect(toast.success).toHaveBeenCalledWith('Note deleted successfully.');
  });
});

// ---------------------------------------------------------------------------
// onCancel callback — HomeView §5 defines onCancel: () => {}
// Gherkin: "openModal receives an onCancel callback"
// ---------------------------------------------------------------------------

describe('NoteCard — onCancel callback', () => {
  it('passes an onCancel function to openModal', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    const { onCancel } = mockOpenModal.mock.calls[0][1];

    expect(typeof onCancel).toBe('function');
  });

  it('onCancel does not throw when invoked', async () => {
    render(<NoteCard note={NOTE} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    const { onCancel } = mockOpenModal.mock.calls[0][1];

    expect(() => onCancel()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Card wrapper layout — HomeView §4: "flex flex-col gap-3 p-5"
// Gherkin: "NoteCard wrapper applies flex column layout"
// ---------------------------------------------------------------------------

describe('NoteCard — card wrapper layout (HomeView §4)', () => {
  it('root card element has flex and flex-col classes', () => {
    const { container } = render(<NoteCard note={NOTE} />);

    expect(container.firstChild).toHaveClass('flex', 'flex-col');
  });

  it('root card element has gap-3 for uniform section spacing', () => {
    const { container } = render(<NoteCard note={NOTE} />);

    expect(container.firstChild).toHaveClass('gap-3');
  });
});

// ---------------------------------------------------------------------------
// Footer separator — HomeView §4: border-t border-sand on the edit link section
// Gherkin: "Edit link section has a top border separator"
// ---------------------------------------------------------------------------

describe('NoteCard — footer separator (HomeView §4)', () => {
  it('the div wrapping the Edit link has border-t class', () => {
    render(<NoteCard note={NOTE} />);

    const editLink = screen.getByRole('link', { name: 'Edit →' });
    const footerDiv = editLink.closest('div');

    expect(footerDiv).toHaveClass('border-t');
  });

  it('the div wrapping the Edit link has border-sand class', () => {
    render(<NoteCard note={NOTE} />);

    const editLink = screen.getByRole('link', { name: 'Edit →' });
    const footerDiv = editLink.closest('div');

    expect(footerDiv).toHaveClass('border-sand');
  });
});

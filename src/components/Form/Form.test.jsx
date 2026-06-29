/**
 * Unit tests for the Form component.
 *
 * @description Covers every BDD scenario defined in specs/NoteForm.md.
 * The Editor component is mocked with a plain div so tests focus exclusively
 * on form behaviour: validation, submission, cancel guard, and data persistence.
 *
 * Mocking strategy:
 *  - @/components/Editor  → vi.fn() stub that captures the onUpdate prop.
 *  - @/hooks/useNotes     → mock createNote, updateNote, getNoteById.
 *  - @/context/ModalContext → mock useModal.openModal.
 *  - next/navigation      → mock useRouter.push.
 *  - sonner               → mock toast.success / toast.error.
 *  - next/link            → plain <a> to avoid router dependency.
 *
 * react-hook-form is NOT mocked — the real library runs in JSDOM so we can
 * rely on isDirty / isValid state changes driven by real input events.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

// ---------------------------------------------------------------------------
// Module-level mocks
// ---------------------------------------------------------------------------

const mockCreateNote = vi.fn().mockResolvedValue('new-id');
const mockUpdateNote = vi.fn().mockResolvedValue(undefined);
const mockGetNoteById = vi.fn().mockResolvedValue(undefined);
const mockPush = vi.fn();
const mockOpenModal = vi.fn();

vi.mock('@/hooks/useNotes', () => ({
  useNotes: () => ({
    createNote: mockCreateNote,
    updateNote: mockUpdateNote,
    getNoteById: mockGetNoteById,
    deleteNote: vi.fn(),
    notes: [],
  }),
}));

vi.mock('@/context/ModalContext', () => ({
  useModal: () => ({ openModal: mockOpenModal }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock the Editor — captures onUpdate so tests can simulate content changes.
vi.mock('@/components/Editor', () => ({
  Editor: vi.fn(({ onUpdate }) => (
    <div
      data-testid="mock-editor"
      onClick={() => onUpdate && onUpdate({ type: 'doc', content: [] })}
    />
  )),
}));

// Dynamic import AFTER mocks are registered.
const Form = (await import('./Form')).default;
const { Editor } = await import('@/components/Editor');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockSaveSuccess = vi.fn();

const renderCreateForm = () =>
  render(<Form isEditMode={false} onSaveSuccess={mockSaveSuccess} />);

const renderEditForm = (noteId = 'note-123') =>
  render(<Form isEditMode={true} noteId={noteId} onSaveSuccess={mockSaveSuccess} />);

const getTitleInput = () => screen.getByPlaceholderText('Add note title...');
const getSaveButton = () => screen.getByRole('button', { name: /save/i });
const getCancelButton = () => screen.getByRole('button', { name: /cancel/i });

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateNote.mockResolvedValue('new-id');
  mockUpdateNote.mockResolvedValue(undefined);
  mockGetNoteById.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Structural rendering
// ---------------------------------------------------------------------------

describe('Form — structural rendering', () => {
  it('renders the title input', () => {
    renderCreateForm();
    expect(getTitleInput()).toBeInTheDocument();
  });

  it('renders the mock Editor', () => {
    renderCreateForm();
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  it('renders the Cancel button', () => {
    renderCreateForm();
    expect(getCancelButton()).toBeInTheDocument();
  });

  it('renders the Save button', () => {
    renderCreateForm();
    expect(getSaveButton()).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Form initialization in Create Mode
// Gherkin: "Form initialization in Create Mode"
// ---------------------------------------------------------------------------

describe('Form — create mode initialization', () => {
  it('title input starts empty', () => {
    renderCreateForm();
    expect(getTitleInput()).toHaveValue('');
  });

  it('Save button is disabled when the form is empty (neither valid nor dirty)', () => {
    renderCreateForm();
    expect(getSaveButton()).toBeDisabled();
  });

  it('Cancel button is always enabled', () => {
    renderCreateForm();
    expect(getCancelButton()).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Save button state
// Gherkin: "Save button is disabled if !isValid || !isDirty"
// ---------------------------------------------------------------------------

describe('Form — Save button state', () => {
  it('Save button becomes enabled after typing a valid title', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'My New Note');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
  });

  it('Save button remains disabled when title is cleared', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'X');
    await userEvent.clear(getTitleInput());
    await waitFor(() => expect(getSaveButton()).toBeDisabled());
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Cancel without dirty state
// Gherkin: "Discarding changes without modifying the form"
// ---------------------------------------------------------------------------

describe('Form — cancel without dirty state', () => {
  it('calls router.push("/") directly when the form is clean', async () => {
    renderCreateForm();
    await userEvent.click(getCancelButton());
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('does NOT open a modal when the form is clean', async () => {
    renderCreateForm();
    await userEvent.click(getCancelButton());
    expect(mockOpenModal).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Cancel with dirty state
// Gherkin: "Attempting to discard unsaved changes"
// ---------------------------------------------------------------------------

describe('Form — cancel with unsaved changes', () => {
  it('opens the confirmation modal when the form is dirty', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'Draft title');
    await userEvent.click(getCancelButton());
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('passes ConfirmModal as the first argument to openModal', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'Draft');
    await userEvent.click(getCancelButton());
    expect(mockOpenModal.mock.calls[0][0]).toBe(ConfirmModal);
  });

  it('passes the unsaved-data warning message to the modal', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'Draft');
    await userEvent.click(getCancelButton());
    const { message } = mockOpenModal.mock.calls[0][1];
    expect(message).toMatch(/unsaved data/i);
  });

  it('onAccept from modal calls router.push("/")', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'Draft');
    await userEvent.click(getCancelButton());
    const { onAccept } = mockOpenModal.mock.calls[0][1];
    act(() => onAccept());
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('onCancel from modal is a no-op function (does not navigate)', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'Draft');
    await userEvent.click(getCancelButton());
    const { onCancel } = mockOpenModal.mock.calls[0][1];
    expect(() => act(() => onCancel())).not.toThrow();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does NOT call router.push() directly when form is dirty', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'Draft');
    await userEvent.click(getCancelButton());
    expect(mockPush).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Saving a valid note — Create Mode
// Gherkin: "Saving a valid modified note"
// ---------------------------------------------------------------------------

describe('Form — submit in create mode', () => {
  it('calls createNote with the correct title on submit', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'My New Note');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
    await userEvent.click(getSaveButton());
    await waitFor(() =>
      expect(mockCreateNote).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My New Note' })
      )
    );
  });

  it('does NOT call updateNote in create mode', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'My Note');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
    await userEvent.click(getSaveButton());
    await waitFor(() => expect(mockCreateNote).toHaveBeenCalled());
    expect(mockUpdateNote).not.toHaveBeenCalled();
  });

  it('calls toast.success with "Note saved successfully" after save', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'My Note');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
    await userEvent.click(getSaveButton());
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Note saved successfully')
    );
  });

  it('calls onSaveSuccess callback after successful save', async () => {
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'My Note');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
    await userEvent.click(getSaveButton());
    await waitFor(() => expect(mockSaveSuccess).toHaveBeenCalledTimes(1));
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Saving — Edit Mode
// ---------------------------------------------------------------------------

describe('Form — submit in edit mode', () => {
  beforeEach(() => {
    mockGetNoteById.mockResolvedValue({
      id: 'note-123',
      title: 'Existing Title',
      description: null,
      notebookId: null,
      tags: [],
    });
  });

  it('calls updateNote (not createNote) when submitting in edit mode', async () => {
    renderEditForm('note-123');
    await waitFor(() => expect(getTitleInput()).toHaveValue('Existing Title'));

    // Modify the title to make the form dirty.
    await userEvent.clear(getTitleInput());
    await userEvent.type(getTitleInput(), 'Updated Title');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
    await userEvent.click(getSaveButton());

    await waitFor(() =>
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-123',
        expect.objectContaining({ title: 'Updated Title' })
      )
    );
    expect(mockCreateNote).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// BDD Scenario: Form initialization in Edit Mode
// Gherkin: "Form initialization in Edit Mode"
// ---------------------------------------------------------------------------

describe('Form — edit mode initialization', () => {
  it('fetches the note by id on mount', async () => {
    renderEditForm('note-123');
    await waitFor(() => expect(mockGetNoteById).toHaveBeenCalledWith('note-123'));
  });

  it('populates the title input with the fetched note data', async () => {
    mockGetNoteById.mockResolvedValue({
      id: 'note-123',
      title: 'Loaded Title',
      description: null,
      notebookId: null,
      tags: [],
    });
    renderEditForm('note-123');
    await waitFor(() => expect(getTitleInput()).toHaveValue('Loaded Title'));
  });

  it('shows toast.error and redirects when note is not found', async () => {
    mockGetNoteById.mockResolvedValue(undefined);
    renderEditForm('bad-id');
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Note not found.')
    );
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('Form — save error handling', () => {
  it('calls toast.error when createNote throws', async () => {
    mockCreateNote.mockRejectedValueOnce(new Error('DB error'));
    renderCreateForm();
    await userEvent.type(getTitleInput(), 'My Note');
    await waitFor(() => expect(getSaveButton()).not.toBeDisabled());
    await userEvent.click(getSaveButton());
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to save the note. Please try again.'
      )
    );
  });
});

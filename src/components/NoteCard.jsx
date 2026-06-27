'use client';

import { useModal } from '@/context/ModalContext';
import { useNotes } from '@/hooks/useNotes';
import { extractPlainText } from '@/utils/extractPlainText';
import { toast } from 'sonner';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import Link from '@/components/Link';

/**
 * Formats a timestamp to DD/MM/YYYY using the native Intl API.
 * @description Avoids importing date libraries for a single formatting need.
 * Uses the es-ES locale to ensure consistent day/month/year ordering.
 * @param {number} timestamp - Unix timestamp in milliseconds.
 * @returns {string} Formatted date string in DD/MM/YYYY format.
 */
const formatDate = (timestamp) =>
  new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));

/**
 * Presentational card component that renders a single note's summary.
 * @description Adheres to strict layout constraints — minimum heights on title
 * and description ensure uniform card heights across the grid regardless of
 * content length, preventing visual jaggedness. Delegates delete logic to the
 * global modal system and uses useLiveQuery reactivity (via useNotes) to auto-
 * update the grid after deletion without manual state management.
 * @param {Object} props
 * @param {Object} props.note - The note data object from IndexedDB.
 * @param {string} props.note.id - Unique note identifier.
 * @param {string} props.note.title - Note title.
 * @param {Object} props.note.description - Tiptap JSON content.
 * @param {number} props.note.updatedAt - Last update timestamp in milliseconds.
 * @returns {JSX.Element}
 */
const NoteCard = ({ note }) => {
  const { deleteNote } = useNotes();
  const { openModal } = useModal();

  const plainText = extractPlainText(note.description);

  /**
   * Opens a confirmation modal before deleting the note.
   * @description Guards against accidental deletions with an explicit confirm step.
   * No manual reload is needed — deleteNote mutates IndexedDB and useLiveQuery
   * propagates the change reactively to all consumers.
   * @returns {void}
   */
  const handleDeleteClick = () => {
    openModal(ConfirmModal, {
      message: 'Are you sure you want to delete this note?',
      onAccept: async () => {
        await deleteNote(note.id);
        toast.success('Note deleted successfully.');
      },
      onCancel: () => {},
    });
  };

  return (
    <Card className="flex flex-col gap-3 p-5">
      {/* Header: date + delete */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-doveGray font-workSans">
          {formatDate(note.updatedAt)}
        </span>
        <button
          type="button"
          onClick={handleDeleteClick}
          aria-label="Delete note"
          className="text-doveGray hover:text-cocoa transition-colors duration-200 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>

      {/* Body: title + description */}
      <div>
        <h2 className="text-ink font-workSans font-semibold text-base line-clamp-2 min-h-12 leading-6">
          {note.title}
        </h2>
        <p className="text-doveGray font-workSans text-sm line-clamp-3 min-h-18 leading-6 mt-1">
          {plainText || 'No content yet.'}
        </p>
      </div>

      {/* Footer: edit link */}
      <div className="mt-auto pt-3 border-t border-sand">
        <Link href={`/notes/${note.id}`} className="text-sm font-workSans no-underline">
          Edit →
        </Link>
      </div>
    </Card>
  );
};

export default NoteCard;

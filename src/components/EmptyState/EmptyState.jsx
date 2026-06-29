import Button from '@/components/Button';
import Link from 'next/link';

/**
 * Empty state UI rendered when the notes collection has no entries.
 * @description Provides a clear call-to-action so users are never left staring at
 * a blank page. Decoupled from the Home view to keep the empty-state presentation
 * logic isolated and independently testable or replaceable.
 * @param {Object} props
 * @param {Function} props.onCreateClick - Handler called when the "New Note" button is clicked.
 * @returns {JSX.Element}
 */
const EmptyState = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-16 h-16 text-sand mb-6"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      <h2 className="text-ink font-workSans font-semibold text-xl mb-2">
        No notes yet.
      </h2>
      <p className="text-doveGray font-workSans text-sm mb-8 max-w-xs">
        Start writing your masterpiece!
      </p>
      <Button variant="full" onClick={onCreateClick}>
        New Note
      </Button>
    </div>
  );
};

export default EmptyState;

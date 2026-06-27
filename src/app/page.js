'use client';

import { useNotes } from '@/hooks/useNotes';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import EmptyState from '@/components/EmptyState';
import NoteCard from '@/components/NoteCard';

/**
 * Home view — Notes Explorer.
 * @description Main entry point of the application. Fetches all notes reactively
 * via useLiveQuery (through useNotes) and renders them in a responsive grid.
 * Handles the creation routing and delegates deletion to the NoteCard component
 * via the global modal system. Switches to EmptyState when no notes exist.
 * @returns {JSX.Element}
 */
export default function Home() {
  const router = useRouter();
  const { notes } = useNotes();

  const handleNewNote = () => router.push('/notes/new');

  if (notes === undefined) return null;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-literata text-2xl lg:text-5xl font-semibold text-ink">
          Your Notes
        </h1>
        <Button variant="full" onClick={handleNewNote}>
          New Note
        </Button>
      </div>

      {/* Empty state */}
      {notes.length === 0 && <EmptyState onCreateClick={handleNewNote} />}

      {/* Notes grid */}
      {notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </main>
  );
}

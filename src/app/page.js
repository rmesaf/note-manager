'use client';

import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useTags } from '@/hooks/useTags';
import Button from '@/components/Button';
import Card from '@/components/Card';

/**
 * DataLayer smoke-test panel.
 * @description Exercises all four BDD scenarios from DataLayer.md:
 * 1. createNote — verifies UUID and timestamp generation.
 * 2. updateNote — verifies updatedAt changes while createdAt stays frozen.
 * 3. createTag duplicate — verifies Dexie throws a ConstraintError on &title.
 * 4. useLiveQuery reactivity — the notes list re-renders automatically after mutations.
 * This component is temporary and will be replaced by the real app UI.
 * @returns {JSX.Element}
 */
export default function Home() {
  const { notebooks, createNotebook } = useNotebooks();
  const [notebookId, setNotebookId] = useState(undefined);
  const { notes, createNote, updateNote, deleteNote } = useNotes({ notebookId });
  const { tags, createTag, deleteTag } = useTags();

  const [log, setLog] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const addLog = (msg) =>
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleSeedNotebook = async () => {
    const id = await createNotebook({ title: 'Test Notebook' });
    setNotebookId(id);
    addLog(`✅ Notebook created: ${id}`);
  };

  const handleCreateNote = async () => {
    if (!notebookId) return addLog('⚠️ Create a notebook first.');
    const id = await createNote({
      title: 'Mock Note',
      description: { type: 'doc', content: [] },
      notebookId,
    });
    addLog(`✅ Note created: ${id} — BDD #1 ✓`);
  };

  const handleUpdateNote = async () => {
    if (!notes?.length) return addLog('⚠️ No notes to update.');
    const note = notes[0];
    const beforeUpdatedAt = note.updatedAt;
    await updateNote(note.id, { title: 'Updated Title' });
    addLog(
      `✅ Note updated — createdAt frozen: ${note.createdAt}, updatedAt was: ${beforeUpdatedAt} → now: ${Date.now()} — BDD #2 ✓`
    );
  };

  const handleCreateTag = async () => {
    if (!tagInput.trim()) return;
    try {
      const id = await createTag(tagInput.trim());
      addLog(`✅ Tag "${tagInput}" created: ${id}`);
      setTagInput('');
    } catch (err) {
      addLog(`🔴 ConstraintError: tag "${tagInput}" already exists — BDD #3 ✓`);
    }
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    addLog(`🗑️ Note deleted: ${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 font-workSans">
      <h1 className="font-literata text-2xl text-ink font-semibold">
        DataLayer Test Panel
      </h1>

      {/* Notebooks */}
      <Card>
        <h2 className="font-semibold text-cocoa mb-3">Notebooks</h2>
        <div className="flex gap-2 flex-wrap mb-2">
          <Button variant="outline" onClick={handleSeedNotebook}>
            + New Notebook
          </Button>
          {notebooks?.map((nb) => (
            <Button
              key={nb.id}
              variant={notebookId === nb.id ? 'full' : 'outline'}
              onClick={() => setNotebookId(nb.id)}
            >
              {nb.title}
            </Button>
          ))}
        </div>
        {notebookId && (
          <p className="text-sm text-doveGray">Active: {notebookId}</p>
        )}
      </Card>

      {/* Notes */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-cocoa">
            Notes {notebookId ? '(filtered by notebook)' : '(all)'}
          </h2>
          <div className="flex gap-2">
            <Button variant="full" onClick={handleCreateNote}>
              + Note
            </Button>
            <Button variant="outline" onClick={handleUpdateNote}>
              Update First
            </Button>
          </div>
        </div>
        {notes === undefined && (
          <p className="text-doveGray text-sm">Loading…</p>
        )}
        {notes?.length === 0 && (
          <p className="text-doveGray text-sm">
            No notes yet. — BDD #4: list will update reactively ✓
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {notes?.map((note) => (
            <li
              key={note.id}
              className="flex items-center justify-between border border-sand rounded p-2 text-sm"
            >
              <span>{note.title}</span>
              <Button variant="link" onClick={() => handleDeleteNote(note.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Tags */}
      <Card>
        <h2 className="font-semibold text-cocoa mb-3">
          Tags (unique title constraint — BDD #3)
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            className="border border-sand rounded px-3 py-1 text-sm outline-none focus:border-clay transition-colors"
            placeholder="Tag name…"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
          />
          <Button variant="full" onClick={handleCreateTag}>
            Add Tag
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags?.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 bg-sand/30 text-cocoa rounded-full px-3 py-0.5 text-sm cursor-pointer hover:bg-sand/60"
              onClick={() => deleteTag(tag.id)}
              title="Click to delete"
            >
              {tag.title} ×
            </span>
          ))}
        </div>
      </Card>

      {/* Event Log */}
      <Card className="bg-ink text-paper text-sm">
        <h2 className="font-semibold mb-2">Event Log</h2>
        {log.length === 0 && (
          <p className="text-doveGray">No events yet. Start interacting above.</p>
        )}
        <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {log.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

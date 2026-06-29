/**
 * Unit tests for the useNotes hook.
 *
 * @description Tests every scenario defined in specs/useNotes.md.
 *
 * Isolation strategy — fresh IDBFactory per test:
 *  The `db` singleton from database.js is replaced via vi.mock with a getter
 *  that returns a fresh Dexie instance created in beforeEach. Each test gets
 *  its own in-memory IndexedDB powered by a NEW IDBFactory(), so mutations
 *  from one test can never contaminate the next and Dexie never enters a bad
 *  state from accumulated transactions on a shared IDB instance.
 *
 * useLiveQuery mock rationale:
 *  dexie-react-hooks's useLiveQuery relies on useSyncExternalStore and Dexie's
 *  internal observable system, which does not operate reliably in JSDOM. The
 *  mock replaces it with useState + useEffect that runs the query function once
 *  on mount — sufficient for testing ordering and filtering because the DB is
 *  always seeded before the hook mounts.
 *
 * Test tool chain:
 *  - Vitest       — test runner.
 *  - renderHook   — mounts the hook without a component tree.
 *  - act / waitFor — flush async React state updates.
 *  - Dexie        — real ORM against fresh fake-indexeddb per test.
 */

import { useState, useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import Dexie from 'dexie';
import { IDBFactory } from 'fake-indexeddb';

// ---------------------------------------------------------------------------
// Fresh Dexie instance per test.
// vi.mock is hoisted; we use a getter so it reads `testDb` at call time.
// ---------------------------------------------------------------------------

let testDb;

vi.mock('@/db/database', () => ({
  get db() { return testDb; },
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (queryFn, deps) => {
    const [result, setResult] = useState(undefined);
    useEffect(() => {
      let mounted = true;
      queryFn()
        .then((v) => { if (mounted) setResult(v); })
        .catch(() => { if (mounted) setResult([]); });
      return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps ?? []);
    return result;
  },
}));

beforeEach(() => {
  testDb = new Dexie('TestDB', { indexedDB: new IDBFactory() });
  testDb.version(1).stores({
    notes: '&id, title, notebookId, isFavorite, *tags, createdAt, updatedAt',
  });
});

afterEach(async () => {
  try { await testDb.delete(); } catch { /* ignore */ }
});

// Dynamic import so useNotes picks up the mocked db module.
const { useNotes } = await import('./useNotes');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const mountHook = async (filters = {}) => {
  const hookResult = renderHook(() => useNotes(filters));
  await waitFor(() => {
    expect(hookResult.result.current.notes).toBeDefined();
  });
  return hookResult;
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useNotes — initial state', () => {
  it('notes resolves to an empty array when the database is empty', async () => {
    const { result } = await mountHook();
    expect(result.current.notes).toEqual([]);
  });

  it('error starts as null', async () => {
    const { result } = await mountHook();
    expect(result.current.error).toBeNull();
  });

  it('exposes createNote, updateNote, deleteNote and getNoteById as functions', async () => {
    const { result } = await mountHook();
    expect(typeof result.current.createNote).toBe('function');
    expect(typeof result.current.updateNote).toBe('function');
    expect(typeof result.current.deleteNote).toBe('function');
    expect(typeof result.current.getNoteById).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// createNote
// ---------------------------------------------------------------------------

describe('useNotes — createNote', () => {
  it('persists the note to IndexedDB', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'First Note', description: null });
    });

    const persisted = await testDb.notes.get(noteId);
    expect(persisted).toBeDefined();
    expect(persisted.title).toBe('First Note');
  });

  it('returns the UUID of the new note', async () => {
    const { result } = await mountHook();
    let returnedId;

    await act(async () => {
      returnedId = await result.current.createNote({ title: 'UUID Test', description: null });
    });

    expect(typeof returnedId).toBe('string');
    expect(returnedId.length).toBeGreaterThan(0);
  });

  it('applies default values: notebookId=null, isFavorite=false, tags=[]', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Defaults', description: null });
    });

    const note = await testDb.notes.get(noteId);
    expect(note.notebookId).toBeNull();
    expect(note.isFavorite).toBe(false);
    expect(note.tags).toEqual([]);
  });

  it('sets createdAt and updatedAt to the current timestamp', async () => {
    const before = Date.now();
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Timestamps', description: null });
    });

    const after = Date.now();
    const note = await testDb.notes.get(noteId);
    expect(note.createdAt).toBeGreaterThanOrEqual(before);
    expect(note.createdAt).toBeLessThanOrEqual(after);
    expect(note.updatedAt).toBe(note.createdAt);
  });

  it('allows consumer-provided values to override defaults', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({
        title: 'Override',
        description: null,
        isFavorite: true,
        tags: ['react', 'vitest'],
      });
    });

    const note = await testDb.notes.get(noteId);
    expect(note.isFavorite).toBe(true);
    expect(note.tags).toEqual(['react', 'vitest']);
  });
});

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

describe('useNotes — ordering', () => {
  it('returns notes sorted by createdAt descending (most recent first)', async () => {
    await testDb.notes.bulkAdd([
      {
        id: 'old', title: 'Older Note', description: null,
        notebookId: null, isFavorite: false, tags: [],
        createdAt: new Date('2026-01-01T08:00:00Z').getTime(),
        updatedAt: new Date('2026-01-01T08:00:00Z').getTime(),
      },
      {
        id: 'new', title: 'Newer Note', description: null,
        notebookId: null, isFavorite: false, tags: [],
        createdAt: new Date('2026-01-02T08:00:00Z').getTime(),
        updatedAt: new Date('2026-01-02T08:00:00Z').getTime(),
      },
    ]);

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.notes).toHaveLength(2));

    expect(result.current.notes[0].title).toBe('Newer Note');
    expect(result.current.notes[1].title).toBe('Older Note');
  });
});

// ---------------------------------------------------------------------------
// updateNote
// ---------------------------------------------------------------------------

describe('useNotes — updateNote', () => {
  it('updates the title field in the database', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Original', description: null });
    });

    await act(async () => {
      await result.current.updateNote(noteId, { title: 'Updated' });
    });

    expect((await testDb.notes.get(noteId)).title).toBe('Updated');
  });

  it('stamps a new updatedAt that is greater than the original', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Original', description: null });
    });

    const originalUpdatedAt = (await testDb.notes.get(noteId)).updatedAt;

    await new Promise((r) => setTimeout(r, 5)); // ensure time advances

    await act(async () => {
      await result.current.updateNote(noteId, { title: 'Updated' });
    });

    expect((await testDb.notes.get(noteId)).updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it('never overwrites the id field even if included in the payload', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Test', description: null });
    });

    await act(async () => {
      await result.current.updateNote(noteId, { title: 'Updated', id: 'hacked-id' });
    });

    expect((await testDb.notes.get(noteId)).id).toBe(noteId);
  });

  it('never overwrites the createdAt field even if included in the payload', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Test', description: null });
    });

    const originalCreatedAt = (await testDb.notes.get(noteId)).createdAt;

    await act(async () => {
      await result.current.updateNote(noteId, { title: 'Updated', createdAt: 9999999999999 });
    });

    expect((await testDb.notes.get(noteId)).createdAt).toBe(originalCreatedAt);
  });
});

// ---------------------------------------------------------------------------
// deleteNote
// ---------------------------------------------------------------------------

describe('useNotes — deleteNote', () => {
  it('permanently removes the note from IndexedDB', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Delete me', description: null });
    });

    await act(async () => {
      await result.current.deleteNote(noteId);
    });

    expect(await testDb.notes.get(noteId)).toBeUndefined();
  });

  it('getNoteById returns undefined after the note is deleted', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Delete me', description: null });
    });

    await act(async () => {
      await result.current.deleteNote(noteId);
    });

    expect(await result.current.getNoteById(noteId)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getNoteById
// ---------------------------------------------------------------------------

describe('useNotes — getNoteById', () => {
  it('returns the note matching the provided id', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Find Me', description: null });
    });

    const note = await result.current.getNoteById(noteId);
    expect(note).toBeDefined();
    expect(note.title).toBe('Find Me');
    expect(note.id).toBe(noteId);
  });

  it('returns undefined for a non-existent id', async () => {
    const { result } = await mountHook();
    expect(await result.current.getNoteById('non-existent')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Filtering by notebookId
// ---------------------------------------------------------------------------

describe('useNotes — filter: notebookId', () => {
  it('returns only notes belonging to the specified notebookId', async () => {
    await testDb.notes.bulkAdd([
      {
        id: 'n1', title: 'Notebook A', description: null,
        notebookId: 'nb-A', isFavorite: false, tags: [], createdAt: 1, updatedAt: 1,
      },
      {
        id: 'n2', title: 'Notebook B', description: null,
        notebookId: 'nb-B', isFavorite: false, tags: [], createdAt: 2, updatedAt: 2,
      },
    ]);

    const { result } = await mountHook({ notebookId: 'nb-A' });
    await waitFor(() => expect(result.current.notes).toHaveLength(1));

    expect(result.current.notes[0].title).toBe('Notebook A');
  });
});

// ---------------------------------------------------------------------------
// Filtering by isFavorite
// ---------------------------------------------------------------------------

describe('useNotes — filter: isFavorite', () => {
  it('returns only favorited notes when isFavorite=true', async () => {
    await testDb.notes.bulkAdd([
      {
        id: 'f1', title: 'Favorite', description: null,
        notebookId: null, isFavorite: true, tags: [], createdAt: 1, updatedAt: 1,
      },
      {
        id: 'f2', title: 'Regular', description: null,
        notebookId: null, isFavorite: false, tags: [], createdAt: 2, updatedAt: 2,
      },
    ]);

    const { result } = await mountHook({ isFavorite: true });
    await waitFor(() => expect(result.current.notes).toHaveLength(1));

    expect(result.current.notes[0].title).toBe('Favorite');
  });

  it('returns only non-favorited notes when isFavorite=false', async () => {
    await testDb.notes.bulkAdd([
      {
        id: 'g1', title: 'Favorite', description: null,
        notebookId: null, isFavorite: true, tags: [], createdAt: 1, updatedAt: 1,
      },
      {
        id: 'g2', title: 'Regular', description: null,
        notebookId: null, isFavorite: false, tags: [], createdAt: 2, updatedAt: 2,
      },
    ]);

    const { result } = await mountHook({ isFavorite: false });
    await waitFor(() => expect(result.current.notes).toHaveLength(1));

    expect(result.current.notes[0].title).toBe('Regular');
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('useNotes — error handling', () => {
  it('sets the error state when createNote fails', async () => {
    const { result } = await mountHook();

    vi.spyOn(testDb.notes, 'add').mockRejectedValueOnce(new Error('DB write failed'));

    await act(async () => {
      try {
        await result.current.createNote({ title: 'Fail', description: null });
      } catch { /* expected re-throw */ }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('DB write failed');
    vi.restoreAllMocks();
  });

  it('sets the error state when deleteNote fails', async () => {
    const { result } = await mountHook();
    let noteId;

    await act(async () => {
      noteId = await result.current.createNote({ title: 'Delete Fail', description: null });
    });

    vi.spyOn(testDb.notes, 'delete').mockRejectedValueOnce(new Error('DB delete failed'));

    await act(async () => {
      try {
        await result.current.deleteNote(noteId);
      } catch { /* expected re-throw */ }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('DB delete failed');
    vi.restoreAllMocks();
  });
});


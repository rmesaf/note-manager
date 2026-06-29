/**
 * Unit tests for the useNotebooks hook.
 *
 * @description Tests every scenario defined in specs/useNotebooks.md.
 * Mirrors the isolation strategy established in useNotes.test.js:
 *
 *  - Fresh IDBFactory per test: each test receives its own in-memory Dexie
 *    instance so mutations from one test cannot contaminate the next.
 *  - vi.mock getter: `@/db/database` is mocked with a JS getter so the `db`
 *    reference read inside useNotebooks.js always returns the current `testDb`
 *    created in beforeEach (live binding, not a captured value).
 *  - useLiveQuery mock: dexie-react-hooks's subscription system does not
 *    operate reliably in JSDOM. The mock runs the query function once on mount
 *    via useState + useEffect, which is sufficient for all ordering and read
 *    tests when the DB is seeded before the hook mounts.
 *
 * No cascade-delete scenario: deleteNotebook removes only the notebook record.
 * A note that references the deleted notebook's id is seeded directly via
 * testDb.notes to verify it remains untouched after deletion.
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
// Fresh Dexie instance per test via vi.mock getter.
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
    notebooks: '&id, title, createdAt, updatedAt',
  });
});

afterEach(async () => {
  try { await testDb.delete(); } catch { /* ignore */ }
});

// Dynamic import after mocks are registered.
const { useNotebooks } = await import('./useNotebooks');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Mounts useNotebooks and waits for the initial useLiveQuery to resolve.
 * @returns {import('@testing-library/react').RenderHookResult}
 */
const mountHook = async () => {
  const hookResult = renderHook(() => useNotebooks());
  await waitFor(() => {
    expect(hookResult.result.current.notebooks).toBeDefined();
  });
  return hookResult;
};

// ---------------------------------------------------------------------------
// Initial state
// Gherkin: "Hook initializes with an empty notebooks list"
// ---------------------------------------------------------------------------

describe('useNotebooks — initial state', () => {
  it('notebooks resolves to an empty array when the database is empty', async () => {
    const { result } = await mountHook();
    expect(result.current.notebooks).toEqual([]);
  });

  it('error starts as null', async () => {
    const { result } = await mountHook();
    expect(result.current.error).toBeNull();
  });

  it('exposes all four CRUD functions', async () => {
    const { result } = await mountHook();
    expect(typeof result.current.createNotebook).toBe('function');
    expect(typeof result.current.updateNotebook).toBe('function');
    expect(typeof result.current.deleteNotebook).toBe('function');
    expect(typeof result.current.getNotebookById).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// createNotebook
// Gherkin: "createNotebook persists the notebook to IndexedDB"
// ---------------------------------------------------------------------------

describe('useNotebooks — createNotebook', () => {
  it('persists the notebook with the provided title', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Work' });
    });

    const persisted = await testDb.notebooks.get(notebookId);
    expect(persisted).toBeDefined();
    expect(persisted.title).toBe('Work');
  });

  it('returns the UUID of the new notebook', async () => {
    const { result } = await mountHook();
    let returnedId;

    await act(async () => {
      returnedId = await result.current.createNotebook({ title: 'Personal' });
    });

    expect(typeof returnedId).toBe('string');
    expect(returnedId.length).toBeGreaterThan(0);
  });

  it('sets createdAt and updatedAt to a recent timestamp', async () => {
    const before = Date.now();
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Timestamps' });
    });

    const after = Date.now();
    const notebook = await testDb.notebooks.get(notebookId);
    expect(notebook.createdAt).toBeGreaterThanOrEqual(before);
    expect(notebook.createdAt).toBeLessThanOrEqual(after);
    expect(notebook.updatedAt).toBe(notebook.createdAt);
  });

  it('preserves extra payload fields beyond title', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({
        title: 'With Color',
        color: '#ff0000',
      });
    });

    const notebook = await testDb.notebooks.get(notebookId);
    expect(notebook.color).toBe('#ff0000');
  });
});

// ---------------------------------------------------------------------------
// Ordering — alphabetical by title
// Gherkin: "Notebooks are returned sorted alphabetically by title"
// ---------------------------------------------------------------------------

describe('useNotebooks — ordering', () => {
  it('returns notebooks sorted alphabetically by title (A before B)', async () => {
    await testDb.notebooks.bulkAdd([
      { id: 'nb-2', title: 'Bravo', createdAt: 1, updatedAt: 1 },
      { id: 'nb-1', title: 'Alpha', createdAt: 2, updatedAt: 2 },
    ]);

    const { result } = await mountHook();
    await waitFor(() => expect(result.current.notebooks).toHaveLength(2));

    expect(result.current.notebooks[0].title).toBe('Alpha');
    expect(result.current.notebooks[1].title).toBe('Bravo');
  });
});

// ---------------------------------------------------------------------------
// updateNotebook
// Gherkin: "updateNotebook persists changed fields"
// ---------------------------------------------------------------------------

describe('useNotebooks — updateNotebook', () => {
  it('updates the title field in the database', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Original' });
    });

    await act(async () => {
      await result.current.updateNotebook(notebookId, { title: 'Renamed' });
    });

    expect((await testDb.notebooks.get(notebookId)).title).toBe('Renamed');
  });

  it('stamps a new updatedAt that is greater than the original', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Original' });
    });

    const originalUpdatedAt = (await testDb.notebooks.get(notebookId)).updatedAt;

    await new Promise((r) => setTimeout(r, 5)); // ensure time advances

    await act(async () => {
      await result.current.updateNotebook(notebookId, { title: 'Updated' });
    });

    expect(
      (await testDb.notebooks.get(notebookId)).updatedAt
    ).toBeGreaterThan(originalUpdatedAt);
  });

  it('never overwrites the id field even if included in the payload', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Test' });
    });

    await act(async () => {
      await result.current.updateNotebook(notebookId, {
        title: 'Updated',
        id: 'hacked-id',
      });
    });

    expect((await testDb.notebooks.get(notebookId)).id).toBe(notebookId);
  });

  it('never overwrites the createdAt field even if included in the payload', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Test' });
    });

    const originalCreatedAt = (await testDb.notebooks.get(notebookId)).createdAt;

    await act(async () => {
      await result.current.updateNotebook(notebookId, {
        title: 'Updated',
        createdAt: 9999999999999,
      });
    });

    expect(
      (await testDb.notebooks.get(notebookId)).createdAt
    ).toBe(originalCreatedAt);
  });
});

// ---------------------------------------------------------------------------
// deleteNotebook
// Gherkin: "deleteNotebook permanently removes the notebook from IndexedDB"
// ---------------------------------------------------------------------------

describe('useNotebooks — deleteNotebook', () => {
  it('removes the notebook from the database', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'To Delete' });
    });

    await act(async () => {
      await result.current.deleteNotebook(notebookId);
    });

    expect(await testDb.notebooks.get(notebookId)).toBeUndefined();
  });

  it('getNotebookById returns undefined after deletion', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'To Delete' });
    });

    await act(async () => {
      await result.current.deleteNotebook(notebookId);
    });

    expect(await result.current.getNotebookById(notebookId)).toBeUndefined();
  });

  it('does NOT cascade-delete notes that reference the deleted notebook', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'With Notes' });
    });

    // Seed a note referencing this notebook directly via testDb.
    const noteId = 'orphan-note-1';
    await testDb.notes.add({
      id: noteId,
      title: 'Note in notebook',
      description: null,
      notebookId,
      isFavorite: false,
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await act(async () => {
      await result.current.deleteNotebook(notebookId);
    });

    // The notebook is gone but the note is still present with its original notebookId.
    const orphanNote = await testDb.notes.get(noteId);
    expect(orphanNote).toBeDefined();
    expect(orphanNote.notebookId).toBe(notebookId);
  });
});

// ---------------------------------------------------------------------------
// getNotebookById
// Gherkin: "getNotebookById returns the correct notebook by id"
// ---------------------------------------------------------------------------

describe('useNotebooks — getNotebookById', () => {
  it('returns the notebook matching the provided id', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Find Me' });
    });

    const notebook = await result.current.getNotebookById(notebookId);
    expect(notebook).toBeDefined();
    expect(notebook.title).toBe('Find Me');
    expect(notebook.id).toBe(notebookId);
  });

  it('returns undefined for a non-existent id', async () => {
    const { result } = await mountHook();
    expect(await result.current.getNotebookById('does-not-exist')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Error handling
// Gherkin: "createNotebook sets the error state when the DB write fails"
// ---------------------------------------------------------------------------

describe('useNotebooks — error handling', () => {
  it('sets the error state when createNotebook fails', async () => {
    const { result } = await mountHook();

    vi.spyOn(testDb.notebooks, 'add').mockRejectedValueOnce(
      new Error('DB write failed')
    );

    await act(async () => {
      try {
        await result.current.createNotebook({ title: 'Fail' });
      } catch { /* expected re-throw */ }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('DB write failed');
    vi.restoreAllMocks();
  });

  it('sets the error state when deleteNotebook fails', async () => {
    const { result } = await mountHook();
    let notebookId;

    await act(async () => {
      notebookId = await result.current.createNotebook({ title: 'Delete Fail' });
    });

    vi.spyOn(testDb.notebooks, 'delete').mockRejectedValueOnce(
      new Error('DB delete failed')
    );

    await act(async () => {
      try {
        await result.current.deleteNotebook(notebookId);
      } catch { /* expected re-throw */ }
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe('DB delete failed');
    vi.restoreAllMocks();
  });
});

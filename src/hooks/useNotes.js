'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

/**
 * Custom hook for reactive CRUD operations on the notes collection.
 * @description Encapsulates all note-related database logic so UI components
 * remain agnostic of IndexedDB implementation details. Uses useLiveQuery to
 * automatically re-render consumers whenever the underlying data changes,
 * eliminating the need for manual state synchronization after mutations.
 * Filters are applied in-memory after fetching to support combining notebookId
 * and isFavorite simultaneously without requiring a compound Dexie index.
 * @param {Object} [filters={}] - Optional filters to narrow the reactive query.
 * @param {string} [filters.notebookId] - Return only notes belonging to this notebook.
 * @param {boolean} [filters.isFavorite] - Return only favorited or non-favorited notes.
 * @returns {{
 *   notes: Array<Object>|undefined,
 *   createNote: Function,
 *   updateNote: Function,
 *   deleteNote: Function,
 *   getNoteById: Function,
 *   error: Error|null
 * }}
 */
export function useNotes({ notebookId, isFavorite } = {}) {
  const [error, setError] = useState(null);

  const notes = useLiveQuery(async () => {
    let results = await db.notes.orderBy('createdAt').reverse().toArray();

    if (notebookId !== undefined) {
      results = results.filter((note) => note.notebookId === notebookId);
    }

    if (isFavorite !== undefined) {
      results = results.filter((note) => note.isFavorite === isFavorite);
    }

    return results;
  }, [notebookId, isFavorite]);

  /**
   * Persists a new note to IndexedDB with auto-generated id and timestamps.
   * @description Generates a UUID and sets both createdAt and updatedAt to the
   * current timestamp at creation time, ensuring the data model invariant
   * that createdAt is immutable after the first write.
   * @param {Object} payload - Note fields to persist (title, description, etc.).
   * @returns {Promise<string>} The generated UUID of the new note.
   */
  const createNote = async (payload) => {
    try {
      const now = Date.now();
      const note = {
        notebookId: null,
        isFavorite: false,
        tags: [],
        ...payload,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await db.notes.add(note);
      return note.id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Updates specified fields of an existing note.
   * @description Explicitly strips createdAt and id from the update payload before
   * writing to the database, guaranteeing these immutable fields can never be
   * accidentally overwritten by callers. Always stamps the current time to updatedAt.
   * @param {string} id - UUID of the note to update.
   * @param {Object} payload - Fields to update (excluding id and createdAt).
   * @returns {Promise<void>}
   */
  const updateNote = async (id, payload) => {
    try {
      const { createdAt: _createdAt, id: _id, ...safeUpdates } = payload;
      await db.notes.update(id, { ...safeUpdates, updatedAt: Date.now() });
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Permanently removes a note from the database.
   * @description Deletes by primary key. The caller is responsible for any
   * pre-delete side effects (e.g., confirming with the user).
   * @param {string} id - UUID of the note to delete.
   * @returns {Promise<void>}
   */
  const deleteNote = async (id) => {
    try {
      await db.notes.delete(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Retrieves a single note by its UUID.
   * @description Non-reactive point-in-time read. Use the reactive `notes` array
   * for list views and this function for detail views that need a specific record.
   * @param {string} id - UUID of the note to retrieve.
   * @returns {Promise<Object|undefined>} The note entity or undefined if not found.
   */
  const getNoteById = async (id) => {
    try {
      return await db.notes.get(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { notes, createNote, updateNote, deleteNote, getNoteById, error };
}

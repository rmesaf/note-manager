'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

/**
 * Custom hook for reactive CRUD operations on the notebooks collection.
 * @description Encapsulates all notebook-related database logic. Notebooks act as
 * containers for notes, so deleting a notebook should be accompanied by handling
 * orphaned notes (setting their notebookId to null) in the UI layer or via a
 * dedicated cleanup operation — this hook only manages the notebook entity itself.
 * @returns {{
 *   notebooks: Array<Object>|undefined,
 *   createNotebook: Function,
 *   updateNotebook: Function,
 *   deleteNotebook: Function,
 *   getNotebookById: Function,
 *   error: Error|null
 * }}
 */
export function useNotebooks() {
  const [error, setError] = useState(null);

  const notebooks = useLiveQuery(() =>
    db.notebooks.orderBy('title').toArray()
  );

  /**
   * Persists a new notebook to IndexedDB with auto-generated id and timestamps.
   * @param {Object} payload - Notebook fields to persist. `title` is required.
   * @param {string} payload.title - The name of the notebook.
   * @returns {Promise<string>} The generated UUID of the new notebook.
   */
  const createNotebook = async (payload) => {
    try {
      const now = Date.now();
      const notebook = {
        ...payload,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      await db.notebooks.add(notebook);
      return notebook.id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Updates specified fields of an existing notebook.
   * @description Strips immutable fields (id, createdAt) before writing to ensure
   * they cannot be accidentally overwritten. Always stamps updatedAt with the
   * current timestamp to track the last modification time.
   * @param {string} id - UUID of the notebook to update.
   * @param {Object} payload - Fields to update.
   * @returns {Promise<void>}
   */
  const updateNotebook = async (id, payload) => {
    try {
      const { createdAt: _createdAt, id: _id, ...safeUpdates } = payload;
      await db.notebooks.update(id, { ...safeUpdates, updatedAt: Date.now() });
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Permanently removes a notebook from the database.
   * @description Does not cascade-delete associated notes. The caller should
   * handle orphaned notes (e.g., nullify their notebookId) before or after deletion.
   * @param {string} id - UUID of the notebook to delete.
   * @returns {Promise<void>}
   */
  const deleteNotebook = async (id) => {
    try {
      await db.notebooks.delete(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Retrieves a single notebook by its UUID.
   * @param {string} id - UUID of the notebook to retrieve.
   * @returns {Promise<Object|undefined>} The notebook entity or undefined if not found.
   */
  const getNotebookById = async (id) => {
    try {
      return await db.notebooks.get(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { notebooks, createNotebook, updateNotebook, deleteNotebook, getNotebookById, error };
}

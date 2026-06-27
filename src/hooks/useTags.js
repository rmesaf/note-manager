'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

/**
 * Custom hook for reactive CRUD operations on the tags collection.
 * @description Encapsulates all tag-related database logic. The `&title` unique
 * index in the schema enforces uniqueness at the database level — Dexie throws a
 * ConstraintError on duplicate insertions, which this hook surfaces via the `error`
 * state so the UI can render an appropriate toast or notification.
 * @returns {{
 *   tags: Array<Object>|undefined,
 *   createTag: Function,
 *   deleteTag: Function,
 *   getTagByTitle: Function,
 *   error: Error|null
 * }}
 */
export function useTags() {
  const [error, setError] = useState(null);

  const tags = useLiveQuery(() =>
    db.tags.orderBy('title').toArray()
  );

  /**
   * Persists a new tag to IndexedDB.
   * @description The `&title` unique index in Dexie will throw a ConstraintError
   * if a tag with the same title already exists. This error is intentionally
   * re-thrown after being stored in state so UI layers can catch it and render
   * user-facing feedback (e.g., "Tag already exists").
   * @param {string} title - The unique name for the new tag.
   * @returns {Promise<string>} The generated UUID of the new tag.
   */
  const createTag = async (title) => {
    try {
      const tag = {
        id: crypto.randomUUID(),
        title,
      };
      await db.tags.add(tag);
      return tag.id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Permanently removes a tag from the database.
   * @description Does not cascade-remove the tag from associated notes' tags arrays.
   * The caller should handle cleanup of stale tag references in notes if needed.
   * @param {string} id - UUID of the tag to delete.
   * @returns {Promise<void>}
   */
  const deleteTag = async (id) => {
    try {
      await db.tags.delete(id);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  /**
   * Retrieves a tag by its unique title.
   * @description Useful for checking existence before attempting creation, or for
   * resolving a tag title to its UUID when associating tags with notes.
   * @param {string} title - The exact title of the tag to find.
   * @returns {Promise<Object|undefined>} The tag entity or undefined if not found.
   */
  const getTagByTitle = async (title) => {
    try {
      return await db.tags.where('title').equals(title).first();
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { tags, createTag, deleteTag, getTagByTitle, error };
}

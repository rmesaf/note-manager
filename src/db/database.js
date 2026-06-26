import Dexie from 'dexie';

/**
 * Singleton Dexie database instance for the SoftCraft application.
 * @description Centralizes the IndexedDB configuration in a single module to prevent
 * multiple concurrent connections and memory leaks. Exporting a singleton ensures
 * all hooks share the same connection pool and transaction context across the app.
 * Schema indexes are chosen based on the expected query patterns:
 * - notebookId/isFavorite: filtered list views
 * - *tags: multi-entry index enables querying notes by individual tag values
 * - createdAt/updatedAt: chronological sorting
 * - &title on tags: unique constraint prevents duplicate tag names at the DB level
 */
const db = new Dexie('SoftCraftDB');

db.version(1).stores({
  notes: '&id, title, notebookId, isFavorite, *tags, createdAt, updatedAt',
  notebooks: '&id, title, createdAt, updatedAt',
  tags: '&id, &title',
});

export { db };

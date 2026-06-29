/**
 * Environment smoke test — validates that Vitest + RTL + fake-indexeddb are
 * wired together correctly before any feature tests are written.
 *
 * @description Two independent concerns are tested here:
 *
 *  1. React rendering pipeline — confirms that @vitejs/plugin-react, JSDOM,
 *     and @testing-library/react are all cooperating. If the JSX transform,
 *     the DOM environment, or the jest-dom matchers were misconfigured this
 *     test would fail before any application code is exercised.
 *
 *  2. Dexie + fake-indexeddb — confirms that Dexie can open a database,
 *     write a record and read it back within the in-memory IndexedDB shim.
 *     This must pass for every hook or utility that touches `lib/db.js` to
 *     be testable in isolation.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dexie from 'dexie';

// ---------------------------------------------------------------------------
// 1. React + RTL smoke test
// ---------------------------------------------------------------------------

/**
 * Minimal React component used exclusively to validate the render pipeline.
 * @returns {JSX.Element}
 */
const Greeting = ({ name }) => <p>Hello, {name}!</p>;

describe('Environment: React + RTL', () => {
  it('renders a React component and finds it in the DOM', () => {
    render(<Greeting name="Vitest" />);

    expect(screen.getByText('Hello, Vitest!')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. Dexie + fake-indexeddb smoke test
// ---------------------------------------------------------------------------

/**
 * Isolated Dexie database used only within this smoke test suite.
 * A fresh IDBFactory is already present on `globalThis.indexedDB` thanks to
 * vitest.setup.js, so Dexie will use the in-memory implementation.
 */
const buildTestDb = () => {
  const db = new Dexie('SmokeTestDB');

  db.version(1).stores({
    items: '++id, label',
  });

  return db;
};

describe('Environment: Dexie + fake-indexeddb', () => {
  it('creates a record and reads it back from the in-memory IndexedDB', async () => {
    const db = buildTestDb();

    const insertedId = await db.items.add({ label: 'smoke-test-entry' });
    expect(insertedId).toBeDefined();

    const record = await db.items.get(insertedId);
    expect(record).toBeDefined();
    expect(record.label).toBe('smoke-test-entry');

    await db.delete();
  });
});

/**
 * Global test setup file executed by Vitest before every test suite.
 *
 * @description Three responsibilities are handled here so that individual test
 * files stay free of boilerplate:
 *
 *  1. jest-dom matchers — extends Vitest's `expect` with DOM-specific assertions
 *     such as `toBeInTheDocument()`, `toHaveTextContent()`, etc.
 *
 *  2. fake-indexeddb — injects an in-memory IndexedDB implementation into the
 *     global scope before any module that imports Dexie is evaluated. Dexie
 *     detects `globalThis.indexedDB` at import time, so this assignment must
 *     happen here rather than inside individual test files.
 *
 *  3. RTL cleanup — automatically unmounts React trees after each test to
 *     prevent state leakage between test cases.
 */

import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Global test setup file executed by Vitest before every test suite.
 *
 * @description Three responsibilities are handled here so that individual test
 * files stay free of boilerplate:
 *
 *  1. fake-indexeddb/auto — installs a complete, in-memory IndexedDB
 *     implementation into the global scope. Using the `/auto` entry point
 *     registers ALL required globals (IDBFactory, IDBKeyRange, IDBCursor,
 *     IDBObjectStore, etc.) that Dexie needs for index-based operations such
 *     as orderBy(), update(), get(), and cursor queries. The previous approach
 *     of only setting `globalThis.indexedDB = new IDBFactory()` left these
 *     sibling APIs undefined, causing MissingAPIError on any Dexie method that
 *     relies on IDBKeyRange or IDBCursor.
 *
 *  2. jest-dom matchers — extends Vitest's `expect` with DOM-specific assertions
 *     such as `toBeInTheDocument()`, `toHaveTextContent()`, etc.
 *
 *  3. RTL cleanup — automatically unmounts React trees after each test to
 *     prevent state leakage between test cases.
 */

// Must be imported before any Dexie module is evaluated.
import 'fake-indexeddb/auto';

// Automatically unmount components rendered with RTL after every single test.
afterEach(() => {
  cleanup();
});

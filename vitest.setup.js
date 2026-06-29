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
import { IDBFactory } from 'fake-indexeddb';

// Inject fake IndexedDB into the JSDOM global scope.
// This must run before any Dexie database is instantiated.
globalThis.indexedDB = new IDBFactory();

// Automatically unmount components rendered with RTL after every single test.
afterEach(() => {
  cleanup();
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest configuration for the Notes Manager Next.js project.
 *
 * @description Bridges Vitest with the Next.js/React ecosystem. The React plugin
 * handles JSX transforms so test files don't need explicit React imports. Path
 * aliases mirror those declared in jsconfig.json so every `@/` import resolves
 * correctly inside the JSDOM environment without touching the Next.js compiler.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    /**
     * JSDOM simulates a browser DOM inside Node.js, which is required by RTL
     * and by Dexie's IndexedDB shim (fake-indexeddb).
     */
    environment: 'jsdom',

    /**
     * Loaded once before every test file. Registers jest-dom matchers,
     * installs fake-indexeddb globals and configures RTL cleanup.
     */
    setupFiles: ['./vitest.setup.js'],

    /**
     * Allow RTL helpers (render, screen, fireEvent…) to be used without
     * explicit imports in every file, similar to Jest's global API.
     */
    globals: true,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/app/**', 'src/**/*.test.{js,jsx}', 'src/**/__tests__/**'],
    },
  },
});

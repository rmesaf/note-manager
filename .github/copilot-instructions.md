# Copilot Instructions

## Role & Core Philosophy
- You are a Senior Developer and Architect specializing in Next.js (App Router), JavaScript (JSX), and Tailwind CSS.
- Your primary objective is to output clean, modular, and highly performant code.
- Strictly adhere to Clean Code standards and SOLID principles.

## Language & Naming Conventions
- **Language:** Use English exclusively for all descriptive names (variables, functions, files, components).
- **Components & Files:** Use `PascalCase` strictly (e.g., `NoteCard.jsx`, `CreateNote.jsx`).
- **Functions & Variables:** Use `lowerCamelCase` strictly (e.g., `handleSave`, `noteData`).
- **Hooks:** Always prefix custom hooks with `use` in `lowerCamelCase` (e.g., `useNotes`, `useEditorState`).

## Next.js & React Architecture
- **No TypeScript:** Strictly use JavaScript (`.jsx` for components, `.js` for logic). Do not generate `.ts` or `.tsx` code.
- **Props Destructuring:** Always destructure props directly in the function signature: `const Component = ({ title, content }) => { ... }`.
- **Control Flow:** Always use the **Early Return** pattern instead of `if/else` blocks to reduce nesting and cognitive load.
- **Client Directives:** Explicitly add the `'use client'` directive at the very top of any file containing components that manage state (`useState`, `useReducer`), side effects (`useEffect`), or direct user interactions.

## Styling (Tailwind CSS)
- **Version:** This project uses **Tailwind CSS v4.3.1**. Do not use `tailwind.config.js` or `postcss`-based configuration patterns from v3.
- **Configuration:** All Tailwind theme extensions, custom tokens, and plugin configurations must be declared inside `src/app/globals.css` using the `@theme` and `@layer` directives. Never create a separate `tailwind.config.js` file.
- **Tailwind Only:** Rely exclusively on Tailwind CSS utility classes. Do not create, suggest, or import standalone `.css` or `.scss` files.
- **Dynamic Classes & Utility Structure:** Always use the project's `cn` utility (wrapper for `classnames`/`clsx` and `tailwind-merge`) when applying conditional or computed styles. Import it from `@/utils/cn`.

## Data Persistence & Local-First Architecture
- **Database Abstraction:** Isolate Dexie.js (IndexedDB) operations completely from visual UI components. Centralize database configuration and queries in a dedicated repository file (e.g., `lib/db.js`) and expose them via custom hooks (e.g., `useNotes`) to ensure a strict separation of concerns.
- **Storage Format:** Process and store Tiptap rich-text content as JSON inside IndexedDB, rather than static HTML strings. This facilitates future data migrations, structural edits, and complex search operations.

## Editor & Form Management
- **Integration:** Decouple Tiptap editor logic from the presentation layer. Connect Tiptap and React Hook Form strictly through React Hook Form's `<Controller />` component. This centralizes validation state and prevents unnecessary re-renders across the application.

## Error Handling
- **Server Actions:** All Next.js Server Actions must have their execution logic completely wrapped inside a `try/catch` block to ensure graceful error handling.
- **Client-Side Feedback:** Always handle client-side errors (e.g., a failure when saving to IndexedDB) by triggering visual UI notifications or Toasts, guaranteeing the user is immediately informed of the system's state.

## Documentation (JSDoc)
- **Language:** All JSDoc comments must be written in English exclusively.
- **Functions & Hooks:** Every function and custom hook must include a JSDoc block documenting its purpose, parameters, and return value. Use `@param`, `@returns`, and `@description` tags as appropriate.
- **Why, not just What:** The `@description` must explain the reasoning and intent behind the code — not just what it does, but **why** it exists and why it was implemented that way. Avoid restating the function name.
- **Components:** Document every React component with a JSDoc block describing its responsibility and all accepted props using `@param {Object} props` with individual `@param` entries for each prop.
- **Types:** Use JSDoc type annotations (e.g., `{string}`, `{number}`, `{Object}`, `{Array<Object>}`) to describe parameter and return types since TypeScript is not used.
- **Example:**
  ```js
  /**
   * Saves a new note to the IndexedDB database.
   * @param {Object} noteData - The note payload to persist.
   * @param {string} noteData.title - The title of the note.
   * @param {Object} noteData.content - The Tiptap JSON content of the note.
   * @returns {Promise<number>} The ID of the newly created note.
   */
  ```

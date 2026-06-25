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
- **Tailwind Only:** Rely exclusively on Tailwind CSS utility classes. Do not create, suggest, or import standalone `.css` or `.scss` files.
- **Dynamic Classes & Utility Structure:** Always use the project's `cn` utility (wrapper for `classnames`/`clsx` and `tailwind-merge`) when applying conditional or computed styles. Assume this utility lives in `lib/utils.js` and import it from there by default.

## Data Persistence & Local-First Architecture
- **Database Abstraction:** Isolate Dexie.js (IndexedDB) operations completely from visual UI components. Centralize database configuration and queries in a dedicated repository file (e.g., `lib/db.js`) and expose them via custom hooks (e.g., `useNotes`) to ensure a strict separation of concerns.
- **Storage Format:** Process and store Tiptap rich-text content as JSON inside IndexedDB, rather than static HTML strings. This facilitates future data migrations, structural edits, and complex search operations.

## Editor & Form Management
- **Integration:** Decouple Tiptap editor logic from the presentation layer. Connect Tiptap and React Hook Form strictly through React Hook Form's `<Controller />` component. This centralizes validation state and prevents unnecessary re-renders across the application.

## Error Handling
- **Server Actions:** All Next.js Server Actions must have their execution logic completely wrapped inside a `try/catch` block to ensure graceful error handling.
- **Client-Side Feedback:** Always handle client-side errors (e.g., a failure when saving to IndexedDB) by triggering visual UI notifications or Toasts, guaranteeing the user is immediately informed of the system's state.

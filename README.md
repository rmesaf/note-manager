# Notes Manager

A local-first rich-text note-taking application built as part of a Master's program activity in AI and software development. The app lets users create, edit, and delete notes using a fully-featured rich-text editor, with all data persisted directly in the browser via IndexedDB — no backend required.

The project was built to explore modern frontend architecture patterns: clean separation of concerns, reactive local state with IndexedDB, and integration of a rich-text editor (Tiptap) within a form-driven UI. The goal was to produce a maintainable, modular codebase following SOLID principles and Clean Code standards, using the latest versions of Next.js (App Router) and Tailwind CSS v4 and only AI generated code.

---

## Prerequisites

Make sure you have the following installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher (bundled with Node.js)

---

## Installing

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd notes-manager
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:

```bash
npm run build
npm start
```

---

## Testing

The project has a full testing suite covering unit, integration, and end-to-end levels.

### Unit & Component Tests — Vitest + React Testing Library

All source modules under `src/` are tested with [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Tests follow a **BDD (Behavior-Driven Development)** approach: each test file maps directly to its corresponding specification in `./specs/`.

**Run all unit tests (one-shot):**

```bash
npm test
```

**Run in watch mode (interactive development):**

```bash
npm run test:watch
```

**Generate a coverage report:**

```bash
npm run test:coverage
```

**Open the Vitest visual UI:**

```bash
npm run test:ui
```

#### What is tested

| Layer | Files covered |
|---|---|
| UI primitives | `Button`, `Card`, `Input`, `Link`, `Spinner`, `SearchIcon` |
| Layout components | `Header`, `Footer`, `EmptyState`, `NoteCard` |
| Modal system | `ConfirmModal`, `ModalWrapper`, `ModalContext` (hook via `renderHook`) |
| Form & Editor | `Form`, `schema` (Yup), `Editor`, `EditorToolbar`, `ToolbarButton`, `ToolbarSelect` |
| Custom hooks | `useNotes`, `useNotebooks` (against a real in-memory IndexedDB via `fake-indexeddb`) |

#### Key testing decisions

- **Tiptap is a black box** — `@tiptap/react` and all extension packages are mocked. Tests verify that toolbar buttons dispatch the correct chain commands (e.g. `editor.chain().focus().toggleBold().run()`) without touching ProseMirror internals.
- **IndexedDB isolation** — `fake-indexeddb/auto` is installed in the global setup file (`vitest.setup.js`). Hook tests (`useNotes`, `useNotebooks`) create a fresh `IDBFactory` and a fresh Dexie instance per test using `vi.mock` + `beforeEach`, guaranteeing zero cross-test contamination.
- **`vi.hoisted()`** — Mock variables that must be available inside `vi.mock()` factory closures are declared with `vi.hoisted()` to avoid the "variable is not defined" pitfall caused by factory hoisting.

---

### End-to-End Tests — Playwright

E2E tests live in `./e2e/tests/` and exercise the full application through a real browser. The app is started automatically by the `webServer` block in `playwright.config.js`.

**Run E2E tests headless (Chromium only — fastest):**

```bash
npm run e2e -- --project=chromium
```

**Run E2E tests on all browsers (Chromium, Firefox, WebKit):**

```bash
npm run e2e
```

**Open the Playwright UI for time-travel debugging:**

```bash
npm run e2e:ui
```

**Run a single test in debug mode:**

```bash
npm run e2e:debug
```

#### E2E flows covered (`e2e/tests/notes.spec.js`)

| # | Test | Flow |
|---|---|---|
| 1 | Empty state renders | Read — pristine IndexedDB |
| 2 | Create a note | Create → redirect → card visible |
| 3 | Read multiple notes | Three notes visible simultaneously |
| 4 | Update a note | Edit form → save → updated title on home |
| 5 | Delete a note | Cancel guard (modal) + confirm deletion |
| 6 | IndexedDB persistence | Note survives `page.reload()` |
| 7 | Cancel guard — clean form | Navigates directly without modal |
| 8 | Cancel guard — dirty form | Modal appears, accept navigates home |

#### Key E2E decisions

- **Native browser context isolation** — Playwright creates a fresh `browserContext` (and therefore a fresh IndexedDB origin) for each `test()` by default. No manual `indexedDB.deleteDatabase()` calls are needed.
- **No IDB mocking** — Tests interact with the real browser IndexedDB API. Dexie.js and all storage operations run exactly as in production.
- **Tiptap interaction** — Content is typed by clicking `.ProseMirror` and using `page.keyboard.type()`. No complex keyboard shortcuts or ProseMirror API calls are used.
- **ConfirmModal interaction** — Located by `role="dialog"` (provided by `ModalWrapper`) and its buttons by the Spanish default labels `"Aceptar"` / `"Cancelar"`.

---

## Built With

- [Next.js 15](https://nextjs.org/) — React framework with App Router for file-based routing and server/client component architecture
- [React 19](https://react.dev/) — UI library
- [Tailwind CSS v4](https://tailwindcss.com/) — Utility-first CSS framework configured entirely via `globals.css`
- [Tiptap 3](https://tiptap.dev/) — Headless rich-text editor built on ProseMirror, with extensions for formatting, lists, links, and text alignment
- [React Hook Form](https://react-hook-form.com/) — Performant form state management with minimal re-renders
- [Yup](https://github.com/jquense/yup) — Schema-based form validation
- [Dexie.js](https://dexie.org/) — Elegant IndexedDB wrapper enabling reactive, local-first data persistence via `useLiveQuery`
- [Sonner](https://sonner.emilkowal.ski/) — Toast notification library

---

## Authors

- **Ricardo Mesa** — Project conception, architecture, and requirements
- **GitHub Copilot (Claude Sonnet 4.6)** — AI pair programmer and implementation assistant
- **Gemini Pro** — AI specification assistant

---

## Acknowledgments

* Hat tip to [GitHub Copilot](https://github.com/features/copilot) who developed all the code

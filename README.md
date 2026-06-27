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

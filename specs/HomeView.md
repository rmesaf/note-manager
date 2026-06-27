# File: HomeViewSpec.md

## Feature: Home View and Note Explorer

### 1. Responsibility and Purpose
The Home view (`app/page.jsx`) is the main entry point of the application. It fetches all stored notes via the `useNotes` hook and displays them in a responsive, uniform grid. It handles routing to the creation and edition views, manages the deletion flow utilizing the global modal system, and provides a clear empty state when no notes exist. 

### 2. Architecture & Components
* **Route:** `/` (Root)
* **Client Directive:** Requires `'use client'` as it consumes reactive database hooks (`useNotes`) and UI state hooks (`useModal`).
* **Sub-components:** * `NoteCard.jsx`: A presentational component responsible for rendering individual note data, adhering to strict layout constraints.
    * `EmptyState.jsx`: Rendered conditionally when the notes array is empty.

### 3. Layout and Responsive Grid (Tailwind CSS)
* **Main Container:** Must be centered with a maximum width of 1280px.
    * Classes: `w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8`
* **Grid System:** Mobile-first approach using standard Tailwind breakpoints.
    * Classes: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
* **Header Section:** Displays a main title (e.g., "Tus Notas") and a "New Note" button (redirecting to `/notes/new`). The search functionality is visually present or omitted based on the design, but its logic is out of scope for this MVP.

### 4. NoteCard Component Specification
The `NoteCard` component represents a single note and strictly follows the layout rules requested, overriding the visual mockup where specified.

* **Wrapper:** Uses the foundational `Card` component to maintain the design system (white background, rounded corners, soft border).
* **Top Section (Header):** `flex justify-between items-start mb-4`
    * **Left (Date):** Displays the `updatedAt` date formatted as `DD/MM/YYYY`. Instead of heavy libraries, it uses native `Intl.DateTimeFormat`.
    * **Right (Delete Action):** A trash can SVG wrapped in a button. Triggers the deletion flow.
* **Body Section (Content):**
    * **Title:** Uses `line-clamp-2` and a minimum height to ensure vertical rhythm even if the title is only one line (e.g., `min-h-[3rem]`).
    * **Description:** Uses `line-clamp-3` and a minimum height (e.g., `min-h-[4.5rem]`). Since the database stores Tiptap JSON, a utility function `extractPlainText(descriptionJson)` must be used to safely parse and display only raw text strings.
* **Bottom Section (Footer):** * Contains the "Edit" link. Uses the custom `Link` component pointing to `/notes/[note.id]`.

### 5. Interaction Rules and Logic
* **Delete Flow:** Clicking the trash icon triggers the `useModal` hook.
    ```javascript
    openModal(ConfirmModal, {
      message: 'Are you sure you want to delete this note?',
      onAccept: async () => {
        await deleteNote(note.id);
        toast.success('Note deleted successfully.');
      },
      onCancel: () => {}, 
    });
    ```
    *Note: No manual reload function is needed. The `deleteNote` action mutates IndexedDB, and `useLiveQuery` automatically updates the grid.*
* **Create Flow:** Clicking the main "New Note" button triggers a router push to `/notes/new`.

### 6. Empty State
* If `notes.length === 0`, the grid is replaced by a centered container.
* **Visuals:** `flex flex-col items-center justify-center py-20 text-center`.
* Contains a subtle icon, a text message (e.g., "No notes yet. Start writing your masterpiece!"), and a primary action button redirecting to `/notes/new`.

### 7. Behavioral Specifications (BDD)

```gherkin
Feature: Home View and Note Management

  Scenario: Displaying the responsive grid
    Given the user navigates to the home page
    And there are at least 4 notes in the database
    Then the notes should be displayed in a grid format
    And the grid should show 1 column on mobile screens
    And the grid should show 2 columns on tablet screens (md breakpoint)
    And the grid should show 3 columns on desktop screens (lg breakpoint)

  Scenario: NoteCard structural uniformity
    Given a NoteCard is rendered in the grid
    When the note has a short title of 1 line and a short description of 1 line
    Then the card should enforce minimum heights for both sections
    And the overall height of the card should exactly match sibling cards with longer text

  Scenario: Deleting a note
    Given the user clicks the trash can icon on a NoteCard
    Then the ConfirmModal should open with a deletion warning
    When the user clicks Accept in the modal
    Then the note should be removed from the database
    And the grid should automatically re-render without the deleted note
    And a success toast should be displayed

  Scenario: Rendering the Empty State
    Given the database contains zero notes
    When the user views the home page
    Then the grid should not be rendered
    And the EmptyState component should be visible with a prompt to create a new note.
```
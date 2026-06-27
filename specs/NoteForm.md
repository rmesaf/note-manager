# File: NoteFormSpec.md

## Feature: Create and Edit Note Page

### 1. Responsibility and Purpose
This page (`app/notes/[id]/page.jsx`) handles both the creation of new notes and the editing of existing ones. It integrates `react-hook-form` for state management, `yup` for validation, Tiptap for rich text editing, and the local Dexie.js database hooks (`useNotes`) for data persistence. It enforces data integrity, prevents accidental data loss via a global confirmation modal, and provides immediate visual feedback.

### 2. Architecture & Routing
* **Route:** `/notes/[id]`
* **Mode Detection:** * If `params.id === 'new'`, the page operates in **Create Mode**.
  * If `params.id` is a valid UUID, the page operates in **Edit Mode**, fetching the note via `getNoteById(params.id)`.
* **Client Directive:** Requires `'use client'` since it uses `useRouter`, form state, and custom DB hooks.

### 3. Form Configuration & Validation
* **Libraries:** `react-hook-form` with `@hookform/resolvers/yup`.
* **Validation Schema (Yup):**
  * `title`: `yup.string().required()`
  * `description`: `yup.object().nullable()` (Stores Tiptap JSON).
* **Default Values:**
  * For creation: `{ title: '', description: null, notebookId: '', tags: [] }`.
  * For editing: The fetched note data.
* **Tiptap Integration:** The Tiptap editor must be wrapped using React Hook Form's `<Controller />` to accurately track the `isDirty` state when the rich text content changes.

### 4. Layout and UI Structure (Based on Design)
The UI replicates the provided artisanal minimalist design.
* **Container:** Wrapped in a main container using the `Card` component (or similar layout mimicking the white box with a soft border).
* **Title Input:** Uses the custom `Input` component with `variant="none"` and `inputSize="large"` to display seamlessly as the document's main heading.
* **Editor Area:**
  * **Toolbar:** A sticky or fixed-position toolbar below the title, containing icons for Bold, Italic, Underline, H1, H2, and Bullet List. Separated by a subtle bottom border (`border-b border-sand pb-2 mb-4`).
  * **Content Area:** The Tiptap editor itself with a placeholder (e.g., "Empieza a escribir tu obra maestra aquí...").
* **Action Footer:** * A section at the bottom of the card with a top border (`border-t border-sand pt-4 mt-4`).
  * Uses flexbox to align buttons to the right (`flex justify-end gap-4`).
  * Contains the "Cancelar" (`variant="outline"`) and "Guardar" (`variant="full"`, likely with a save icon) buttons.

### 5. Interaction Rules and Logic
* **Save Button State:** * Strictly disabled if `!isValid || !isDirty`.
* **Save Action (onSubmit):**
  * **Create Mode:** Generates a new ID using `crypto.randomUUID()`. Calls `createNote(payload)`.
  * **Edit Mode:** Calls `updateNote(params.id, payload)`.
  * **Post-Save:** Triggers `toast.success('Note saved successfully')` and redirects to the home page (`/`) via `next/navigation`'s `useRouter`.
* **Cancel Button State:** * Always active.
* **Cancel Action:**
  * If `!isDirty`: Directly redirects to the home page (`/`).
  * If `isDirty`: Triggers the global modal using the following configuration:
    ```javascript
    openModal(ConfirmModal, {
      message: 'Are you sure you want to cancel? If you cancel, you will lose any unsaved data.',
      onAccept: () => {
        router.push('/');
      },
      onCancel: () => {}, // Modal closes automatically, user continues editing
    });
    ```

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Note Creation and Editing Flow

  Scenario: Form initialization in Create Mode
    Given the user navigates to "/notes/new"
    Then the form should load with empty fields
    And the Save button should be disabled because the form is neither dirty nor valid

  Scenario: Form initialization in Edit Mode
    Given the user navigates to "/notes/123-uuid"
    When the note data is successfully fetched from IndexedDB
    Then the form fields should be populated with the existing data
    And the form isDirty state should be false
    And the Save button should be disabled until a change is made

  Scenario: Discarding changes without modifying the form
    Given the user is on the note form
    And the form isDirty state is false
    When the user clicks the "Cancelar" button
    Then the application should navigate to the home page without opening a modal

  Scenario: Attempting to discard unsaved changes
    Given the user has modified the title or description (isDirty is true)
    When the user clicks the "Cancelar" button
    Then the ConfirmModal should appear with a warning message about unsaved data
    And clicking Accept in the modal should navigate to the home page
    And clicking Cancel in the modal should dismiss the modal and allow continued editing

  Scenario: Saving a valid modified note
    Given the form has a valid title and has been modified (isDirty is true)
    And the Save button is enabled
    When the user clicks the "Guardar" button
    Then the note data should be persisted to the database
    And a success toast with the message "Note saved successfully" should appear
    And the application should navigate back to the home page
```
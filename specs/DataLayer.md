## Layer: Local Data Persistence (Dexie.js)

### 1. Responsibility and Purpose
This layer manages the local-first database architecture using Dexie.js (a wrapper for IndexedDB). It centralizes the database configuration in a singleton and exposes decoupled, reactive CRUD operations through custom React hooks. This ensures UI components remain agnostic of database implementation details while reacting to data changes in real-time.

### 2. Database Configuration (`src/db/database.js`)
The database instance is defined as a singleton to prevent multiple connections and memory leaks.

* **Database Name:** `SoftCraftDB`
* **Schema Definition:**
  * **`notes`:** `id, notebookId, isFavorite, *tags, createdAt, updatedAt`
    * `id`: Primary key (String, UUID).
    * `notebookId`: Indexed for fast querying of notes belonging to a specific notebook.
    * `isFavorite`: Indexed boolean for filtering favorite notes.
    * `*tags`: Multi-entry index (array of strings) to allow querying notes that contain specific tags.
    * `createdAt`, `updatedAt`: Indexed for chronological sorting.
  * **`notebooks`:** `id, title, createdAt, updatedAt`
    * `id`: Primary key (String, UUID).
    * `title`: Indexed for alphabetical sorting or searching by name.
    * `createdAt`, `updatedAt`: Indexed for chronological sorting.
  * **`tags`:** `id, &title`
    * `id`: Primary key (String, UUID).
    * `&title`: Unique index (String). Dexie will reject insertions of tags with duplicate titles.

### 3. Data Models
All interactions with the database must strictly adhere to the following data shapes:

* **Note Entity:**
  * `id` (String): Generated via `crypto.randomUUID()`.
  * `title` (String): Required. The title of the note.
  * `description` (Object): The Tiptap rich-text content strictly stored as a JSON object.
  * `notebookId` (String | null): Foreign key referencing a notebook.
  * `isFavorite` (Boolean): Defaults to `false`.
  * `tags` (Array<String>): Array of tag IDs or strings.
  * `createdAt` (Number): Unix timestamp (milliseconds), set only upon creation.
  * `updatedAt` (Number): Unix timestamp (milliseconds), updated on every modification.

* **Notebook Entity:**
  * `id` (String): Generated via `crypto.randomUUID()`.
  * `title` (String): Required. The name of the notebook.
  * `createdAt` (Number): Unix timestamp (milliseconds), set only upon creation.
  * `updatedAt` (Number): Unix timestamp (milliseconds), updated on every modification.

* **Tag Entity:**
  * `id` (String): Generated via `crypto.randomUUID()`.
  * `title` (String): Required, unique name of the tag.

### 4. Hook Encapsulation
To maintain adherence to Clean Code principles, components will interact with the database exclusively through dedicated custom hooks (e.g., `useNotes`, `useNotebooks`, `useTags`). 

* **Client Directive:** The hook files must include the `'use client'` directive since they rely on React state/effects (via `dexie-react-hooks`).
* **Core Functions (Example for Notes):**
  * `createNote(payload)`: Generates `id`, sets `createdAt` and `updatedAt` to `Date.now()`, and inserts the note.
  * `updateNote(id, payload)`: Updates the specified fields and automatically sets `updatedAt` to `Date.now()`. It must never overwrite `createdAt`.
  * `deleteNote(id)`: Removes the note from the database. (Note: Consider cascading deletes or setting `notebookId` to null if a Notebook is deleted).
  * `getNoteById(id)`: Asynchronously retrieves a single note.
* **Reactive Queries (`useLiveQuery`):**
  * The hooks should expose reactive state variables derived from `useLiveQuery` to automatically trigger UI re-renders when data changes.
  * `useNotes` must accept optional filters like `notebookId` and `isFavorite` to refine the LiveQuery results.

### 5. Error Handling
All asynchronous database operations (create, update, delete) within the hooks must be wrapped in `try/catch` blocks. The hooks should expose an `error` state or throw structured errors to allow the UI to render Toasts/Notifications when an IndexedDB transaction fails (e.g., storage quota exceeded or unique constraint violations on tags).

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Local Database Operations and Relational Integrity

  Scenario: Creating a new note initializes timestamps correctly
    Given the user submits a new note payload without timestamps
    When the createNote function is called
    Then a new crypto.randomUUID should be assigned as the id
    And both createdAt and updatedAt should be set to the current timestamp
    And the note should be persisted to IndexedDB

  Scenario: Updating an existing note modifies only updatedAt
    Given a note exists in the database with a specific createdAt timestamp
    When the updateNote function is called with a new title
    Then the note's title should be updated in the database
    And the updatedAt timestamp should be updated to the current time
    And the createdAt timestamp must remain unchanged

  Scenario: Tag title uniqueness constraint
    Given a tag exists in the database with the title "Frontend"
    When the system attempts to create a new tag with the title "Frontend"
    Then Dexie should throw a ConstraintError
    And the new tag should not be persisted

  Scenario: Reactive UI updates on data mutation
    Given a component is rendering a list of notes for a specific notebook using useNotes
    When a new note is created with that notebookId
    Then the useLiveQuery hook should automatically detect the database change
    And the component should re-render with the updated list of notes without manual state sync
```
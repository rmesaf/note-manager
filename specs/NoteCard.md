## Component: NoteCard

### 1. Responsibility and Purpose
`NoteCard` is a presentational summary card that renders a single note's key data inside the Home view grid. It composes `Card`, `Link`, and the global modal system to display the note's date, title, plain-text description preview, an edit link, and a delete action — all within a consistent fixed-height layout.

### 2. Props
| Prop | Type | Required | Description |
|---|---|---|---|
| `note.id` | `string` | ✓ | Unique identifier used for the edit link and delete call. |
| `note.title` | `string` | ✓ | Note heading rendered as `<h2>`. |
| `note.description` | `Object` | ✓ | Tiptap JSON document. Passed to `extractPlainText` for preview. |
| `note.updatedAt` | `number` | ✓ | Unix timestamp (ms). Formatted as `DD/MM/YYYY` via `Intl.DateTimeFormat('es-ES')`. |

### 3. Behavior and Logic
* **Date formatting:** Uses `Intl.DateTimeFormat('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' })` — no external date library.
* **Description preview:** `extractPlainText(note.description)` recursively extracts leaf text nodes from the Tiptap JSON tree. Falls back to `"No content yet."` when the result is an empty string.
* **Delete flow:** Clicking the trash icon calls `openModal(ConfirmModal, { message, onAccept, onCancel })`. The actual `deleteNote` and `toast.success` are invoked only after the user confirms inside the modal — NoteCard itself never calls them directly on click.
* **Edit navigation:** A `<Link href={/notes/${note.id}}>Edit →</Link>` navigates to the note's detail page.
* **No card-level click:** `Card` has no `onClick`. Only the delete button and the edit link are interactive, so there is no event propagation concern between them.

### 4. Layout Constraints
* Title: `line-clamp-2 min-h-12` — truncates at 2 lines with a reserved minimum height.
* Description: `line-clamp-3 min-h-18` — truncates at 3 lines with a reserved minimum height.
* These constraints ensure uniform card heights across the grid regardless of content length.

### 5. Behavioral Specifications (BDD)

```gherkin
Feature: NoteCard Note Summary Display and Actions

  Scenario: NoteCard renders the note title
    Given a NoteCard is rendered with a note object
    Then a heading containing the note's title should be visible

  Scenario: NoteCard renders the formatted date
    Given a NoteCard is rendered with a note whose updatedAt is a known timestamp
    Then the date should be displayed in DD/MM/YYYY format

  Scenario: NoteCard renders the plain-text description preview
    Given a NoteCard is rendered with a note whose description is a Tiptap JSON document
    Then the extracted plain text should be visible in the card body

  Scenario: NoteCard shows a fallback when description produces no text
    Given a NoteCard is rendered with an empty or null description
    Then the text "No content yet." should be displayed

  Scenario: NoteCard renders the Edit link pointing to the note's page
    Given a NoteCard is rendered with a note whose id is "note-42"
    Then a link labelled "Edit →" should be visible
    And its href should be "/notes/note-42"

  Scenario: NoteCard renders the delete button with an accessible label
    Given a NoteCard is rendered
    Then a button with aria-label="Delete note" should be present in the DOM

  Scenario: User clicks the delete button — confirmation modal opens
    Given a NoteCard is rendered with an openModal mock
    When the user clicks the "Delete note" button
    Then openModal should be called once
    And the first argument should be the ConfirmModal component
    And the message prop should read "Are you sure you want to delete this note?"

  Scenario: Clicking the delete button does not fire a card-level navigation
    Given a NoteCard is rendered
    When the user clicks the delete icon button
    Then only the delete handler should be triggered
    And the Edit link should not be activated

  Scenario: onAccept callback calls toast.success with the correct message
    Given a NoteCard is rendered and the delete button is clicked
    When the onAccept callback registered in openModal is invoked
    Then deleteNote should be called with the note's id
    And toast.success should be called with "Note deleted successfully."

  Scenario: openModal receives an onCancel callback
    Given a NoteCard is rendered and the delete button is clicked
    Then the second argument to openModal should include an onCancel function

  Scenario: NoteCard wrapper applies flex column layout
    Given a NoteCard is rendered
    Then the root card element should have flex, flex-col and gap-3 classes
    So that cards stack their sections vertically with uniform spacing

  Scenario: Edit link section has a top border separator
    Given a NoteCard is rendered
    Then the footer div wrapping the Edit link should have border-t and border-sand classes
```

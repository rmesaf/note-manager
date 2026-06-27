## Layer: Global Modal System & Components

### 1. Responsibility and Purpose
This specification covers the global modal architecture and its first concrete implementation: the `ConfirmModal`. 
* **Global System (`ModalProvider`, `useModal`, `ModalWrapper`):** Manages the state of the active modal globally using React Context, renders it outside the normal DOM hierarchy using React Portals to avoid z-index conflicts, and manages accessibility (e.g., locking background scroll).
* **`ConfirmModal`:** A specific, reusable UI component injected into the global system to handle user confirmations (e.g., "Are you sure you want to delete this?").

### 2. Architecture & Components

#### A. Global Context (`src/context/ModalContext.jsx`)
* **State:** Manages `isOpen` (Boolean), `modalContent` (ReactNode), and `modalProps` (Object).
* **Hook (`useModal`):** Exposes `openModal(content, props)` and `closeModal()` functions.

#### B. Modal Wrapper (`src/components/ModalWrapper.jsx`)
* **Responsibility:** The structural shell rendered via `createPortal` into `document.body`.
* **Client Directive:** Requires `'use client'` as it relies on DOM manipulation and React Context.
* **Behavior:**
  * **Backdrop:** Renders a darkened overlay (`bg-ink/50 backdrop-blur-sm`). Clicking the backdrop explicitly triggers the `closeModal` function.
  * **Scroll Lock:** When mounted and `isOpen` is true, it adds the `overflow-hidden` class to `document.body` to prevent background scrolling. Removes it on unmount.
  * **Keyboard Accessibility:** Listens for the "Escape" key to trigger `closeModal`.

#### C. Confirm Modal (`src/components/ConfirmModal.jsx`)
* **Responsibility:** The visual confirmation dialog injected into the `ModalWrapper`.
* **Props:**
  * `message` (String): The dynamic text confirming the action.
  * `onAccept` (Function): Callback executed when the primary button is clicked.
  * `onCancel` (Function): Callback executed when the secondary button is clicked.
  * `onClose` (Function): Standard callback injected by the `ModalWrapper` to unmount the modal.
  * `acceptText` (String): Text for the accept button (Default: "Aceptar").
  * `cancelText` (String): Text for the cancel button (Default: "Cancelar").

### 3. Behavior and Logic (`ConfirmModal`)
* **Execution Flow:** * If the user clicks Cancel: execute `onCancel()`, then immediately execute `onClose()`.
  * If the user clicks Accept: execute `onAccept()`, then immediately execute `onClose()`.
* **Close Icon ("X"):** A button in the top right corner that strictly executes `onClose()`.

### 4. Variant System and Styling (Tailwind CSS)
* **Wrapper & Backdrop:** `fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4`.
* **Modal Container (ConfirmModal):**
  * Uses the project's warm palette: `bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative`.
* **Action Buttons:** Centered at the bottom using flexbox (`flex justify-center gap-4 mt-8`). Uses the existing `Button` component:
  * Cancel Button: `variant="outline"`
  * Accept Button: `variant="full"`

### 5. Implementation Structure Example
Example of how the `useModal` hook will be consumed in the application:

```jsx
const { openModal, closeModal } = useModal();

const handleDelete = () => {
  openModal(ConfirmModal, {
    message: "¿Estás seguro de que deseas eliminar esta nota?",
    onAccept: () => deleteNote(noteId),
    onCancel: () => console.log("Operación cancelada")
  });
};
```

```gherkin
Feature: Global Modal System and Confirmation Dialog

  Scenario: Opening a modal locks the background scroll
    Given the user is on a page with scrollable content
    When the useModal hook triggers openModal
    Then a ModalWrapper should be rendered via a React Portal
    And the document body should receive the "overflow-hidden" class
    And the user should not be able to scroll the background page

  Scenario: Closing the modal via the backdrop
    Given the ConfirmModal is currently open and visible
    When the user clicks on the darkened backdrop outside the white modal container
    Then the closeModal function should be executed
    And the modal should be unmounted
    And the "overflow-hidden" class should be removed from the body

  Scenario: User accepts the confirmation action
    Given the ConfirmModal is open with an onAccept callback
    When the user clicks the Accept button
    Then the onAccept callback must execute successfully
    And immediately after, the closeModal function must execute to close the dialog

  Scenario: User cancels the confirmation action
    Given the ConfirmModal is open with an onCancel callback
    When the user clicks the Cancel button or the top-right "X" icon
    Then the onCancel callback (if clicked cancel) or just onClose (if clicked X) is executed
    And the modal is dismissed
```
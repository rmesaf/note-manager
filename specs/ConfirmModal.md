## Component: ConfirmModal

### 1. Responsibility and Purpose
`ConfirmModal` is a reusable confirmation dialog card. It decouples the "are you sure?" UX pattern from individual features: callers supply the question text and action callbacks; `ConfirmModal` handles only the visual layout and button wiring. It is always rendered inside `ModalWrapper`, which provides the portal, ARIA landmark, backdrop, scroll lock, and keyboard (Escape) dismissal behaviors.

### 2. Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `message` | `string` | ✓ | — | The confirmation question shown to the user. |
| `onAccept` | `Function` | ✓ | — | Callback executed when the user confirms. Called before `onClose`. |
| `onCancel` | `Function` | — | `undefined` | Optional callback executed when the user cancels. Called before `onClose`. |
| `onClose` | `Function` | ✓ | — | Injected by `ModalProvider`. Dismisses the modal. Always called after any action. |
| `acceptText` | `string` | — | `'Aceptar'` | Label for the confirm button. |
| `cancelText` | `string` | — | `'Cancelar'` | Label for the cancel button. |

### 3. Behavior and Logic

#### 3.1 ConfirmModal (card UI)
* **Accept flow:** `handleAccept` calls `onAccept?.()` first, then always calls `onClose()`. This guarantees the modal closes even if the callback throws or rejects.
* **Cancel flow:** `handleCancel` calls `onCancel?.()` first (optional), then always calls `onClose()`.
* **Close icon flow:** The X button in the top-right corner calls `onClose` directly, bypassing both `onAccept` and `onCancel`.
* **Optional `onCancel`:** The component uses optional chaining (`onCancel?.()`) so callers that only care about the accept path are not forced to provide a cancel callback.

#### 3.2 ModalWrapper (structural shell — co-located behavior)
`ConfirmModal` is always rendered inside `ModalWrapper`, which is responsible for:
* **Portal:** Rendered via `createPortal` into `document.body` to escape any stacking context.
* **ARIA:** The backdrop overlay carries `role="dialog"` and `aria-modal="true"`.
* **Escape key:** A `keydown` listener on `document` calls `onClose` when the user presses Escape.
* **Backdrop click:** Clicking directly on the overlay (not the card) calls `onClose`.
* **Scroll lock:** `overflow-hidden` is added to `document.body` while the modal is mounted and removed on cleanup.

### 4. Structure and Content (ConfirmModal card)
1. **Close icon button** — `aria-label="Close modal"`, positioned `absolute top-4 right-4`.
2. **Message `<p>`** — displays the `message` prop.
3. **Cancel `<Button variant="outline">`** — label from `cancelText`.
4. **Accept `<Button variant="full">`** — label from `acceptText`.

### 5. Styling (Tailwind CSS)
Card wrapper: `bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative font-workSans`
ModalWrapper backdrop: `fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: ConfirmModal Confirmation Dialog

  # ── Card UI (ConfirmModal in isolation) ──────────────────────────────────

  Scenario: Modal card displays the confirmation message
    Given the ConfirmModal is rendered with a message prop
    Then the message text should be visible in the dialog card

  Scenario: Modal card shows default button labels
    Given the ConfirmModal is rendered without explicit acceptText or cancelText
    Then a button labelled "Aceptar" should be visible
    And a button labelled "Cancelar" should be visible

  Scenario: Modal card shows custom button labels
    Given the ConfirmModal is rendered with acceptText="Delete" and cancelText="Keep"
    Then a button labelled "Delete" should be visible
    And a button labelled "Keep" should be visible

  Scenario: User confirms the action
    Given the ConfirmModal is rendered with onAccept and onClose handlers
    When the user clicks the accept button
    Then onAccept should be called once
    And onClose should be called once

  Scenario: User cancels the action
    Given the ConfirmModal is rendered with onCancel and onClose handlers
    When the user clicks the cancel button
    Then onCancel should be called once
    And onClose should be called once

  Scenario: User closes via the X icon button
    Given the ConfirmModal is rendered with an onClose handler
    When the user clicks the close icon button
    Then onClose should be called once
    And onAccept and onCancel should not be called

  Scenario: Cancel is optional — no error when onCancel is not provided
    Given the ConfirmModal is rendered without an onCancel handler
    When the user clicks the cancel button
    Then onClose should still be called once without throwing an error

  # ── ModalWrapper integration ──────────────────────────────────────────────

  Scenario: Modal backdrop has the correct ARIA attributes
    Given the ConfirmModal is rendered inside ModalWrapper
    Then the backdrop should have role="dialog"
    And the backdrop should have aria-modal="true"

  Scenario: User dismisses the modal by pressing Escape
    Given the ConfirmModal is rendered inside ModalWrapper with an onClose handler
    When the user presses the Escape key
    Then onClose should be called once

  Scenario: User dismisses the modal by clicking the backdrop
    Given the ConfirmModal is rendered inside ModalWrapper with an onClose handler
    When the user clicks directly on the backdrop overlay (outside the card)
    Then onClose should be called once
```

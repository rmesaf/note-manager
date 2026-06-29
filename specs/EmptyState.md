## Component: EmptyState

### 1. Responsibility and Purpose
The `EmptyState` component is the fallback UI rendered in the Home view when the user's note collection contains zero entries. Its single responsibility is to prevent a blank-page experience by presenting a clear, branded call-to-action that invites the user to create their first note. It is intentionally decoupled from the Home view so the empty-state presentation can be replaced or extended independently.

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `onCreateClick` (Function): **Required.** The handler invoked when the user clicks the "New Note" call-to-action button. In the Home view this triggers a router push to `/notes/new`.

### 3. Behavior and Logic
* **Architecture:** The component is a `'use client'`-free RSC at its own level, but it renders the `Button` component which carries `'use client'`. Next.js handles this boundary automatically.
* **Call to Action:** The `onCreateClick` prop is threaded directly into the `Button` component's `onClick` prop. If `onCreateClick` is not provided, the button renders but clicking it produces no effect.
* **Dead Import:** `next/link` is present in the import list but is **not used** anywhere in the component's JSX. This is leftover code that should be removed in a future cleanup pass.
* **No internal state:** The component is fully controlled by its parent via `onCreateClick`. It holds no local state.

### 4. Structure and Content
The component renders the following elements in order:
1. **Decorative SVG icon** — a document/note outline icon with `aria-hidden="true"`. Sized `w-16 h-16` in `text-sand` color.
2. **Heading `<h2>`** — "No notes yet." — styled `text-xl`, `font-semibold`, `text-ink`, `font-workSans`.
3. **Subtitle `<p>`** — "Start writing your masterpiece!" — styled `text-sm`, `text-doveGray`, `font-workSans`, `max-w-xs`.
4. **CTA `<Button>`** — "New Note" — rendered with `variant="full"`, wired to `onCreateClick`.

### 5. Styling (Tailwind CSS)
**Root `<div>` wrapper classes:**
* `flex flex-col items-center justify-center` — vertical stack, fully centered.
* `py-20` — generous vertical padding to visually center content in the page body.
* `text-center` — centers all inline text content.

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: EmptyState Component Call to Action

  Scenario: Decorative illustration is rendered with correct accessibility attributes
    Given the EmptyState component is rendered
    Then an SVG illustration should be present in the DOM
    And the SVG should have aria-hidden="true" so screen readers ignore the decoration

  Scenario: Main heading is displayed
    Given the EmptyState component is rendered
    Then a level-2 heading with the text "No notes yet." should be visible

  Scenario: Descriptive subtitle is displayed
    Given the EmptyState component is rendered
    Then a paragraph with the text "Start writing your masterpiece!" should be visible

  Scenario: Call-to-action button is rendered with the correct label
    Given the EmptyState component is rendered
    Then a button labelled "New Note" should be visible in the DOM

  Scenario: User clicks the call-to-action button
    Given the EmptyState component is rendered with an onCreateClick handler
    When the user clicks the "New Note" button
    Then the onCreateClick handler should be called exactly once

  Scenario: Container applies vertical centering layout
    Given the EmptyState component is rendered
    Then the root wrapper should have flex, flex-col, items-center, justify-center and text-center classes
```

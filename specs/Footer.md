## Component: Footer

### 1. Responsibility and Purpose
The `Footer` component is the bottom-level branding and legal information shell of the application. It renders a full-width, semantically correct `<footer>` landmark that contains a centered copyright notice. It establishes visual symmetry with the `Header` component by applying an equivalent border treatment — a subtle sand-colored top border in place of the header's bottom border.

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `className` (String): Additional Tailwind classes to extend or override the default wrapper styles (using the `cn` utility).
* `...props`: Any other native HTML property applicable to a `<footer>` element (e.g., `id`, `aria-label`, `data-testid`).

### 3. Behavior and Logic
* **Architecture:** The component is a React Server Component (RSC). It manages no state or user interactions and does not require the `'use client'` directive.
* **Copyright Year:** The copyright year is **statically hardcoded** as `2026`. It is **not** computed via `new Date().getFullYear()`. This is a deliberate design choice for the current version; any future update to the year requires a manual code change.
* **Copyright Text:** The full copyright string is `© 2026 SoftCraft — Artisanal Minimalism`.
* **Prop Spreading:** All `...props` are spread onto the root `<footer>` element, enabling consumers (such as tests or layout wrappers) to attach `data-*` attributes or ARIA overrides without modifying the component.

### 4. Styling (Tailwind CSS)
**Root `<footer>` element base classes:**
* `w-full` — stretches across the full viewport width.
* `border-t border-sand` — subtle top divider mirroring the Header's `border-b border-sand`.
* `py-6` — generous vertical padding for comfortable spacing.
* `flex items-center justify-center` — centers the copyright paragraph both horizontally and vertically.

**Copyright `<p>` element classes:**
* `font-literata` — uses the serif Literata font, consistent with headings in the design system.
* `text-cocoa` — warm cocoa accent color for branding.
* `text-xs` — small typographic scale, appropriate for legal/secondary text.
* `italic` — stylistic italic treatment for a minimalist brand voice.

### 5. Style Integration
The component uses the `cn` utility to merge base classes with any `className` prop, ensuring conflicting Tailwind classes (e.g., a different padding or background) correctly override the defaults.

Example:
`className={cn('w-full border-t border-sand py-6 flex items-center justify-center', className)}`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Footer Component Branding and Legal Information

  Scenario: Footer renders as a semantic landmark element
    Given the Footer component is rendered
    Then a "contentinfo" landmark element should be present in the DOM
    So that screen readers and assistive technologies can identify the page footer

  Scenario: Footer displays the full copyright notice
    Given the Footer component is rendered
    Then a paragraph with the text "© 2026 SoftCraft — Artisanal Minimalism" should be visible

  Scenario: Copyright year is the hardcoded value 2026
    Given the Footer component is rendered
    Then the copyright text should contain the year "2026"
    And the year should be statically rendered, not computed from the system clock

  Scenario: Footer applies default layout and border styles
    Given the Footer component is rendered without extra props
    Then the footer element should have the full-width, border-t, border-sand, py-6, flex, items-center and justify-center classes

  Scenario: Copyright paragraph applies brand typography styles
    Given the Footer component is rendered
    Then the copyright paragraph should have font-literata, text-cocoa, text-xs and italic classes

  Scenario: Consumer extends styles via className prop
    Given the Footer component is rendered with an additional className
    Then the extra class should be present on the root footer element
    And the default base classes should be preserved

  Scenario: Consumer passes native HTML attributes via prop spreading
    Given the Footer component is rendered with a data-testid prop
    Then the root footer element should have that data-testid attribute applied
```

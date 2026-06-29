## Component: Header

### 1. Responsibility and Purpose
The `Header` component is the top-level navigation shell of the application. It renders a full-width, semantically correct `<header>` landmark containing the SoftCraft brand logo. It establishes the visual hierarchy of every page and acts as the designated extension point for future navigation elements (menus, authentication controls, search bar, etc.).

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `className` (String): Additional Tailwind classes to extend or override the default wrapper styles (using the `cn` utility).
* `...props`: Any other native HTML property applicable to a `<header>` element (e.g., `id`, `aria-label`, `data-testid`).

### 3. Behavior and Logic
* **Architecture:** The component is a React Server Component (RSC). It manages no state or user interactions and therefore does not require the `'use client'` directive, which minimizes client-side bundle size.
* **Logo Rendering:** Uses `next/image` to render the SoftCraft logo (`/logo.svg`) with explicit `width={120}` and `height={40}` dimensions and the `priority` flag, ensuring the logo is eagerly loaded as part of the Largest Contentful Paint (LCP) candidate.
* **Prop Spreading:** All `...props` are spread directly onto the root `<header>` element, enabling consumers to attach event listeners, ARIA attributes, or `data-*` attributes as needed.

### 4. Styling (Tailwind CSS)
The header applies the following base utility classes to the root `<header>` element:
* `w-full` — stretches across the full viewport width.
* `border-b border-sand` — subtle bottom divider using the warm sand palette color.
* `bg-paper` — warm off-white background consistent with the design system.
* `py-4 px-6` — vertical and horizontal padding for comfortable spacing.
* `flex items-center` — horizontal flexbox layout to align the logo and future sibling elements vertically.

### 5. Style Integration
The component uses the `cn` utility to merge base classes with any `className` prop passed by the consumer. Conflicting classes (e.g., a different background or padding) correctly override the defaults without CSS specificity issues.

Example:
`className={cn('w-full border-b border-sand bg-paper py-4 px-6 flex items-center', className)}`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Header Component Branding and Navigation Shell

  Scenario: Header renders as a semantic landmark element
    Given the Header component is rendered
    Then a "banner" landmark element should be present in the DOM
    So that screen readers and assistive technologies can identify the page header

  Scenario: Header displays the SoftCraft logo
    Given the Header component is rendered
    Then an image element should be visible inside the header
    And the image source should point to "/logo.svg"

  Scenario: Logo has descriptive alternative text for accessibility
    Given the Header component is rendered
    Then the logo image should have the alt text "SoftCraft Logo"
    So that screen readers can announce the brand identity

  Scenario: Logo is rendered with explicit dimensions
    Given the Header component is rendered
    Then the logo image should have a width of 120 and a height of 40
    So that the browser can reserve layout space before the image loads

  Scenario: Header applies default layout and border styles
    Given the Header component is rendered without any extra props
    Then the header element should have the full-width, flex, border-b, bg-paper, and padding classes

  Scenario: Consumer extends styles via className prop
    Given the Header component is rendered with an additional className
    Then the extra class should be present on the root header element
    And the default base classes should be preserved

  Scenario: Consumer passes native HTML attributes via prop spreading
    Given the Header component is rendered with a data-testid prop
    Then the root header element should have that data-testid attribute applied
```

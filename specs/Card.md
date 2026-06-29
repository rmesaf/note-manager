## Component: Card

### 1. Responsibility and Purpose
The `Card` component is a flexible, presentational container designed to wrap content within a visually distinct boundary. It applies a consistent white background, subtle shadows, rounded corners, and borders using the project's warm palette (`sand`), establishing a clean hierarchy for the UI.

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `children` (ReactNode): The content to be rendered inside the card.
* `className` (String): Additional Tailwind classes to extend or override default styles (e.g., margins, custom padding, flexbox properties) using the `cn` utility.
* `...props`: Any other native HTML property applicable to a `<div>` element (e.g., `id`, `aria-label`, `onClick`, `role`).

### 3. Behavior and Logic
* **Architecture:** The component acts as a straightforward wrapper around a native HTML `<div>`. It does not manage state or lifecycle, so it does not require the `'use client'` directive and can be rendered as a React Server Component (RSC) by default.
* **Prop Spreading:** It must spread all `...props` to the root `<div>` element to ensure semantic flexibility and allow event listeners or ARIA attributes to be attached by the consumer when needed.

### 4. Variant System and Styling (Tailwind CSS)
The card utilizes standard Tailwind utility classes tied to the SoftCraft design system.

* **Base Styles:**
  * Background: `bg-white`
  * Border: `border border-sand`
  * Corners: `rounded-lg`
  * Shadow: `shadow-sm`
  * Default Padding: `p-4` (equivalent to 1rem).

### 5. Style Integration
The component must consolidate classes using the `cn` utility to ensure that any conflicting classes passed via `className` (such as a different padding like `p-0` or `p-8`) correctly override the base styles without css specificity issues.

Example implementation structure for the root `<div>`:
`className={cn("bg-white border border-sand rounded-lg shadow-sm p-4", className)}`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Card Component Presentation

  Scenario: Component renders with default styles
    Given the Card component is rendered with standard content
    Then it should have a white background, rounded corners, and a subtle shadow
    And it should display a border using the "sand" color scheme
    And it should apply a default internal padding of 1rem (p-4)

  Scenario: Consumer overrides the default padding
    Given the Card component is rendered
    And the consumer passes the class "p-0" via the className prop
    Then the tailwind-merge utility should override the default "p-4" class
    And the Card should render with no internal padding

  Scenario: Consumer passes native HTML attributes
    Given the Card component is rendered
    And the consumer passes an "aria-label" and a "data-testid" prop
    Then those native HTML properties should be applied to the root div element of the Card

  Scenario: Component renders its children content
    Given the Card component is rendered with text content as children
    Then the text content should be visible inside the Card's root element

  Scenario: Component renders complex element children
    Given the Card component is rendered with a nested React element as children
    Then the nested element should be present in the DOM inside the Card

  Scenario: Additional className is applied alongside base styles
    Given the Card component is rendered with an extra class like "mt-8"
    Then the root div should have both the "mt-8" class and the base "bg-white" class

  Scenario: Consumer attaches a click handler via props
    Given the Card component is rendered with an onClick handler
    When the user clicks on the Card
    Then the onClick handler should be called once
```
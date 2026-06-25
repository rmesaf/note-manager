## Component: Button

### 1. Responsibility and Purpose
The `Button` component is the primary, reusable interaction element of the application. It handles user actions, manages loading and disabled states, and applies consistent styling based on the project's design system (warm palette). 

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `children` (ReactNode): The content of the button (text or elements).
* `onClick` (Function): Click event handler.
* `variant` (String): Defines the visual style. Allowed values: `'full' | 'outline' | 'link'`. Default: `'full'`.
* `className` (String): Additional Tailwind classes to extend or override styles (using the `cn` utility).
* `isLoading` (Boolean): If `true`, displays a loading state and disables the button.
* `disabled` (Boolean): If `true`, disables the button both visually and functionally.
* `...props`: Any other native HTML property applicable to a `<button>` element (e.g., `type`, `aria-label`, `id`).

### 3. Behavior and Logic
* **Client Directive:** The file must include `'use client'` at the very top since it handles user interaction (`onClick`).
* **Default Type:** The button's `type` attribute must default to `"button"` to prevent accidental form submissions, unless a different `type` is explicitly passed via `...props` (e.g., `type="submit"`).
* **Disabled State:** If `true`, the button reduces its opacity (e.g., `opacity-50`), changes the cursor (`cursor-not-allowed`), and prevents the execution of `onClick` or any mouse events (`pointer-events-none`). Additionally, it receives the `aria-disabled="true"` attribute.
* **Loading State (`isLoading`):** Inherits all restrictions from the `disabled` state. Additionally, it renders a loading icon (spinner) to the left of the `children` text.
* **Event Prevention:** The component must use the *early return* pattern in its internal click handler (if one is abstracted) or directly ignore the click natively via HTML disable attributes if `isLoading` or `disabled` are true.

### 4. Variant System and Styling (Tailwind CSS)
The class resolution for the variants will be handled through a standard JavaScript class dictionary (plain object) inside the file, without using external libraries like `cva`.

* **Base Styles:** Standard spacing (e.g., `px-4 py-2`), rounded corners (`rounded-md`), centered flexbox alignment (`inline-flex items-center justify-center`), and smooth transitions (`transition-colors duration-200`).
* **Variant Dictionary:**
  * `'full'`: Cocoa background (`bg-cocoa`), white text (`text-white`). Hover/active state: subtle darkening (e.g., `hover:bg-cocoa/90`).
  * `'outline'`: Transparent background (`bg-transparent`), cocoa border (`border border-cocoa`), cocoa text (`text-cocoa`). Hover/active state: subtle sand background (`hover:bg-sand/20`).
  * `'link'`: No base padding or borders (`p-0`), cocoa text (`text-cocoa`), and underlined by default (`underline`). Hover/active state: opacity change (`hover:text-cocoa/80`). The underline can be overridden via `className`.

### 5. Style Integration
The component must consolidate classes using the `cn` utility to ensure classes passed via `className` resolve conflicts correctly. Conditional classes must utilize the object syntax. 

Example implementation structure for the class resolution:
`className={cn(baseClasses, variantDictionary[variant], { "opacity-50 cursor-not-allowed pointer-events-none": isLoading || disabled }, className)}`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Button Component Interactions

  Scenario: User interacts with a standard active button
    Given the button is rendered with standard props
    And the button is neither disabled nor loading
    When the user clicks the button
    Then the onClick handler should be executed successfully

  Scenario: User attempts to interact with a disabled button
    Given the button is rendered with the disabled prop set to true
    When the user clicks or hovers over the button
    Then the button should display with reduced opacity and a not-allowed cursor
    And the onClick handler should not be executed

  Scenario: User views a button in a loading state
    Given the button is rendered with the isLoading prop set to true
    Then a loading spinner should be visible to the left of the button text
    And the button should behave as disabled
    And the onClick handler should not be executed

  Scenario: Button is rendered as a link variant
    Given the button is rendered with the variant prop set to "link"
    Then the button should have no background, cocoa text, and an underline
    When the user hovers over the button
    Then the text opacity should decrease slightly
```

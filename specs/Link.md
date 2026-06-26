## Component: Link

### 1. Responsibility and Purpose
The `Link` component is a styling wrapper around the native `next/link` component. It ensures that all navigational elements in the application share a consistent visual identity with the `link` variant of the `Button` component, while preserving the performance benefits and prefetching capabilities of the Next.js App Router.

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `href` (String | Object): The path or URL to navigate to. This is explicitly destructured as it is a required prop for `next/link`.
* `children` (ReactNode): The text or elements to be rendered inside the link.
* `className` (String): Additional Tailwind classes to extend or override the default styles (using the `cn` utility).
* `...props`: Any other native Next.js `<Link>` properties (e.g., `prefetch`, `replace`, `scroll`) or standard anchor `<a>` attributes (e.g., `target`, `rel`).

### 3. Behavior and Logic
* **Architecture:** Unlike the `Button` component, this component does not require the `'use client'` directive. It relies entirely on the routing mechanisms of Next.js and should remain a React Server Component (RSC) to optimize load times.
* **Next.js Integration:** It must import and render the `Link` component from `next/link`. All `...props` must be spread directly onto this underlying component to ensure native routing features remain fully functional.

### 4. Variant System and Styling (Tailwind CSS)
To maintain module independence, the styling logic is decoupled from the `Button` component, though it visually replicates its `'link'` variant exactly.

* **Base Styles:**
  * Padding: `p-0` (no padding)
  * Text Color: `text-cocoa`
  * Text Decoration: `underline`
  * Interaction: `transition-colors duration-200 hover:text-cocoa/80`

### 5. Style Integration
The component must consolidate classes using the `cn` utility to ensure that any conflicting classes passed via `className` (such as `no-underline` or a different text color) correctly override the base styles without CSS specificity issues.

Example implementation structure for the underlying component:
`className={cn("p-0 text-cocoa underline transition-colors duration-200 hover:text-cocoa/80", className)}`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Link Component Navigation and Styling

  Scenario: Component renders with default styles and required href
    Given the Link component is rendered with a valid "href" prop
    Then it should render a next/link element with the provided href
    And it should display cocoa text with an underline by default
    And the text opacity should decrease slightly on hover

  Scenario: Consumer overrides the default underline styling
    Given the Link component is rendered
    And the consumer passes the class "no-underline" via the className prop
    Then the tailwind-merge utility should successfully override the default "underline" class
    And the Link should render without a text decoration

  Scenario: Consumer passes specific Next.js routing properties
    Given the Link component is rendered
    And the consumer passes the prop "prefetch={false}"
    Then the underlying next/link component should receive the "prefetch" prop
    And the Next.js router should not prefetch the route on viewport intersection
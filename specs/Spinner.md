## Component: Spinner

### 1. Responsibility and Purpose
The `Spinner` component is a purely presentational, reusable UI element designed to provide visual feedback during loading states or asynchronous operations. It is built using an inline SVG animated with Tailwind CSS, inspired by the Flowbite accessibility and structural standards, but strictly adapted to the project's warm color palette.

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `size` (String): Determines the dimensions of the spinner. Allowed values: `'sm' | 'md' | 'lg' | 'xl'`. Default: `'md'`.
* `color` (String): Determines the color of the spinner's track and animated segment. Allowed values: `'clay' | 'cocoa' | 'ink' | 'doveGray'`. Default: `'cocoa'`.
* `className` (String): Additional Tailwind classes to extend or override default styles (e.g., margins, positioning) using the `cn` utility.
* `...props`: Any other native HTML property applicable to an `<svg>` element or a wrapper `<div>`.

### 3. Behavior and Logic
* **Accessibility (a11y):** The component must be accessible to screen readers. The SVG or its wrapper must include the attribute `role="status"`. Additionally, an accompanying visually hidden `<span>` (using Tailwind's `sr-only` class) containing the text "Loading..." must be rendered inside the component.
* **Animation:** The SVG must utilize Tailwind's native `animate-spin` class to rotate continuously.
* **Server/Client Component:** Since this component is purely presentational and does not manage state or user interactions, it does not require the `'use client'` directive.

### 4. Variant System and Styling (Tailwind CSS)
The component relies on standard JavaScript object dictionaries to resolve sizes and colors, avoiding external variant libraries.

* **Base Styles:** The SVG element must always include `inline` and `animate-spin` classes.
* **Size Dictionary:**
  * `'sm'`: `w-4 h-4`
  * `'md'`: `w-8 h-8`
  * `'lg'`: `w-12 h-12`
  * `'xl'`: `w-16 h-16`
* **Color Dictionary:** Maps the track (background ring) and the fill (spinning segment) to the custom palette. The track uses a lower-opacity fill, while the spinning segment uses a solid fill color.
  * `'clay'`: `track: fill-clay/20, segment: fill-clay`
  * `'cocoa'`: `track: fill-cocoa/20, segment: fill-cocoa`
  * `'ink'`: `track: fill-ink/20, segment: fill-ink`
  * `'doveGray'`: `track: fill-doveGray/20, segment: fill-doveGray`

### 5. Style Integration
The component must consolidate classes using the `cn` utility to ensure external classes are applied correctly.

Example implementation structure for the class resolution on the `<svg>` element:
`className={cn("inline animate-spin", sizeDictionary[size], className)}`

### 6. Behavioral Specifications (BDD)

```gherkin
Feature: Spinner Component Visual Feedback

  Scenario: Component renders with default properties
    Given the Spinner is rendered without explicit props
    Then it should display an SVG with the "md" size dimensions (w-8 h-8)
    And it should use the default "cocoa" color scheme
    And the SVG should have the "animate-spin" class applied

  Scenario: Component renders with custom size and color
    Given the Spinner is rendered with the size prop set to "sm"
    And the color prop set to "clay"
    Then the SVG should have dimensions corresponding to "sm" (w-4 h-4)
    And the SVG should use the "clay" color scheme for both track and fill

  Scenario: Screen reader support and accessibility
    Given the Spinner component is rendered on the page
    Then the wrapper or SVG element should have the role="status" attribute
    And there should be a nested span element containing the text "Loading..."
    And the nested span should have the "sr-only" class applied to remain visually hidden

  Scenario: SVG is hidden from the accessibility tree
    Given the Spinner component is rendered
    Then the SVG element should have the aria-hidden="true" attribute
    So that screen readers rely on the sr-only span instead of the decorative graphic

  Scenario: Component renders with large size variant
    Given the Spinner is rendered with the size prop set to "lg"
    Then the SVG should have dimensions corresponding to "lg" (w-12 h-12)

  Scenario: Component renders with extra-large size variant
    Given the Spinner is rendered with the size prop set to "xl"
    Then the SVG should have dimensions corresponding to "xl" (w-16 h-16)

  Scenario: Component renders with ink color scheme
    Given the Spinner is rendered with the color prop set to "ink"
    Then the track path should have the "fill-ink/20" class
    And the segment path should have the "fill-ink" class

  Scenario: Component renders with doveGray color scheme
    Given the Spinner is rendered with the color prop set to "doveGray"
    Then the track path should have the "fill-doveGray/20" class
    And the segment path should have the "fill-doveGray" class

  Scenario: Consumer applies additional classes via className
    Given the Spinner is rendered with an extra class like "mx-auto"
    Then the SVG element should include the "mx-auto" class alongside "animate-spin"
```
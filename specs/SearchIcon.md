## Component: SearchIcon

### 1. Responsibility and Purpose
`SearchIcon` is a purely presentational inline SVG component that renders a magnifying glass icon. It is used by the `Input` component to decorate `type="search"` fields. Being inline avoids an icon library dependency and inherits color from the surrounding `currentColor` context.

### 2. Props
* `aria-label` (String): When provided, the SVG becomes a labelled image (`role="img"`, `aria-hidden` omitted) so screen readers can announce its purpose. When absent, the SVG is decorative (`aria-hidden="true"`, `role="presentation"`).
* `className` (String): Tailwind or custom classes forwarded to the `<svg>` element via `...props`.
* `...props`: Any valid SVG element attribute (e.g., `width`, `height`, `style`, `data-*`).

### 3. Accessibility Model
| Usage | `aria-hidden` | `role` | `aria-label` |
|---|---|---|---|
| Decorative (no label) | `true` | `"presentation"` | absent |
| Descriptive (label provided) | absent | `"img"` | value of prop |

### 4. Behavioral Specifications (BDD)

```gherkin
Feature: SearchIcon SVG Accessibility and Styling

  Scenario: Icon is decorative by default (no aria-label)
    Given the SearchIcon is rendered without an aria-label prop
    Then the SVG should have aria-hidden="true"
    And the SVG should have role="presentation"

  Scenario: Icon becomes descriptive when aria-label is provided
    Given the SearchIcon is rendered with aria-label="Search"
    Then the SVG should have role="img"
    And the SVG should have aria-label="Search"
    And aria-hidden should not be set

  Scenario: Consumer applies a custom className to the SVG
    Given the SearchIcon is rendered with className="text-red-500"
    Then the SVG element should have the class "text-red-500"

  Scenario: Consumer forwards additional SVG props
    Given the SearchIcon is rendered with a data-testid prop
    Then the SVG element should have that data-testid attribute
```

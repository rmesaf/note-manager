# File: InputSpec.md

## Component: Input

### 1. Responsibility and Purpose
The `Input` component is a highly flexible, reusable form element. It is designed to integrate seamlessly with `react-hook-form` via `forwardRef`, support multiple border and sizing variations, and conditionally render icons (such as a search magnifying glass) without disrupting the layout. It utilizes a wrapper element to manage focus states and borders, keeping the native input completely transparent and integrated with the background.

### 2. Props
The component accepts the following properties via destructuring in its signature:
* `variant` (String): Determines the border style. Allowed values: `'full' | 'bottom' | 'none'`. Default: `'full'`.
* `inputSize` (String): Determines the typographic scale and padding. Allowed values: `'small' | 'base' | 'medium' | 'large'`. Default: `'base'`.
* `type` (String): The native HTML input type. If `type="search"`, a magnifying glass SVG is automatically rendered on the left. Default: `'text'`.
* `className` (String): Additional Tailwind classes to override the wrapper's styles.
* `inputClassName` (String): Additional Tailwind classes specifically for the inner `<input>` element (useful for overriding specific font weights or colors, like the title input).
* `...props`: Any other native HTML property applicable to an `<input>` element (e.g., `placeholder`, `disabled`, `onChange`).

### 3. Behavior and Logic
* **React Hook Form Integration:** The component must be wrapped in `React.forwardRef`. The forwarded `ref` must be attached directly to the native `<input>` element to allow libraries like `react-hook-form` to register it and manage focus/validation natively.
* **DOM Structure:** The component returns a relative `<div>` wrapper. This wrapper handles the borders and focus-within states. The actual `<input>` sits inside this wrapper, is set to `bg-transparent`, and has its native outline removed (`outline-none`).
* **Search Icon Logic:** If `type === "search"`, an SVG icon is rendered absolutely positioned to the left (`absolute left-0 top-1/2 -translate-y-1/2`). The inner input must conditionally receive left padding (e.g., `pl-8`) to prevent text from overlapping the icon.

### 4. Variant System and Styling (Tailwind CSS)
The class resolution relies on standard JavaScript object dictionaries. 

* **Wrapper Border Variants:**
  * `'full'`: `border border-sand rounded-md focus-within:border-clay`
  * `'bottom'`: `border-b border-sand rounded-none focus-within:border-clay`
  * `'none'`: `border-transparent rounded-none` (No visible borders, relies entirely on the background, perfect for the main title input).
* **Input Size Dictionary (affects typography and padding):**
  * `'small'`: `text-sm py-1`
  * `'base'`: `text-base py-2`
  * `'medium'`: `text-lg py-3`
  * `'large'`: `text-3xl py-4 font-bold` (Ideal for the "Título de la nota..." placeholder).
* **Placeholder Styling:** The native input should use a subdued color for placeholders, e.g., `placeholder:text-doveGray/50` or `placeholder:text-sand`.

### 5. Style Integration
The component uses the `cn` utility to merge classes for both the wrapper and the input.

Example implementation structure:
```jsx
const Input = React.forwardRef(({ variant = 'full', inputSize = 'base', type = 'text', className, inputClassName, ...props }, ref) => {
  const isSearch = type === 'search';
  
  return (
    <div className={cn("relative transition-colors duration-200", borderDictionary[variant], className)}>
      {isSearch && <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-doveGray w-5 h-5" />}
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full bg-transparent outline-none text-ink placeholder:text-doveGray/60",
          sizeDictionary[inputSize],
          isSearch ? "pl-9 pr-3" : "px-3",
          inputClassName
        )}
        {...props}
      />
    </div>
  );
});

### 6. Behavioral Specifications (BDD)

  Scenario: Component registers with React Hook Form
    Given the Input is rendered within a form
    And it is passed a ref from react-hook-form's register function
    Then the native input element should receive the ref
    And the form should be able to capture its value on submit

  Scenario: Component renders as a search input
    Given the Input is rendered with type="search"
    Then a magnifying glass SVG should be visible on the left side of the input
    And the input text should be padded to the right to avoid overlapping the icon

  Scenario: Component renders a borderless large title input
    Given the Input is rendered with variant="none" and inputSize="large"
    Then the wrapper should have no visible borders
    And the input text should use the large typography scale
    And the placeholder text should be visible with a subdued color

  Scenario: User focuses on a standard input
    Given the Input is rendered with the "bottom" variant
    When the user clicks inside the input
    Then the wrapper's bottom border color should transition to the "clay" accent color
    And the native browser focus outline should remain hidden
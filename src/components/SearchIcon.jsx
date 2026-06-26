/**
 * Magnifying glass SVG icon for search inputs.
 * @description Kept as an inline SVG to avoid adding an icon library dependency.
 * Inherits color via currentColor so it adapts to the surrounding text color.
 * @param {Object} props - Any SVG element attributes (e.g., className, aria-label).
 * @returns {JSX.Element}
 */
const SearchIcon = ({ 'aria-label': ariaLabel, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={ariaLabel ? undefined : true}
    role={ariaLabel ? 'img' : 'presentation'}
    aria-label={ariaLabel}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export default SearchIcon;

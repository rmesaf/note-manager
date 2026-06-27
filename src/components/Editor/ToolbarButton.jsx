import { cn } from '@/utils/cn';

/**
 * Reusable styled toolbar button for the Tiptap editor.
 * @description Extracts button rendering logic to keep the toolbar JSX clean.
 * Active state uses the sand/cocoa palette to match the warm design system.
 * Purely presentational — expects onClick to be a function that executes
 * Tiptap chain commands (handled by the parent Editor component).
 * @param {Object} props
 * @param {Function} props.onClick - Callback to execute when button is clicked.
 * @param {boolean} [props.isActive=false] - Whether the format is currently active at cursor.
 * @param {string} [props.title] - Tooltip text for accessibility.
 * @param {React.ReactNode} props.children - Icon or label content.
 * @returns {JSX.Element}
 */
const ToolbarButton = ({ onClick, isActive = false, title, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      'w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors duration-150 cursor-pointer',
      isActive
        ? 'bg-sand text-cocoa'
        : 'text-doveGray hover:text-ink hover:bg-sand/30'
    )}
  >
    {children}
  </button>
);

export default ToolbarButton;

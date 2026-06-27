import { useState } from 'react';
import { cn } from '@/utils/cn';

/**
 * Dropdown selector for the Tiptap editor toolbar.
 * @description Renders a button that opens a dropdown menu with multiple options.
 * Used for grouping related commands (headings, lists, text alignment) to save
 * toolbar space and improve organization.
 * @param {Object} props
 * @param {string} props.title - Tooltip and accessible label for the button.
 * @param {Array<Object>} props.options - Array of selectable options.
 *   Each option: { label, icon?, onClick, isActive? }
 * @param {string} [props.displayValue] - Current value/label to show on button.
 * @param {React.ReactNode} [props.buttonIcon] - Icon to display on the button.
 * @returns {JSX.Element}
 */
const ToolbarSelect = ({
  title,
  options,
  displayValue,
  buttonIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (option) => {
    option.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown trigger button */}
      <button
        type="button"
        title={title}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors duration-150 cursor-pointer',
          isOpen
            ? 'bg-sand text-cocoa'
            : 'text-doveGray hover:text-ink hover:bg-sand/30'
        )}
      >
        {buttonIcon || displayValue}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-10 left-0 bg-white border border-sand rounded-lg shadow-lg z-10 min-w-max overflow-hidden">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              title={option.label}
              onClick={() => handleOptionClick(option)}
              className={cn(
                'w-full px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer text-left flex items-center gap-2 whitespace-nowrap',
                option.isActive
                  ? 'bg-sand text-cocoa'
                  : 'text-ink hover:bg-sand/30'
              )}
            >
              {option.icon && <span className="w-4 h-4">{option.icon}</span>}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown on click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ToolbarSelect;

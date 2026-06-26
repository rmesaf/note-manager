'use client';

import { cn } from '@/utils/cn';
import Spinner from '@/components/Spinner';

/**
 * Primary reusable interaction element of the application.
 * @description Centralizes all button behavior — loading, disabled states, and
 * variant-based styling — in a single component. Avoids duplicating interaction
 * logic across the app and ensures the design system's warm palette is applied
 * consistently. Variant resolution uses a plain object dictionary to keep the
 * implementation dependency-free and easy to extend.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content rendered inside the button.
 * @param {Function} [props.onClick] - Click event handler.
 * @param {'full'|'outline'|'link'} [props.variant='full'] - Visual style variant.
 * @param {string} [props.className] - Additional Tailwind classes merged via `cn`.
 * @param {boolean} [props.isLoading=false] - Displays a spinner and blocks interaction.
 * @param {boolean} [props.disabled=false] - Disables the button visually and functionally.
 * @returns {JSX.Element}
 */
const Button = ({
  children,
  onClick,
  variant = 'full',
  className,
  isLoading = false,
  disabled = false,
  ...props
}) => {
  const baseClasses =
    'px-4 py-2 rounded-md inline-flex items-center justify-center gap-2 transition-colors duration-200 font-literata cursor-pointer';

  const variantClasses = {
      full: 'bg-cocoa text-white hover:bg-cocoa/90',
      outline: 'bg-transparent border border-cocoa text-cocoa hover:bg-sand/20',
      link: 'p-0 text-cocoa underline hover:text-cocoa/80',
  };

  const isDisabled = isLoading || disabled;

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        { 'opacity-50 cursor-not-allowed pointer-events-none': isDisabled },
        className
      )}
      {...props}
    >
      {isLoading && <Spinner size="sm" color="cocoa" />}
      {children}
    </button>
  );
};

export default Button;

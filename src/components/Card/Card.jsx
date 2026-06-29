import { cn } from '@/utils/cn';

/**
 * Flexible presentational container component.
 * @description Wraps content in a visually distinct boundary using the project's
 * warm design system. Centralizes card styling (background, border, shadow, corners)
 * so consumers don't repeat these tokens across the app. Rendered as a Server Component
 * since it manages no state or interactions.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content rendered inside the card.
 * @param {string} [props.className] - Additional Tailwind classes merged via `cn`.
 *   Conflicting classes (e.g., a different padding) correctly override defaults.
 * @param {...any} props - Any native HTML `<div>` attributes (e.g., `id`, `aria-label`).
 * @returns {JSX.Element}
 */
const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('bg-white border border-sand rounded-lg shadow-sm p-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

import { cn } from '@/utils/cn';

/**
 * Semantic footer component with copyright and branding information.
 * @description Renders a full-width footer positioned at the bottom of the viewport.
 * Displays copyright text centered both horizontally and vertically with generous
 * padding. Uses a subtle sand-colored top border to separate from main content
 * and aligns visually with the Header component's design language.
 * @param {Object} props
 * @param {string} [props.className] - Additional Tailwind classes merged via `cn`.
 * @param {...any} props - Any native HTML footer attributes.
 * @returns {JSX.Element}
 */
const Footer = ({ className, ...props }) => {
  return (
    <footer
      className={cn(
        'w-full border-t border-sand py-6 flex items-center justify-center',
        className
      )}
      {...props}
    >
      <p className="font-literata text-cocoa text-xs italic">
        © 2026 SoftCraft — Artisanal Minimalism
      </p>
    </footer>
  );
};

export default Footer;

import Image from 'next/image';
import { cn } from '@/utils/cn';

/**
 * Semantic header component for application navigation and branding.
 * @description Renders a full-width header with the SoftCraft logo positioned
 * on the left. Maintains a consistent visual hierarchy with a subtle sand-colored
 * bottom border. Uses next/image for logo optimization and serves as the entry
 * point for future navigation elements (menus, auth controls, etc.).
 * @param {Object} props
 * @param {string} [props.className] - Additional Tailwind classes merged via `cn`.
 * @param {...any} props - Any native HTML header attributes.
 * @returns {JSX.Element}
 */
const Header = ({ className, ...props }) => {
  return (
    <header
      className={cn(
        'w-full border-b border-sand bg-paper py-4 px-6 flex items-center',
        className
      )}
      {...props}
    >
      <Image
        src="/logo.svg"
        alt="SoftCraft Logo"
        width={120}
        height={40}
        priority
      />
    </header>
  );
};

export default Header;

import NextLink from 'next/link';
import { cn } from '@/utils/cn';

/**
 * Styling wrapper around Next.js's native Link component.
 * @description Ensures all navigational elements share the visual identity of the
 * Button's 'link' variant while preserving Next.js prefetching and App Router
 * optimizations. Kept as an RSC (no 'use client') to avoid unnecessary
 * client-side hydration overhead on static links.
 *
 * Security note: when `target="_blank"` is passed, `rel="noopener noreferrer"`
 * is automatically injected to prevent reverse tabnapping attacks. Any `rel`
 * value explicitly provided by the consumer is appended after the security
 * tokens so that custom relationship types are preserved.
 * @param {Object} props
 * @param {string|Object} props.href - The path or URL to navigate to. Required by next/link.
 * @param {React.ReactNode} props.children - Content rendered inside the link.
 * @param {string} [props.className] - Additional Tailwind classes merged via `cn`.
 *   Conflicting classes (e.g., `no-underline`) correctly override defaults.
 * @param {string} [props.target] - HTML anchor target attribute (e.g., "_blank").
 * @param {string} [props.rel] - HTML anchor rel attribute. Merged with security
 *   tokens when target="_blank".
 * @param {...any} props - Any native next/link or anchor `<a>` attributes.
 * @returns {JSX.Element}
 */
const Link = ({ href, children, className, target, rel, ...props }) => {
  const resolvedRel =
    target === '_blank'
      ? ['noopener', 'noreferrer', ...(rel ? [rel] : [])].join(' ')
      : rel;

  return (
    <NextLink
      href={href}
      target={target}
      rel={resolvedRel}
      className={cn(
        'p-0 text-cocoa underline transition-colors duration-200 hover:text-cocoa/80',
        className
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
};

export default Link;

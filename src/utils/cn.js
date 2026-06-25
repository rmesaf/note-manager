import { twMerge } from 'tailwind-merge';
import classnames from 'classnames';

/**
 * Combines class names with logical and style conflict resolution.
 * @description Uses `classnames` to handle conditional and logical class composition
 * (e.g., objects, arrays, falsy values), then passes the result through `tailwind-merge`
 * to resolve Tailwind CSS utility conflicts — ensuring the last class wins when two
 * utilities target the same CSS property (e.g., `p-2` and `p-4`).
 * @param {...any} args - Any arguments accepted by the `classnames` library.
 * @returns {string} A single merged and deduplicated class name string.
 */
export function cn(...args) {
  return twMerge(classnames(...args));
}

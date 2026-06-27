'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import SearchIcon from '@/components/SearchIcon';

/**
 * Flexible, reusable form input component with React Hook Form support.
 * @description Wraps a native input in a styled div that manages borders and
 * focus-within states, keeping the input itself transparent and integrated.
 * Uses forwardRef so react-hook-form can register it and manage focus/validation
 * without needing uncontrolled workarounds. The wrapper-based border approach
 * allows focus-within to style the border without additional JS.
 * @param {Object} props
 * @param {'full'|'bottom'|'none'} [props.variant='full'] - Border style of the wrapper.
 * @param {'small'|'base'|'medium'|'large'} [props.inputSize='base'] - Typography and padding scale.
 * @param {string} [props.type='text'] - Native input type. 'search' renders a magnifying glass icon.
 * @param {string} [props.className] - Additional Tailwind classes for the wrapper div.
 * @param {string} [props.inputClassName] - Additional Tailwind classes for the inner input element.
 * @param {...any} props - Any native HTML input attributes (e.g., placeholder, disabled, onChange).
 * @param {React.Ref} ref - Forwarded ref attached to the native input element.
 * @returns {JSX.Element}
 */
const Input = React.forwardRef(
  (
    {
      variant = 'full',
      inputSize = 'base',
      type = 'text',
      className,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const borderDictionary = {
      full: 'border border-sand rounded-md focus-within:border-clay',
      bottom: 'border-b border-sand rounded-none focus-within:border-clay',
      none: 'border-transparent rounded-none',
    };

    const sizeDictionary = {
      small: 'text-sm py-1',
      base: 'text-base py-2',
      medium: 'text-lg py-3',
      large: 'text-3xl py-4 font-bold',
    };

    const isSearch = type === 'search';

    return (
      <div
        className={cn(
          'relative transition-colors duration-200',
          borderDictionary[variant],
          className
        )}
      >
        {isSearch && (
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-doveGray w-5 h-5  pointer-events-none" />
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full bg-transparent outline-none text-ink placeholder:text-doveGray/60',
            sizeDictionary[inputSize],
            isSearch ? 'pl-9 pr-3' : 'px-3',
            inputClassName
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  required = false,
  icon,
  startIcon,
  rightIcon,
  ...props
}, ref) => {
  // Use startIcon if provided, otherwise fall back to icon
  const displayIcon = startIcon || icon;
  const inputClasses = cn(
    'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
    displayIcon && 'pl-10',
    rightIcon && 'pr-10',
    error && 'border-red-500 focus:ring-red-500',
    className
  );

  // Filter out non-standard props that shouldn't go on the input element
  const { 
    rightIcon: _, 
    startIcon: __, 
    icon: ___, 
    label: ____, 
    error: _____, 
    helperText: ______, 
    required: _______, 
    className: ________,
    type: _________,
    ...inputProps 
  } = props;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {displayIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 sm:text-sm">{displayIcon}</span>
          </div>
        )}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...inputProps}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

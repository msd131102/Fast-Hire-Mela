import React from 'react';
import { motion } from 'framer-motion';
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
    // Base styles: increased height (h-12) for better touch targets and modern feel
    'flex h-12 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-base transition-all duration-200 outline-none',
    // Mobile-friendly font size (text-base prevents auto-zoom on iOS)
    'text-gray-900 placeholder:text-gray-400',
    // Focus states: subtle blue glow instead of a harsh ring
    'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
    // Conditional padding for icons
    displayIcon && 'pl-11',
    rightIcon && 'pr-11',
    // Error states
    error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
    // Disabled states
    'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70',
    className
  );

  // Filter out non-standard props - Preserving logic exactly
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
    <div className="w-full group">
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-blue-600">
          {label}
          {required && <span className="text-red-500 ml-1 font-black">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {displayIcon && (
          <div className="absolute left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
            <span className="text-gray-400">{displayIcon}</span>
          </div>
        )}
        
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...inputProps}
        />
        
        {rightIcon && (
          <div className="absolute right-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {/* Messages with slide-down animation feel */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 ml-1 text-xs font-bold text-red-600 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 ml-1 text-xs text-gray-500 font-medium">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

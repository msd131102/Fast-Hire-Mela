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
    'w-full px-4 py-3 bg-surface border-2 border-border shadow-sm rounded-2xl transition-all duration-100 outline-none',
    // Mobile-friendly font size (text-base prevents auto-zoom on iOS)
    'text-text font-game text-lg placeholder:text-muted',
    // Focus states: pixel highlight instead of a harsh ring
    'focus:border-primary-400 focus:ring-0',
    // Conditional padding for icons
    displayIcon && 'pl-11',
    rightIcon && 'pr-11',
    // Error states
    error && 'border-danger-500 focus:border-danger-500 focus:shadow-pixel-danger',
    // Disabled states
    'disabled:cursor-not-allowed disabled:bg-background disabled:opacity-70',
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
        <label className="block text-sm font-game text-text uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-primary-400">
          {label}
          {required && <span className="text-danger-500 ml-1 font-black">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {displayIcon && (
          <div className="absolute left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
            <span className="text-muted">{displayIcon}</span>
          </div>
        )}
        
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          {...inputProps}
        />
        
        {rightIcon && (
          <div className="absolute right-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-500">
            <span className="text-muted">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {/* Messages with slide-down animation feel */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 ml-1 text-xs font-bold text-danger-500 flex items-center gap-1"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-danger-500" />
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 ml-1 text-xs text-muted font-medium">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  // Filter out non-DOM props - Preserving logic
  const { isLoading, ...domProps } = props;
  
  // Base classes optimized for modern adventure look
  const baseClasses = 'inline-flex items-center justify-center font-game font-semibold tracking-wider rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background select-none hover:-translate-y-0.5 active:translate-y-1';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-sm border border-transparent',
    secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 shadow-sm border border-transparent',
    outline: 'border-2 border-border bg-surface text-text hover:border-primary-400 hover:bg-primary-50/50 shadow-sm',
    ghost: 'text-muted hover:bg-surface hover:text-text',
    danger: 'bg-danger-500 text-white hover:bg-danger-400 shadow-sm border border-transparent',
    success: 'bg-success-500 text-white hover:bg-success-400 shadow-sm border border-transparent',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  };

  const buttonClasses = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    (disabled || loading) && 'opacity-60 cursor-not-allowed grayscale-[0.5]',
    className
  );

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">{icon}</span>
      )}
      <span className="truncate">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2 flex items-center justify-center transition-transform group-hover:translate-x-0.5">{icon}</span>
      )}
    </>
  );

  if (disabled || loading) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={true}
        {...domProps}
      >
        {content}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn("group", buttonClasses)}
      onClick={onClick}
      {...domProps}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
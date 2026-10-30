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
  
  // Base classes optimized for better click/touch interaction
  const baseClasses = 'inline-flex items-center justify-center font-semibold tracking-wide rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:opacity-90';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg shadow-blue-600/20',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-gray-200 bg-white text-gray-700 hover:border-blue-600 hover:text-blue-600 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm', // Slightly larger for better mobile tap target
    md: 'px-6 py-2.5 text-sm sm:text-base',
    lg: 'px-8 py-3.5 text-base sm:text-lg',
    xl: 'px-10 py-4 text-lg sm:text-xl font-bold',
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
      whileHover={{ scale: 1.01, translateY: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...domProps}
    >
      {content}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
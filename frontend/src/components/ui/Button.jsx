import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const buttonVariants = ({ variant = 'default', size = 'default', className } = {}) => {
  const variants = {
    default: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm focus-visible:ring-primary-500",
    secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus-visible:ring-secondary-500",
    outline: "border border-secondary-200 bg-transparent hover:bg-secondary-100 text-secondary-900 focus-visible:ring-secondary-500",
    ghost: "hover:bg-secondary-100 text-secondary-900 hover:text-secondary-900 focus-visible:ring-secondary-500",
    destructive: "bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500",
    link: "text-primary-600 underline-offset-4 hover:underline",
    success: "bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-500",
    warning: "bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
};

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  isLoading = false,
  children, 
  disabled,
  ...props 
}, ref) => {
  // Only animate if not disabled and not loading
  const shouldAnimate = !disabled && !isLoading && variant !== 'link';

  return (
    <motion.button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      disabled={disabled || isLoading}
      whileHover={shouldAnimate ? { scale: 1.02 } : {}}
      whileTap={shouldAnimate ? { scale: 0.98 } : {}}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };

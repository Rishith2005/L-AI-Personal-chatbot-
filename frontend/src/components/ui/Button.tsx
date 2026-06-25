import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all outline-none focus:ring-1 focus:ring-white/20 select-none';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  }[size];

  const variantStyles = {
    primary: 'bg-white text-black hover:bg-white/90 active:scale-98 disabled:opacity-50 disabled:pointer-events-none',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-98 disabled:opacity-50 disabled:pointer-events-none',
    glass: 'glass text-white hover:bg-white/5 border-white/8 hover:border-white/15 active:scale-98 disabled:opacity-50 disabled:pointer-events-none',
    danger: 'bg-rose-950/20 border border-rose-500/30 text-rose-200 hover:bg-rose-950/40 active:scale-98 disabled:opacity-50 disabled:pointer-events-none',
  }[variant];

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, brightness: disabled ? 1 : 1.1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

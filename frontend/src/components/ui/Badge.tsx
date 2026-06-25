import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-white/5 border-white/10 text-white/60',
  success: 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300',
  warning: 'bg-amber-950/30 border-amber-500/20 text-amber-300',
  error: 'bg-rose-950/30 border-rose-500/20 text-rose-300',
  info: 'bg-blue-950/30 border-blue-500/20 text-blue-300',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

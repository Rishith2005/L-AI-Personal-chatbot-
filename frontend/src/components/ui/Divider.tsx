import React from 'react';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = '' }) => {
  if (label) {
    return (
      <div className={`flex items-center gap-3 my-4 ${className}`}>
        <div className="flex-1 h-px bg-white/8" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 select-none">
          {label}
        </span>
        <div className="flex-1 h-px bg-white/8" />
      </div>
    );
  }

  return <div className={`h-px bg-white/8 my-4 ${className}`} />;
};

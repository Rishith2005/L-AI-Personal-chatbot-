import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-white/50 px-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-white/20 focus:bg-white/8 outline-none transition-all ${
          error ? 'border-rose-500/50 focus:border-rose-500/80' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-400 px-1 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

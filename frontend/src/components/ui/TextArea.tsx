import React, { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none min-h-[100px] font-body ${className}`}
          {...props}
        />
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

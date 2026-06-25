import React from 'react';

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass ${
        interactive ? 'glass-interactive cursor-pointer' : ''
      } p-6 rounded-2xl shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

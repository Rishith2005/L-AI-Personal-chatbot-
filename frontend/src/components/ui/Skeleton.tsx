import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'bg-white/5 animate-pulse';

  const variantClasses: Record<string, string> = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};

// Pre-composed skeleton layouts
export const MessageSkeleton: React.FC = () => (
  <div className="flex gap-4 p-5">
    <Skeleton variant="rectangular" className="w-9 h-9 shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-16 h-3" />
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-3/4 h-4" />
      <Skeleton variant="text" className="w-1/2 h-4" />
    </div>
  </div>
);

export const ConversationSkeleton: React.FC = () => (
  <div className="space-y-2 px-2 py-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
        <Skeleton variant="rectangular" className="w-4 h-4 shrink-0" />
        <div className="flex-1 space-y-1">
          <Skeleton variant="text" className="w-full h-3" />
          <Skeleton variant="text" className="w-2/3 h-2.5" />
        </div>
      </div>
    ))}
  </div>
);

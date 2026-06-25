import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : 'L';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`rounded-full object-cover border-2 border-white/10 ${sizeMap[size]} ${className}`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center font-semibold font-heading text-white/80 select-none ${sizeMap[size]} ${className}`}
    >
      {initials}
    </div>
  );
};

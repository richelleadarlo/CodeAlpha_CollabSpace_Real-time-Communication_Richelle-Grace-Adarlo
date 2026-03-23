interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isSpeaking?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export default function Avatar({ initials, color, size = 'md', isSpeaking, className = '' }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-primary-foreground select-none shrink-0 ${isSpeaking ? 'ring-2 ring-primary ring-offset-2' : ''} ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

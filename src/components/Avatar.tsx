interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isSpeaking?: boolean;
  className?: string;
  avatarUrl?: string | null;
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export default function Avatar({ initials, color, size = 'md', isSpeaking, className = '', avatarUrl }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-primary-foreground select-none shrink-0 ${isSpeaking ? 'ring-2 ring-primary ring-offset-2' : ''} ${className} overflow-hidden`}
      style={{ backgroundColor: avatarUrl ? undefined : color }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="profile" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

import type { Participant } from '@/data/mockData';
import Avatar from './Avatar';

interface AvatarGroupProps {
  participants: Participant[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarGroup({ participants, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = participants.slice(0, max);
  const remaining = participants.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((p) => (
        <Avatar key={p.id} initials={p.initials} color={p.color} size={size} className="ring-2 ring-card" />
      ))}
      {remaining > 0 && (
        <div className={`${size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'} rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium ring-2 ring-card`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

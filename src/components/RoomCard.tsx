import { useNavigate } from 'react-router-dom';
import type { Room } from '@/data/mockData';
import AvatarGroup from './AvatarGroup';

interface RoomCardProps {
  room: Room;
  index: number;
}

export default function RoomCard({ room, index }: RoomCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/room/${room.id}`)}
      className="glass-card-hover rounded-2xl p-5 text-left w-full animate-reveal-up cursor-pointer group"
      style={{ animationDelay: `${index * 80 + 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-[15px] leading-tight mb-1 line-clamp-2 text-balance">
            {room.name}
          </h3>
          <p className="text-muted-foreground text-sm truncate">{room.subtitle}</p>
        </div>
        {room.isLive && (
          <span className="shrink-0 ml-2 flex items-center gap-1.5 text-xs font-medium text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <AvatarGroup participants={room.participants} />
        <span className="text-muted-foreground text-sm tabular-nums">
          {room.participants.length}
        </span>
      </div>
    </button>
  );
}

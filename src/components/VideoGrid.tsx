import { useState } from 'react';
import type { Participant } from '@/data/mockData';
import Avatar from './Avatar';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoGridProps {
  participants: Participant[];
  pinnedId?: string | null;
  onPin?: (id: string | null) => void;
}

function VideoTile({ participant, isPinned, onPin }: { participant: Participant; isPinned: boolean; onPin?: () => void }) {
  return (
    <button
      onClick={onPin}
      className={`relative rounded-2xl overflow-hidden bg-foreground/5 flex items-center justify-center group cursor-pointer transition-shadow duration-200 ${isPinned ? 'col-span-2 row-span-2' : ''}`}
      style={{ aspectRatio: isPinned ? undefined : '16/10', minHeight: isPinned ? 360 : undefined }}
    >
      {/* Simulated video — shows avatar */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
      <Avatar initials={participant.initials} color={participant.color} size="lg" isSpeaking={participant.isSpeaking} />

      {/* Name overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="glass-card px-2.5 py-1 rounded-lg text-xs font-medium text-foreground">
          {participant.name}
        </span>
        {participant.isMuted && (
          <span className="glass-card p-1 rounded-lg">
            <MicOff className="w-3.5 h-3.5 text-destructive" />
          </span>
        )}
      </div>

      {/* Speaking ring */}
      {participant.isSpeaking && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-primary ring-inset pointer-events-none" />
      )}
    </button>
  );
}

export default function VideoGrid({ participants, pinnedId, onPin }: VideoGridProps) {
  const pinned = pinnedId ? participants.find(p => p.id === pinnedId) : null;
  const others = pinnedId ? participants.filter(p => p.id !== pinnedId) : participants;

  if (pinned) {
    return (
      <div className="flex gap-3 h-full animate-fade-in">
        <div className="flex-1 min-w-0">
          <VideoTile participant={pinned} isPinned onPin={() => onPin?.(null)} />
        </div>
        <div className="w-44 flex flex-col gap-3 overflow-y-auto">
          {others.map((p) => (
            <VideoTile key={p.id} participant={p} isPinned={false} onPin={() => onPin?.(p.id)} />
          ))}
        </div>
      </div>
    );
  }

  const gridCols = participants.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
    participants.length <= 4 ? 'grid-cols-2' :
    participants.length <= 6 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-3 h-full animate-fade-in auto-rows-fr`}>
      {participants.map((p) => (
        <VideoTile key={p.id} participant={p} isPinned={false} onPin={() => onPin?.(p.id)} />
      ))}
    </div>
  );
}

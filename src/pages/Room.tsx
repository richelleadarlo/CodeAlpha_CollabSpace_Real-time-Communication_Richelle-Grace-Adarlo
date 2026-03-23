import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useRoomChat } from '@/hooks/useRoomChat';
import { mockParticipants } from '@/data/mockData';
import type { Participant, SharedFile } from '@/data/mockData';
import VideoGrid from '@/components/VideoGrid';
import Controls from '@/components/Controls';
import ChatBox from '@/components/ChatBox';
import FileShare from '@/components/FileShare';
import Whiteboard from '@/components/Whiteboard';
import { ChevronLeft, Users } from 'lucide-react';
import { toast } from 'sonner';

type SidePanel = 'chat' | 'files' | null;

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [roomName, setRoomName] = useState('Meeting Room');
  const [sidePanel, setSidePanel] = useState<SidePanel>('chat');
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const {
    localStream, remoteStreams,
    isMuted, isCameraOff, isScreenSharing,
    toggleMic, toggleCamera, toggleScreenShare,
  } = useWebRTC(id);

  const { messages, sendMessage } = useRoomChat(id);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const loadSharedFiles = useCallback(async () => {
    if (!id || !user) return;

    const { data, error } = await supabase
      .from('shared_files')
      .select('id, user_id, file_name, file_size, file_type, storage_path, created_at')
      .eq('room_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load shared files.');
      return;
    }

    const userIds = Array.from(new Set((data || []).map((f) => f.user_id)));
    let nameMap = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      nameMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name]));
    }

    setSharedFiles((data || []).map((f) => ({
      id: f.id,
      name: f.file_name,
      size: f.file_size,
      type: f.file_type,
      sharedBy: nameMap.get(f.user_id) || 'Unknown',
      timestamp: new Date(f.created_at),
      storagePath: f.storage_path,
    })));
  }, [id, user]);

  const handleUploadFile = useCallback(async (file: File) => {
    if (!id || !user) return;

    setIsUploadingFile(true);
    const extension = file.name.includes('.') ? file.name.split('.').pop() || 'file' : 'file';
    const safeName = file.name.replace(/\s+/g, '-');
    const storagePath = `${id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('room-files')
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      setIsUploadingFile(false);
      toast.error(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from('shared_files')
      .insert({
        room_id: id,
        user_id: user.id,
        file_name: file.name,
        file_size: formatFileSize(file.size),
        file_type: extension.toLowerCase(),
        storage_path: storagePath,
      });

    if (insertError) {
      await supabase.storage.from('room-files').remove([storagePath]);
      setIsUploadingFile(false);
      toast.error(insertError.message);
      return;
    }

    setIsUploadingFile(false);
    toast.success('File uploaded successfully.');
    await loadSharedFiles();
  }, [id, user, loadSharedFiles]);

  const handleDownloadFile = useCallback(async (file: SharedFile) => {
    if (!file.storagePath) {
      toast.error('Download link is unavailable for this file.');
      return;
    }

    const { data, error } = await supabase
      .storage
      .from('room-files')
      .createSignedUrl(file.storagePath, 60);

    if (error || !data?.signedUrl) {
      toast.error(error?.message || 'Failed to create download link.');
      return;
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Load room info and join as participant
  useEffect(() => {
    if (!id || !user) return;

    async function init() {
      // Fetch room name
      const { data: room } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', id!)
        .single();
      if (room) setRoomName(room.name);

      // Join as participant
      await supabase.from('room_participants').upsert(
        { room_id: id!, user_id: user!.id },
        { onConflict: 'room_id,user_id' }
      );
    }

    init();

    return () => {
      // Leave room on unmount
      if (user) {
        supabase.from('room_participants')
          .delete()
          .eq('room_id', id!)
          .eq('user_id', user.id)
          .then(() => {});
      }
    };
  }, [id, user]);

  useEffect(() => {
    if (!id || !user) return;

    loadSharedFiles();

    const channel = supabase
      .channel(`shared-files:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_files', filter: `room_id=eq.${id}` },
        () => {
          loadSharedFiles();
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      loadSharedFiles();
    }, 8000);

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [id, user, loadSharedFiles]);

  // Build participants list from local + remote streams + mock fallback
  const participants: Participant[] = [
    {
      id: user?.id || 'me',
      name: profile?.display_name || 'You',
      initials: (profile?.display_name || 'Y').slice(0, 2).toUpperCase(),
      color: 'hsl(162 63% 41%)',
      isMuted,
      isSpeaking: false,
      avatarUrl: profile?.avatar_url,
    },
    ...mockParticipants.slice(0, 4).map((p, i) => ({
      ...p,
      isMuted: i === 2,
      isSpeaking: i === 0,
    })),
  ];

  const togglePanel = (panel: SidePanel) => {
    setSidePanel(prev => prev === panel ? null : panel);
  };

  // Convert chat messages to ChatBox format
  const chatMessages = messages.map(m => ({
    id: m.id,
    senderId: m.senderId,
    senderName: m.senderName,
    text: m.text,
    timestamp: m.timestamp,
    isOwn: m.isOwn,
  }));

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 animate-reveal">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="control-btn-default w-9 h-9 rounded-xl">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground text-[15px] leading-tight">{roomName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {participants.length} participants
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-primary font-medium">Live</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-medium tabular-nums text-foreground">Live</span>
          </span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-3 min-h-0">
            <VideoGrid
              participants={participants}
              pinnedId={pinnedId}
              onPin={setPinnedId}
              localStream={localStream}
              remoteStreams={remoteStreams}
              localUserId={user?.id}
            />
          </div>
          <Controls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isScreenSharing={isScreenSharing}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onLeave={() => navigate('/dashboard')}
            onToggleChat={() => togglePanel('chat')}
            onToggleFiles={() => togglePanel('files')}
            onToggleWhiteboard={() => setShowWhiteboard(!showWhiteboard)}
            isChatOpen={sidePanel === 'chat'}
            isFilesOpen={sidePanel === 'files'}
            isWhiteboardOpen={showWhiteboard}
          />
        </div>

        {sidePanel && (
          <aside className="w-80 border-l border-border bg-card shrink-0 animate-fade-in overflow-hidden">
            {sidePanel === 'chat' && (
              <ChatBox messages={chatMessages} onSend={sendMessage} />
            )}
            {sidePanel === 'files' && (
              <FileShare
                files={sharedFiles}
                onUpload={handleUploadFile}
                onDownload={handleDownloadFile}
                isUploading={isUploadingFile}
              />
            )}
          </aside>
        )}
      </div>

      {showWhiteboard && <Whiteboard onClose={() => setShowWhiteboard(false)} />}
    </div>
  );
}

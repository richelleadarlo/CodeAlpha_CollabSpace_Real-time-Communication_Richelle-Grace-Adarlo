import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MessageSquare, Paperclip, PenTool, Settings } from 'lucide-react';

interface ControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
  onToggleChat: () => void;
  onToggleFiles: () => void;
  onToggleWhiteboard: () => void;
  isChatOpen: boolean;
  isFilesOpen: boolean;
  isWhiteboardOpen: boolean;
}

export default function Controls({
  isMuted, isCameraOff, isScreenSharing,
  onToggleMic, onToggleCamera, onToggleScreenShare, onLeave,
  onToggleChat, onToggleFiles, onToggleWhiteboard,
  isChatOpen, isFilesOpen, isWhiteboardOpen,
}: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 animate-reveal" style={{ animationDelay: '200ms' }}>
      {/* Media controls */}
      <div className="glass-card rounded-2xl px-3 py-2 flex items-center gap-2">
        <button onClick={onToggleMic} className={`control-btn w-11 h-11 ${isMuted ? 'bg-destructive text-destructive-foreground' : 'control-btn-default'}`}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={onToggleCamera} className={`control-btn w-11 h-11 ${isCameraOff ? 'bg-destructive text-destructive-foreground' : 'control-btn-default'}`}>
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button onClick={onToggleScreenShare} className={`control-btn w-11 h-11 ${isScreenSharing ? 'control-btn-primary' : 'control-btn-default'}`}>
          <MonitorUp className="w-5 h-5" />
        </button>
      </div>

      {/* Leave */}
      <button onClick={onLeave} className="control-btn-danger w-14 h-11 rounded-2xl">
        <PhoneOff className="w-5 h-5" />
      </button>

      {/* Side panel toggles */}
      <div className="glass-card rounded-2xl px-3 py-2 flex items-center gap-2">
        <button onClick={onToggleChat} className={`control-btn w-11 h-11 ${isChatOpen ? 'control-btn-primary' : 'control-btn-default'}`}>
          <MessageSquare className="w-5 h-5" />
        </button>
        <button onClick={onToggleFiles} className={`control-btn w-11 h-11 ${isFilesOpen ? 'control-btn-primary' : 'control-btn-default'}`}>
          <Paperclip className="w-5 h-5" />
        </button>
        <button onClick={onToggleWhiteboard} className={`control-btn w-11 h-11 ${isWhiteboardOpen ? 'control-btn-primary' : 'control-btn-default'}`}>
          <PenTool className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import RoomCard from '@/components/RoomCard';
import bgLandscape from '@/assets/bg-landscape.jpg';
import { Plus, Search, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface RoomRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    async function loadRooms() {
      const { data } = await supabase
        .from('rooms')
        .select('id, name, description, is_active, created_by')
        .order('created_at', { ascending: false });
      if (data) setRooms(data);
    }
    loadRooms();
  }, []);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profile?.avatar_url]);

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRoom = () => {
    setNewRoomName('');
    setShowCreateDialog(true);
  };

  const handleSubmitRoom = async () => {
    if (!newRoomName.trim()) return;
    setCreatingRoom(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCreatingRoom(false); return; }

    const { data, error } = await supabase
      .from('rooms')
      .insert({ name: newRoomName.trim(), created_by: user.id })
      .select()
      .single();

    setCreatingRoom(false);
    if (error) {
      toast.error(error.message);
    } else if (data) {
      setShowCreateDialog(false);
      navigate(`/room/${data.id}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <img src={profile?.background_url || bgLandscape} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/20" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 animate-reveal" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center overflow-hidden">
              {profile?.avatar_url && !avatarLoadError ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
              )}
            </div>
            <span className="font-semibold text-foreground text-lg">CollabSpace</span>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="glass-card rounded-xl px-3.5 py-2.5 flex items-center gap-2 w-60">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rooms..."
                className="bg-transparent text-base outline-none flex-1 placeholder:text-muted-foreground" />
            </div>
            <button onClick={() => navigate('/settings')} className="glass-card control-btn w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="glass-card control-btn w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 pb-10 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
            <button onClick={handleCreateRoom}
              className="glass-card-hover rounded-2xl p-6 flex flex-col items-center justify-center gap-4 min-h-[180px] text-muted-foreground hover:text-foreground animate-reveal-up cursor-pointer group"
              style={{ animationDelay: '50ms' }}>
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-base font-medium">Create a room</span>
            </button>

            {filtered.map((room, i) => (
              <div key={room.id} className="animate-reveal-up cursor-pointer" style={{ animationDelay: `${(i + 1) * 60}ms` }}
                onClick={() => navigate(`/room/${room.id}`)}>
                <div className="glass-card-hover rounded-2xl p-6 min-h-[180px] flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-base leading-snug">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5">{room.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {room.is_active && (
                      <span className="flex items-center gap-1 text-sm text-primary font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="flex items-center justify-center gap-3 pb-6 animate-reveal" style={{ animationDelay: '500ms' }}>
          <div className="glass-card rounded-full px-4 py-2 flex items-center gap-1">
            <span className="text-base text-muted-foreground">
              Signed in as <span className="text-foreground font-medium">{profile?.display_name || 'User'}</span>
            </span>
          </div>
        </footer>
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateDialog(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_10px_38px_rgba(255,255,255,0.32)] p-7 animate-reveal-up">
            <h2 className="text-2xl font-semibold text-black mb-1">Create a room</h2>
            <p className="text-base text-black/75 mb-5">Give your room a name to get started.</p>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitRoom()}
              className="w-full px-4 py-3 rounded-xl border border-white/60 bg-white/70 text-black text-base outline-none focus:ring-2 focus:ring-black/20 transition-shadow placeholder:text-black/55 mb-5"
              placeholder="e.g. Team Standup"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 rounded-xl text-base text-black/75 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRoom}
                disabled={!newRoomName.trim() || creatingRoom}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {creatingRoom ? 'Creating...' : 'Create room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

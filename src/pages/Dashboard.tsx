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
  const { profile, signOut } = useAuth();
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState<RoomRow[]>([]);

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

  const filtered = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRoom = async () => {
    const name = prompt('Room name:');
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('rooms')
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else if (data) {
      navigate(`/room/${data.id}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <img src={bgLandscape} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/20" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 animate-reveal" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
            </div>
            <span className="font-semibold text-foreground text-lg">CollabSpace</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 w-56">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rooms…"
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" />
            </div>
            <button className="glass-card control-btn w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="glass-card control-btn w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 pb-8 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <button onClick={handleCreateRoom}
              className="glass-card-hover rounded-2xl p-5 flex flex-col items-center justify-center gap-3 min-h-[160px] text-muted-foreground hover:text-foreground animate-reveal-up cursor-pointer group"
              style={{ animationDelay: '50ms' }}>
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Create a room</span>
            </button>

            {filtered.map((room, i) => (
              <div key={room.id} className="animate-reveal-up cursor-pointer" style={{ animationDelay: `${(i + 1) * 60}ms` }}
                onClick={() => navigate(`/room/${room.id}`)}>
                <div className="glass-card-hover rounded-2xl p-5 min-h-[160px] flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-[15px] leading-snug">{room.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{room.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {room.is_active && (
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
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
            <span className="text-sm text-muted-foreground">
              Signed in as <span className="text-foreground font-medium">{profile?.display_name || 'User'}</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

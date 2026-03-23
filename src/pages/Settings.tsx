import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setAvatarPreview(profile?.avatar_url || null);
  }, [profile]);

  const handlePickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      toast.error('Display name is required.');
      return;
    }

    setSaving(true);
    let avatarUrl = profile?.avatar_url ?? null;

    if (avatarFile) {
      const safeName = avatarFile.name.replace(/\s+/g, '-');
      const storagePath = `${user.id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(storagePath, avatarFile, { upsert: true });

      if (uploadError) {
        setSaving(false);
        toast.error(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from('profile-avatars').getPublicUrl(storagePath);
      avatarUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: trimmedName, avatar_url: avatarUrl })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    await refreshProfile();
    toast.success('Profile updated.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="control-btn-default px-3 py-2 rounded-xl flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </button>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Update your display name and profile picture.</p>

          <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-foreground">
                  {(displayName || 'U').slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity w-fit">
              <Camera className="w-4 h-4" />
              Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePickAvatar} />
            </label>
          </div>

          <div className="mt-6">
            <label className="text-base font-medium text-foreground mb-2 block">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full max-w-lg px-4 py-3 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
              placeholder="Your name"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-base font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

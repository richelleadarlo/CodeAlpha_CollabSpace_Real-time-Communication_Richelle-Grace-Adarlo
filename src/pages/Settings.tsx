import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ImageIcon, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setAvatarPreview(profile?.avatar_url || null);
    setBgPreview(profile?.background_url || null);
  }, [profile]);

  const handlePickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handlePickBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
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
    // If bgPreview was cleared (user removed background), null it out; otherwise keep existing
    let backgroundUrl = bgPreview === null ? null : (profile?.background_url ?? null);

    // Upload avatar if changed
    if (avatarFile) {
      const safeName = avatarFile.name.replace(/\s+/g, '-');
      const storagePath = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(storagePath, avatarFile, { upsert: true });
      if (uploadError) {
        setSaving(false);
        toast.error(uploadError.message?.includes('Bucket not found') ? 'Storage not configured.' : uploadError.message);
        return;
      }
      const { data } = supabase.storage.from('profile-avatars').getPublicUrl(storagePath);
      avatarUrl = data.publicUrl;
    }

    // Upload background if changed
    if (bgFile) {
      const safeName = bgFile.name.replace(/\s+/g, '-');
      const storagePath = `${user.id}/bg-${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(storagePath, bgFile, { upsert: true });
      if (uploadError) {
        setSaving(false);
        toast.error(uploadError.message?.includes('Bucket not found') ? 'Storage not configured.' : uploadError.message);
        return;
      }
      const { data } = supabase.storage.from('profile-avatars').getPublicUrl(storagePath);
      backgroundUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: trimmedName, avatar_url: avatarUrl, background_url: backgroundUrl })
      .eq('user_id', user.id);

    if (error) {
      setSaving(false);
      toast.error(error.message);
      return;
    }

    // Update password if provided
    if (password.trim()) {
      const { error: pwError } = await supabase.auth.updateUser({ password: password.trim() });
      if (pwError) {
        setSaving(false);
        toast.error(pwError.message);
        return;
      }
    }

    setSaving(false);
    await refreshProfile();
    toast.success('Profile updated.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="control-btn-default px-3 py-2 rounded-xl flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to dashboard</span>
        </button>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">Update your profile picture, display name, background, and password.</p>

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

          <div className="mt-7 border-t border-border pt-6">
            <p className="text-base font-semibold text-foreground">Dashboard background</p>
            <p className="text-sm text-muted-foreground mt-0.5 mb-4">Replaces the default landscape photo on your main page.</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-full max-w-xs h-28 rounded-xl border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                {bgPreview ? (
                  <img src={bgPreview} alt="Background preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity w-fit">
                  <ImageIcon className="w-4 h-4" />
                  {bgPreview ? 'Change background' : 'Upload background'}
                  <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickBackground} />
                </label>
                {bgPreview && (
                  <button
                    type="button"
                    onClick={() => { setBgPreview(null); setBgFile(null); if (bgInputRef.current) bgInputRef.current.value = ''; }}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors text-left"
                  >
                    Remove background
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-border pt-6">
            <p className="text-base font-semibold text-foreground">Change password</p>
            <p className="text-sm text-muted-foreground mt-0.5 mb-4">Leave blank to keep your current password.</p>
            <div className="relative max-w-lg">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                placeholder="New password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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

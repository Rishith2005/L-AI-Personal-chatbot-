import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { useNotification } from '../context/NotificationContext';
import { GlassContainer } from '../components/ui/GlassContainer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Divider } from '../components/ui/Divider';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, User, Image, Save, Shield, Palette, Info, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type SettingsTab = 'account' | 'appearance' | 'about';

export const SettingsPage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Sync profile data to local state
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(username.trim() || null, avatarUrl.trim() || null);
      await refreshProfile();
      showSuccess('Profile updated successfully.');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    window.location.hash = '/chat';
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="relative min-h-full bg-black overflow-y-auto flex flex-col items-center px-4 md:px-6 py-8 md:py-12">
      {/* Light effect */}
      <div className="glow-spot top-1/4 left-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10 space-y-6"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer select-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat Workspace
        </button>

        {/* Title */}
        <div>
          <h1 className="font-heading text-4xl font-semibold tracking-wide text-white">
            Settings
          </h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-1">
            Manage your workspace preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white/3 border border-white/5 rounded-xl p-1 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'account' && (
            <GlassContainer className="p-6 md:p-8">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                  <Avatar src={avatarUrl || null} name={username || user?.email} size="lg" />
                  <div>
                    <h3 className="text-sm font-semibold text-white/90">
                      {username || user?.email?.split('@')[0] || 'User'}
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">{user?.email}</p>
                    <Badge variant="success" className="mt-2">Active</Badge>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="Display Name"
                    id="username"
                    type="text"
                    placeholder="e.g., alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <User className="absolute right-4 bottom-3 w-4 h-4 text-white/30" />
                </div>

                <div className="relative">
                  <Input
                    label="Avatar Image URL"
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                  <Image className="absolute right-4 bottom-3 w-4 h-4 text-white/30" />
                </div>

                <Divider />

                {/* Security info */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <Shield className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white/60">Security</p>
                    <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">
                      Password management is handled through Supabase Auth. Use the "Forgot Password" flow on the login page to reset your credentials.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-t-black border-black/20 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </GlassContainer>
          )}

          {activeTab === 'appearance' && (
            <GlassContainer className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Theme</h3>
                  <p className="text-xs text-white/40 mb-4">
                    L AI uses a premium dark theme with glassmorphism design.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border-2 border-white/20 bg-black cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-white" />
                        <span className="text-xs font-bold text-white">Dark</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-white/10 rounded w-full" />
                        <div className="h-2 bg-white/5 rounded w-3/4" />
                      </div>
                      <Badge variant="success" className="mt-3">Active</Badge>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-white/2 cursor-not-allowed opacity-40">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-white/50" />
                        <span className="text-xs font-bold text-white/50">Light</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-white/5 rounded w-full" />
                        <div className="h-2 bg-white/3 rounded w-3/4" />
                      </div>
                      <Badge className="mt-3">Coming Soon</Badge>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h3 className="text-sm font-semibold text-white/90 mb-1">Typography</h3>
                  <p className="text-xs text-white/40 mb-3">
                    The design system uses Instrument Serif for headings and Inter for body text.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className="font-heading text-lg text-white mb-1">Instrument Serif</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Headings</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                      <p className="font-body text-lg text-white mb-1">Inter</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Body Text</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassContainer>
          )}

          {activeTab === 'about' && (
            <GlassContainer className="p-6 md:p-8">
              <div className="space-y-6">
                {/* App info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center font-heading text-3xl font-semibold shadow-xl">
                    L
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-white">L AI</h3>
                    <p className="text-xs text-white/40 mt-0.5">Version 1.0.0</p>
                  </div>
                </div>

                <Divider />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white/70">AI Model</p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        DeepSeek-V4-Pro via Hugging Face
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white/70">Authentication</p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        Supabase Auth with JWT + Row Level Security
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Palette className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white/70">Design System</p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        Glassmorphism + Tailwind CSS v4 + Framer Motion
                      </p>
                    </div>
                  </div>
                </div>

                <Divider />

                <p className="text-[11px] text-white/25 text-center leading-relaxed">
                  Built with precision. Powered by intelligence.
                  <br />
                  A modern AI workspace designed for developers.
                </p>
              </div>
            </GlassContainer>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
